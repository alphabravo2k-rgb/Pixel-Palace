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

  // Separate function to fetch static team data (run once or on manual refresh)
  const fetchTeams = async () => {
    try {
        // 2. Fetch Teams (using 'teams' table)
        const { data: teamsData, error: teamsError } = await supabase
            .from('teams') 
            .select('*')
            .order('seed_number', { ascending: true });

        if (teamsError) throw teamsError;

        // 3. Fetch Players to Populate Rosters
        const { data: playersData } = await supabase.from('players').select('*');

        // 4. Map Data: Teams
        const uiTeams = (teamsData || []).map(t => {
            const teamPlayers = playersData ? playersData.filter(p => p.team_id === t.id) : [];
            const captain = teamPlayers.find(p => p.is_captain);

            return {
                id: t.id,
                name: t.name, 
                seed_number: t.seed_number,
                logo_url: t.logo_url,
                region: t.region,
                captainId: captain ? captain.id : null,
                players: teamPlayers.map(p => ({
                    uid: p.id,
                    name: p.display_name,
                    role: p.is_captain ? 'CAPTAIN' : p.is_substitute ? 'SUBSTITUTE' : 'PLAYER',
                    rank: p.rank_level,
                    faceit: p.faceit_url,
                    steam: p.steam_url,
                    discord: p.discord_handle
                })),
                ...t
            };
        });
        setTeams(uiTeams);
    } catch (err) {
        console.error("Team Fetch Error:", err);
    }
  };

  // Function to fetch volatile match data (polled)
  const fetchMatches = async () => {
    try {
        let matchesData = [];
        
        if (session.isAuthenticated && session.pin) {
            const res = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
            
            if (!res.error && res.data && res.data.length > 0) {
                matchesData = res.data;
            } else if ([ROLES.ADMIN, ROLES.OWNER].includes(session.role)) {
                // Silent fallback for admins if auth fetch empty
                const pubRes = await supabase.rpc('get_public_matches');
                matchesData = pubRes.data || [];
            } else if (res.error) {
                // If specific error, log it
                 console.warn("Auth Fetch Error:", res.error);
                 const pubRes = await supabase.rpc('get_public_matches');
                 matchesData = pubRes.data || [];
            }
        } else {
            const res = await supabase.rpc('get_public_matches');
            matchesData = res.data || [];
        }

        const uiMatches = matchesData.map(m => {
            const { banned, picked } = parseVetoState(m.metadata?.veto);
            let turnId = null;
            if (m.metadata?.turn === 'A') turnId = m.team1_id;
            if (m.metadata?.turn === 'B') turnId = m.team2_id;
            
            const p1Name = m.team1_name || "TBD";
            const p2Name = m.team2_name || "TBD";
            const adminName = m.assigned_admin_name;

            return {
                id: m.id,
                round: m.round,
                matchIndex: m.slot, 
                team1Id: m.team1_id, 
                team2Id: m.team2_id,
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
                team2Name: p2Name,
                team1Logo: m.team1_logo,
                team2Logo: m.team2_logo
            };
        });

        setMatches(uiMatches);
        setError(null);
    } catch (err) {
        console.error("Match Sync Error:", err);
        setError(err.message);
    }
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
        setLoading(true);
        await Promise.all([fetchTeams(), fetchMatches()]);
        setLoading(false);
    };
    init();
  }, [session.pin, session.isAuthenticated]);

  // Polling for Matches ONLY (Every 10s) - Teams don't need frequent polling
  useEffect(() => {
    const interval = setInterval(fetchMatches, 10000); 
    return () => clearInterval(interval);
  }, [session.pin, session.isAuthenticated]); 

  // --- RPC ACTIONS ---

  const submitVeto = async (matchId, payload, legacyDescription) => {
    if (!session.pin) throw new Error("Authorization Required");
    
    let action, mapId;
    if (typeof payload === 'string' || legacyDescription) {
         const desc = typeof payload === 'string' ? payload : legacyDescription;
         const mapName = desc.replace(/^(Banned|Picked)\s+/i, '').replace(/\s+\(.*\)$/, '').trim();
         const isBan = desc.toUpperCase().includes('BAN');
         const isPick = desc.toUpperCase().includes('PICK');
         action = isBan ? 'BAN' : isPick ? 'PICK' : 'SIDE';
         
         const mapObj = MAP_POOL.find(m => m.name.toLowerCase() === mapName.toLowerCase());
         if (!mapObj) throw new Error("Invalid Map Name");
         mapId = mapObj.id;
    } else {
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
    fetchMatches(); 
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Authorization Required");
    
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
    fetchMatches(); 
  };

  const triggerSOS = async (matchId) => {
      if (!session.pin) throw new Error("Authorization Required");
      const { data, error } = await supabase.rpc('trigger_sos', {
          match_id: matchId,
          input_pin: session.pin
      });
      if (error) throw new Error(error.message);
      fetchMatches();
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
