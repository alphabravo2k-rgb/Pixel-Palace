import { useState } from 'react';
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
   * 1. Permission Gating (Client-side with Context)
   * 2. Error Handling
   * 3. Loading State
   * 4. Audit Trail Injection
   */
  const execute = async ({ 
    action,       // Permission String (e.g. 'CAN_MANAGE_BRACKET')
    context = {}, // { tournamentId, matchId }
    rpc,          // The SQL function name
    params = {},  // RPC parameters
    onSuccess     // Callback
  }) => {
    setError(null);

    // 🛡️ GATEKEEPER: Check Authority + Scope before Network Request
    if (!can(action, context)) {
      const msg = `ACCESS DENIED: Missing permission ${action} for this scope.`;
      console.error(msg);
      setError(msg);
      alert(msg);
      return { success: false, error: 'Unauthorized' };
    }

    setLoading(true);
    try {
      // 🕵️ AUDIT INJECTION: Always attach the operator's ID
      const payload = {
        ...params,
        p_admin_id: session.identity.id
      };

      const { data, error: rpcError } = await supabase.rpc(rpc, payload);
      
      if (rpcError) throw rpcError;

      // Handle custom API error responses (success: false)
      if (data && data.success === false) {
        throw new Error(data.message || 'Operation Failed');
      }
      
      if (onSuccess) onSuccess(data);
      return { success: true, data };

    } catch (err) {
      console.error(`[${action}] Failed:`, err);
      setError(err.message);
      alert(`Action Failed: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};
