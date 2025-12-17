import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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

  // Helper: Parse Structured Veto State from DB metadata
  const parseVetoState = (vetoMeta) => {
    const banned = [];
    let picked = null;

    const maps = vetoMeta?.maps || [];
    if (Array.isArray(maps)) {
      maps.forEach((entry) => {
        if (entry.action === 'BAN') banned.push(entry.map_id);
        if (entry.action === 'PICK') picked = entry.map_id;
      });
    }
    return { banned, picked };
  };

  // Unified Sync Function: Teams, Players, and Matches
  const fetchData = useCallback(async () => {
    try {
      // --- 1. FETCH TEAMS ---
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('seed_number', { ascending: true });

      if (teamsError) throw teamsError;

      const { data: playersData } = await supabase.from('players').select('*');

      const uiTeams = (teamsData || []).map((t) => {
        const teamPlayers = playersData ? playersData.filter((p) => p.team_id === t.id) : [];
        const captain = teamPlayers.find((p) => p.is_captain);

        return {
          ...t, // Base team properties (id, name, logo_url, region, seed_number)
          captainId: captain ? captain.id : null,

          // CANONICAL PLAYER MODEL: Enforcing the contract for the UI
          players: teamPlayers.map((p) => ({
            id: p.id,
            name: p.display_name,
            role: p.is_captain ? 'CAPTAIN' : p.is_substitute ? 'SUBSTITUTE' : 'PLAYER',
            
            // Stats & Visuals
            avatar: p.faceit_avatar_url || null,
            elo: p.faceit_elo ?? null,
            country: p.country_code || 'un',

            // Strict Socials Object
            socials: {
              faceit: p.faceit_url || null,
              steam: p.steam_url || null,
              discord: p.discord_url || (p.discord_handle ? `https://discord.com/users/${p.discord_handle}` : null)
            }
          }))
        };
      });
      setTeams(uiTeams);

      // --- 2. FETCH MATCHES ---
      let matchesData = [];
      if (session.isAuthenticated && session.pin) {
        // Authenticated users get authorized match data (includes IPs/sensitive info if Admin)
        const res = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
        if (!res.error && res.data) {
          matchesData = res.data;
        } else {
          // Fallback to public if RPC fails
          const pubRes = await supabase.rpc('get_public_matches');
          matchesData = pubRes.data || [];
        }
      } else {
        const res = await supabase.rpc('get_public_matches');
        matchesData = res.data || [];
      }

      const uiMatches = matchesData.map((m) => {
        const { banned, picked } = parseVetoState(m.metadata?.veto);
        let turnId = null;
        if (m.metadata?.turn === 'A') turnId = m.team1_id;
        if (m.metadata?.turn === 'B') turnId = m.team2_id;

        let displayStatus = 'scheduled';
        if (m.state === 'complete') displayStatus = 'completed';
        else if (m.state === 'open') {
          if (m.server_ip && m.server_ip !== 'HIDDEN') displayStatus = 'live';
          else if (banned.length > 0 || picked) displayStatus = 'veto';
          else displayStatus = 'ready';
        }

        return {
          id: m.id,
          round: m.round,
          matchIndex: m.slot,
          team1Id: m.team1_id,
          team2Id: m.team2_id,
          winnerId: m.winner_id,
          state: m.state,
          status: displayStatus,
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
            assigned_admin_name: m.assigned_admin_name
          },
          server_ip: m.server_ip || null,
          gotv_ip: m.gotv_ip || null,
          stream_url: m.stream_url || null,
          score: m.score,
          team1Name: m.team1_name || "TBD",
          team1Logo: m.team1_logo,
          team2Name: m.team2_name || "TBD",
          team2Logo: m.team2_logo
        };
      });

      setMatches(uiMatches);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Tournament Data Sync Error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [session.pin, session.isAuthenticated]);

  // Handle Initial Load and Adaptive Polling
  useEffect(() => {
    fetchData();
    
    // Resource Management: Admins get 10s updates, public viewers get 30s
    const pollRate = session.isAuthenticated && [ROLES.ADMIN, ROLES.OWNER].includes(session.role) 
      ? 10000 
      : 30000;

    const interval = setInterval(fetchData, pollRate);
    return () => clearInterval(interval);
  }, [fetchData, session.isAuthenticated, session.role]);

  // --- ACTIONS ---

  const submitVeto = async (matchId, payload) => {
    if (!session.pin) throw new Error("Unauthorized");
    const { error } = await supabase.rpc('submit_veto', {
      match_id: matchId,
      input_pin: session.pin,
      action: payload.action,
      target_map_id: payload.mapId
    });
    if (error) throw error;
    fetchData();
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Unauthorized");
    const { error } = await supabase.rpc('admin_update_match', {
      match_id: matchId,
      input_pin: session.pin,
      updates: updates
    });
    if (error) throw error;
    fetchData();
  };

  const triggerSOS = async (matchId) => {
    if (!session.pin) throw new Error("Unauthorized");
    const { error } = await supabase.rpc('trigger_sos', {
      match_id: matchId,
      input_pin: session.pin
    });
    if (error) throw error;
    fetchData();
  };

  // Group matches by round for bracket rendering
  const rounds = useMemo(() => {
    return matches.reduce((acc, m) => {
      if (!acc[m.round]) acc[m.round] = [];
      acc[m.round].push(m);
      return acc;
    }, {});
  }, [matches]);

  return (
    <TournamentContext.Provider value={{
      teams,
      matches,
      rounds,
      loading,
      error,
      submitVeto,
      adminUpdateMatch,
      triggerSOS,
      refreshMatches: fetchData
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error("useTournament must be used within a TournamentProvider");
  return context;
};
