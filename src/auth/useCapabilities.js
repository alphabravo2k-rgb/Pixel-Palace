/**
 * 🛡️ USE CAPABILITIES: PERMISSION INTERFACE (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // SECURED
 */

import { useCallback, useMemo } from 'react';
import { useSession } from './useSession';
import { can as checkPermission, getClearanceLevel } from '../lib/security/engine';

/**
 * THE HOOK: Provides a tactical interface for the Security Engine.
 */
export const useCapabilities = () => {
  const { session } = useSession();

  /**
   * 🧠 PERMISSION RESOLVER
   * Standardized method to check if an action is authorized.
   * Usage: const allowed = can('CAP_MANAGE_MATCH', matchData);
   */
  const can = useCallback((capability, context = null) => {
    // 🚦 STAGE 1: HYDRATION GUARD
    // If the system is still booting or the user has no identity, fail closed.
    if (!session || session.isLoading || !session.isAuthenticated) {
        return false;
    }
    
    // 🚦 STAGE 2: ENGINE HANDSHAKE
    // Delegate the complex logic to the stateless master engine.
    return checkPermission(capability, session, context);
  }, [session]);

  /**
   * 📊 CLEARANCE METRIC
   * Returns the numerical clearance level for the current operator.
   */
  const clearance = useMemo(() => {
    return getClearanceLevel(session?.role);
  }, [session?.role]);

  return { 
    can, 
    clearance,
    role: session?.role || 'guest',
    // 🛰️ Flat Accessors for quick UI logic
    isAdmin: clearance >= 60,
    isOwner: clearance === 100
  };
};
