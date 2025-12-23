import { useState } from 'react';
import { supabase } from '../supabase/client'; 

export const useMatchAdmin = () => {
  // 'swap' | 'schedule' | 'start' | null
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);

  // Helper to manage state lifecycle
  const runAction = async (actionName, fn) => {
    if (loadingAction) return; // Prevent double-click race conditions
    setLoadingAction(actionName);
    setError(null);
    try {
      await fn();
      return { success: true };
    } catch (err) {
      console.error(`${actionName} Failed:`, err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoadingAction(null);
    }
  };

  // 🔄 SWAP TEAMS
  const swapTeams = (matchId, team1Id, team2Id, adminId) => 
    runAction('swap', async () => {
      const { error: rpcError } = await supabase.rpc('admin_swap_teams', {
        match_id: matchId,
        new_team1_id: team1Id,
        new_team2_id: team2Id,
        admin_user_id: adminId // Passed for Audit Log
      });
      if (rpcError) throw rpcError;
    });

  // ⏰ SCHEDULE MATCH
  const scheduleMatch = (matchId, newTime, adminId) => 
    runAction('schedule', async () => {
      const { error: rpcError } = await supabase.rpc('admin_schedule_match', {
        match_id: matchId,
        new_start_time: newTime,
        admin_user_id: adminId
      });
      if (rpcError) throw rpcError;
    });

  // 🚦 START MATCH
  const startMatch = (matchId, adminId) => 
    runAction('start', async () => {
      const { error: rpcError } = await supabase.rpc('admin_start_match', {
        match_id: matchId,
        admin_user_id: adminId
      });
      if (rpcError) throw rpcError;
    });

  return {
    swapTeams,
    scheduleMatch,
    startMatch,
    loadingAction, // Exposes exactly WHICH action is busy
    error
  };
};
