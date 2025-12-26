import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles'; // Ensure this path exists

const TournamentContext = createContext(null);

export const TournamentProvider = ({ children, defaultId }) => {
  const { session } = useSession();
  
  // STATE
  const [selectedTournamentId, setSelectedTournamentId] = useState(defaultId || null);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentData, setTournamentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // LIFECYCLE STATE (The New Brain)
  const [lifecycle, setLifecycle] = useState({
    status: 'LOADING',
    isLocked: true,
    isRegistrationOpen: false,
    canGenerateBracket: false
  });

  // 1. FETCH LIST & AUTO-SELECT
  useEffect(() => {
    const fetchTournaments = async () => {
      const { data } = await supabase
        .from('tournaments')
        .select('id, name, status, starts_at')
        .order('starts_at', { ascending: false });
      
      if (data) {
        setTournaments(data);
        // Fallback: If no selection, grab the first active one
        if (!selectedTournamentId && data.length > 0 && !defaultId) {
           // Check local storage preference first
           const lastId = localStorage.getItem('pp_active_tid');
           setSelectedTournamentId(lastId || data[0].id);
        }
      }
    };
    fetchTournaments();
  }, [defaultId]); // Intentionally removed selectedTournamentId to avoid loops

  // 2. CRITICAL BINDING: Captain -> Tournament (Your Logic Preserved)
  useEffect(() => {
    if (session.isAuthenticated && session.role === ROLES.CAPTAIN) {
      const allowedTournamentId = session.identity?.tournament_id;
      // If a Captain tries to look at a tournament they don't own, force switch them back
      if (allowedTournamentId && selectedTournamentId !== allowedTournamentId) {
        console.warn(`🔒 Security: Re-binding Captain to ${allowedTournamentId}`);
        setSelectedTournamentId(allowedTournamentId);
      }
    }
  }, [session, selectedTournamentId]);

  // 3. LOAD DATA + REAL-TIME SYNC (The Upgrade)
  useEffect(() => {
    if (!selectedTournamentId) return;
    
    // Save preference
    localStorage.setItem('pp_active_tid', selectedTournamentId);
    
    setLoading(true);
    fetchDetails(selectedTournamentId);

    // REAL-TIME: Watch for Lock/Status changes
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

  const fetchDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      updateLocalState(data);
    } catch (err) {
      console.error("Tournament Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. STATE MACHINE CALCULATOR
  const updateLocalState = (data) => {
    setTournamentData(data);
    
    let status = 'SETUP';
    const now = new Date();
    const start = data.starts_at ? new Date(data.starts_at) : null;

    if (data.status === 'COMPLETED') status = 'COMPLETED';
    else if (start && now >= start) status = 'LIVE';
    else if (data.status === 'REGISTRATION') status = 'REGISTRATION'; // Trust DB flag if set

    setLifecycle({
      status,
      // Lock settings if Live or Completed
      isLocked: status === 'LIVE' || status === 'COMPLETED',
      isRegistrationOpen: status === 'REGISTRATION',
      canGenerateBracket: status === 'REGISTRATION' || status === 'SETUP'
    });
  };

  // 5. THE IRON CURTAIN (Action Validator)
  const validateAction = useCallback((action) => {
    if (!tournamentData) return false;

    if (action === 'EDIT_SETTINGS') {
      if (lifecycle.status === 'LIVE') {
        alert("ACTION BLOCKED: Cannot edit settings while tournament is LIVE.");
        return false;
      }
    }
    return true;
  }, [lifecycle, tournamentData]);

  return (
    <TournamentContext.Provider value={{
      selectedTournamentId,
      setSelectedTournamentId,
      tournaments,
      tournamentData,
      lifecycle,      // <--- New State
      validateAction, // <--- New Enforcer
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
