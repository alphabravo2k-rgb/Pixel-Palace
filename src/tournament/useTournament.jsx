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

  // 1. FETCH TOURNAMENT LIST
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
        // Smart Selection: Remember last viewed or pick newest
        if (!selectedTournamentId && data.length > 0 && !defaultId) {
           const lastId = localStorage.getItem('pp_active_tid');
           const isValid = data.find(t => t.id === lastId);
           setSelectedTournamentId(isValid ? lastId : data[0].id);
        }
      }
    };
    fetchTournaments();
  }, [defaultId, selectedTournamentId]);

  // 2. LOAD DETAILS & REAL-TIME SUBSCRIPTION
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
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

    fetchDetails(selectedTournamentId);

    // ⚡ REAL-TIME: If Admin updates status/theme, clients update instantly
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

  // 3. STATE MACHINE
  const updateLocalState = (data) => {
    if (!data) return;
    setTournamentData(data);
    const status = data.status || 'setup';

    setLifecycle({
      status: status.toUpperCase(),
      isLocked: ['active', 'completed'].includes(status),
      isRegistrationOpen: status === 'setup',
      canGenerateBracket: status === 'seeding'
    });
  };

  return (
    <TournamentContext.Provider value={{
      selectedTournamentId,
      setSelectedTournamentId,
      tournaments,
      tournamentData,
      lifecycle,
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
