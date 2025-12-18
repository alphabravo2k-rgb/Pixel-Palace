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
        
        // 1. Fetch Matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .order('start_time', { ascending: true });

        if (matchesError) throw matchesError;

        // 2. Fetch Teams (if you have a teams table, otherwise mock/empty)
        // const { data: teamsData } = await supabase.from('teams').select('*');
        
        if (mounted) {
          setMatches(matchesData || []);
          // setTeams(teamsData || []);
        }

      } catch (err) {
        console.error("Tournament Data Load Failed:", err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    // 3. Realtime Subscription (Live Updates)
    const subscription = supabase
      .channel('public:matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
         fetchData(); // Refresh data on any change
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(subscription);
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
