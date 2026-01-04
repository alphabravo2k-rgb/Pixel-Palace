import { useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { toast } from 'react-hot-toast';

export const useAdminConsole = () => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * EXECUTE RPC (Database Function)
   * @param {string} rpcName - The exact name of the SQL function
   * @param {object} params - Parameters to pass (e.g., { p_match_id: '...' })
   * @param {object} options - { silent: boolean } -> If true, suppresses error toasts
   */
  const execute = useCallback(async (rpcName, params = {}, options = { silent: false }) => {
    setLoading(true);
    setError(null);

    try {
      if (!session?.isAuthenticated) {
        throw new Error("UNAUTHORIZED: Session invalid.");
      }

      // 🛡️ DEBUG LOG
      console.log(`[AdminConsole] ⚡ Executing: ${rpcName}`, params);

      // The Magic Line: Calls the Postgres Function
      const { data, error: rpcError } = await supabase.rpc(rpcName, params);

      if (rpcError) throw rpcError;

      // Handle "Logic Errors" returned by the database JSON (e.g., "Tournament Locked")
      // Some of our SQL functions return { "success": false, "message": "..." }
      if (data && data.success === false) {
        throw new Error(data.message || 'Operation denied by server logic.');
      }

      return { success: true, data };

    } catch (err) {
      console.error(`[AdminConsole] ❌ Error:`, err);
      
      const message = err.message || "Unknown Database Error";
      setError(message);
      
      // 🔔 UI FEEDBACK
      if (!options.silent) {
          toast.error(message);
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [session]);

  return { execute, loading, error };
};
