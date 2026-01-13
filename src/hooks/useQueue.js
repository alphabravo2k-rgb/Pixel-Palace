/**
 * ⚔️ USE QUEUE: THE MATCHMAKER
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL
 */

import { useCallback } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { useNexus } from './useNexus';
import { supabase } from '../supabase/client';
import { toast } from 'react-hot-toast';
import { SoundNexus, CUES } from '../lib/soundNexus';

export const useQueue = () => {
  const { user } = useNexus();
  const { 
    isQueued, 
    queueTime, 
    matchFound, 
    setQueued, 
    setMatchFound, 
    reset 
  } = useQueueStore();

  /**
   * 🟢 JOIN QUEUE
   */
  const joinQueue = useCallback(async () => {
    if (!user) return toast.error("LOGIN REQUIRED");

    try {
      // 1. Database Call
      const { error } = await supabase
        .from('match_queue')
        .insert({ player_id: user.id, region: 'asia' }); // Default region for now

      if (error) throw error;

      // 2. Update UI State
      setQueued(true);
      SoundNexus.play(CUES.UI_POWER_UP);
      toast.success("SEARCHING FOR OPERATIVES...");
      
    } catch (err) {
      console.error(err);
      toast.error("QUEUE FAILED: " + err.message);
    }
  }, [user, setQueued]);

  /**
   * 🔴 LEAVE QUEUE
   */
  const leaveQueue = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('match_queue')
        .delete()
        .eq('player_id', user.id);

      setQueued(false);
      SoundNexus.play(CUES.UI_POWER_DOWN);
      toast("QUEUE CANCELLED");
      
    } catch (err) {
      console.error(err);
    }
  }, [user, setQueued]);

  /**
   * ✅ ACCEPT MATCH
   */
  const acceptMatch = useCallback(async (matchId) => {
    SoundNexus.play(CUES.UI_CLICK_HEAVY);
    // Logic to mark player as 'READY' in the DB would go here
    toast.success("ACCEPTED! REDIRECTING...");
    // navigate(`/match/${matchId}`);
  }, []);

  return {
    joinQueue,
    leaveQueue,
    acceptMatch,
    isQueued,
    queueTime,
    matchFound
  };
};
