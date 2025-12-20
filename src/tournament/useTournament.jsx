import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

const TournamentContext = createContext();

// --- INTEL PROCESSING ---
const COUNTRY_MAP = {
  'PAK': 'pk', 'PK': 'pk', 'PAKISTAN': 'pk',
  'IND': 'in', 'IN': 'in', 'INDIA': 'in',
  'UAE': 'ae', 'AE': 'ae', 'SAU': 'sa', 'SA': 'sa'
};

const extractFaceitNickname = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
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

  const fetchData = useCallback(async () => {
    try {
      // 1. FETCH TEAMS & PLAYERS
      const [teamsRes, playersRes] = await Promise.all([
        supabase.from('teams').select('*').order('seed_number', { ascending: true }),
        supabase.from('players').select('*')
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (playersRes.error) throw playersRes.error;

      // 2. NORMALIZE ROSTER (The "Canonical Model")
      const uiTeams = (teamsRes.data || []).map((t) => {
        const teamPlayers = playersRes.data ? playersRes.data.filter((p) => p.team_id === t.id) : [];
        const regionCode = t.region ? (COUNTRY_MAP[t.region.toUpperCase().trim()] || 'un') : 'un';

        return {
          ...t,
          region_iso2: regionCode,
          players: teamPlayers.map((p) => {
            // ROLE DETECTION
            let role = 'PLAYER';
            if (p.is_captain) role = 'CAPTAIN';
            else if (p.is_substitute || p.role === 'SUBSTITUTE') role = 'SUBSTITUTE';

            return {
              id: p.id,
              name: p.display_name,
              nickname: extractFaceitNickname(p.faceit_url) || p.display_name,
              role: role,
              avatar: p.faceit_avatar_url || null,
              elo: p.faceit_elo ?? null,
              // SOCIALS - Fallback mapping
              socials: {
                faceit: p.faceit_url,
                steam: p.steam_url,
                discord: p.discord_url || (p.discord_handle ? `https://discord.com/users/${p.discord_handle}` : null)
              }
            };
          })
        };
      });

      // 3. FETCH MATCHES
      let matchesData = [];
      if (session.isAuthenticated && session.pin) {
        const { data } = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
        matchesData = data || [];
      } else {
        const { data } = await supabase.rpc('get_public_matches');
        matchesData = data || [];
      }

      // Map Matches (Status Logic)
      const uiMatches = matchesData.map(m => {
        let status = 'scheduled';
        if (m.state === 'complete') status = 'completed';
        else if (m.state === 'open') {
          status = (m.server_ip && m.server_ip !== 'HIDDEN') ? 'live' : 'ready';
        }
        return { ...m, status, team1Name: m.team1_name || "TBD", team2Name: m.team2_name || "TBD" };
      });

      setTeams(uiTeams);
      setMatches(uiMatches);
      setError(null);

    } catch (err) {
      console.error("Sync Failure:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session.pin, session.isAuthenticated]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refreshMatches = async () => { await fetchData(); };

  // Helper for admin actions
  const adminUpdateMatch = async (matchId, updates) => {
     if (!session.pin) return;
     await supabase.rpc('admin_update_match', { match_id: matchId, input_pin: session.pin, updates });
     await fetchData();
  };

  const rounds = useMemo(() => {
    return matches.reduce((acc, m) => {
      if (!acc[m.round]) acc[m.round] = [];
      acc[m.round].push(m);
      return acc;
    }, {});
  }, [matches]);

  return (
    <TournamentContext.Provider value={{ teams, matches, rounds, loading, error, refreshMatches, adminUpdateMatch }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
