/**
 * 🛰️ FACEIT SERVICE: EXTERNAL INTELLIGENCE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // EDGE-PROXY LINKED
 */

import { supabase } from '../supabase/client';
// Note: Safe navigation prevents crashes if audio engine isn't ready
import { SoundNexus, CUES } from '../lib/soundNexus';
import { getTierFromElo } from '../tournament/tournamentUtils';

export const FaceitService = {
  /**
   * 🔍 VERIFY PLAYER
   * Invokes the Edge Proxy to sanitize and return external stats.
   * @param {string} nickname - Faceit Username
   */
  verifyPlayer: async (nickname) => {
    if (!nickname) throw new Error("Nickname required for uplink.");

    try {
      // 1. Invoke Secure Edge Function (Hides API Keys)
      const { data, error } = await supabase.functions.invoke('faceit-proxy', {
        body: { nickname }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      // 🔊 HAPTIC SUCCESS: Identity found
      try { SoundNexus.playSpatial(CUES.UI_SUCCESS, { volume: 0.5 }); } catch(e){}

      return {
        success: true,
        player_id: data.player_id,
        nickname: data.nickname,
        avatar: data.avatar || 'https://assets.faceit-cdn.net/avatars/default_avatar_100x100.png',
        elo: data.elo,
        level: data.level,
        country: data.country
      };

    } catch (err) {
      console.error("Faceit Uplink Failed:", err);
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      return { success: false, message: err.message || "Player not found." };
    }
  },

  /**
   * 🔄 SYNC PROFILE
   * Updates the internal database with external Faceit credentials.
   * Usage: Call on Registration or "Refresh Stats" button.
   */
  syncProfile: async (userId, faceitNickname) => {
    // 1. Verify External Data
    const stats = await FaceitService.verifyPlayer(faceitNickname);
    
    if (stats.success) {
      // 2. Calculate Tier internally to ensure consistency with Leaderboard
      const tierData = getTierFromElo(stats.elo);
      
      // 3. Update Database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          faceit_elo: stats.elo,
          rank_tier: tierData.tier, // Synced with tournament/tournamentUtils.js
          avatar_url: stats.avatar,
          country_code: stats.country
        })
        .eq('id', userId);

      if (error) throw error;
      return stats;
    }
    return null;
  }
};
