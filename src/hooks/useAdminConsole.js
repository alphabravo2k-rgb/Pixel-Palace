import { useState } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

/**
 * 4️⃣ useAdminConsole — THE OPERATIONAL BRIDGE
 * Wraps RPC calls with Audit IDs and Permission Checks.
 */
export const useAdminConsole = () => {
  const { session, getAuthIdentifier } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * GENERIC EXECUTOR
   * 1. Checks Auth
   * 2. Injects p_admin_id
   * 3. Calls RPC
   */
  const execute = async (rpcName, params = {}) => {
    setError(null);
    
    // 1. Basic Gatekeeping
    if (!session.isAuthenticated || !['ADMIN', 'OWNER'].includes(session.role)) {
       const msg = "ACCESS DENIED: Unauthorized Role";
       console.error(msg);
       setError(msg);
       return { success: false, message: msg };
    }

    setLoading(true);
    try {
      // 2. Audit Injection
      const adminId = getAuthIdentifier();
      if (!adminId) throw new Error("Security Error: No Identity Found");

      const payload = {
        ...params,
        p_admin_id: adminId // 🔒 The Golden Key
      };

      // 3. Network Request
      const { data, error: rpcError } = await supabase.rpc(rpcName, payload);
      
      if (rpcError) throw rpcError;

      // 4. Logic Handling
      // Some RPCs return void, some return { success: true }
      if (data && data.success === false) {
        throw new Error(data.message || 'Operation Failed');
      }
      
      return { success: true, data };

    } catch (err) {
      console.error(`[${rpcName}] Failed:`, err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // --- PRE-FABRICATED ACTIONS ---

  const syncRegistrations = (tournamentId) => {
    return execute('api_sync_registrations', { p_tournament_id: tournamentId });
  };

  const generateBracket = (tournamentId) => {
    return execute('api_generate_bracket', { p_tournament_id: tournamentId });
  };

  const createAdmin = (pin, { name, discord, faceitUser }) => {
     // NOTE: We use direct insert in the UI panel for now, 
     // but if we move to RPC, this is where it goes.
     return { success: false, message: "Use Panel Direct Insert" };
  };

  return { 
    execute, 
    syncRegistrations, 
    generateBracket, 
    createAdmin,
    loading, 
    error 
  };
};
