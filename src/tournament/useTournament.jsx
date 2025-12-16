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
        setLoading(true);
        
        // 1. Fetch Matches via Secure RPC
        // This solves the RLS issue by passing the PIN for validation server-side
        let matchesQuery;
        
        if (session.isAuthenticated && session.pin) {
            // Authenticated: Use RPC to get filtered matches
            matchesQuery = supabase
                .rpc('get_authorized_matches', { input_pin: session.pin })
                .select(`
                    *, 
                    player1:player1_id(display_name), 
                    player2:player2_id(display_name), 
                    winner:winner_id(display_name),
                    assigned_admin:assigned_admin(display_name)
                `)
                .order('round', { ascending: true });
        } else {
            // Public/Guest: Try fetching public matches (or empty if RLS blocks)
            matchesQuery = supabase
                .from('matches')
                .select(`
                    *, 
                    player1:player1_id(display_name), 
                    player2:player2_id(display_name), 
                    winner:winner_id(display_name),
                    assigned_admin:assigned_admin(display_name)
                `)
                .order('round', { ascending: true });
        }

        const { data: matchesData, error: matchesError } = await matchesQuery;

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
            captainId: null, // Logic managed by access_pins table
            players: [],
            ...t
        }));

        const uiMatches = (matchesData || []).map(m => {
            const { banned, picked } = parseVetoState(m.metadata?.veto);
            
            // Derive turn from metadata (calculated by SQL backend now)
            const turnId = m.metadata?.turn === 'B' ? m.player2_id : m.player1_id;

            return {
                id: m.id,
                round: m.round,
                matchIndex: 0, // SQL sort order handles visual placement
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
                    assigned_admin_name: m.assigned_admin?.display_name
                },
                server_ip: m.server_ip,
                gotv_ip: m.gotv_ip,
                stream_url: m.stream_url,
                score: m.score
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

    // Realtime: Listen for DB changes
    // Note: Realtime subscriptions use the standard RLS policies. 
    // If RLS is blocking read, realtime might not trigger updates for hidden rows.
    // For specific role-based realtime, we rely on the channel connection.
    const channel = supabase.channel('tournament_db_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchData())
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session.pin]); // Refetch if PIN changes (login)

  // --- RPC ACTIONS (Secure Backend Calls) ---

  const submitVeto = async (matchId, vetoData, actionDescription) => {
    if (!session.pin) throw new Error("Authorization Required");
    
    // Parse the UI action string ("Banned Ancient") to get parameters for the SQL RPC
    const isBan = actionDescription.toUpperCase().includes('BAN');
    const isPick = actionDescription.toUpperCase().includes('PICK');
    const action = isBan ? 'BAN' : isPick ? 'PICK' : 'SIDE';
    
    const mapName = actionDescription.replace(/^(Banned|Picked)\s+/i, '').replace(/\s+\(.*\)$/, '').trim();
    
    const mapObj = MAP_POOL.find(m => m.name.toLowerCase() === mapName.toLowerCase());
    if (!mapObj) throw new Error("Invalid Map Name");

    // Call the Secure SQL RPC
    // Note: The backend 'submit_veto' handles role validation, turn checking, and now 'played_maps' checking logic
    const { data, error } = await supabase.rpc('submit_veto', {
        match_id: matchId,
        input_pin: session.pin,
        action: action,
        target_map_id: mapObj.id
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Authorization Required");
    if (session.role !== ROLES.ADMIN && session.role !== ROLES.OWNER) {
        throw new Error("Unauthorized");
    }

    // Map UI updates to SQL column names
    const sqlUpdates = {};
    
    // Logic for Force Win / Completion
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
    
    // Support for SOS clearing
    if (updates.clear_sos) {
        sqlUpdates.sos_triggered = false;
        sqlUpdates.sos_by = null;
    }

    // Mandatory: Override Reason for sensitive edits (bracket changes after R32)
    // The UI should prompt for this if changing teams or critical states
    const reason = updates.override_reason || "Admin Update"; 

    const { data, error } = await supabase.rpc('admin_update_match', {
        match_id: matchId,
        input_pin: session.pin,
        updates: sqlUpdates,
        override_reason: reason // Pass reason to backend for audit log
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
  };

  const triggerSOS = async (matchId) => {
      if (!session.pin) throw new Error("Authorization Required");
      // Call dedicated RPC or generic update if allowed by Captain role
      // For now, we assume a specific RPC for captain actions to be safe
      const { data, error } = await supabase.rpc('trigger_sos', {
          match_id: matchId,
          input_pin: session.pin
      });
      if (error) throw new Error(error.message);
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
