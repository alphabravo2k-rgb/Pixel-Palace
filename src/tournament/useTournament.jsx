import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';

const TournamentContext = createContext();

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
      setLoading(true);
      const [teamsRes, matchesRes] = await Promise.all([
        supabase.from('teams').select('*, players(*)').order('seed_number', { ascending: true }),
        supabase.rpc('get_public_matches')
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (matchesRes.error) throw matchesRes.error;

      const rawMatches = matchesRes.data || [];

      // 1. Normalize Teams
      const uiTeams = (teamsRes.data || []).map((t) => ({
        ...t,
        players: Array.isArray(t.players) ? t.players : []
      }));

      // 2. Normalize Matches (The Logic Fix)
      const uiMatches = rawMatches.map((m) => {
        const { banned, picked } = parseVetoState(m.metadata?.veto);
        
        let displayStatus = 'scheduled';
        if (m.state === 'complete') {
          displayStatus = 'completed';
        } else if (m.state === 'open') {
          if (m.server_ip && m.server_ip !== 'HIDDEN' && m.server_ip !== '') {
            displayStatus = 'live';
          } else if (banned.length > 0 || picked) {
            displayStatus = 'veto';
          } else {
            displayStatus = 'scheduled'; // Show as standby if open but no IP
          }
        }

        return {
          ...m,
          team1Name: m.team1_name || "OPEN SLOT",
          team2Name: m.team2_name || "OPEN SLOT",
          team1Logo: m.team1_logo,
          team2Logo: m.team2_logo,
          team1Id: m.team1_id,
          team2Id: m.team2_id,
          status: displayStatus,
          round: Number(m.round) // Ensure numeric for grouping
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
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
      refreshMatches: fetchData
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error("useTournament error");
  return context;
};
