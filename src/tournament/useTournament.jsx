import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase/client';

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Matches (AND join with Teams table to get names)
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            team1:team1_id ( name ),
            team2:team2_id ( name )
          `)
          .order('start_time', { ascending: true });

        if (matchesError) throw matchesError;

        // 2. Fetch Teams (AND join with Players table to get roster)
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select(`
            *,
            roster:players ( display_name, is_captain )
          `);

        if (teamsError && teamsError.code !== 'PGRST116') {
             console.warn("Teams fetch warning:", teamsError.message);
        }
        
        if (mounted) {
          // TRANSFORM MATCHES: Flatten the nested team objects for the UI
          const formattedMatches = (matchesData || []).map(m => ({
            ...m,
            team1_name: m.team1?.name || 'TBD',
            team2_name: m.team2?.name || 'TBD'
          }));
          setMatches(formattedMatches);

          // TRANSFORM TEAMS: Calculate captain and player list for the UI
          const formattedTeams = (teamsData || []).map(t => ({
            ...t,
            captain: t.roster?.find(p => p.is_captain)?.display_name || 'N/A',
            players: t.roster?.map(p => p.display_name) || []
          }));
          setTeams(formattedTeams); 
        }

      } catch (err) {
        console.error("Tournament Data Load Failed:", err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    // 3. Realtime Subscriptions (Refresh on any change)
    const matchSub = supabase
      .channel('public:matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
      .subscribe();
      
    const teamSub = supabase
      .channel('public:teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchData())
      .subscribe();

    const playerSub = supabase
      .channel('public:players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchData())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(matchSub);
      supabase.removeChannel(teamSub);
      supabase.removeChannel(playerSub);
    };
  }, []);

  const value = useMemo(() => ({
    matches,
    teams,
    loading,
    error
  }), [matches, teams, loading, error]);

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
