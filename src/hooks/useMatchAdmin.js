import { useAdminConsole } from './useAdminConsole';

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  const swapMatchSlots = (reason) => {
    return execute('api_swap_match_slots', {
        p_match_id: match.id,
        p_reason: reason
    });
  };

  const updateFormat = (bestOf) => {
    return execute('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: bestOf
    });
  };

  return { swapMatchSlots, updateFormat, loading, error };
};
