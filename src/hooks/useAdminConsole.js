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

      const payload = { ...params };

      console.log(`[AdminConsole] Executing ${rpcName}`, payload);

      const { data, error: rpcError } = await supabase.rpc(rpcName, payload);

      if (rpcError) throw rpcError;

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

  const syncRegistrations = (tId) => execute('admin_sync_rosters', { p_tournament_id: tId });
  const generateBracket = (tId) => execute('admin_generate_bracket', { p_tournament_id: tId });

  return { execute, syncRegistrations, generateBracket, loading, error };
};
