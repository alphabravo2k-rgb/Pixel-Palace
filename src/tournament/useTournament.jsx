import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

const TournamentContext = createContext();

const extractFaceitNickname = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    const segments = u.pathname.split('/').filter(Boolean);
    const idx = segments.indexOf('players');
    return idx !== -1 ? segments[idx + 1] : null;
  } catch { return null; }
};

export const TournamentProvider = ({ children }) => {
  const { session } = useSession();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const parseVetoState = (vetoMeta, team1Id, team2Id) => {
    const banned = [];
    let picked = null;
    const maps = vetoMeta?.maps || [];
    maps.forEach(m => {
      if (m.action === 'BAN') banned.push(m.map_id);
      if (m.action === 'PICK') picked = m.map_id;
    });
    
    let turnId = null;
    if (vetoMeta?.turn === 'A') turnId = team1Id;
    if (vetoMeta?.turn === 'B') turnId = team2Id;

    return { bannedMaps: banned, pickedMap: picked, turn: turnId, phase: vetoMeta?.phase || 'ban' };
  };

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, playersRes] = await Promise.all([
        supabase.from('teams').select('*').order('seed_number', { ascending: true }),
        supabase.from('players').select('*')
      ]);

      let matchesData = [];
      if (session.isAuthenticated && session.pin) {
        const { data } = await supabase.rpc('get_authorized_matches', { input_pin: session.pin });
        matchesData = data || [];
      } else {
        const { data } = await supabase.rpc('get_public_matches');
        matchesData = data || [];
      }

      const uiTeams = (teamsRes.data || []).map(t => ({
        ...t,
        players: (playersRes.data || []).filter(p => p.team_id === t.id).map(p => ({
          ...p,
          nickname: extractFaceitNickname(p.faceit_url),
          role: p.is_captain ? 'CAPTAIN' : 'PLAYER'
        }))
      }));

      const uiMatches = matchesData.map(m => {
        const veto = parseVetoState(m.metadata?.veto, m.team1_id, m.team2_id);
        let status = 'scheduled';
        if (m.state === 'complete') status = 'completed';
        else if (m.state === 'open') {
          status = (m.server_ip && m.server_ip !== 'HIDDEN') ? 'live' : 
                   (veto.bannedMaps.length > 0) ? 'veto' : 'ready';
        }

        return {
          ...m,
          status,
          vetoState: veto,
          team1Name: m.team1_name || "TBD",
          team2Name: m.team2_name || "TBD"
        };
      });

      setTeams(uiTeams);
      setMatches(uiMatches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session.pin, session.isAuthenticated]);

  useEffect(() => {
    fetchData();
    const matchSubscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(matchSubscription);
  }, [fetchData]);

  const submitVeto = async (matchId, payload) => {
    const { error } = await supabase.rpc('submit_veto', {
      match_id: matchId, input_pin: session.pin, action: payload.action, target_map_id: payload.mapId
    });
    if (error) throw error;
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
      teams, matches, rounds, loading,
      submitVeto, refreshMatches: fetchData
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
