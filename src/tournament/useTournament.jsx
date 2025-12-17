import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { MAP_POOL } from '../lib/constants';

const TournamentContext = createContext();

// --- HELPERS ---
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

const extractFaceitNickname = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const u = new URL(fullUrl);
    const segments = u.pathname.split('/').filter(Boolean);
    const idx = segments.indexOf('players');
    return idx !== -1 && segments[idx + 1] ? segments[idx + 1] : null;
  } catch (e) { return null; }
};

export const TournamentProvider = ({ children }) => {
  const { session } = useSession();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, matchesRes] = await Promise.all([
        supabase.from('teams').select('*, players(*)').order('seed_number', { ascending: true }),
        supabase.rpc('get_public_matches') // Or get_authorized_matches if you implemented the switch
      ]);

      if (teamsRes.error) throw teamsRes.error;
      // Note: We prioritize the RPC for matches, but you can swap logic if needed
      
      const rawMatches = matchesRes.data || [];

      // 1. Normalize Teams
      const uiTeams = (teamsRes.data || []).map((t) => {
        const regionCode = t.region ? (COUNTRY_MAP[t.region.toUpperCase().trim()] || 'un') : 'un';
        // Ensure players is an array
        const teamPlayers = Array.isArray(t.players) ? t.players : [];

        return {
          ...t,
          region_iso2: regionCode,
          players: teamPlayers.map((p) => ({
            id: p.id,
            name: p.display_name,
            nickname: extractFaceitNickname(p.faceit_url),
            role: p.is_captain ? 'CAPTAIN' : p.is_substitute ? 'SUBSTITUTE' : 'PLAYER',
            is_captain: p.is_captain, // Legacy compat
            avatar: p.faceit_avatar_url || null,
            elo: p.faceit_elo ?? null,
            country: p.country_code || 'un',
            socials: {
              faceit: p.faceit_url || null,
              steam: p.steam_url || null,
              discord: p.discord_url || (p.discord_handle ? `https://discord.com/users/${p.discord_handle}` : null)
            }
          }))
        };
      });

      // 2. Normalize Matches
      const uiMatches = rawMatches.map((m) => {
        const { banned, picked } = parseVetoState(m.metadata?.veto);
        let displayStatus = 'scheduled';
        if (m.state === 'complete') displayStatus = 'completed';
        else if (m.state === 'open') {
          if (m.server_ip && m.server_ip !== 'HIDDEN') displayStatus = 'live';
          else if (banned.length > 0 || picked) displayStatus = 'veto';
          else displayStatus = 'ready';
        }

        return {
          ...m,
          // Rename keys for UI consistency
          team1Name: m.team1_name || "TBD",
          team2Name: m.team2_name || "TBD",
          team1Logo: m.team1_logo,
          team2Logo: m.team2_logo,
          team1Id: m.team1_id,
          team2Id: m.team2_id,
          winnerId: m.winner_id,
          score: m.score || '0-0',
          status: displayStatus,
          vetoState: { 
            phase: m.state === 'complete' ? 'complete' : 'ban', 
            // Fallbacks for veto
            bannedMaps: banned, 
            pickedMap: picked 
          },
          metadata: { ...m.metadata, sos_triggered: m.sos_triggered, sos_by: m.sos_by }
        };
      });

      setTeams(uiTeams);
      setMatches(uiMatches);
      setError(null);
    } catch (err) {
      console.error("Tournament Sync Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session.pin, session.isAuthenticated]); // Add dependencies if logic changes

  useEffect(() => {
    fetchData();
    const isAdmin = [ROLES.ADMIN, ROLES.OWNER].includes(session.role);
    const pollRate = session.isAuthenticated && isAdmin ? 10000 : 30000;
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

  const fetchMatchTimeline = async (matchId) => {
    const { data, error } = await supabase
        .from('audit_logs') 
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  };

  // Group matches by round for bracket rendering
  const rounds = useMemo(() => {
    if (!matches.length) return {};
    return matches.reduce((acc, m) => {
      const r = m.round || 1;
      if (!acc[r]) acc[r] = [];
      acc[r].push(m);
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
      fetchMatchTimeline,
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
