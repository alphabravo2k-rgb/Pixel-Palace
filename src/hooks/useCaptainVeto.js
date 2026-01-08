import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS, MAP_POOL } from '../lib/constants';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { toast } from 'react-hot-toast';

/**
 * 🎣 USE CAPTAIN VETO
 * -------------------
 * STATUS: MASTERED (LOGIC FIXED)
 * * PURPOSE:
 * Manages the complex state machine of the Veto/Pick phase.
 * * FIXES:
 * 1. Aligned 'team1'/'team2' check with constants.js.
 * 2. Added 8D Audio triggers.
 */

export const useCaptainVeto = (match, passedTeamId) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1️⃣ RESOLVE IDENTITY (Who am I?)
  const myTeamId = useMemo(() => {
    // Priority: Prop > Session > Metadata
    const sessionTeamId = passedTeamId || session?.team_id || session?.user?.user_metadata?.team_id;
    
    if (!sessionTeamId || !match) return null;
    
    // Normalize for comparison
    const sId = String(sessionTeamId).toLowerCase();
    if (String(match.team1_id).toLowerCase() === sId) return match.team1_id;
    if (String(match.team2_id).toLowerCase() === sId) return match.team2_id;
    return null;
  }, [match, session, passedTeamId]);

  // 2️⃣ FORMAT DERIVATION (BO1 vs BO3)
  const formatRules = useMemo(() => {
    if (!match) return MATCH_FORMATS.BO1;
    const type = match.best_of === 3 ? 'BO3' : match.best_of === 5 ? 'BO5' : 'BO1';
    return MATCH_FORMATS[type] || MATCH_FORMATS.BO1;
  }, [match]);

  // 3️⃣ STATE ENGINE (Whose turn is it?)
  const vetoState = useMemo(() => {
    if (!formatRules || !match) return { isMyTurn: false, action: 'WAIT', availableMaps: MAP_POOL };

    const totalSteps = formatRules.sequence.length;
    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= totalSteps;

    // 🧠 INTELLIGENT FILTERING
    // Removes maps that have already been banned/picked
    const usedMapIds = new Set(vetoes.map(v => v.map_name)); // DB stores 'de_mirage'
    const availableMaps = MAP_POOL.filter(m => !usedMapIds.has(m.id));

    if (isComplete) {
      return { isMyTurn: false, action: 'COMPLETE', activeTeamId: null, availableMaps: [] };
    }

    // Determine Active Team based on Sequence (team1 vs team2)
    const currentStep = formatRules.sequence[currentStepIndex];
    const activeTeamId = (currentStep.team === 'team1') ? match.team1_id : match.team2_id;

    const isMyTurn = myTeamId && activeTeamId && (String(myTeamId) === String(activeTeamId));

    return {
      isMyTurn,
      action: currentStep.type, // 'BAN' or 'PICK'
      activeTeamId,
      stepIndex: currentStepIndex,
      totalSteps,
      availableMaps
    };
  }, [vetoes, formatRules, match, myTeamId]);

  // 4️⃣ DATA FETCHING & SYNC
  const fetchVetoes = useCallback(async () => {
    if (!match?.id) return;
    const { data, error } = await supabase
      .from('match_vetoes')
      .select('*')
      .eq('match_id', match.id)
      .order('pick_order', { ascending: true });

    if (!error) setVetoes(data || []);
  }, [match?.id]);

  useEffect(() => {
    fetchVetoes();
    const subscription = supabase
      .channel(`veto_sync_${match?.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'match_vetoes', 
        filter: `match_id=eq.${match?.id}` 
      }, (payload) => {
        // Play sound on ANY update (even if opponent acted)
        if (payload.eventType === 'INSERT') SoundNexus.play(CUES.VETO_ACTION);
        fetchVetoes();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [match?.id, fetchVetoes]);

  // 5️⃣ ACTION: SUBMIT VETO
  const submitVeto = async (mapId) => {
    if (!vetoState.isMyTurn || loading) return;
    
    // Guard: Prevent double clicks
    if (vetoes.some(v => v.map_name === mapId)) {
      toast.error("MAP ALREADY PROCESSED");
      return;
    }

    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);

    try {
      // Direct Insert (Faster than RPC for simple vetoes)
      // Note: Ensure RLS policies allow captains to insert
      const { error } = await supabase.from('match_vetoes').insert({
        match_id: match.id,
        team_id: myTeamId,
        map_name: mapId,
        type: vetoState.action,
        pick_order: vetoes.length + 1
      });

      if (error) throw error;
      
      toast.success(`${formatRules.sequence[vetoes.length].type}: ${mapId}`);
      // Sound handled by subscription listener
    } catch (err) {
      console.error(err);
      toast.error("VETO FAILED: " + err.message);
      SoundNexus.play(CUES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return {
    vetoes,
    ...vetoState,
    progress: `${vetoState.stepIndex} / ${vetoState.totalSteps}`,
    submitVeto,
    loading
  };
};
