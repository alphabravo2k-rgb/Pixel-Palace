import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
// 🛑 FIX: Import useSession to bridge the gap
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';

const TournamentContext = createContext();

export const TournamentProvider = ({ children, defaultId }) => {
  const { session } = useSession(); // 🔗 BINDING THE SESSION
  
  const [selectedTournamentId, setSelectedTournamentId] = useState(defaultId || null);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentData, setTournamentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch List of Tournaments (For Admin Selector or Public History)
  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, status, start_date')
        .order('start_date', { ascending: false });
      
      if (data) {
        setTournaments(data);
        
        // Fallback: If no default env var and no selection, grab the first active one
        if (!selectedTournamentId && data.length > 0 && !defaultId) {
             setSelectedTournamentId(data[0].id);
        }
      }
    };
    fetchTournaments();
  }, [defaultId, selectedTournamentId]);

  // 🛡️ 2. CRITICAL BINDING: Session Claims -> Tournament Selection
  // If the user logs in as a Captain, they are strictly bound to ONE tournament.
  // We must force the app to switch to that tournament immediately.
  useEffect(() => {
    if (session.isAuthenticated && session.role === ROLES.CAPTAIN) {
      // Captains usually have exactly one tournament ID in their claims
      const allowedTournamentId = session.claims.tournamentIds[0];
      
      if (allowedTournamentId && selectedTournamentId !== allowedTournamentId) {
        console.log(`🔗 Binding Violation Detected. Auto-switching Captain to ${allowedTournamentId}`);
        setSelectedTournamentId(allowedTournamentId);
      }
    }
  }, [session, selectedTournamentId]);

  // 3. Fetch Active Tournament Data
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
