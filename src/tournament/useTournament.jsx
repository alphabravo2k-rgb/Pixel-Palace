import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { COUNTRY_MAP } from '../lib/constants';

const TournamentContext = createContext();

// --- DATA NORMALIZATION HELPERS ---

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

const parseVetoState = (vetoMeta) => {
  const banned = [];
  const pickedMaps = [];
  let picked = null; // Legacy support
  const maps = vetoMeta?.maps || [];
  
  if (Array.isArray(maps)) {
    maps.forEach((entry) => {
      // Safety check for malformed entries
      if (!entry?.map_id) return;

      if (entry.action === 'BAN') {
        banned.push(entry.map_id);
      }
      if (entry.action === 'PICK') {
        pickedMaps.push(entry.map_id);
        picked = entry.map_id; 
      }
    });
  }
  return { banned, picked, pickedMaps };
};

export const TournamentProvider = ({ children }) => {
  const { session } = useSession();
  
  // State
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true); // Initial load only
  const [isRefreshing, setIsRefreshing] = useState(false); // Background sync indicator
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Refs for tracking data presence and concurrent fetches
  const hasLoadedTeams = useRef(false);
  const hasLoadedMatches = useRef(false);
  const isFetchingMatches = useRef(false);
  const isFetchingTeams = useRef(false);

  // --- 1. FETCH TEAMS (Static Data) ---
  const fetchTeams = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingTeams.current) return;
    isFetchingTeams.current = true;

    try {
      const [teamsRes, playersRes] = await Promise.all([
        supabase.from('teams').select('*').order('seed_number', { ascending: true }),
        supabase.from('players').select('*')
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (playersRes.error) throw playersRes.error;

      // Normalize Teams into Canonical Model
      const uiTeams = (teamsRes.data || []).map((t) => {
        const teamPlayers = playersRes.data ? playersRes.data.filter((p) => p.team_id === t.id) : [];
        const regionCode = t.region ? (COUNTRY_MAP[t.region.toUpperCase().trim()] || 'un') : 'un';

        // UTC Timestamp normalization for is_synced check (24h threshold)
        const updatedAt = t.updated_at ? new Date(t.updated_at).getTime() : 0;
        const now = Date.now();
        const isSynced = (now - updatedAt) < 86400000;

        return {
          ...t,
          region_iso2: regionCode,
          is_synced: isSynced,
          players: teamPlayers.map((p) => ({
            id: p.id,
            name: p.display_name,
            nickname: extractFaceitNickname(p.faceit_url),
            role: p.is_captain ? 'CAPTAIN' : p.is_substitute ? 'SUBSTITUTE' : 'PLAYER',
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

      setTeams(uiTeams);
      hasLoadedTeams.current = true;
    } catch (err) {
      console.error("Team Sync Error:", err);
      if (!hasLoadedTeams.current) setError("Failed to load team roster."); 
    } finally {
      isFetchingTeams.current = false;
    }
  }, []); 

  // --- 2. FETCH MATCHES (Live Data) ---
  const fetchMatches = useCallback(async () => {
    // Prevent concurrent fetches or overlap with polling
    if (isFetchingMatches.current) return;
    isFetchingMatches.current = true;

    try {
      let matchesData = [];
      
      if (session.isAuthenticated && session.pin) {
        const res = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
        matchesData = res.data || [];
      } else {
        const res = await supabase.rpc('get_public_matches');
        matchesData = res.data || [];
      }

      const uiMatches = matchesData.map((m) => {
        const { banned, picked, pickedMaps } = parseVetoState(m.metadata?.veto);
        
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
          
          team1Name: m.team1_name || "TBD",
          team2Name: m.team2_name || "TBD",
          team1Logo: m.team1_logo,
          team2Logo: m.team2_logo,
          score: m.score || '0-0',
          state: m.state,
          status: displayStatus,
          vetoState: { 
            phase: m.state === 'complete' ? 'complete' : 'ban', 
            turn: m.metadata?.turn === 'A' ? m.team1_id : m.metadata?.turn === 'B' ? m.team2_id : null,
            bannedMaps: banned, 
            pickedMap: picked,
            pickedMaps: pickedMaps
          },
          metadata: { ...m.metadata, sos_triggered: m.sos_triggered, sos_by: m.sos_by, assigned_admin_name: m.assigned_admin_name },
          server_ip: m.server_ip || null,
          gotv_ip: m.gotv_ip || null,
          stream_url: m.stream_url || null
        };
      });

      setMatches(uiMatches);
      setLastUpdated(new Date());
      hasLoadedMatches.current = true;
      
      // Clear error if we have successful data to prevent flickering
      if (matchesData.length > 0) {
        setError(prev => prev ? null : prev);
      }

    } catch (err) {
      console.error("Match Sync Error:", err);
      if (!hasLoadedMatches.current) setError(err.message);
    } finally {
      isFetchingMatches.current = false;
      // Note: We do not set global loading false here to avoid thrashing on poll
    }
  }, [session.pin, session.isAuthenticated]); // Removed 'error' and 'matches.length' dependencies

  // --- 3. LIFECYCLE MANAGEMENT ---

  // Initial Load
  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      setLoading(true);
      await Promise.all([fetchTeams(), fetchMatches()]);
      if (mounted) setLoading(false);
    };
    boot();
    return () => { mounted = false; };
  }, [fetchTeams, fetchMatches]);

  // Adaptive Polling
  useEffect(() => {
    const isAdmin = [ROLES.ADMIN, ROLES.OWNER].includes(session.role);
    const pollRate = session.isAuthenticated && isAdmin ? 10000 : 30000;
    
    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchMatches().finally(() => setIsRefreshing(false));
    }, pollRate);

    return () => clearInterval(interval);
  }, [fetchMatches, session.isAuthenticated, session.role]);

  // Force Sync (Admin Action)
  // Uses setIsRefreshing to avoid unmounting UI components
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([fetchTeams(), fetchMatches()]);
    setIsRefreshing(false);
  }, [fetchTeams, fetchMatches]);

  // --- 4. MUTATION ACTIONS ---

  const submitVeto = async (matchId, payload) => {
    if (!session.pin) throw new Error("Unauthorized");
    const { error } = await supabase.rpc('submit_veto', { 
      match_id: matchId, 
      input_pin: session.pin, 
      action: payload.action, 
      target_map_id: payload.mapId 
    });
    if (error) throw error;
    fetchMatches();
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Unauthorized");
    const { error } = await supabase.rpc('admin_update_match', { 
      match_id: matchId, 
      input_pin: session.pin, 
      updates: updates 
    });
    if (error) throw error;
    fetchMatches();
  };

  const triggerSOS = async (matchId) => {
    if (!session.pin) throw new Error("Unauthorized");
    const { error } = await supabase.rpc('trigger_sos', { 
      match_id: matchId, 
      input_pin: session.pin 
    });
    if (error) throw error;
    fetchMatches();
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

  // --- 5. SELECTORS ---
  
  const rounds = useMemo(() => {
    if (!matches.length) return {};
    const grouped = matches.reduce((acc, m) => {
      const r = m.round || 1;
      if (!acc[r]) acc[r] = [];
      acc[r].push(m);
      return acc;
    }, {});
    
    Object.keys(grouped).forEach(r => {
      grouped[r].sort((a, b) => (a.slot || 0) - (b.slot || 0));
    });
    
    return grouped;
  }, [matches]);

  return (
    <TournamentContext.Provider value={{
      teams,
      matches,
      rounds,
      loading,
      isRefreshing,
      error,
      lastUpdated,
      submitVeto,
      adminUpdateMatch,
      triggerSOS,
      fetchMatchTimeline,
      refreshMatches: refreshAll
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
