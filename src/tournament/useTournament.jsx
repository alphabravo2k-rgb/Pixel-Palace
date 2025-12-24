import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

/**
 * useTournament (HARDENED)
 * * RESPONSIBILITY:
 * - Fetch core tournament data (Tournament Row, Matches, Teams)
 * - Provide a "Loading" or "Error" state.
 * - NEVER crash the UI by returning undefined arrays.
 * * RULES:
 * - No mock data.
 * - No inferred state.
 * - Arrays default to [] to prevent .map() crashes.
 */
export const useTournament = (tournamentId) => {
  // 1. STATE: Explicit defaults prevent "Cannot read properties of null"
  const [state, setState] = useState({
    tournament: null, // The metadata (status, name)
    matches: [],      // The bracket nodes
    teams: [],        // The roster
    loading: true,
    error: null,
    lastUpdated: null // For debugging freshness
  });

  // 2. FETCH LOGIC
  const fetchTournamentData = useCallback(async () => {
    if (!tournamentId) {
      setState(prev => ({ ...prev, loading: false, error: "No Tournament ID provided" }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // A. Fetch Tournament Metadata
      const { data: tourneyData, error: tourneyError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tourneyError) throw tourneyError;
      if (!tourneyData) throw new Error("Tournament not found");

      // B. Fetch Teams (needed for rendering names in bracket)
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);

      if (teamsError) throw teamsError;

      // C. Fetch Matches (The Bracket Tree)
      // We order by round/slot to ensure visual consistency
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('slot', { ascending: true });

      if (matchesError) throw matchesError;

      // 3. SUCCESS UPDATE
      setState({
        tournament: tourneyData,
        matches: matchesData || [], // Safety fallback
        teams: teamsData || [],     // Safety fallback
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      console.error("[useTournament] Critical Fetch Error:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        // Don't expose raw SQL errors to UI, keeps it cleaner
        error: err.message || "Failed to load tournament data"
      }));
    }
  }, [tournamentId]);

  // 3. INITIAL EFFECT
  useEffect(() => {
    fetchTournamentData();
    
    // Optional: Realtime Subscription could go here later.
    // For now, we stick to fetch-on-mount for stability.
    
  }, [fetchTournamentData]);

  // 4. EXPOSED API (Safe Contracts)
  return {
    ...state,
    refresh: fetchTournamentData, // Manual re-fetch capability
    
    // Helper: Is the system ready?
    isReady: !state.loading && !state.error && !!state.tournament
  };
};
