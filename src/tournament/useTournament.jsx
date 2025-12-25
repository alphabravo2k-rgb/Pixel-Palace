import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const TournamentContext = createContext();

export const TournamentProvider = ({ children, defaultId }) => {
  // ✅ Initialize state with the defaultId if provided
  const [selectedTournamentId, setSelectedTournamentId] = useState(defaultId || null);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentData, setTournamentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch List of Tournaments (for Admin Selector)
  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, status, start_date')
        .order('start_date', { ascending: false });
      
      if (data) {
        setTournaments(data);
        // If no default was passed, and we have tournaments, auto-select the first one?
        // Let's stick to the env var for precision, but fallback to first if desperate.
        if (!selectedTournamentId && data.length > 0) {
             // Optional: setSelectedTournamentId(data[0].id);
        }
      }
    };
    fetchTournaments();
  }, []);

  // 2. Fetch Active Tournament Data
  useEffect(() => {
    if (!selectedTournamentId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', selectedTournamentId)
          .single();
        
        if (error) throw error;
        setTournamentData(data);
      } catch (err) {
        console.error("Tournament Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedTournamentId]);

  return (
    <TournamentContext.Provider value={{
      selectedTournamentId,
      setSelectedTournamentId,
      tournaments,
      tournamentData,
      loading,
      error
    }}>
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
