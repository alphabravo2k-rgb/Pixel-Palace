import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabase/client';
import { normalizeRole, ROLES } from '../lib/roles';
import { SoundNexus, CUES } from '../lib/soundNexus';

/**
 * 🧠 PIXEL PALACE: NEXUS CORE
 * ---------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * VERSION: 4.0.0
 * * ARCHITECTURE:
 * 1. PERSISTENCE: Remembers user identity across page reloads.
 * 2. SELF-HEALING: 'syncNexus' verifies session validity on boot.
 * 3. HYBRID AUTH: Unifies Supabase Users (Admins) and Team Codes (Captains).
 */

export const useNexusStore = create(
  persist(
    (set, get) => ({
      // --- CORE STATE ---
      uid: null,
      profile: null,
      team_id: null,
      role: ROLES.GUEST,
      authType: 'GUEST', // 'GUEST' | 'SUPABASE' | 'CAPTAIN_PIN'
      isLive: true,      // Network Status
      isHydrated: false, // Store Ready Status

      // --- ⚡ ACTION: SYSTEM SYNC (Self-Healing) ---
      // Called on App boot to ensure the session is real
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
        // Captains rely on the persisted 'nexus-storage' in localStorage.
        // If authType is CAPTAIN_PIN and we have data, we assume it's valid 
        // until an API call fails (handled by axios/fetch interceptors ideally).
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
        
        // Only call Supabase signOut if we were logged in via Supabase
        if (get().authType === 'SUPABASE') {
            await supabase.auth.signOut();
        }

        set({ uid: null, profile: null, role: ROLES.GUEST, authType: 'GUEST', team_id: null });
        localStorage.removeItem('nexus-storage');
      },

      // Internal Hydration Signal
      hydrate: () => set({ isHydrated: true })
    }),
    {
      name: 'nexus-storage', // Key in LocalStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // When the app reloads, verify the session
        state?.syncNexus().finally(() => state?.hydrate());
      }
    }
  )
);
