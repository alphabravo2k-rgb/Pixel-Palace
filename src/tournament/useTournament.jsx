import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { MAP_POOL } from '../lib/constants';

const TournamentContext = createContext();

// --- DATA NORMALIZATION HELPERS ---
// Centralizing "Intel" logic here to keep the UI clean and prevent runtime crashes.

const COUNTRY_MAP = {
  'PAK': 'pk', 'PK': 'pk', 'PAKISTAN': 'pk',
  'IND': 'in', 'IN': 'in', 'INDIA': 'in',
  'IRN': 'ir', 'IR': 'ir', 'IRAN': 'ir',
  'UAE': 'ae', 'AE': 'ae',
  'SAU': 'sa', 'SA': 'sa',
  'BAN': 'bd', 'BD': 'bd',
  'AFG': 'af', 'AF': 'af',
  'LKA': 'lk', 'LK': 'lk',
  'NPL': 'np', 'NP': 'np'
};

/**
 * Robust Faceit Nickname Extractor.
 * Extracts the nickname from a URL once during data ingestion.
 */
const extractFaceitNickname = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const u = new URL(fullUrl);
    const segments = u.pathname.split('/').filter(Boolean);
    const idx = segments.indexOf('players');
    return idx !== -1 && segments[idx + 1] ? segments[idx + 1] : null;
  } catch (e) {
    return null;
  }
};

export const TournamentProvider = ({ children }) => {
  const { session } = useSession();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Helper: Parse Structured Veto State from DB metadata.
   */
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

  /**
   * CENTRALIZED DATA FETCH & NORMALIZATION
   * Maps raw database fields into the "Canonical Player Model".
   * UI components will consume this normalized structure.
   */
  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, playersRes] = await Promise.all([
        supabase.from('teams').select('*').order('seed_number', { ascending: true }),
        supabase.from('players').select('*')
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (playersRes.error) throw playersRes.error;

      // Normalize Teams and Players immediately
      const uiTeams = (teamsRes.data || []).map((t) => {
        const teamPlayers = playersRes.data ? playersRes.data.filter((p) => p.team_id === t.id) : [];
        
        // Resolve Team Flag once here (mapping regional strings to ISO-2 codes)
        const regionCode = t.region ? (COUNTRY_MAP[t.region.toUpperCase().trim()] || 'un') : 'un';

        return {
          ...t,
          region_iso2: regionCode, 
          players: teamPlayers.map((p) => {
            const nickname = extractFaceitNickname(p.faceit_url);
            return {
              id: p.id,
              name: p.display_name,
              nickname: nickname, // Pre-extracted nickname for the UI
              role: p.is_captain ? 'CAPTAIN' : p.is_substitute ? 'SUBSTITUTE' : 'PLAYER',
              avatar: p.faceit_avatar_url || null,
              elo: p.faceit_elo ?? null,
              country: p.country_code || 'un',
              socials: {
                faceit: p.faceit_url || null,
                steam: p.steam_url || null,
                discord: p.discord_url || (p.discord_handle ? `https://discord.com/users/${p.discord_handle}` : null)
              }
            };
          })
        };
      });

      // Match Logic with Access Control
      let matchesData = [];
      if (session.isAuthenticated && session.pin) {
        // RPC handles filtered access to sensitive IP data for admins
        const res = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
        matchesData = res.data || [];
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
            sos_by: m.sos_by 
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

      setTeams(uiTeams);
      setMatches(uiMatches);
      setError(null);
    } catch (err) {
      console.error("Tournament Data Sync Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session.pin, session.isAuthenticated]);

  /**
   * ADAPTIVE POLLING
   * Admins (Authenticated) poll every 10s.
   * Public viewers poll every 30s to reduce server load.
   */
  useEffect(() => {
    fetchData();
    const isAdmin = [ROLES.ADMIN, ROLES.OWNER].includes(session.role);
    const pollRate = session.isAuthenticated && isAdmin ? 10000 : 30000;
    
    const interval = setInterval(fetchData, pollRate);
    return () => clearInterval(interval);
  }, [fetchData, session.isAuthenticated, session.role]);

  // --- MUTATION ACTIONS ---

  const submitVeto = async (matchId, payload) => {
    if (!session.pin) throw new Error("Unauthorized");
    const { error } = await supabase.rpc('submit_veto', {
      match_id: matchId,
      input_pin: session.pin,
      action: payload.action,
      target_map_id: payload.mapId
    });
    if (error) throw error;
    fetchData(); // Immediate refresh after action
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
