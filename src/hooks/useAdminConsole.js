import { useState } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament'; 

export const useAdminConsole = () => {
  const { session } = useSession();
  const { setSelectedTournamentId } = useTournament(); // Used for Truth Refresh
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (rpcName, params = {}) => {
    setError(null);
    
    // 1. GATEKEEPING: Fail hard if role is wrong
    if (!session.isAuthenticated || !['ADMIN', 'OWNER'].includes(session.role)) {
       const msg = "ACCESS DENIED: Unauthorized Role";
       console.error(msg);
       setError(msg);
       return { success: false, message: msg };
    }

    setLoading(true);
    try {
      // 2. SECURITY: Use session ID directly (No silent fallbacks)
      const adminId = session.user?.id;
      if (!adminId) throw new Error("Security Violation: No Identity Found");

      const payload = {
        ...params,
        p_admin_id: adminId // 🔒 The Golden Key
      };

      // 3. EXECUTION
      const { data, error: rpcError } = await supabase.rpc(rpcName, payload);
      
      if (rpcError) throw rpcError;

      // 4. LOGIC CHECK
      if (data && data.success === false) {
        throw new Error(data.message || 'Operation Failed');
      }
      
      return { success: true, data };

    } catch (err) {
      console.error(`[${rpcName}] Failed:`, err);
      setError(err.message);

      // 🚨 TRUTH REFRESH: If a write fails, assume UI is stale. Force refresh.
      if (params.p_tournament_id || params.p_team_id) {
         console.warn("⚠️ State desync detected. Refreshing context from backend...");
         const currentId = params.p_tournament_id || localStorage.getItem('pp_active_tid');
         if (currentId) setSelectedTournamentId(currentId); 
      }

      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // --- PRE-FABRICATED ACTIONS ---
  const syncRegistrations = (tournamentId) => execute('api_sync_registrations', { p_tournament_id: tournamentId });
  const generateBracket = (tournamentId) => execute('api_generate_bracket', { p_tournament_id: tournamentId });

  return { execute, syncRegistrations, generateBracket, loading, error };
};
