import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

const TournamentContext = createContext();

// --- SMART HELPERS ---
const normalizeUrl = (input, type) => {
  if (!input) return null;
  const str = input.toString().trim();
  if (str.startsWith('http')) return str;
  if (type === 'faceit') return `https://www.faceit.com/en/players/${str}`;
  if (type === 'steam') return str.includes('steamcommunity') ? str : `https://steamcommunity.com/id/${str}`;
  return null;
};

const extractNickname = (url, name) => {
  if (!url) return name;
  try {
    if (!url.includes('/')) return url; // It's already a nickname
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

  // 🛡️ CRITICAL FIX: Safe access to session properties
  const isAuthed = Boolean(session?.isAuthenticated);
  const pin = session?.pin ?? null;

  const fetchData = useCallback(async () => {
    try {
      // 1. FETCH RAW TEAMS & PLAYERS
      // Note: In future, this should move to a DB VIEW for performance
      const [teamsRes, playersRes] = await Promise.all([
        supabase.from('teams').select('*').order('seed_number', { ascending: true }),
        supabase.from('players').select('*')
      ]);

      if (teamsRes.error) throw teamsRes.error;

      // 2. PROCESS ROSTER (Safe Client-Side Join)
      const uiTeams = (teamsRes.data || []).map((t) => {
        const teamPlayers = playersRes.data ? playersRes.data.filter((p) => p.team_id === t.id) : [];
        
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
                faceit: normalizeUrl(p.faceit_url, 'faceit'),
                steam: normalizeUrl(p.steam_url, 'steam'),
                discord: p.discord_url
              }
            };
          })
        };
      });

      // 3. PROCESS MATCHES (Security Context Aware)
      let matchesData = [];
      
      if (isAuthed && pin) {
        // Admin/Captain View (Secured via RPC)
        const { data, error } = await supabase.rpc('get_authorized_matches', { input_pin: pin });
        if (!error) matchesData = data || [];
        else console.warn("Admin RPC failed:", error);
      } else {
        // Public View (Secured via RPC)
        const { data, error } = await supabase.rpc('get_public_matches');
        if (!error) matchesData = data || [];
        // 🛡️ SECURITY FIX: Removed raw table fallback for public users
        // If RPC fails, public users see empty schedule, not leaked IPs.
      }

      const uiMatches = matchesData.map(m => {
        // Calculate Status Logic (Backend should ideally do this)
        let status = 'scheduled';
        if (m.state === 'complete') status = 'completed';
        else if (m.state === 'open') {
          status = (m.server_ip && m.server_ip !== 'HIDDEN') ? 'live' : 'ready'; 
          if (m.metadata?.veto?.bannedMaps?.length > 0) status = 'veto';
        }

        return {
          ...m,
          // Normalization
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
      setError(err.message || "Data Sync Failed");
    } finally {
      setLoading(false);
    }
  }, [isAuthed, pin]); // Dependencies corrected

  // Polling Logic
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  // Actions
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

  // Group by Rounds for Bracket
  const rounds = useMemo(() => {
    if (!Array.isArray(matches)) return {}; // 🛡️ CRASH GUARD
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
