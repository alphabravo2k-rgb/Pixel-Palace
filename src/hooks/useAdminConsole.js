import { useState } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament'; // 🛡️ Import for Truth Refresh

/**
 * 4️⃣ useAdminConsole — THE OPERATIONAL BRIDGE
 * Wraps RPC calls with Audit IDs, Permission Checks, and Systemic Refresh.
 */
export const useAdminConsole = () => {
  const { session } = useSession();
  const { setSelectedTournamentId } = useTournament(); // We use this to trigger refreshes
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * GENERIC EXECUTOR
   * 1. Checks Auth
   * 2. Injects p_admin_id
   * 3. Calls RPC
   * 4. 🚨 SYSTEMIC REFRESH on Failure
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
      // ✅ FIXED: Use session directly, getAuthIdentifier didn't exist
      const adminId = session.user?.id;
      if (!adminId) throw new Error("Security Error: No Identity Found");

      const payload = {
        ...params,
        p_admin_id: adminId // 🔒 The Golden Key
      };

      // 3. Network Request
      const { data, error: rpcError } = await supabase.rpc(rpcName, payload);
      
      if (rpcError) throw rpcError;

      // 4. Logic Handling
      if (data && data.success === false) {
        throw new Error(data.message || 'Operation Failed');
      }
      
      return { success: true, data };

    } catch (err) {
      console.error(`[${rpcName}] Failed:`, err);
      setError(err.message);

      // 🚨 SYSTEMIC FIX: TRUTH REFRESH
      // If a write operation fails, our local state is "Untrusted".
      // We force a refresh of the tournament context.
      if (params.p_tournament_id || params.p_team_id) {
         console.warn("⚠️ State desync detected. Refreshing context from backend...");
         // Trigger a re-fetch in the TournamentProvider by effectively "jiggling" the selection
         // or if your provider has a specific .refresh() method, use that.
         // This assumes useTournament watches selectedTournamentId changes or we can manually re-trigger.
         const currentId = params.p_tournament_id || localStorage.getItem('pp_active_tid');
         if (currentId) setSelectedTournamentId(currentId); 
      }

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
     // NOTE: We use direct insert in the UI panel for now.
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
