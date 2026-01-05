import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS, MAP_POOL } from '../lib/constants';
import { toast } from 'react-hot-toast';

export const useCaptainVeto = (match, passedTeamId) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const myTeamId = useMemo(() => {
    if (passedTeamId) return passedTeamId;
    const sessionTeamId = session?.team_id || session?.teamId || session?.user?.user_metadata?.team_id; 
    
    if (!sessionTeamId || !match) return null;
    if (match.team1_id === sessionTeamId) return match.team1_id;
    if (match.team2_id === sessionTeamId) return match.team2_id;
    return null; 
  }, [match, session, passedTeamId]);

  const formatRules = useMemo(() => {
    if (!match) return MATCH_FORMATS['BO1'];
    const type = match.best_of === 3 ? 'BO3' : 'BO1'; 
    return MATCH_FORMATS[type] || MATCH_FORMATS['BO1'];
  }, [match]);

  const vetoState = useMemo(() => {
    if (!formatRules || !match) return { isMyTurn: false, action: 'WAIT', availableMaps: [] };

    const totalSteps = formatRules.sequence.length;
    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= totalSteps;

    const usedMapIds = new Set(vetoes.map(v => v.map_name));
    const availableMaps = MAP_POOL.filter(m => !usedMapIds.has(m.id));

    if (isComplete) {
      return { isMyTurn: false, action: 'COMPLETE', activeTeamId: null, availableMaps };
    }

    const currentStep = formatRules.sequence[currentStepIndex]; 
    let activeTeamId = null;
    if (currentStep.team === 'A') activeTeamId = match.team1_id;
    else if (currentStep.team === 'B') activeTeamId = match.team2_id;
    
    return {
      isMyTurn: String(myTeamId).toLowerCase() === String(activeTeamId).toLowerCase(), 
      action: currentStep.type, 
      activeTeamId,
      stepIndex: currentStepIndex,
      totalSteps,
      availableMaps
    };
  }, [vetoes, formatRules, match, myTeamId]);

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
      }, () => fetchVetoes())
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [match?.id, fetchVetoes]);

  const submitVeto = async (mapId) => {
    // 🛡️ FRONTEND PROTECTION: Prevents duplicate picks if they already exist in local state
    const isAlreadyVetoed = vetoes.some(v => v.map_name === mapId);
    if (isAlreadyVetoed) {
      toast.error("Map already selected");
      return;
    }

    if (!vetoState.isMyTurn || loading) {
        toast.error("Wait for your turn!");
        return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.rpc('api_submit_veto', {
        p_match_id: match.id,
        p_team_id: myTeamId,
        p_map_name: mapId,
        p_type: vetoState.action,
        p_pick_order: vetoes.length + 1 // Postgres matches often use 1-based indexing for orders
      });

      if (error) throw error;
      toast.success(`${mapId} Processed`);
      await fetchVetoes();

    } catch (err) {
      console.error("Veto Error:", err);
      toast.error(err.message);
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
