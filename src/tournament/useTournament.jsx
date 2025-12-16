import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { MAP_POOL } from '../lib/constants';

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
  const { session } = useSession();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: Parse Structured Veto State from DB (JSONB) -> UI Format
  const parseVetoState = (vetoMeta) => {
      const banned = [];
      let picked = null; 
      
      const maps = vetoMeta?.maps || [];
      if (Array.isArray(maps)) {
          maps.forEach(entry => {
              if (entry.action === 'BAN') banned.push(entry.map_id);
              if (entry.action === 'PICK') picked = entry.map_id; 
          });
      }
      return { banned, picked };
  };

  const fetchData = async () => {
    try {
        // 1. Fetch Matches via Secure RPC (Flat Return)
        // Note: The SQL function 'get_authorized_matches' now handles all joins internally.
        // We do NOT chain .select() anymore to avoid PostgREST issues.
        let matchesData = [];
        let matchesError = null;
        
        if (session.isAuthenticated && session.pin) {
            const res = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
            matchesData = res.data;
            matchesError = res.error;
        } else {
            // Public/Guest Fallback: Basic fetch (might be empty if RLS is strict)
             const res = await supabase
                .from('matches')
                .select(`*, player1:player1_id(display_name), player2:player2_id(display_name), winner:winner_id(display_name)`)
                .order('round', { ascending: true });
             matchesData = res.data; // Note: structure slightly different (nested vs flat)
             matchesError = res.error;
        }

        if (matchesError) throw matchesError;

        // 2. Fetch Teams
        const { data: teamsData, error: teamsError } = await supabase
            .from('players')
            .select('*')
            .order('seed_number', { ascending: true });

        if (teamsError) throw teamsError;

        // 3. Map Data
        const uiTeams = teamsData.map(t => ({
            id: t.id,
            name: t.display_name,
            captainId: null,
            players: [],
            ...t
        }));

        const uiMatches = (matchesData || []).map(m => {
            const { banned, picked } = parseVetoState(m.metadata?.veto);
            const turnId = m.metadata?.turn === 'B' ? m.player2_id : m.player1_id;
            
            // Handle Flat RPC structure OR Nested Public structure
            const p1Name = m.player1_name || m.player1?.display_name;
            const p2Name = m.player2_name || m.player2?.display_name;
            const wName = m.winner_name || m.winner?.display_name;
            const adminName = m.assigned_admin_name || m.assigned_admin?.display_name;

            return {
                id: m.id,
                round: m.round,
                matchIndex: 0, 
                team1Id: m.player1_id,
                team2Id: m.player2_id,
                winnerId: m.winner_id,
                status: m.state === 'open' ? 'live' : m.state === 'complete' ? 'completed' : 'scheduled',
                vetoState: {
                    phase: m.state === 'complete' ? 'complete' : 'ban',
                    turn: turnId,
                    bannedMaps: banned,
                    pickedMap: picked
                },
                metadata: {
                    ...m.metadata,
                    sos_triggered: m.sos_triggered,
                    sos_by: m.sos_by,
                    assigned_admin_name: adminName
                },
                server_ip: m.server_ip,
                gotv_ip: m.gotv_ip,
                stream_url: m.stream_url,
                score: m.score,
                // Add flat names for UI rendering if needed
                team1Name: p1Name,
                team2Name: p2Name
            };
        });

        setTeams(uiTeams);
        setMatches(uiMatches);
        setLoading(false);

    } catch (err) {
        console.error("Supabase Sync Error:", err);
        setError(err.message);
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // POLLING STRATEGY (Production Safe)
    // Realtime sockets often fail with custom RLS/RPC logic.
    // Polling ensures consistency for Captains/Admins.
    const interval = setInterval(fetchData, 10000); // 10 seconds

    // Optional: Keep basic realtime for public table changes just in case
    const channel = supabase.channel('tournament_db_changes')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
       .subscribe();

    return () => { 
        clearInterval(interval);
        supabase.removeChannel(channel); 
    };
  }, [session.pin]); 

  // --- RPC ACTIONS (Secure Backend Calls) ---

  const submitVeto = async (matchId, vetoData, actionDescription) => {
    if (!session.pin) throw new Error("Authorization Required");
    
    const mapName = actionDescription.replace(/^(Banned|Picked)\s+/i, '').replace(/\s+\(.*\)$/, '').trim();
    const isBan = actionDescription.toUpperCase().includes('BAN');
    const isPick = actionDescription.toUpperCase().includes('PICK');
    const action = isBan ? 'BAN' : isPick ? 'PICK' : 'SIDE';
    
    const mapObj = MAP_POOL.find(m => m.name.toLowerCase() === mapName.toLowerCase());
    if (!mapObj) throw new Error("Invalid Map Name");

    const { data, error } = await supabase.rpc('submit_veto', {
        match_id: matchId,
        input_pin: session.pin,
        action: action,
        target_map_id: mapObj.id
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
    fetchData(); // Immediate refresh
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Authorization Required");
    if (session.role !== ROLES.ADMIN && session.role !== ROLES.OWNER) {
        throw new Error("Unauthorized");
    }

    const sqlUpdates = {};
    if (updates.status === 'completed') {
        sqlUpdates.state = 'complete';
        sqlUpdates.is_locked = false; 
    } else if (updates.status) {
        sqlUpdates.state = updates.status === 'live' ? 'open' : updates.status === 'scheduled' ? 'pending' : updates.status;
    }

    if (updates.winnerId) sqlUpdates.winner_id = updates.winnerId;
    if (updates.stream_url !== undefined) sqlUpdates.stream_url = updates.stream_url;
    if (updates.server_ip !== undefined) sqlUpdates.server_ip = updates.server_ip;
    if (updates.gotv_ip !== undefined) sqlUpdates.gotv_ip = updates.gotv_ip;
    if (updates.score !== undefined) sqlUpdates.score = updates.score;
    
    if (updates.clear_sos) {
        sqlUpdates.sos_triggered = false;
        sqlUpdates.sos_by = null;
    }

    const reason = updates.override_reason || "Admin Update"; 

    const { data, error } = await supabase.rpc('admin_update_match', {
        match_id: matchId,
        input_pin: session.pin,
        updates: sqlUpdates,
        override_reason: reason
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
    fetchData(); // Immediate refresh
  };

  const triggerSOS = async (matchId) => {
      if (!session.pin) throw new Error("Authorization Required");
      const { data, error } = await supabase.rpc('trigger_sos', {
          match_id: matchId,
          input_pin: session.pin
      });
      if (error) throw new Error(error.message);
      fetchData();
  };

  const fetchMatchTimeline = async (matchId) => {
      const { data, error } = await supabase
          .from('audit_logs') 
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: false });
      
      if (error) {
          console.error("Timeline Fetch Error:", error);
          return [];
      }
      return data;
  };

  const createTeam = async () => alert("Use SQL Registration Script in Supabase Dashboard.");
  const joinTeam = async () => alert("Registration is handled via Discord/SQL.");
  const createMatch = async () => alert("Matches are generated via SQL Script.");

  return (
    <TournamentContext.Provider value={{ 
      teams, 
      matches, 
      loading, 
      error,
      createTeam, 
      joinTeam, 
      createMatch,
      submitVeto, 
      adminUpdateMatch,
      triggerSOS,
      fetchMatchTimeline
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
