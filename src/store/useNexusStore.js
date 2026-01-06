import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles'; // Assumes roles.js exists
import { SoundNexus, CUES } from '../lib/soundNexus';

/**
 * 🧠 PIXEL PALACE: NEXUS STORE
 * ----------------------------
 * STATUS: MASTERED
 * PURPOSE: Global state persistence for Authentication & UI.
 */

export const useNexusStore = create(
  persist(
    (set, get) => ({
      uid: null,
      profile: null,
      team_id: null,
      role: ROLES.GUEST,
      authType: 'GUEST',
      isLive: true,
      isHydrated: false,

      // ACTIONS
      loginAdmin: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, message: error.message };

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

      loginCaptain: async (accessCode) => {
        const { data, error } = await supabase.rpc('verify_team_access', { p_code: accessCode });
        if (error || !data?.success) return { success: false, message: error?.message || 'Invalid Code' };

        set({
          uid: `cap_${data.team_id}`,
          profile: {
            id: data.team_id,
            display_name: `Captain (${data.team_name})`,
            team_id: data.team_id,
            team_name: data.team_name,
            role: ROLES.CAPTAIN
          },
          team_id: data.team_id,
          role: ROLES.CAPTAIN,
          authType: 'CAPTAIN_PIN',
          isLive: true
        });

        SoundNexus.play(CUES.NOTIFICATION);
        return { success: true, role: 'captain' };
      },

      clearNexus: async () => {
        SoundNexus.play(CUES.NAVIGATION_SWISH);
        await supabase.auth.signOut();
        set({ uid: null, profile: null, role: ROLES.GUEST, authType: 'GUEST', team_id: null });
        localStorage.removeItem('nexus-storage');
      },

      hydrate: () => set({ isHydrated: true })
    }),
    {
      name: 'nexus-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      }
    }
  )
);
