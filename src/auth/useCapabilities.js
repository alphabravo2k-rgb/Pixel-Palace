import { useCallback } from 'react';
import { useSession } from './useSession';
import { can as checkPermission } from '../lib/permissions';

export const useCapabilities = () => {
  const { session } = useSession();

  /**
   * CHECK PERMISSION (The Core Function)
   * Wraps the centralized RBAC logic from src/lib/permissions.js
   * * @param {string} capability - The PERM_CAPABILITY key
   * @param {object} context - Optional data (e.g., the match object) for scope checks
   */
  const can = useCallback((capability, context = null) => {
    // We pass the WHOLE session object because permissions.js needs session.team_id
    return checkPermission(capability, session, context);
  }, [session]);

  /**
   * LEGACY COMPATIBILITY
   * Maps old UI calls (resource:action) to new Permission Keys
   */
  const hasCapability = (role, resource, action) => {
    // Maps 'MATCH:VETO' -> 'CAP_MANAGE_MATCH' or similar
    const key = `CAP_${resource}_${action}`.toUpperCase();
    return can(key);
  };

  return { can, hasCapability };
};
