/**
 * 🛠️ MATCH ADMIN HOOK: WAR ROOM OPERATIONS
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // AUDIT-LINKED
 */

import { useAdminConsole } from './useAdminConsole';
import { supabase } from '../supabase/client';
import { toast } from 'react-hot-toast';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';

export const useMatchAdmin = (match) => {
  const { execute, loading, error } = useAdminConsole();

  // 1. 🛰️ TELEMETRY WRAPPER
  // Automatically logs every admin action to the telemetry black box
  const auditAction = (action, details) => {
    Telemetry.log(EVENTS.ACTION, {
      subsystem: 'WAR_ROOM',
      matchId: match?.id,
      action,
      ...details
    });
  };

  // 2. 🎛️ UPDATE MATCH (The Master Save)
  const updateMatchDetails = async (formData) => {
    if (!match?.id) return;

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: formData.status?.toLowerCase(), 
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
          // Only update IDs if explicitly provided (prevents wiping existing links)
          ...(formData.team1Id && { team1_id: formData.team1Id }),
          ...(formData.team2Id && { team2_id: formData.team2Id })
        })
        .eq('id', match.id);

      if (error) throw error;

      auditAction('UPDATE_MATCH_DETAILS', { status: formData.status });
      
      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
      toast.success("WAR ROOM: STATE UPDATED");
      return true;
    } catch (err) {
      console.error("Update Failed:", err);
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      toast.error("UPDATE FAILED");
      return false;
    }
  };

  // 3. 👑 SET WINNER (Bracket Advancement)
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

      auditAction('SET_WINNER', { winnerId: winnerTeamId });
      
      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
      toast.success("BRACKET ADVANCED");
      return true;
    } catch (err) {
      console.error("Advance Failed:", err);
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      toast.error("ADVANCE FAILED");
      return false;
    }
  };

  // 4. ♻️ RESET MATCH (The Nuclear Option)
  const resetMatch = async () => {
    if (!match?.id) return;
    if (!window.confirm("⚠️ DANGER: Wipe scores, vetoes, and winners?")) return;

    try {
      // A. Reset Match Record
      const { error: matchError } = await supabase
        .from('matches')
        .update({ 
          winner_id: null,
          status: 'scheduled',
          score_team1: 0, 
          score_team2: 0,
          is_paused: false,
          server_ip: null
        })
        .eq('id', match.id);

      if (matchError) throw matchError;

      // B. Purge Veto History
      await supabase
        .from('match_vetoes')
        .delete()
        .eq('match_id', match.id);

      auditAction('RESET_MATCH', { confirmed: true });
      
      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
      toast.success("MATCH RESET TO GENESIS");
      return true;
    } catch (err) {
      console.error("Reset Failed:", err);
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      toast.error("RESET FAILED");
      return false;
    }
  };

  return { 
    updateMatchDetails, 
    setWinner,
    resetMatch,
    loading, 
    error 
  };
};
