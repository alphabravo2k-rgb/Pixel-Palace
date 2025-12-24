import { useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

/**
 * 4️⃣ useAdminConsole — THE OPERATIONAL BRIDGE
 * strictly enforces "Role + Scope + State" before execution.
 */
export const useAdminConsole = () => {
  const { session, can } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * GENERIC EXECUTOR
   * Wraps all RPC calls with:
   * 1. Permission Gating (Client-side)
   * 2. Error Handling
   * 3. Loading State
   */
  const execute = useCallback(async (action, permission, rpcName, params = {}) => {
    setError(null);

    // 🛡️ GATEKEEPER: Check Authority before Network Request
    if (!can(permission)) {
      setError(`ACCESS DENIED: Missing permission ${permission}`);
      return { success: false, error: 'Unauthorized' };
    }

    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc(rpcName, params);
      
      if (rpcError) throw rpcError;
      
      return { success: true, data };
    } catch (err) {
      console.error(`[${action}] Failed:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [can]);

  // ----------------------------------------------------------------
  // OPERATIONAL METHODS
  // ----------------------------------------------------------------

  /**
   * CREATE ADMIN
   * ⚠️ Sensitive Action: Requires Re-Auth (PIN)
   */
  const createAdmin = async (authPin, newAdminData) => {
    return execute(
      'CREATE_ADMIN',
      'CAN_MANAGE_BRACKET', // Permission Check
      'api_create_admin_v2', // RPC Name
      { 
        p_auth_pin: authPin, // Re-auth credential
        p_name: newAdminData.name,
        p_discord: newAdminData.discord,
        p_faceit: newAdminData.faceitUser 
      }
    );
  };

  /**
   * GENERATE BRACKET
   * Scoped Action: Context aware
   */
  const generateBracket = async (tournamentId) => {
    // We pass the context { tournamentId } to can() to verify scope
    if (!can('CAN_MANAGE_BRACKET', { tournamentId })) {
      setError("Scope Violation: You do not own this tournament.");
      return { success: false };
    }

    return execute(
      'GENERATE_BRACKET',
      'CAN_MANAGE_BRACKET',
      'api_generate_bracket',
      { p_tournament_id: tournamentId }
    );
  };

  /**
   * SYNC REGISTRATIONS
   * Idempotent safe action
   */
  const syncRegistrations = async (tournamentId) => {
    return execute(
      'SYNC_ROSTER',
      'CAN_EDIT_ROSTER',
      'api_sync_registrations',
      { p_tournament_id: tournamentId }
    );
  };

  return {
    loading,
    error,
    createAdmin,
    generateBracket,
    syncRegistrations
  };
};
