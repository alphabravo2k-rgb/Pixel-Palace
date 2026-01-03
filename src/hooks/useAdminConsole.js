import { useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

export const useAdminConsole = () => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (rpcName, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      if (!session?.isAuthenticated) {
        throw new Error("UNAUTHORIZED: Session invalid.");
      }

      // 🛡️ SECURITY LOGGING (Helps you debug in Console)
      console.log(`[AdminConsole] Executing ${rpcName}`, params);

      // The Magic Line: Calls the Postgres Function
      const { data, error: rpcError } = await supabase.rpc(rpcName, params);

      if (rpcError) throw rpcError;

      // Handle "Logic Errors" returned by the database (e.g., "Tournament Locked")
      if (data && data.success === false) {
        throw new Error(data.message || 'Operation denied by server logic.');
      }

      return { success: true, data };

    } catch (err) {
      console.error(`[AdminConsole] Error:`, err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [session]);

  return { execute, loading, error };
};
