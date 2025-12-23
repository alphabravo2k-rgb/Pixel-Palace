import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

const TournamentContext = createContext();

// --- SMART HELPERS ---
const normalizeUrl = (input, type) => {
  if (!input || input === 'null' || input === 'undefined') return null;
  const str = input.toString().trim();
  if (str.length === 0) return null;
  
  if (str.startsWith('http')) return str;
  
  if (type === 'faceit') return `https://www.faceit.com/en/players/${str}`;
  if (type === 'steam') {
    return str.match(/^\d+$/) ? `https://steamcommunity.com/profiles/${str}` : `https://steamcommunity.com/id/${str}`;
  }
  return null;
};

const extractNickname = (url, name) => {
  if (!url) return name;
  try {
    if (!url.includes('/')) return url; 
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const idx = segments.indexOf('players');
    return (idx !== -1 && segments[idx + 1]) ? segments[idx + 1] : name;
  } catch { return name; }
};

export const TournamentProvider = ({ children }) => {
  const { session } = useSession();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthed = Boolean(session?.isAuthenticated);
  const pin = session?.pin ?? null;

  const fetchData = useCallback(async () => {
    try {
      // 1. FETCH RAW TEAMS & PLAYERS
      const [teamsRes, playersRes] = await Promise.all([
        supabase.from('teams').select('*').order('seed_number', { ascending: true }),
        supabase.from('players').select('*')
      ]);

      if (teamsRes.error) throw teamsRes.error;

      // 🛡️ CRITICAL GUARD: Ensure we have arrays
      const rawTeams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
      const rawPlayers = Array.isArray(playersRes.data) ? playersRes.data : [];

      // 2. PROCESS ROSTER
      const uiTeams = rawTeams.map((t) => {
        const teamPlayers = rawPlayers.filter((p) => p.team_id === t.id);
        
        return {
          ...t,
          region_iso2: t.region_iso2 || 'un', 
          players: teamPlayers.map((p) => {
            let role = 'PLAYER';
            if (p.is_captain) role = 'CAPTAIN';
            else if (p.is_substitute) role = 'SUBSTITUTE';

            return {
              id: p.id,
              name: p.display_name,
              nickname: extractNickname(p.faceit_url, p.display_name),
              role: role, 
              avatar: p.faceit_avatar_url,
              elo: p.faceit_elo,
              socials: {
                faceit: normalizeUrl(p.faceit_url || p.faceit_username, 'faceit'),
                steam: normalizeUrl(p.steam_url || p.steam_id, 'steam'),
                discord: p.discord_url || (p.discord_handle ? `https://discord.com/users/${p.discord_handle}` : null)
              }
            };
          })
        };
      });

      // 3. PROCESS MATCHES
      let matchesData = [];
      
      if (isAuthed && pin) {
        const { data, error } = await supabase.rpc('get_authorized_matches', { input_pin: pin });
        if (!error) matchesData = data || [];
        else console.warn("Admin RPC failed:", error);
      } else {
        const { data, error } = await supabase.rpc('get_public_matches');
        if (!error) matchesData = data || [];
      }

      // 🛡️ CRITICAL GUARD: Ensure matchesData is an array
      const safeMatchesData = Array.isArray(matchesData) ? matchesData : [];

      const uiMatches = safeMatchesData.map(m => {
        let status = 'scheduled';
        if (m.state === 'complete') status = 'completed';
        else if (m.state === 'open') {
          status = (m.server_ip && m.server_ip !== 'HIDDEN') ? 'live' : 'ready'; 
          if (m.metadata?.veto?.bannedMaps?.length > 0) status = 'veto';
        }

        return {
          ...m,
          team1Id: m.team1_id,
          team2Id: m.team2_id,
          winnerId: m.winner_id,
          team1Name: m.team1_name || "TBD",
          team2Name: m.team2_name || "TBD",
          status,
          vetoState: m.metadata?.veto || {}
        };
      });

      setTeams(uiTeams);
      setMatches(uiMatches);
      setError(null);

    } catch (err) {
      console.error("Sync Error:", err);
      // Don't show full error object to user, just message
      setError(err.message || "Connection Failed");
      // 🛡️ PREVENT STALE UI: Clear data if fetch fails hard
      setTeams([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthed, pin]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const refreshMatches = async () => fetchData();
  
  const adminUpdateMatch = async (matchId, updates) => {
      if (!pin) return;
      await supabase.rpc('admin_update_match', { match_id: matchId, input_pin: pin, updates });
      await fetchData();
  };

  const submitVeto = async (matchId, payload) => {
    const { error } = await supabase.rpc('submit_veto', {
      match_id: matchId, input_pin: pin, action: payload.action, target_map_id: payload.mapId
    });
    if (error) throw error;
    await fetchData();
  };

  const rounds = useMemo(() => {
    if (!Array.isArray(matches)) return {}; 
    return matches.reduce((acc, m) => {
      if (!acc[m.round]) acc[m.round] = [];
      acc[m.round].push(m);
      return acc;
    }, {});
  }, [matches]);

  return (
    <TournamentContext.Provider value={{ teams, matches, rounds, loading, error, refreshMatches, adminUpdateMatch, submitVeto }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
