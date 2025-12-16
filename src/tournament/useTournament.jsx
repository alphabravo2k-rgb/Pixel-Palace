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

  // Helper: Parse Structured Veto State from DB
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
    setLoading(true);
    setError(null);

    try {
        let matchesData = [];
        
        // 1. Fetch Matches (Split Path: Auth vs Public)
        if (session.isAuthenticated && session.pin) {
            // Authenticated: Full access (IPs, Logs, Admin fields)
            const res = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
            
            // CRITICAL FIX: If Authorized returns empty but user is Admin, fallback to public matches
            if (!res.error && res.data && res.data.length > 0) {
                matchesData = res.data;
            } else {
                console.warn("Auth Fetch returned 0 matches. Falling back to public view.");
                const pubRes = await supabase.rpc('get_public_matches');
                matchesData = pubRes.data || [];
            }
        } else {
            // Public: Limited access
            const res = await supabase.rpc('get_public_matches');
            matchesData = res.data || [];
        }

        // 2. Fetch Teams (using new 'teams' table in V14, but RPC might return join data directly)
        // We still fetch full team list for roster/admin pages
        const { data: teamsData, error: teamsError } = await supabase
            .from('teams') // CHANGED: V14 uses 'teams' table, not 'players' for team entities
            .select('*')
            .order('seed_number', { ascending: true });

        if (teamsError) throw teamsError;

        // 3. Map Data
        const uiTeams = teamsData.map(t => ({
            id: t.id,
            name: t.name, // V14 uses 'name'
            seed_number: t.seed_number,
            logo_url: t.logo_url,
            captainId: null,
            players: [],
            ...t
        }));

        const uiMatches = matchesData.map(m => {
            const { banned, picked } = parseVetoState(m.metadata?.veto);
            let turnId = null;
            // Note: backend metadata uses 'A'/'B' which map to team1/team2.
            // V14 schema uses team1_id / team2_id
            if (m.metadata?.turn === 'A') turnId = m.team1_id;
            if (m.metadata?.turn === 'B') turnId = m.team2_id;
            
            // Handle Names from RPC (V14 renamed these to teamX_name)
            const p1Name = m.team1_name || m.player1_name; // Support V14 or fallback
            const p2Name = m.team2_name || m.player2_name; 
            const adminName = m.assigned_admin_name;

            return {
                id: m.id,
                round: m.round,
                matchIndex: m.slot || 0, 
                // V14 ALIGNMENT: Map team1_id -> team1Id for UI
                team1Id: m.team1_id || m.player1_id, 
                team2Id: m.team2_id || m.player2_id,
                winnerId: m.winner_id,
                state: m.state, 
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
                server_ip: m.server_ip || null,
                gotv_ip: m.gotv_ip || null,
                stream_url: m.stream_url || null,
                score: m.score,
                team1Name: p1Name,
                team2Name: p2Name
            };
        });

        setTeams(uiTeams);
        setMatches(uiMatches); // Pass ALL matches (even pending/TBD ones)
        setLoading(false);

    } catch (err) {
        console.error("Supabase Sync Error:", err);
        setError(err.message);
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [session.pin, session.isAuthenticated]); 

  // --- RPC ACTIONS ---

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
    fetchData(); 
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Authorization Required");
    // Admin check is enforced by RLS/RPC, but UI check adds speed
    if (![ROLES.ADMIN, ROLES.OWNER].includes(session.role)) {
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
    fetchData(); 
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
