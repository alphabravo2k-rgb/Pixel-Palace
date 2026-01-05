import { useAdminConsole } from './useAdminConsole';
import { supabase } from '../supabase/client';
import { toast } from 'react-hot-toast';

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  // 1. 🎛️ FULL CONTROL (The "War Room" Save Button)
  const updateMatchDetails = async (formData) => {
    if (!match?.id) return;

    return execute('admin_update_match_state', {
        p_match_id: match.id,
        // ✅ Ensure lowercase for Captain Dashboard compatibility
        p_status: formData.status.toLowerCase(), 
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
        p_team1_id: formData.team1Id || match.team1_id,
        p_team2_id: formData.team2Id || match.team2_id
    });
  };

  // 2. 🔄 SWAP SIDES
  const swapMatchSlots = async (reason = "Admin Swap") => {
    if (!match?.id) return;
    return execute('api_swap_match_slots', {
        p_match_id: match.id,
        p_reason: reason
    });
  };

  // 3. 👑 FORCE WINNER (Trigger Bracket Progression)
  const setWinner = async (winnerTeamId) => {
    if (!match?.id) return;
    
    try {
        const { error } = await supabase
            .from('matches')
            .update({ 
                winner_id: winnerTeamId,
                status: 'completed' // Lowercase for safety
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
  const resetMatch = async () => {
    if (!match?.id) return;

    try {
        const { error } = await supabase
            .from('matches')
            .update({ 
                winner_id: null,
                status: 'scheduled',
                // ✅ FIXED: Using team1_score instead of score_team1
                team1_score: 0, 
                team2_score: 0,
                // Keeps position and round intact
                match_position: match.match_position,
                round_number: match.round_number 
            })
            .eq('id', match.id);

        if (error) throw error;
        
        // 🔥 Also clear the Veto History for this match so captains can re-veto
        await supabase
            .from('match_vetoes')
            .delete()
            .eq('match_id', match.id);

        toast.success("Match & Vetoes Reset Successfully");
        return true;
    } catch (err) {
        console.error("Reset Error:", err);
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
