import { useAdminConsole } from './useAdminConsole';

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  // 1. SWAP TEAMS (Fixes accidental mis-seeding)
  const swapMatchSlots = (reason) => {
    if (!match?.id) return;
    return execute('api_swap_match_slots', {
        p_match_id: match.id,
        p_reason: reason
    });
  };

  // 2. UPDATE FORMAT (BO1 -> BO3)
  const updateFormat = (bestOf) => {
    if (!match?.id) return;
    return execute('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: parseInt(bestOf) // Ensure integer
    });
  };

  return { swapMatchSlots, updateFormat, loading, error };
};
