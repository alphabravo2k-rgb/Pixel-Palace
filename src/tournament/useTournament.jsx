import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

const TournamentContext = createContext();

// --- STANDARD INTEL MAPPING ---
// Maps non-standard inputs to ISO-2 codes for FlagCDN
const COUNTRY_MAP = {
  'PAK': 'pk', 'PK': 'pk', 'PAKISTAN': 'pk',
  'IND': 'in', 'IN': 'in', 'INDIA': 'in',
  'IRN': 'ir', 'IR': 'ir', 'IRAN': 'ir',
  'UAE': 'ae', 'AE': 'ae',
  'SAU': 'sa', 'SA': 'sa',
  'BAN': 'bd', 'BD': 'bd',
  'AFG': 'af', 'AF': 'af',
  'LKA': 'lk', 'LK': 'lk',
  'NPL': 'np', 'NP': 'np',
  'USA': 'us', 'US': 'us'
};

/**
 * Extracts the raw Faceit nickname from a URL.
 * Example: "faceit.com/en/players/s1mple" -> "s1mple"
 */
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

/**
 * Parses the raw JSON Veto metadata into a usable state object.
 */
const parseVetoState = (vetoMeta, team1Id, team2Id) => {
  const banned = [];
  let picked = null;
  const maps = vetoMeta?.maps || [];
  
  if (Array.isArray(maps)) {
    maps.forEach((entry) => {
      if (entry.action === 'BAN') banned.push(entry.map_id);
      if (entry.action === 'PICK') picked = entry.map_id;
    });
  }
  
  // Determine whose turn it is
  let turnId = null;
  if (vetoMeta?.turn === 'A') turnId = team1Id;
  if (vetoMeta?.turn === 'B') turnId = team2Id;

  return { 
    bannedMaps: banned, 
    pickedMap: picked, 
    turn: turnId, 
    phase: vetoMeta?.phase || 'ban' 
  };
};

export const TournamentProvider = ({ children }) => {
  const { session } = useSession();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      // 1. FETCH BASE INTEL (Teams & Players)
      const [teamsRes, playersRes] = await Promise.all([
        supabase.from('teams').select('*').order('seed_number', { ascending: true }),
        supabase.from('players').select('*')
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (playersRes.error) throw playersRes.error;

      // 2. NORMALIZE ROSTER DATA (The "Canonical Model")
      const uiTeams = (teamsRes.data || []).map((t) => {
        // Find players belonging to this team
        const teamPlayers = playersRes.data ? playersRes.data.filter((p) => p.team_id === t.id) : [];
        
        // Normalize Region
        const regionCode = t.region ? (COUNTRY_MAP[t.region.toUpperCase().trim()] || 'un') : 'un';

        return {
          ...t,
          region_iso2: regionCode,
          players: teamPlayers.map((p) => ({
            id: p.id,
            name: p.display_name,
            nickname: extractFaceitNickname(p.faceit_url), // Auto-extract nickname
            role: p.is_captain ? 'CAPTAIN' : p.is_substitute ? 'SUBSTITUTE' : 'PLAYER',
            avatar: p.faceit_avatar_url || null,
            elo: p.faceit_elo ?? null,
            socials: {
              faceit: p.faceit_url || null,
              steam: p.steam_url || null,
              discord: p.discord_url || (p.discord_handle ? `https://discord.com/users/${p.discord_handle}` : null)
            }
          }))
        };
      });

      // 3. FETCH MATCH DATA (With Access Control)
      let matchesData = [];
      if (session.isAuthenticated && session.pin) {
        // Admin/Owner Access: Get EVERYTHING (IPs, Hidden Status)
        const { data } = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
        matchesData = data || [];
      } else {
        // Public Access: Get Safe Data Only
        const { data } = await supabase.rpc('get_public_matches');
        matchesData = data || [];
      }

      const uiMatches = matchesData.map(m => {
        const veto = parseVetoState(m.metadata?.veto, m.team1_id, m.team2_id);
        
        // Calculate Display Status
        let status = 'scheduled';
        if (m.state === 'complete') status = 'completed';
        else if (m.state === 'open') {
          // If server IP exists and isn't hidden, match is LIVE
          status = (m.server_ip && m.server_ip !== 'HIDDEN') ? 'live' : 
                   (veto.bannedMaps.length > 0) ? 'veto' : 'ready';
        }

        return {
          ...m,
          status,
          vetoState: veto,
          team1Name: m.team1_name || "TBD",
          team2Name: m.team2_name || "TBD",
          // Pass through sensitive data if authorized
          server_ip: m.server_ip || null,
          gotv_ip: m.gotv_ip || null
        };
      });

      setTeams(uiTeams);
      setMatches(uiMatches);
      setError(null);

    } catch (err) {
      console.error("Tournament Sync Failure:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session.pin, session.isAuthenticated]);

  // --- ADAPTIVE POLLING SYSTEM ---
  useEffect(() => {
    fetchData(); // Initial Load

    // Admins need faster updates (10s), Spectators can wait (30s)
    const isAdmin = ['ADMIN', 'OWNER'].includes(session.role);
    const pollRate = isAdmin ? 10000 : 30000;

    const interval = setInterval(fetchData, pollRate);
    
    // Also listen for Realtime Database Changes
    const matchSubscription = supabase
      .channel('live-tournament-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        console.log("⚡ Match Update Detected");
        fetchData();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(matchSubscription);
    };
  }, [fetchData, session.role]);

  // --- ACTIONS ---
  const submitVeto = async (matchId, payload) => {
    const { error } = await supabase.rpc('submit_veto', {
      match_id: matchId, input_pin: session.pin, action: payload.action, target_map_id: payload.mapId
    });
    if (error) throw error;
    fetchData(); // Immediate refresh
  };

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
