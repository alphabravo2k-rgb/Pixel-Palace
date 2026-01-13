/**
 * 🧠 USE NEXUS: THE CENTRAL NERVOUS SYSTEM
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: ACTIVE // SOVEREIGN
 */

import { useSession } from '../auth/useSession';
import { useNexusStore } from '../store/useNexusStore';
import { getRoleTheme, can as checkPermission, ROLE_DEF } from '../lib/roles';
import { useMemo, useCallback } from 'react';

export const useNexus = () => {
  const { session, isAuthenticated, loading: authLoading } = useSession();
  const { isGlobalLoading } = useNexusStore();

  // 1. 🆔 DERIVE IDENTITY
  // Merges the Supabase Auth User with the Pixel Palace Profile metadata
  const currentUser = useMemo(() => {
    if (!session?.user) return null;

    const role = session.role || 'guest';

    return {
      id: session.user.id,
      email: session.user.email,
      ...session.identity, // Username, Avatar, ELO, Region
      role: role,
      teamId: session.identity?.team_id || null,
      // Calculate numeric clearance for hierarchical access (Admin > Mod > User)
      // Uses the definitions we built in src/lib/security/definitions.js
      clearance: ROLE_DEF[role.toUpperCase()]?.level || 0
    };
  }, [session]);

  // 2. 🎨 VISUAL DNA
  // Tactical styles (glow, colors, rings) based on the user's role
  const theme = useMemo(() => {
    return getRoleTheme(currentUser?.role);
  }, [currentUser]);

  // 3. 🛡️ PERMISSION WRAPPER
  // Memoized callback for high-frequency UI checks (e.g. buttons in a list)
  const can = useCallback((capability, context = null) => {
    if (!isAuthenticated || !session) return false;
    return checkPermission(capability, session, context);
  }, [isAuthenticated, session]);

  return {
    // Identity
    user: currentUser,
    isAuthenticated,
    isLoading: authLoading || isGlobalLoading,
    
    // Security & Styling
    theme,
    can,
    
    // 🚦 QUICK-ACCESS STATUS FLAGS
    isOwner: currentUser?.role === 'owner',
    isAdmin: currentUser?.clearance >= 90, // Level 90+ (Admin/Owner)
    isStaff: currentUser?.clearance >= 60, // Level 60+ (Crew/Admin/Owner)
    // A user is effective captain if they have the role OR are the designated lead of a team
    isCaptain: currentUser?.role === 'captain' || !!currentUser?.teamId,
    
    // Helper to get raw role strings
    role: currentUser?.role || 'guest'
  };
};
