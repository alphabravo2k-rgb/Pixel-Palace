import { useAdminConsole } from './useAdminConsole';
import { PERM_CAPABILITIES } from '../lib/permissions.actions'; // Corrected import

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  // Helper to ensure we have context
  const context = { tournamentId: match?.tournament_id };

  // 🔄 SWAP TEAMS (Uses Strict RPC)
  const swapTeams = (team1Id, team2Id, reason) => {
    return execute('api_swap_match_slots', {
        p_match_a_id: match.id,
        p_slot_a: 1, 
        p_match_b_id: match.id, 
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

  return { updateScore, resetMatch, loading, error };
};
