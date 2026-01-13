/**
 * 🧠 USE NEXUS: THE CENTRAL NERVOUS SYSTEM
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: ACTIVE
 */

import { useSession } from '../auth/useSession';
import { useNexusStore } from '../store/useNexusStore';
import { getRoleTheme, can as checkPermission } from '../lib/roles';
import { useMemo } from 'react';

export const useNexus = () => {
  const { session, isAuthenticated, loading: authLoading } = useSession();
  const { isGlobalLoading } = useNexusStore();

  // 1. DERIVE IDENTITY
  // Combines DB Profile + Auth Session into one usable object
  const currentUser = useMemo(() => {
    if (!session) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      ...session.identity, // Merges profile data (username, avatar)
      role: session.role || 'guest',
      teamId: session.identity?.team_id || null
    };
  }, [session]);

  // 2. VISUAL DNA
  // Instantly get the correct Cyberpunk colors for the current user
  const theme = useMemo(() => {
    return getRoleTheme(currentUser?.role);
  }, [currentUser]);

  // 3. PERMISSION WRAPPER
  // Usage: if (can('manage_match')) ...
  const can = (capability, context = null) => {
    return checkPermission(capability, session, context);
  };

  return {
    user: currentUser,
    isAuthenticated,
    isLoading: authLoading || isGlobalLoading,
    theme,
    can,
    // Quick-Access Boolean Flags
    isAdmin: currentUser?.role === 'admin' || currentUser?.role === 'owner',
    isCaptain: currentUser?.role === 'captain'
  };
};
