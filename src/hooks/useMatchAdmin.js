import { useAdminConsole } from './useAdminConsole';
import { PERM_CAPABILITIES } from '../lib/permissions.actions';

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  // 🔄 SWAP SLOTS (Corrected)
  // We don't pass Team IDs because the RPC swaps whatever is in slot A/B.
  const swapMatchSlots = (reason) => {
    return execute('api_swap_match_slots', {
        p_match_a_id: match.id,
        p_slot_a: 1, 
        p_match_b_id: match.id, 
        p_slot_b: 2, // Swapping 1 and 2 within the same match
        p_tournament_id: match.tournament_id,
        p_reason: reason
    });
  };

  // 📝 UPDATE SCORE
  const updateScore = (t1Score, t2Score) => {
    return execute('api_update_match_score', { 
        p_match_id: match.id, 
        p_team1_score: t1Score, 
        p_team2_score: t2Score 
    });
  };

  // 🔁 RESET MATCH
  const resetMatch = (reason) => {
    return execute('api_reset_match', { 
        p_match_id: match.id, 
        p_reason: reason 
    });
  };

  return { updateScore, resetMatch, swapMatchSlots, loading, error };
};
