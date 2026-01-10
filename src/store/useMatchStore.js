/**
 * ⚔️ MATCH STORE: TACTICAL OPERATIONS CENTER
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: VOLATILE // REAL-TIME SYNCED
 */

import { create } from 'zustand';
import { supabase } from '../supabase/client';
// Note: Safe navigation for SoundNexus handles cases where audio isn't ready
import { SoundNexus, CUES } from '../lib/soundNexus';

export const useMatchStore = create((set, get) => ({
  // 1. ATOMIC COMBAT STATE
  activeMatchId: null,
  matchData: null,      // Deep Joined Record (Teams + Match)
  liveLog: [],          // Match Events (Kills, Vetoes, Technicals)
  isLoading: false,
  subscription: null,

  // 2. ⚡ ACTION: NEURAL LINK (Connection)
  connectMatch: async (matchId) => {
    if (get().activeMatchId === matchId) return;
    
    // Auto-sever old connections
    get().disconnectMatch();
    set({ activeMatchId: matchId, isLoading: true });

    // A. INITIAL DATA SYNC (The Handshake)
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team1:teams!team1_id(*),
        team2:teams!team2_id(*)
      `)
      .eq('id', matchId)
      .single();

    if (error) {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      set({ isLoading: false });
      return;
    }

    set({ matchData: data, isLoading: false });

    // B. REAL-TIME PULSE (WebSocket)
    const channel = supabase
      .channel(`tactical:${matchId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'matches', 
        filter: `id=eq.${matchId}` 
      }, (payload) => {
        const oldData = get().matchData;
        const newData = payload.new;

        // 🔊 TACTICAL AUDIO HOOKS
        if (newData.score_team1 !== oldData.score_team1 || newData.score_team2 !== oldData.score_team2) {
          try { SoundNexus.playSpatial(CUES.UI_TICK, { pitch: 1.2 }); } catch(e){}
          // Add to Live Log
          get().pushLog(`SCORE UPDATE: ${newData.score_team1} - ${newData.score_team2}`);
        }

        if (newData.status === 'live' && oldData.status !== 'live') {
          try { SoundNexus.play(CUES.NOTIFICATION); } catch(e){}
          get().pushLog("SYSTEM: MATCH COMMENCED");
        }

        // Deep Merge to preserve joined 'team1' and 'team2' objects
        // (Postgres realtime only sends the flat 'matches' row, so we keep old joins)
        set((state) => ({
          matchData: { ...state.matchData, ...newData }
        }));
      })
      .subscribe();

    set({ subscription: channel });
  },

  // 3. ⚡ ACTION: PUSH LOG
  // Adds events to a temporary session-based killfeed
  pushLog: (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      liveLog: [{ id: Date.now(), timestamp, message }, ...state.liveLog].slice(0, 50)
    }));
  },

  // 4. ⚡ ACTION: DISCONNECT (Clean Exit)
  disconnectMatch: () => {
    const sub = get().subscription;
    if (sub) supabase.removeChannel(sub);
    set({ activeMatchId: null, matchData: null, subscription: null, liveLog: [] });
  },

  // 5. ⚡ ACTION: SOVEREIGN UPDATE (Score)
  updateScore: async (t1, t2) => {
    const id = get().activeMatchId;
    if (!id) return;

    // Optimistic Logic
    set((state) => ({
      matchData: { ...state.matchData, score_team1: t1, score_team2: t2 }
    }));

    const { error } = await supabase
      .from('matches')
      .update({ score_team1: t1, score_team2: t2 })
      .eq('id', id);

    if (error) {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      // Data will self-heal on next server pulse
    }
  }
}));
