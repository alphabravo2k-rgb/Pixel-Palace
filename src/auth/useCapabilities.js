import { useCallback } from 'react';
import { useSession } from './useSession';
import { can as checkPermission } from '../lib/permissions';

export const useCapabilities = () => {
  const { session } = useSession();

  /**
   * CHECK PERMISSION (The Core Function)
   * Wraps the centralized RBAC logic from src/lib/permissions.js
   * @param {string} capability - The PERM_CAPABILITY key
   * @param {object} context - Optional data (e.g., the match object) for scope checks
   */
  const can = useCallback((capability, context = null) => {
    // 🛡️ GUARD: Prevent checks if session is still loading or invalid
    if (!session || session.loading) return false;

    // We pass the WHOLE session object because permissions.js checks session.team_id
    return checkPermission(capability, session, context);
  }, [session]);

  return { can };
};
