/**
 * 📡 QUEUE STORE: GLOBAL MATCHMAKING NETWORK
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: VOLATILE // SENSORY-LINKED
 */

import { create } from 'zustand';
// Note: Safe audio handling ensures no crash if SoundNexus loads late
import { SoundNexus, CUES } from '../lib/soundNexus';

export const useQueueStore = create((set, get) => ({
  // 1. NEURAL QUEUE STATE
  status: 'IDLE', // 'IDLE' | 'SEARCHING' | 'READY' | 'ACCEPTED'
  startTime: null,
  region: 'eu',
  gameMode: '5v5_ranked',
  estimatedTime: 120, // Seconds
  elapsedTime: 0,
  matchFoundId: null,
  acceptDeadline: null,

  // 2. ⚡ ACTION: INITIATE SEARCH
  joinQueue: (region = 'eu', mode = '5v5_ranked') => {
    try { SoundNexus.playSpatial(CUES.UI_POWER_UP, { pitch: 0.8 }); } catch(e){}
    
    set({ 
      status: 'SEARCHING', 
      startTime: Date.now(),
      elapsedTime: 0,
      region, 
      gameMode: mode,
      matchFoundId: null
    });

    // START ELAPSED TIMER
    const interval = setInterval(() => {
      // If status changed (e.g. user canceled), stop timer
      if (get().status !== 'SEARCHING') return clearInterval(interval);
      
      const currentElapsed = Math.floor((Date.now() - get().startTime) / 1000);
      set({ elapsedTime: currentElapsed });
      
      // Heartbeat sound every 10 seconds of searching for immersion
      if (currentElapsed > 0 && currentElapsed % 10 === 0) {
        try { SoundNexus.playSpatial(CUES.UI_TICK, { volume: 0.05 }); } catch(e){}
      }
    }, 1000);

    // 🤖 SIMULATION: Mock Match Found after 15 seconds (Remove in Production)
    /*
    setTimeout(() => {
      if (get().status === 'SEARCHING') get().triggerMatchFound('mock-match-uuid');
    }, 15000);
    */
  },

  // 3. ⚡ ACTION: ABORT SEARCH
  leaveQueue: () => {
    try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
    set({ status: 'IDLE', startTime: null, elapsedTime: 0, matchFoundId: null });
  },

  // 4. ⚡ INTERNAL: UPLINK ESTABLISHED (Match Found)
  triggerMatchFound: (matchId) => {
    // 🔊 CRITICAL NOTIFICATION: High volume, distinct spatial cue
    try { SoundNexus.play(CUES.NOTIFICATION, { volume: 1.0 }); } catch(e){}
    
    const deadline = Date.now() + 20000; // 20 Seconds to accept
    set({ status: 'READY', matchFoundId: matchId, acceptDeadline: deadline });

    // Auto-Abort if deadline passes
    setTimeout(() => {
      if (get().status === 'READY') {
        get().leaveQueue();
        // Potential "Missed Match" penalty logic here
      }
    }, 20000);
  },

  // 5. ⚡ ACTION: CONFIRM READINESS
  acceptMatch: () => {
    try { SoundNexus.playSpatial(CUES.UI_SUCCESS, { pitch: 1.5 }); } catch(e){}
    set({ status: 'ACCEPTED' });
    // Router logic in the UI will detect this state and redirect to /match/:id
  },

  // 6. 🛠️ HELPER: GET FORMATTED TIME
  getFormattedTime: () => {
    const time = get().elapsedTime;
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}));
