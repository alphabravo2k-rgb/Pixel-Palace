/**
 * 🏆 PIXEL PALACE: OPERATIONAL COMMAND NEXUS
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // REAL-TIME SYNC // THEME INJECTION
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useNexusStore } from '../store/useNexusStore';
import { ROLE_DEF } from '../lib/roles';
// Note: Ensure SoundNexus exists. Safe navigation used below.
import { SoundNexus, CUES } from '../lib/soundNexus';

const TournamentContext = createContext(null);

export const TournamentProvider = ({ children }) => {
  const { profile } = useNexusStore();
  
  // 1. ATOMIC STATE
  const [activeTournamentId, setActiveTournamentId] = useState(() => localStorage.getItem('pp_active_tid') || null);
  const [tournaments, setTournaments] = useState([]); // List of available events
  const [tournamentData, setTournamentData] = useState(null); // Full details of active event
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. DYNAMIC THEME ENGINE (Visual Recalibration)
  // Repaints the UI (CSS Variables) to match the Tournament's brand identity
  const recalibrateVisuals = useCallback((theme) => {
    if (!theme) return;
    const root = document.documentElement;
    
    // Helper: Hex -> RGB for Tailwind opacity modifiers (e.g. bg-brand/50)
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '192 38 211';
    };

    if (theme.primary_color) root.style.setProperty('--brand-rgb', hexToRgb(theme.primary_color));
    if (theme.secondary_color) root.style.setProperty('--brand-dim-rgb', hexToRgb(theme.secondary_color));
    if (theme.accent_color) root.style.setProperty('--brand-glow-rgb', hexToRgb(theme.accent_color));
    
    // 🔊 Auditory confirmation of visual shift
    try { SoundNexus.playSpatial(CUES.UI_POWER_UP, { volume: 0.2 }); } catch(e) {}
  }, []);

  // 3. FETCH GLOBAL OPERATIONS (List View)
  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('id, name, slug, status, start_date')
        .order('start_date', { ascending: false });
      
      if (fetchError) {
        console.error("Nexus List Error:", fetchError);
        return setError(fetchError.message);
      }

      setTournaments(data || []);
      
      // Auto-select most recent if none selected
      if (!activeTournamentId && data?.length > 0) {
        setActiveTournamentId(data[0].id);
      }
      setLoading(false);
    };
    fetchTournaments();
  }, []); 

  // 4. REAL-TIME UPLINK (The "Pulse")
  useEffect(() => {
    if (!activeTournamentId) return;
    
    localStorage.setItem('pp_active_tid', activeTournamentId);
    setLoading(true);

    // 4a. Initial Data Load
    const syncTournament = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', activeTournamentId)
        .single();

      if (data) {
        setTournamentData(data);
        // Assuming 'theme_config' is a JSON column in your DB: { primary_color: "#ff0000", ... }
        if (data.theme_config) recalibrateVisuals(data.theme_config);
      }
      setLoading(false);
    };
    syncTournament();

    // 4b. Real-time Listener
    const channel = supabase
      .channel(`tournament:${activeTournamentId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tournaments', 
        filter: `id=eq.${activeTournamentId}` 
      }, (payload) => {
        console.log("⚡ Nexus Update Received:", payload.new);
        setTournamentData(payload.new);
        
        // If status changes to LIVE, play alert
        if (payload.new.status === 'live' && payload.old.status !== 'live') {
           try { SoundNexus.playSpatial(CUES.NOTIFICATION); } catch(e) {}
        }
        
        // Live Theme Updates
        if (payload.new.theme_config) recalibrateVisuals(payload.new.theme_config);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTournamentId, recalibrateVisuals]);

  // 5. SOVEREIGN ACTIONS (Secured by Logic Layer)
  const actions = {
    // Organizers can force a status change (e.g., "Start Tournament")
    updateStatus: async (newStatus) => {
      // 🛡️ Security Check
      const userRole = profile?.role || 'guest';
      const userLevel = ROLE_DEF[userRole.toUpperCase()]?.level || 0;
      
      // Level 50 = ORGANIZER
      if (userLevel < 50) {
        try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
        throw new Error("ACCESS_DENIED: Insufficient Clearance.");
      }
      
      const { error } = await supabase
        .from('tournaments')
        .update({ status: newStatus })
        .eq('id', activeTournamentId);
      
      if (error) throw error;
      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
    }
  };

  const value = useMemo(() => ({
    activeTournamentId,
    setActiveTournamentId,
    tournaments,
    tournamentData,
    loading,
    error,
    actions
  }), [activeTournamentId, tournaments, tournamentData, loading, error, profile]);

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
};s
