import { useAdminConsole } from './useAdminConsole';

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  const swapMatchSlots = (reason) => {
    return execute('api_swap_match_slots', {
        p_match_id: match.id,
        p_reason: reason
    });
  };

  const updateScore = (t1Score, t2Score) => {
    return execute('api_update_match_score', { 
        p_match_id: match.id, 
        p_team1_score: t1Score, 
        p_team2_score: t2Score 
    });
  };

  const resetMatch = (reason) => {
    return execute('api_reset_match', { 
        p_match_id: match.id, 
        p_reason: reason 
    });
  };

  return { updateScore, resetMatch, swapMatchSlots, loading, error };
};
