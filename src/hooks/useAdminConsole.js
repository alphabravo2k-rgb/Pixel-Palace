import { useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { toast } from 'react-hot-toast';
import { SoundNexus, CUES } from '../lib/soundNexus';

/**
 * 🛠️ USE ADMIN CONSOLE
 * ---------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * PURPOSE:
 * A generic wrapper for all "God Mode" database calls.
 * * UPGRADES:
 * 1. AUDIO: Plays Success/Error sounds automatically.
 * 2. AUTH FIX: Correctly checks 'isAuthenticated' from the hook.
 */

export const useAdminConsole = () => {
  // ✅ FIX: Destructure isAuthenticated directly (it's not inside the session object)
  const { isAuthenticated } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * EXECUTE RPC (Database Function)
   * @param {string} rpcName - The exact name of the SQL function
   * @param {object} params - Parameters to pass (e.g., { p_match_id: '...' })
   * @param {object} options - { silent: boolean } -> If true, suppresses sounds/toasts
   */
  const execute = useCallback(async (rpcName, params = {}, options = { silent: false }) => {
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        throw new Error("UNAUTHORIZED: Access Token Invalid.");
      }

      // 🛡️ DEBUG LOG
      console.log(`[AdminConsole] ⚡ Executing: ${rpcName}`, params);

      // The Magic Line: Calls the Postgres Function
      const { data, error: rpcError } = await supabase.rpc(rpcName, params);

      if (rpcError) throw rpcError;

      // Handle "Logic Errors" returned by the database JSON
      if (data && data.success === false) {
        throw new Error(data.message || 'Operation denied by server logic.');
      }

      if (!options.silent) {
          SoundNexus.play(CUES.SUCCESS);
      }
      return { success: true, data };

    } catch (err) {
      console.error(`[AdminConsole] ❌ Error:`, err);
      
      const message = err.message || "Unknown Database Error";
      setError(message);
      
      // 🔔 UI FEEDBACK
      if (!options.silent) {
          toast.error(message);
          SoundNexus.play(CUES.ERROR);
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return { execute, loading, error };
};
