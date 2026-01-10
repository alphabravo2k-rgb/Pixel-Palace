/**
 * 🧠 PIXEL PALACE: NEXUS CORE (MASTER OMNI)
 * VERSION: 2050.5.0
 * STATUS: SECURED // OPTIMIZED FOR 144Hz
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabase/client';
import { ROLE_DEF } from '../lib/roles';
// Note: Safe audio handling ensures no crash if SoundNexus loads late
import { SoundNexus, CUES } from '../lib/soundNexus';

export const useNexusStore = create(
  persist(
    (set, get) => ({
      // =========================================================
      // 🆔 IDENTITY MODULE
      // =========================================================
      uid: null,
      profile: null, // Stores full DB profile (role, elo, avatar)
      authType: 'GUEST', // 'GUEST' | 'SUPABASE' | 'CAPTAIN_PIN'
      isHydrated: false, // Prevents UI flicker on load

      // --- ⚡ ACTION: LOGIN (The Entry Point) ---
      login: async (email, password) => {
        // 1. Attempt Supabase Login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
          throw error;
        }

        // 2. Play Success Sound
        try { SoundNexus.play(CUES.UI_POWER_UP); } catch(e){}

        // 3. Sync Profile Data immediately
        await get().syncNexus();
        return data;
      },

      // --- ⚡ ACTION: SYSTEM SYNC (Self-Healing Auth) ---
      syncNexus: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch unified profile from our master 'profiles' table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileData) {
            set({ 
              uid: session.user.id, 
              profile: profileData,
              authType: 'SUPABASE'
            });
            return;
          }
        }
        
        // Preserve Captain PIN sessions if active
        if (get().authType === 'CAPTAIN_PIN') return;

        // Default Reset if no valid session found
        set({ uid: null, profile: null, authType: 'GUEST' });
      },

      // --- ⚡ ACTION: LOGOUT ---
      logout: async () => {
        try { SoundNexus.playSpatial(CUES.UI_POWER_DOWN); } catch(e){}
        
        if (get().authType === 'SUPABASE') {
            await supabase.auth.signOut();
        }
        
        set({ uid: null, profile: null, authType: 'GUEST' });
        // Clear local storage for a fresh security state
        localStorage.removeItem('nexus-storage');
      },

      // =========================================================
      // 🏗️ REALITY MODULE (3D Vision Engine)
      // =========================================================
      graphics: {
        tier: 'high', // 'low' (2D only) | 'medium' (No post-proc) | 'high' (Full 3D)
        enable3D: true,
        enablePostProcessing: true,
      },

      setGraphics: (config) => set((state) => ({
        graphics: { ...state.graphics, ...config }
      })),

      // =========================================================
      // 🔊 SENSORY MODULE (8D Audio Engine)
      // =========================================================
      audio: {
        master: 0.8,
        sfx: 1.0,
        music: 0.4,
        isMuted: false
      },

      setVolume: (channel, val) => set((state) => ({
        audio: { ...state.audio, [channel]: val }
      })),

      toggleMute: () => {
        const next = !get().audio.isMuted;
        set((state) => ({ audio: { ...state.audio, isMuted: next } }));
        // Hardware link to Howler
        try { SoundNexus.toggleMute(); } catch(e){} 
      },

      // --- 🛠️ INTERNAL HYDRATION ---
      setHydrated: () => set({ isHydrated: true })
    }),
    {
      name: 'nexus-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-volatile data (Don't persist error states or loading flags)
      partialize: (state) => ({
        uid: state.uid,
        profile: state.profile,
        authType: state.authType,
        graphics: state.graphics,
        audio: state.audio
      }),
      // Re-check auth with server on every page reload
      onRehydrateStorage: () => (state) => {
        state?.syncNexus().finally(() => state?.setHydrated());
      }
    }
  )
);
