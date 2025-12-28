import { useState, useCallback } from 'react';
import { supabase } from '../supabase/client';

export const useAdminConsole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * UNIFIED EXECUTION API
   * 1. Automatically grabs the Admin ID from storage (Context-aware).
   * 2. Enforces consistent error handling.
   */
  const execute = useCallback(async (rpcName, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get Admin Context (Critical for V2 Backend)
      // We assume the admin ID is stored after PIN login.
      const adminId = localStorage.getItem('pp_admin_id'); 
      
      if (!adminId) {
        throw new Error("SECURITY_CONTEXT_MISSING: No Admin ID found. Please relogin.");
      }

      // 2. Inject Admin ID into payload
      // Your backend functions ALL expect 'p_admin_id' for security checks.
      const payload = {
        p_admin_id: adminId,
        ...params
      };

      console.log(`[AdminConsole] Invoking ${rpcName}`, payload);

      // 3. Execute RPC
      const { data, error: rpcError } = await supabase.rpc(rpcName, payload);

      if (rpcError) throw rpcError;

      // 4. Handle logical errors returned as JSON success: false
      if (data && data.success === false) {
        throw new Error(data.message || 'Operation rejected by server logic.');
      }

      return { success: true, data };

    } catch (err) {
      console.error(`[AdminConsole] Failed:`, err);
      setError(err.message || 'Execution Failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Wrappers for common actions
  const syncRegistrations = (tId) => execute('admin_sync_rosters', { p_tournament_id: tId });
  const generateBracket = (tId) => execute('admin_generate_bracket', { p_tournament_id: tId });

  return { execute, syncRegistrations, generateBracket, loading, error };
};
