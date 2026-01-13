/**
 * ⚔️ USE QUEUE: THE MATCHMAKER (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // REALTIME-ENABLED
 */

import { useCallback, useEffect } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { useNexus } from './useNexus';
import { supabase } from '../supabase/client';
import { toast } from 'react-hot-toast';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';

export const useQueue = () => {
  // 1. Get User from Nexus (Correctly using 'user' from the hook we built)
  const { user, isAuthenticated } = useNexus();
  
  const { 
    isQueued, 
    queueTime, 
    matchFound, 
    setQueued, 
    setMatchFound 
  } = useQueueStore();

  /**
   * 🟢 JOIN QUEUE (Deployment)
   */
  const joinQueue = useCallback(async () => {
    if (!isAuthenticated || !user) return toast.error("AUTHENTICATION REQUIRED");

    try {
      // 🛰️ TELEMETRY: Track search start
      Telemetry.log(EVENTS.ACTION, { action: 'queue_join', region: 'asia' }, user.id);

      // Use upsert to handle potential zombie records
      const { error } = await supabase
        .from('match_queue')
        .upsert({ 
          player_id: user.id, 
          region: 'asia',
          elo: user.faceit_elo || 1000, // Use ELO from profile
          joined_at: new Date().toISOString()
        });

      if (error) throw error;

      setQueued(true);
      SoundNexus.play(CUES.UI_POWER_UP);
      toast.success("SEARCHING FOR OPERATIVES...", {
        style: { background: '#09090b', color: '#10b981', border: '1px solid #10b98150' }
      });
      
    } catch (err) {
      console.error(err);
      toast.error("UPLINK FAILED: " + err.message);
    }
  }, [user, isAuthenticated, setQueued]);

  /**
   * 🔴 LEAVE QUEUE (Withdrawal)
   */
  const leaveQueue = useCallback(async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('match_queue')
        .delete()
        .eq('player_id', user.id);

      setQueued(false);
      SoundNexus.play(CUES.UI_POWER_DOWN);
      toast("QUEUE ABORTED", { icon: '🚫' });
      
    } catch (err) {
      console.error("Queue Exit Error:", err);
    }
  }, [user, setQueued]);

  /**
   * ✅ ACCEPT MATCH (Engagement)
   */
  const acceptMatch = useCallback(async (matchId) => {
    // 🔊 8D EFFECT: Slam the sound into center stage
    SoundNexus.playSpatial(CUES.UI_SUCCESS, 0); 
    
    // Log acceptance time for performance metrics
    Telemetry.log(EVENTS.COMBAT, { action: 'match_accepted', matchId }, user?.id);
    
    toast.success("COMBAT READINESS CONFIRMED", { icon: '⚡' });
    
    // Here we would typically update a 'match_participants' table to set is_ready = true
  }, [user]);

  /**
   * 📡 REALTIME WATCHER (Match Found Detector)
   * Listens for the backend to create a match record.
   */
  useEffect(() => {
    if (!isQueued || !user?.id) return;

    // Listen for any NEW match where this player/team is involved
    const channel = supabase
      .channel(`queue_monitor:${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'matches' 
      }, (payload) => {
        const newMatch = payload.new;
        
        // 🔍 Check if this match belongs to us
        // (Assuming user.teamId is available from useNexus)
        const isMyMatch = user.teamId && (
          newMatch.team1_id === user.teamId || 
          newMatch.team2_id === user.teamId
        );

        if (isMyMatch) {
            setMatchFound(newMatch);
            SoundNexus.playVortex(CUES.NOTIFICATION, 2000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isQueued, user?.id, user?.teamId, setMatchFound]);

  return {
    joinQueue,
    leaveQueue,
    acceptMatch,
    isQueued,
    queueTime,
    matchFound
  };
};
