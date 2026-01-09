/**
 * 📊 USE LEADERBOARD: GLOBAL RANKING ENGINE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // SCALABLE // REAL-TIME
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { getTierFromElo } from './tournamentUtils';
// Note: Safe navigation used for audio to prevent crashes if engine is loading
import { SoundNexus, CUES } from '../lib/soundNexus';

export const useLeaderboard = (options = { limit: 50, region: 'global' }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);

  const fetchRankings = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    
    const from = page * options.limit;
    const to = from + options.limit - 1;

    // 1. Construct Query
    let query = supabase
      .from('profiles')
      .select('id, display_name, avatar_url, faceit_elo, country_code, is_verified')
      .order('faceit_elo', { ascending: false })
      .range(from, to);

    // 🌍 Regional Filter Integration
    if (options.region !== 'global') {
      query = query.eq('country_code', options.region);
    }

    const { data, error: dbError } = await query;

    if (dbError) {
      console.error("Leaderboard Error:", dbError);
      setError(dbError.message);
    } else if (data) {
      // 2. Hydrate Data with Visual Tiers
      const enriched = data.map((player, index) => ({
        ...player,
        rank: from + index + 1,
        tier: getTierFromElo(player.faceit_elo)
      }));
      
      setLeaderboard(enriched);
      
      if (isRefreshing) {
        try { SoundNexus.playSpatial(CUES.UI_TICK, { volume: 0.1 }); } catch(e){}
      }
    }
    
    setLoading(false);
  }, [page, options.limit, options.region]);

  // 3. INITIAL LOAD & PAGINATION SYNC
  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // 4. THE "LIVE PULSE" (Real-time Ranking Shifts)
  // Re-fetch rankings when high-ELO profiles update their stats
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-pulse')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        // Optimization: Only refresh if the change impacts the visible High Tiers (>2000 ELO)
        const newElo = payload.new.faceit_elo || 0;
        const oldElo = payload.old.faceit_elo || 0;
        
        if (newElo > 2000 || oldElo > 2000) {
          fetchRankings(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchRankings]);

  return { 
    leaderboard, 
    loading, 
    error,
    page,
    actions: { 
      nextPage: () => {
        setPage(p => p + 1);
        try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
      },
      prevPage: () => {
        setPage(p => Math.max(0, p - 1));
        try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
      },
      refresh: () => fetchRankings(true)
    } 
  };
};
