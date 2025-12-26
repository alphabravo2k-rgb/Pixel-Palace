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

  // 1. FETCH LIST (Corrected Column Names)
  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('id, name, status, start_date') // ✅ Corrected starts_at -> start_date
        .order('start_date', { ascending: false });
      
      if (fetchError) {
        console.error("Tournament List Error:", fetchError);
        return;
      }

      if (data) {
        setTournaments(data);
        if (!selectedTournamentId && data.length > 0 && !defaultId) {
           const lastId = localStorage.getItem('pp_active_tid');
           setSelectedTournamentId(lastId || data[0].id);
        }
      }
    };
    fetchTournaments();
  }, [defaultId]);

  // 2. CAPTAIN BINDING
  useEffect(() => {
    if (session?.isAuthenticated && session?.role === ROLES.CAPTAIN) {
      const allowedTournamentId = session.identity?.tournament_id;
      if (allowedTournamentId && selectedTournamentId !== allowedTournamentId) {
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

  // 4. STATE MACHINE (Corrected for start_date)
  const updateLocalState = (data) => {
    if (!data) return;
    setTournamentData(data);
    
    let status = 'SETUP';
    const now = new Date();
    // ✅ Corrected starts_at -> start_date
    const start = data.start_date ? new Date(data.start_date) : null;

    if (data.status === 'COMPLETED') status = 'COMPLETED';
    else if (start && now >= start) status = 'LIVE';
    else if (data.status === 'REGISTRATION') status = 'REGISTRATION';

    setLifecycle({
      status,
      isLocked: status === 'LIVE' || status === 'COMPLETED',
      isRegistrationOpen: status === 'REGISTRATION',
      canGenerateBracket: (status === 'REGISTRATION' || status === 'SETUP') && !data.bracket_generated
    });
  };

  const validateAction = useCallback((action) => {
    if (!tournamentData) return false;
    if (action === 'EDIT_SETTINGS' && lifecycle.status === 'LIVE') {
        alert("ACTION BLOCKED: Cannot edit settings while tournament is LIVE.");
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
