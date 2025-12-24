import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

// 1. Create the Context
const TournamentContext = createContext(null);

// 2. Define the Hook Logic (Internal)
const useTournamentLogic = (tournamentId) => {
  const [state, setState] = useState({
    tournament: null,
    matches: [],
    teams: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchTournamentData = useCallback(async () => {
    if (!tournamentId) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data: tourneyData, error: tourneyError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tourneyError) throw tourneyError;

      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);

      if (teamsError) throw teamsError;

      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('slot', { ascending: true });

      if (matchesError) throw matchesError;

      setState({
        tournament: tourneyData,
        matches: matchesData || [],
        teams: teamsData || [],
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      console.error("[useTournament] Error:", err);
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  return { ...state, refresh: fetchTournamentData };
};

// 3. Export the Provider Component (Used in App.jsx)
export const TournamentProvider = ({ children, tournamentId }) => {
  const tournamentData = useTournamentLogic(tournamentId);
  
  return (
    <TournamentContext.Provider value={tournamentData}>
      {children}
    </TournamentContext.Provider>
  );
};

// 4. Export the Hook (Used in Components)
export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return context;
};
