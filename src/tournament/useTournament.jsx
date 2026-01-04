import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

const TournamentContext = createContext(null);

export const TournamentProvider = ({ children, defaultId }) => {
  const { session } = useSession();
  
  // 1. STATE
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

  // 2. FETCH LIST (On Mount)
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
        // Smart Selection: Prioritize localStorage, then prop, then newest
        if (!selectedTournamentId && data.length > 0) {
           const lastId = localStorage.getItem('pp_active_tid');
           const isValid = data.find(t => t.id === lastId);
           setSelectedTournamentId(isValid ? lastId : data[0].id);
        }
      }
    };
    fetchTournaments();
  }, [defaultId, selectedTournamentId]);

  // 3. LOAD ACTIVE TOURNAMENT & REAL-TIME
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

    // ⚡ REAL-TIME: Listen for Phase Changes or Theme Updates
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

  // 4. THEME PAINTER (The Magic 🎨)
  // Automatically injects DB colors into Tailwind CSS Variables
  useEffect(() => {
    if (!tournamentData) return;

    const root = document.documentElement;
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '192 38 211';
    };

    if (tournamentData.theme_color) {
        root.style.setProperty('--color-brand', hexToRgb(tournamentData.theme_color));
    }
    if (tournamentData.theme_color_dim) {
        root.style.setProperty('--color-brand-dim', hexToRgb(tournamentData.theme_color_dim));
    }
    if (tournamentData.theme_color_glow) {
        root.style.setProperty('--color-brand-glow', hexToRgb(tournamentData.theme_color_glow));
    }
  }, [tournamentData]);

  // 5. HELPER LOGIC
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

  // 6. ADMIN ACTIONS
  const updateStatus = async (newStatus) => {
      if (!selectedTournamentId) return;
      const { error } = await supabase
        .from('tournaments')
        .update({ status: newStatus })
        .eq('id', selectedTournamentId);
      if (error) throw error;
      // UI updates automatically via Realtime Subscription above
  };

  // 7. MEMOIZED CONTEXT
  const value = useMemo(() => ({
    selectedTournamentId,
    setSelectedTournamentId,
    tournaments,
    tournamentData,
    lifecycle,
    loading,
    error,
    actions: { updateStatus }
  }), [selectedTournamentId, tournaments, tournamentData, lifecycle, loading, error]);

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error('useTournament must be used within a TournamentProvider');
  return context;
};
