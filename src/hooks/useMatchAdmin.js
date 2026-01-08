import { useAdminConsole } from './useAdminConsole';
import { supabase } from '../supabase/client';
import { toast } from 'react-hot-toast';
import { SoundNexus, CUES } from '../lib/soundNexus';

/**
 * 🛠️ MATCH ADMIN HOOK
 * -------------------
 * STATUS: MASTERED (SCHEMA ALIGNED)
 * * PURPOSE: 
 * Encapsulates all "God Mode" actions for the War Room.
 */

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  // 1. 🎛️ FULL CONTROL (The "War Room" Save Button)
  const updateMatchDetails = async (formData) => {
    if (!match?.id) return;

    // We use direct DB updates for reliability unless you have the specific RPC installed
    try {
        const { error } = await supabase
            .from('matches')
            .update({
                status: formData.status.toLowerCase(), 
                score_team1: parseInt(formData.score1 || 0),
                score_team2: parseInt(formData.score2 || 0),
                server_ip: formData.serverIp,
                server_pass: formData.serverPass,
                is_visible: formData.isServerVisible,
                start_time: formData.startTime,
                stream_url: formData.streamUrl,
                demo_url: formData.demoUrl,
                admin_notes: formData.notes,
                is_paused: formData.isPaused,
                map_name: formData.mapName,
                caster_name: formData.casterName,
                // Only update IDs if explicitly changed to avoid nulling them
                ...(formData.team1Id && { team1_id: formData.team1Id }),
                ...(formData.team2Id && { team2_id: formData.team2Id })
            })
            .eq('id', match.id);

        if (error) throw error;
        SoundNexus.play(CUES.SUCCESS);
        toast.success("MATCH STATE UPDATED");
        return true;
    } catch (err) {
        console.error("Update Error:", err);
        SoundNexus.play(CUES.ERROR);
        toast.error("UPDATE FAILED");
        return false;
    }
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
        SoundNexus.play(CUES.SUCCESS);
        toast.success("BRACKET ADVANCED");
        return true;
    } catch (err) {
        console.error("Force Win Error:", err);
        SoundNexus.play(CUES.ERROR);
        toast.error("ADVANCE FAILED");
        return false;
    }
  };

  // 4. ♻️ RESET MATCH (Emergency Undo)
  const resetMatch = async () => {
    if (!match?.id) return;

    if (!window.confirm("⚠️ DANGER: This will wipe scores, vetoes, and winner status. Proceed?")) return;

    try {
        const { error } = await supabase
            .from('matches')
            .update({ 
                winner_id: null,
                status: 'scheduled',
                // ✅ FIXED: Using score_team1 to match Master Schema
                score_team1: 0, 
                score_team2: 0,
                // Keeps position and round intact
                match_position: match.match_position,
                round_number: match.round_number,
                is_paused: false,
                server_ip: null
            })
            .eq('id', match.id);

        if (error) throw error;
        
        // 🔥 Also clear the Veto History for this match so captains can re-veto
        await supabase
            .from('match_vetoes')
            .delete()
            .eq('match_id', match.id);

        SoundNexus.play(CUES.SUCCESS);
        toast.success("MATCH RESET COMPLETE");
        return true;
    } catch (err) {
        console.error("Reset Error:", err);
        SoundNexus.play(CUES.ERROR);
        toast.error("RESET FAILED");
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
