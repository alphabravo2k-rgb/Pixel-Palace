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
  // Now handles specific side selection structure if present
  const parseVetoState = (vetoMeta) => {
      const banned = [];
      let picked = null; // Legacy single pick support
      const pickedMaps = []; // Future BO3/BO5 support
      
      const maps = vetoMeta?.maps || [];
      if (Array.isArray(maps)) {
          maps.forEach(entry => {
              if (entry.action === 'BAN') banned.push(entry.map_id);
              if (entry.action === 'PICK') {
                  picked = entry.map_id;
                  pickedMaps.push(entry.map_id);
              }
          });
      }
      return { banned, picked, pickedMaps };
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
        let matchesData = [];
        
        // 1. Fetch Matches (Strict Separation: Auth vs Public)
        if (session.isAuthenticated && session.pin) {
            // Authenticated: Full access. 
            const res = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
            
            // Fallback: If Admin/Owner has valid session but no PIN mapping in DB (setup issue), use public view
            if (!res.error && res.data) {
                matchesData = res.data;
            } else if ([ROLES.ADMIN, ROLES.OWNER].includes(session.role)) {
                console.warn("Auth Fetch empty/failed for Admin. Using Public View fallback.");
                const pubRes = await supabase.rpc('get_public_matches');
                matchesData = pubRes.data || [];
            } else if (res.error) {
                throw res.error;
            }
        } else {
            // Public: Limited access
            const res = await supabase.rpc('get_public_matches');
            if (res.error) throw res.error;
            matchesData = res.data || [];
        }

        // 2. Fetch Teams (using new 'teams' table in V14)
        const { data: teamsData, error: teamsError } = await supabase
            .from('teams') 
            .select('*')
            .order('seed_number', { ascending: true });

        if (teamsError) throw teamsError;

        // 3. Fetch Players to Populate Rosters
        const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('*');
        
        if (playersError) throw playersError;

        // 4. Map Data: Teams & Rosters
        const uiTeams = teamsData.map(t => {
            // Link players to this team
            const teamPlayers = playersData.filter(p => p.team_id === t.id);
            const captain = teamPlayers.find(p => p.is_captain);

            return {
                id: t.id,
                name: t.name, 
                seed_number: t.seed_number,
                logo_url: t.logo_url,
                captainId: captain ? captain.id : null,
                players: teamPlayers.map(p => ({
                    uid: p.id,
                    name: p.display_name,
                    role: p.is_captain ? 'CAPTAIN' : p.is_substitute ? 'SUBSTITUTE' : 'PLAYER',
                    rank: p.rank_level,
                    faceit: p.faceit_url,
                    steam: p.steam_url
                })),
                ...t
            };
        });

        // 5. Map Data: Matches
        const uiMatches = matchesData.map(m => {
            const { banned, picked, pickedMaps } = parseVetoState(m.metadata?.veto);
            
            // Resolve Turn ID from Metadata ('A'/'B' -> TeamUUID)
            // This enables the UI to know exactly whose turn it is without guessing
            let turnId = null;
            if (m.metadata?.turn === 'A') turnId = m.team1_id; // V14 uses teamX_id
            if (m.metadata?.turn === 'B') turnId = m.team2_id;
            
            // Handle Names from RPC (V14 renamed these to teamX_name)
            const p1Name = m.team1_name; 
            const p2Name = m.team2_name; 
            const adminName = m.assigned_admin_name;

            return {
                id: m.id,
                round: m.round,
                matchIndex: m.slot, // V14: 'slot' is the authoritative position
                
                // Teams
                team1Id: m.team1_id, 
                team2Id: m.team2_id,
                winnerId: m.winner_id,
                
                state: m.state, 
                status: m.state === 'open' ? 'live' : m.state === 'complete' ? 'completed' : 'scheduled',
                
                // Veto State Object
                vetoState: {
                    phase: m.state === 'complete' ? 'complete' : 'ban', // Simplified derived state
                    turn: turnId,
                    bannedMaps: banned,
                    pickedMap: picked, // Legacy support
                    pickedMaps: pickedMaps // BO3/BO5 support
                },
                
                // Metadata & Logs
                metadata: {
                    ...m.metadata,
                    sos_triggered: m.sos_triggered,
                    sos_by: m.sos_by,
                    assigned_admin_name: adminName
                },
                
                // Connection Info
                server_ip: m.server_ip || null,
                gotv_ip: m.gotv_ip || null,
                stream_url: m.stream_url || null,
                score: m.score,
                
                // Flattened Names for easy UI rendering
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
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [session.pin, session.isAuthenticated]); 

  // --- ACTIONS ---

  // submitVeto: Now accepts structured payload { action: 'BAN', mapId: '...' }
  const submitVeto = async (matchId, payload, legacyDescription) => {
    if (!session.pin) throw new Error("Authorization Required");
    
    let action, mapId;

    if (typeof payload === 'string' || legacyDescription) {
         // Legacy Parsing (Fallback)
         const desc = typeof payload === 'string' ? payload : legacyDescription;
         const mapName = desc.replace(/^(Banned|Picked)\s+/i, '').replace(/\s+\(.*\)$/, '').trim();
         const isBan = desc.toUpperCase().includes('BAN');
         const isPick = desc.toUpperCase().includes('PICK');
         action = isBan ? 'BAN' : isPick ? 'PICK' : 'SIDE';
         
         const mapObj = MAP_POOL.find(m => m.name.toLowerCase() === mapName.toLowerCase());
         if (!mapObj) throw new Error("Invalid Map Name");
         mapId = mapObj.id;
    } else {
         // Modern Structured Payload
         action = payload.action;
         mapId = payload.mapId;
    }

    const { data, error } = await supabase.rpc('submit_veto', {
        match_id: matchId,
        input_pin: session.pin,
        action: action,
        target_map_id: mapId
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
    fetchData(); // Optimistic update
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Authorization Required");
    // Frontend guard: Admin check (backend enforces strictly)
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
