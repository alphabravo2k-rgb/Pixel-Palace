import { useCallback } from 'react';
import { useSession } from './useSession';
import { can as checkPermission } from '../lib/permissions';

export const useCapabilities = () => {
  const { session } = useSession();

  /**
   * CHECK PERMISSION (The Core Function)
   * Wraps the centralized RBAC logic from src/lib/permissions.js
   */
  const can = useCallback((capability, context = null) => {
    return checkPermission(capability, session, context);
  }, [session]);

  /**
   * LEGACY COMPATIBILITY
   * Use this if you have old components checking 'resource', 'action'
   */
  const hasCapability = (role, resource, action) => {
    // Maps old style checks to new RBAC keys
    // Example: 'MATCH:VETO' -> 'CAP_ACT_AS_CAPTAIN'
    const key = `CAP_${resource}_${action}`.toUpperCase();
    // Ideally, update your components to use PERM_CAPABILITIES directly.
    return can(key);
  };

  return { can, hasCapability };
};
