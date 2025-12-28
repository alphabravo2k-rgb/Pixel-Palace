import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';

const TournamentContext = createContext(null);

export const TournamentProvider = ({ children, defaultId }) => {
  const { session } = useSession();
  
  const [selectedTournamentId, setSelectedTournamentId] = useState(defaultId || null);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentData, setTournamentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [lifecycle, setLifecycle] = useState({
    status: 'LOADING',
    isLocked: true,
    isRegistrationOpen: false,
    canGenerateBracket: false
  });

  // 1. FETCH LIST
  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('id, name, status, start_date')
        .order('start_date', { ascending: false });
      
      if (fetchError) {
        console.error("Tournament List Error:", fetchError);
        return;
      }

      if (data) {
        setTournaments(data);
        // Auto-select logic
        if (!selectedTournamentId && data.length > 0 && !defaultId) {
           const lastId = localStorage.getItem('pp_active_tid');
           // Validate lastId exists in data
           const isValid = data.find(t => t.id === lastId);
           setSelectedTournamentId(isValid ? lastId : data[0].id);
        }
      }
    };
    fetchTournaments();
  }, [defaultId]);

  // 2. CAPTAIN BINDING (Security UX Fix)
  useEffect(() => {
    // If user is a Captain, they are bound to their team's tournament.
    // We enforce this in UI to prevent confusion, while RLS enforces it in data.
    if (session?.isAuthenticated && session?.role === ROLES.CAPTAIN) {
      // Assuming 'session.tournament_id' is populated by your Auth Provider via team_members join
      const allowedTournamentId = session.tournament_id; 
      
      if (allowedTournamentId && selectedTournamentId !== allowedTournamentId) {
        console.warn("🔒 SECURITY: Redirecting Captain to assigned tournament.");
        // UX FIX: Loud Notification
        alert("SECURITY ALERT: You are restricted to your registered tournament context.");
        setSelectedTournamentId(allowedTournamentId);
      }
    }
  }, [session, selectedTournamentId]);

  // 3. LOAD DETAILS & REAL-TIME
  useEffect(() => {
    if (!selectedTournamentId) return;
    
    localStorage.setItem('pp_active_tid', selectedTournamentId);
    setLoading(true);
    
    const fetchDetails = async (id) => {
        try {
          const { data, error: detailError } = await supabase
            .from('tournaments')
            .select('*')
            .eq('id', id)
            .single();
          
          if (detailError) throw detailError;
          updateLocalState(data);
        } catch (err) {
          console.error("Tournament Detail Error:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

    fetchDetails(selectedTournamentId);

    const subscription = supabase
      .channel(`tournament_live_${selectedTournamentId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tournaments', 
        filter: `id=eq.${selectedTournamentId}` 
      }, (payload) => {
        updateLocalState(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [selectedTournamentId]);

  // 4. STATE MACHINE (Aligned with Backend Enums)
  const updateLocalState = (data) => {
    if (!data) return;
    setTournamentData(data);
    
    // Backend Enum: 'setup', 'seeding', 'active', 'completed'
    const status = data.status || 'setup';

    setLifecycle({
      status: status.toUpperCase(),
      // Locked = Active or Completed (No settings changes allowed)
      isLocked: ['active', 'completed'].includes(status),
      // Registration = Setup only
      isRegistrationOpen: status === 'setup',
      // Bracket Gen = Seeding phase
      canGenerateBracket: status === 'seeding'
    });
  };

  const validateAction = useCallback((action) => {
    if (!tournamentData) return false;
    // Example: Block editing settings if tournament is live
    if (action === 'EDIT_SETTINGS' && lifecycle.isLocked) {
        alert("ACTION BLOCKED: Tournament is LIVE/LOCKED.");
        return false;
    }
    return true;
  }, [lifecycle, tournamentData]);

  return (
    <TournamentContext.Provider value={{
      selectedTournamentId,
      setSelectedTournamentId,
      tournaments,
      tournamentData,
      lifecycle,
      validateAction,
      loading,
      error
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error('useTournament must be used within a TournamentProvider');
  return context;
};
