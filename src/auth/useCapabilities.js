import { useCallback } from 'react';
import { useSession } from './useSession';
import { supabase } from '../supabase/client';

export const useCapabilities = () => {
  const { session } = useSession();

  /**
   * CHECK PERMISSION (The Core Function)
   * usage: await can('TOURNAMENT_EDIT', tournamentId)
   */
  const can = useCallback(async (action, resourceId = null) => {
    if (!session?.isAuthenticated) return false;

    try {
      // 1. Check local session cache first (Fast)
      // If we already know they are a Global Owner, return true instantly.
      if (session.role === 'OWNER') return true;

      // 2. Ask the Database (The Authority)
      const { data, error } = await supabase.rpc('authorize_action', {
        requested_permission: action,
        p_auth_user_id: session.identity.id,
        target_resource_id: resourceId
      });

      if (error) {
        console.error("Permission Check Failed:", error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error("Capability Error:", err);
      return false;
    }
  }, [session]);

  /**
   * CHECK UI CAPABILITY (The Frontend Helper)
   * Checks against the 'system_capabilities' table for UI logic
   * usage: if (hasCapability('CAPTAIN', 'MATCH', 'VETO')) ...
   */
  const hasCapability = (role, resource, action) => {
    // This logic mimics the DB table 'system_capabilities'
    // In a real app, you might fetch this table on login and cache it.
    // For now, we hardcode the matrix to match the SQL for speed.
    
    const MATRIX = {
      OWNER: ['ALL'],
      ADMIN: ['TOURNAMENT:CONFIGURE', 'MATCH:FORCE_WIN', 'FINANCIAL:VIEW', 'ROSTER:FORCE_ADD'],
      REFEREE: ['MATCH:PAUSE', 'MATCH:REPORT', 'DISPUTE:VIEW'],
      CAPTAIN: ['ROSTER:INVITE', 'MATCH:VETO', 'MATCH:DISPUTE', 'MATCH:CHECK_IN'],
      PLAYER: ['PROFILE:EDIT']
    };

    const userRole = session?.role || 'GUEST';
    const permissions = MATRIX[userRole] || [];

    if (permissions.includes('ALL')) return true;
    return permissions.includes(`${resource}:${action}`);
  };

  return { can, hasCapability };
};
