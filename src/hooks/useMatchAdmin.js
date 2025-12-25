import { useAdminConsole } from './useAdminConsole';
import { PERM_ACTIONS } from '../lib/permissions.actions';

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  // Helper to ensure we have context
  // This validates the admin owns the tournament this match belongs to
  const context = { tournamentId: match?.tournament_id };

  // 🔄 SWAP TEAMS (Uses Strict RPC)
  const swapTeams = (team1Id, team2Id, reason) => {
    return execute({
      action: PERM_ACTIONS.CAN_MANAGE_MATCH,
      context,
      rpc: 'api_swap_match_slots',
      params: {
        p_match_a_id: match.id,
        p_slot_a: 1, // Logic handled in RPC wrapper usually, simplified here
        p_match_b_id: match.id, // Usually distinct, but for single-match operations...
        // NOTE: The RPC expects two matches. This helper assumes internal swapping or specialized UI.
        // For simple re-slotting within same match:
        p_tournament_id: match.tournament_id,
        p_reason: reason
      }
    });
    // NOTE: If this is purely for the "Swap Tool" which involves 2 matches, 
    // it should be called from the BracketSwapper component directly. 
    // This hook is better for single-match admin actions like Reset/Score.
  };

  // 📝 UPDATE SCORE
  const updateScore = (t1Score, t2Score) => {
    return execute({
      action: PERM_ACTIONS.CAN_MANAGE_MATCH,
      context,
      rpc: 'api_update_match_score', // Ensure this RPC exists in your SQL
      params: { 
        p_match_id: match.id, 
        p_team1_score: t1Score, 
        p_team2_score: t2Score 
      }
    });
  };

  // 🔁 RESET MATCH
  const resetMatch = (reason) => {
    return execute({
      action: PERM_ACTIONS.CAN_MANAGE_MATCH,
      context,
      rpc: 'api_reset_match', // Ensure this RPC exists
      params: { 
        p_match_id: match.id,
        p_reason: reason 
      }
    });
  };

  return { updateScore, resetMatch, loading, error };
};
