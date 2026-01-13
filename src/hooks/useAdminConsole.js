/**
 * 🛠️ USE ADMIN CONSOLE: GOD-MODE EXECUTOR
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // ATOMIC
 */

import { useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { toast } from 'react-hot-toast';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';

export const useAdminConsole = () => {
  const { isAuthenticated, session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * ⚡ EXECUTE RPC
   * The primary bridge to the Sovereign DB Logic.
   * @param {string} rpcName - The exact SQL function name
   * @param {object} params - JSON parameters for the function
   * @param {object} options - { silent: boolean }
   */
  const execute = useCallback(async (rpcName, params = {}, options = { silent: false }) => {
    setLoading(true);
    setError(null);

    // ⏱️ Start Telemetry Tracking (Measure execution time)
    const startLog = Telemetry.time(`rpc_${rpcName}`);

    try {
      if (!isAuthenticated) {
        throw new Error("UNAUTHORIZED: Identity not verified.");
      }

      // 🛡️ INVOKE POSTGRES FUNCTION
      const { data, error: rpcError } = await supabase.rpc(rpcName, params);

      if (rpcError) throw rpcError;

      // Handle custom success/fail JSON from SQL (Logic Gates)
      if (data && data.success === false) {
        throw new Error(data.message || 'The Nexus rejected this command.');
      }

      // 🔊 SUCCESS FEEDBACK
      if (!options.silent) {
        // Safe play (avoids crash if audio context is blocked)
        try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
        
        if (data?.message) toast.success(data.message);
      }

      // Log success latency to Telemetry
      startLog.end(session?.user?.id);

      return { success: true, data };

    } catch (err) {
      const message = err.message || "Database Uplink Failure";
      setError(message);
      
      // 🚨 LOG CRITICAL ERROR TO BLACK BOX
      Telemetry.log(EVENTS.ERROR, { 
        subsystem: 'ADMIN_CONSOLE', 
        rpc: rpcName, 
        error: message 
      });

      if (!options.silent) {
        toast.error(message);
        try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session]);

  return { execute, loading, error };
};
