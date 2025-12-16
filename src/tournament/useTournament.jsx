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
  // Updated to support arrays for BO3/BO5 readiness
  const parseVetoState = (vetoMeta) => {
      const banned = [];
      const picked = []; // Changed to array for BO3/BO5
      
      const maps = vetoMeta?.maps || [];
      if (Array.isArray(maps)) {
          maps.forEach(entry => {
              if (entry.action === 'BAN') banned.push(entry.map_id);
              if (entry.action === 'PICK') picked.push(entry.map_id); 
          });
      }
      // Return last pick as 'pickedMap' for backward compat with simple UI, but expose full list
      return { banned, picked, lastPicked: picked[picked.length - 1] || null };
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
        let matchesData = [];
        let fetchError = null;
        
        // 1. Fetch Matches (Prioritize Authorized View, Fallback to Public)
        if (session.isAuthenticated && session.pin) {
            // Authenticated: Try fetching full details
            const res = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
            if (res.error) {
                console.warn("Auth Fetch Failed, falling back to public:", res.error);
                // Fallback to public if auth fails (e.g. RLS issue or expired pin acting weird)
                const pubRes = await supabase.rpc('get_public_matches');
                matchesData = pubRes.data || [];
                fetchError = pubRes.error;
            } else {
                matchesData = res.data || [];
            }
        } else {
            // Public: Limited access (Bracket visualization only)
            const res = await supabase.rpc('get_public_matches');
            matchesData = res.data || [];
            fetchError = res.error;
        }

        if (fetchError) throw fetchError;

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

        const uiMatches = matchesData.map(m => {
            const { banned, picked, lastPicked } = parseVetoState(m.metadata?.veto);
            
            // Defensive Turn Logic
            let turnId = null;
            if (m.metadata?.turn === 'A') turnId = m.player1_id;
            if (m.metadata?.turn === 'B') turnId = m.player2_id;
            
            // Handle Names (Safe fallback between Auth/Public RPC shapes)
            const p1Name = m.player1_name || m.player1?.display_name;
            const p2Name = m.player2_name || m.player2?.display_name;
            const adminName = m.assigned_admin_name || m.assigned_admin?.display_name;

            return {
                id: m.id,
                round: m.round,
                matchIndex: 0, 
                team1Id: m.player1_id,
                team2Id: m.player2_id,
                winnerId: m.winner_id,
                // Direct mapping of backend state
                state: m.state, 
                // UI derived status (can be refined in components)
                status: m.state === 'open' ? 'live' : m.state === 'complete' ? 'completed' : 'scheduled',
                vetoState: {
                    phase: m.state === 'complete' ? 'complete' : 'ban',
                    turn: turnId,
                    bannedMaps: banned,
                    pickedMap: lastPicked, // For current simple UI
                    pickedMaps: picked     // For future BO3/BO5 UI
                },
                metadata: {
                    // Sanitize/whitelist metadata for public/non-admin views if needed
                    // For now, we pass it through but UI should guard usage
                    ...m.metadata,
                    sos_triggered: m.sos_triggered,
                    sos_by: m.sos_by,
                    assigned_admin_name: adminName
                },
                // Sensitive fields might be undefined in public view, handle gracefully
                server_ip: m.server_ip || null,
                gotv_ip: m.gotv_ip || null,
                stream_url: m.stream_url || null,
                score: m.score,
                team1Name: p1Name,
                team2Name: p2Name
            };
        });

        // Ensure we don't accidentally render nothing if array is empty (though it might be validly empty)
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

    // Polling Strategy (Every 10s)
    const interval = setInterval(fetchData, 10000); 

    return () => { 
        clearInterval(interval);
    };
  }, [session.pin, session.isAuthenticated]); 

  // --- RPC ACTIONS ---

  const submitVeto = async (matchId, vetoData, actionDescription) => {
    if (!session.pin) throw new Error("Authorization Required");
    
    // Improved: Parse more robustly or accept objects.
    // For now, we still parse the description but we prepare the data structure for the FUTURE RPC
    let action = 'BAN';
    let mapId = null;

    if (typeof actionDescription === 'string') {
        const mapName = actionDescription.replace(/^(Banned|Picked)\s+/i, '').replace(/\s+\(.*\)$/, '').trim();
        const isBan = actionDescription.toUpperCase().includes('BAN');
        const isPick = actionDescription.toUpperCase().includes('PICK');
        action = isBan ? 'BAN' : isPick ? 'PICK' : 'SIDE'; // Fallback logic
        
        const mapObj = MAP_POOL.find(m => m.name.toLowerCase() === mapName.toLowerCase());
        if (!mapObj) throw new Error("Invalid Map Name");
        mapId = mapObj.id;
    } else {
        // Assume object passed: { action: 'PICK', mapId: 'de_mirage' }
        action = actionDescription.action;
        mapId = actionDescription.mapId;
    }

    const { data, error } = await supabase.rpc('submit_veto', {
        match_id: matchId,
        input_pin: session.pin,
        action: action,
        target_map_id: mapId
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
    fetchData(); 
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Authorization Required");
    // Relaxed check: Allow if authenticated with valid role.
    // Strict enforcement happens on backend via RLS/RPC permission checks.
    if (![ROLES.ADMIN, ROLES.OWNER].includes(session.role)) {
        throw new Error("Unauthorized");
    }

    const sqlUpdates = {};
    // Map UI status back to SQL state
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
