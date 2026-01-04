import { useAdminConsole } from './useAdminConsole';
import { supabase } from '../supabase/client';
import { toast } from 'react-hot-toast';

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  // 1. 🎛️ FULL CONTROL (The "War Room" Save Button)
  // Maps directly to Master Code B: admin_update_match_state
  const updateMatchDetails = async (formData) => {
    if (!match?.id) return;

    return execute('admin_update_match_state', {
        p_match_id: match.id,
        p_status: formData.status,
        p_team1_score: parseInt(formData.score1 || 0),
        p_team2_score: parseInt(formData.score2 || 0),
        p_server_ip: formData.serverIp,
        p_server_pass: formData.serverPass,
        p_is_visible: formData.isServerVisible,
        p_scheduled_at: formData.startTime,
        p_stream_url: formData.streamUrl,
        p_demo_url: formData.demoUrl,
        p_admin_notes: formData.notes,
        p_is_paused: formData.isPaused,
        p_map_name: formData.mapName,
        p_caster_name: formData.casterName,
        // Optional: Allow changing teams in the slot (e.g. for TBD slots)
        p_team1_id: formData.team1Id || match.team1_id,
        p_team2_id: formData.team2Id || match.team2_id
    });
  };

  // 2. 🔄 SWAP SIDES (Fixes "Team A is on Left, but acts as Right")
  // Maps directly to Master Code B: api_swap_match_slots
  const swapMatchSlots = async (reason = "Admin Swap") => {
    if (!match?.id) return;
    return execute('api_swap_match_slots', {
        p_match_id: match.id,
        p_reason: reason
    });
  };

  // 3. 👑 FORCE WINNER (Trigger Bracket Progression)
  // Direct DB update because it's simpler than an RPC for a single field.
  // This triggers the 'handle_match_progression' SQL function automatically.
  const setWinner = async (winnerTeamId) => {
    if (!match?.id) return;
    
    try {
        const { error } = await supabase
            .from('matches')
            .update({ 
                winner_id: winnerTeamId,
                status: 'completed'
            })
            .eq('id', match.id);

        if (error) throw error;
        toast.success("Bracket Advanced!");
        return true;
    } catch (err) {
        console.error("Force Win Error:", err);
        toast.error("Failed to advance bracket.");
        return false;
    }
  };

  // 4. ♻️ RESET MATCH (Emergency Undo)
  // Clears scores and winner, setting it back to 'scheduled' or 'live'
  const resetMatch = async () => {
    if (!match?.id) return;

    try {
        const { error } = await supabase
            .from('matches')
            .update({ 
                winner_id: null,
                status: 'scheduled',
                score_team1: 0,
                score_team2: 0,
                round: match.round // Keeps it in the same bracket spot
            })
            .eq('id', match.id);

        if (error) throw error;
        toast.success("Match Reset Successfully");
        return true;
    } catch (err) {
        toast.error("Failed to reset match");
        return false;
    }
  };

  return { 
    updateMatchDetails, 
    swapMatchSlots, 
    setWinner,
    resetMatch,
    loading, 
    error 
  };
};
