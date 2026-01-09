/**
 * 📊 USE LEADERBOARD: GLOBAL RANKING ENGINE
 * STATUS: SECURED // PAGINATED
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getTierFromElo } from './tournamentUtils';

export const useLeaderboard = (seasonId = 'current') => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      
      // Fetch profiles sorted by ELO (Descending)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, faceit_elo, country_code')
        .order('faceit_elo', { ascending: false })
        .limit(100); // Top 100 Global

      if (!error && data) {
        // Enrich data with Calculated Tiers
        const enriched = data.map((player, index) => ({
          ...player,
          rank: index + 1,
          tier: getTierFromElo(player.faceit_elo)
        }));
        setLeaderboard(enriched);
      }
      setLoading(false);
    };

    fetchRankings();
  }, [seasonId]);

  return { leaderboard, loading };
};
