import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS, MAP_POOL } from '../lib/constants';
import { toast } from 'react-hot-toast';

// ✅ Added passedTeamId as an argument
export const useCaptainVeto = (match, passedTeamId) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1️⃣ RESOLVE IDENTITY: Use the passed ID or look it up from session
  const myTeamId = useMemo(() => {
    // Priority 1: The ID passed from the Modal
    if (passedTeamId) return passedTeamId;

    // Priority 2: PIN Login Session property
    const sessionTeamId = session?.team_id || session?.teamId || session?.user?.user_metadata?.team_id; 
    
    if (!sessionTeamId || !match) return null;
    
    // Validate that the user belongs to this match
    if (match.team1_id === sessionTeamId) return match.team1_id;
    if (match.team2_id === sessionTeamId) return match.team2_id;
    
    return null; 
  }, [match, session, passedTeamId]);

  // 2️⃣ FORMAT DERIVATION (BO1 vs BO3)
  const formatRules = useMemo(() => {
    if (!match) return MATCH_FORMATS['BO1'];
    const type = match.best_of === 3 ? 'BO3' : 'BO1'; 
    return MATCH_FORMATS[type] || MATCH_FORMATS['BO1'];
  }, [match]);

  // 3️⃣ STATE CALCULATION (Whose turn is it?)
  const vetoState = useMemo(() => {
    if (!formatRules || !match) return { isMyTurn: false, action: 'WAIT', availableMaps: [] };

    const totalSteps = formatRules.sequence.length;
    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= totalSteps;

    const usedMapIds = new Set(vetoes.map(v => v.map_name));
    const availableMaps = MAP_POOL.filter(m => !usedMapIds.has(m.id));

    if (isComplete) {
      return { 
        isMyTurn: false, 
        action: 'COMPLETE', 
        activeTeamId: null, 
        availableMaps 
      };
    }

    const currentStep = formatRules.sequence[currentStepIndex]; 
    
    let activeTeamId = null;
    if (currentStep.team === 'A') activeTeamId = match.team1_id;
    else if (currentStep.team === 'B') activeTeamId = match.team2_id;
    
    return {
      // ✅ Critical Comparison
      isMyTurn: String(myTeamId) === String(activeTeamId), 
      action: currentStep.type, 
      activeTeamId,
      stepIndex: currentStepIndex,
      totalSteps,
      availableMaps
    };
  }, [vetoes, formatRules, match, myTeamId]);

  // 4️⃣ DATA FETCHING
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
        event: '*', // Listen for all changes (inserts/deletes)
        schema: 'public', 
        table: 'match_vetoes',
        filter: `match_id=eq.${match?.id}` 
      }, () => fetchVetoes())
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [match?.id, fetchVetoes]);

  // 5️⃣ SUBMIT ACTION
  const submitVeto = async (mapId) => {
    if (!vetoState.isMyTurn || loading) {
        toast.error("It is not your turn!");
        return;
    }
    setLoading(true);

    try {
      const type = vetoState.action; 
      const nextOrder = vetoes.length; 

      const { error } = await supabase.rpc('api_submit_veto', {
        p_match_id: match.id,
        p_team_id: myTeamId,
        p_map_name: mapId,
        p_type: type,
        p_pick_order: nextOrder
      });

      if (error) throw error;
      
      toast.success(`${mapId} ${type}ED`);
      await fetchVetoes();

    } catch (err) {
      console.error("Veto Error:", err);
      toast.error("Veto Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    vetoes,
    isMyTurn: vetoState.isMyTurn,
    currentAction: vetoState.action,
    activeTeamId: vetoState.activeTeamId,
    availableMaps: vetoState.availableMaps,
    progress: `${vetoState.stepIndex + 1} / ${vetoState.totalSteps}`,
    submitVeto,
    loading
  };
};
