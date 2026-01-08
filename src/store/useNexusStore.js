import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';
import { SoundNexus, CUES } from '../lib/soundNexus';

/**
 * 🧠 PIXEL PALACE: NEXUS CORE (MASTER HYBRID)
 * -------------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * VERSION: 4.5.0
 * * ARCHITECTURE:
 * 1. IDENTITY: Hybrid Auth (Supabase Admin + Captain PIN).
 * 2. REALITY: Controls 3D/2D rendering modes based on hardware power.
 * 3. SENSES: Manages Audio/Haptics global state.
 */

export const useNexusStore = create(
  persist(
    (set, get) => ({
      // =========================================================
      // 🆔 IDENTITY MODULE (PRESERVED & PROTECTED)
      // =========================================================
      uid: null,
      profile: null,
      team_id: null,
      role: ROLES.GUEST,
      authType: 'GUEST', // 'GUEST' | 'SUPABASE' | 'CAPTAIN_PIN'
      isLive: true,      // Network Status
      isHydrated: false, // Store Ready Status

      // --- ⚡ ACTION: SYSTEM SYNC (Self-Healing) ---
      syncNexus: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        // A. If Supabase Session Found (Admin)
        if (session?.user) {
          const { data: adminData } = await supabase
            .from('app_admins')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .maybeSingle();

          if (adminData) {
            set({ 
              uid: session.user.id, 
              profile: { ...adminData, display_name: adminData.full_name }, 
              role: normalizeRole(adminData.role),
              authType: 'SUPABASE',
              isLive: true
            });
            return;
          }
        }
        
        // B. If Captain Session (Optimistic Trust)
        if (get().authType === 'CAPTAIN_PIN' && get().uid) {
           set({ isLive: true });
           return;
        }

        // C. Fallback: Guest
        set({ uid: null, role: ROLES.GUEST, authType: 'GUEST' });
      },

      // --- ⚡ ACTION: ADMIN LOGIN ---
      loginAdmin: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          SoundNexus.play(CUES.DISPUTE_TRIGGER);
          return { success: false, message: error.message };
        }

        const { data: adminData } = await supabase
          .from('app_admins')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .maybeSingle();

        const role = normalizeRole(adminData?.role || ROLES.CREW);
        
        set({
          uid: data.user.id,
          profile: { ...adminData, display_name: adminData?.full_name || email },
          role,
          authType: 'SUPABASE',
          isLive: true
        });

        SoundNexus.play(CUES.NOTIFICATION);
        return { success: true, role };
      },

      // --- ⚡ ACTION: CAPTAIN LOGIN ---
      loginCaptain: async (accessCode) => {
        const { data, error } = await supabase.rpc('verify_team_access', { p_code: accessCode });
        
        if (error || !data?.success) {
          SoundNexus.play(CUES.DISPUTE_TRIGGER);
          return { success: false, message: error?.message || 'Identity Verification Failed' };
        }

        const captainProfile = {
          id: data.team_id,
          display_name: `Captain (${data.team_name})`,
          team_id: data.team_id,
          team_name: data.team_name,
          role: ROLES.CAPTAIN
        };

        set({
          uid: `cap_${data.team_id}`,
          profile: captainProfile,
          team_id: data.team_id,
          role: ROLES.CAPTAIN,
          authType: 'CAPTAIN_PIN',
          isLive: true
        });

        SoundNexus.play(CUES.NOTIFICATION);
        return { success: true, role: 'captain' };
      },

      // --- ⚡ ACTION: LOGOUT ---
      clearNexus: async () => {
        SoundNexus.play(CUES.NAVIGATION_SWISH);
        if (get().authType === 'SUPABASE') {
            await supabase.auth.signOut();
        }
        set({ uid: null, profile: null, role: ROLES.GUEST, authType: 'GUEST', team_id: null });
        localStorage.removeItem('nexus-storage');
      },

      // =========================================================
      // 🏗️ REALITY MODULE (INJECTED FOR 3D UPGRADE)
      // =========================================================
      graphicsTier: 'high', // 'low' | 'medium' | 'high' | 'ultra'
      is3DEnabled: true,
      
      setGraphicsTier: (tier) => set({ graphicsTier: tier }),
      toggle3D: () => set((state) => ({ is3DEnabled: !state.is3DEnabled })),

      // =========================================================
      // 🔊 SENSORY MODULE (INJECTED FOR 8D AUDIO)
      // =========================================================
      volume: { master: 0.8, sfx: 1.0, music: 0.5, voice: 1.0 },
      isMuted: false,
      
      setVolume: (channel, level) => set((state) => ({
        volume: { ...state.volume, [channel]: level }
      })),
      toggleMute: () => {
        const newMuteState = !get().isMuted;
        set({ isMuted: newMuteState });
        // Direct Hardware Link
        SoundNexus.mute(newMuteState); 
      },

      // Internal Hydration Signal
      hydrate: () => set({ isHydrated: true })
    }),
    {
      name: 'nexus-storage', // Key in LocalStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.syncNexus().finally(() => state?.hydrate());
      }
    }
  )
);
