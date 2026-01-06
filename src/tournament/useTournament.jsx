import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

const TournamentContext = createContext(null);

/**
 * 🏆 PIXEL PALACE: TOURNAMENT NEXUS
 * --------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * * CORE FEATURES:
 * 1. REAL-TIME SYNC: Websocket connection for instant status/bracket updates.
 * 2. THEME INJECTION: Repaints the entire app UI based on Tournament colors.
 * 3. MEDIA RESOLVER: Auto-generates public URLs for logos and banners.
 * 4. SECURITY: Strict lifecycle & ownership checks.
 */

export const TournamentProvider = ({ children, defaultId }) => {
  const { session } = useSession();
  
  // 1. ATOMIC STATE
  const [selectedTournamentId, setSelectedTournamentId] = useState(defaultId || null);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentData, setTournamentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [lifecycle, setLifecycle] = useState({
    status: 'LOADING',
    isLocked: true,
    isRegistrationOpen: false,
    canGenerateBracket: false,
    isAdmin: false // 🛡️ UID Security
  });

  // 2. THEME ENGINE (Hardware Accelerated)
  // Injects CSS variables directly into the document root for instant recoloring
  const paintTheme = useCallback((data) => {
    if (!data) return;
    const root = document.documentElement;
    
    // Helper: Hex -> Space-separated RGB (for Tailwind opacity modifiers)
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '192 38 211';
    };

    if (data.theme_color) root.style.setProperty('--color-brand', hexToRgb(data.theme_color));
    if (data.theme_color_dim) root.style.setProperty('--color-brand-dim', hexToRgb(data.theme_color_dim));
    if (data.theme_color_glow) root.style.setProperty('--color-brand-glow', hexToRgb(data.theme_color_glow));
  }, []);

  // 3. FETCH GLOBAL LIST (On Mount)
  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('id, name, status, start_date')
        .order('start_date', { ascending: false });
      
      if (fetchError) {
        console.error("Nexus List Error:", fetchError);
        return setError(fetchError.message);
      }

      if (data) {
        setTournaments(data);
        // Smart Restore: If no ID selected, try to restore from LocalStorage, else pick newest
        if (!selectedTournamentId && data.length > 0) {
          const lastId = localStorage.getItem('pp_active_tid');
          const isValid = data.find(t => t.id === lastId);
          setSelectedTournamentId(isValid ? lastId : data[0].id);
        }
      }
    };
    fetchTournaments();
  }, []); // Run once on mount

  // 4. ACTIVE TOURNAMENT DATA & REAL-TIME UPLINK
  useEffect(() => {
    if (!selectedTournamentId) return;
    
    // Persist selection
    localStorage.setItem('pp_active_tid', selectedTournamentId);
    setLoading(true);

    // 4a. Initial Data Load
    const loadData = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', selectedTournamentId)
          .single();
        
        if (dbError) throw dbError;
        processTournamentUpdate(data);
      } catch (err) {
        console.error("Nexus Detail Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // 4b. Real-Time Subscription (The "Pulse")
    const channel = supabase
      .channel(`tournament:${selectedTournamentId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tournaments', 
        filter: `id=eq.${selectedTournamentId}` 
      }, (payload) => {
        console.log("⚡ Nexus Update Received:", payload.new);
        processTournamentUpdate(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTournamentId, session?.user?.id]); // Re-run if ID or User changes

  // 5. DATA PROCESSING CORE
  const processTournamentUpdate = (data) => {
    if (!data) return;

    // Resolve Media URLs (Cloud Storage -> Public URL)
    const media = {
      logo: data.logo_path 
        ? supabase.storage.from('tournaments').getPublicUrl(data.logo_path).data.publicUrl 
        : null,
      banner: data.banner_path 
        ? supabase.storage.from('tournaments').getPublicUrl(data.banner_path).data.publicUrl 
        : null,
    };

    setTournamentData({ ...data, media });
    paintTheme(data);

    // Calculate Lifecycle State
    const status = data.status || 'setup';
    setLifecycle({
      status: status.toUpperCase(),
      isLocked: ['active', 'completed'].includes(status),
      isRegistrationOpen: status === 'setup',
      canGenerateBracket: status === 'seeding',
      isAdmin: data.owner_id === session?.user?.id // 🛡️ Ownership Check
    });
  };

  // 6. ADMIN ACTIONS
  const updateStatus = async (newStatus) => {
    if (!lifecycle.isAdmin) throw new Error("ACCESS_DENIED: You do not have Overlord privileges.");
    
    const { error } = await supabase
      .from('tournaments')
      .update({ status: newStatus })
      .eq('id', selectedTournamentId);
    
    if (error) throw error;
    // Note: No need to set state here manually; the Real-time subscription will catch the DB change and update UI.
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
