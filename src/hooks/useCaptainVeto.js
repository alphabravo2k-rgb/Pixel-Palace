import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS, MAP_POOL } from '../lib/constants';
import { toast } from 'react-hot-toast';

export const useCaptainVeto = (match, passedTeamId) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1️⃣ RESOLVE IDENTITY (Ensures UUID vs String safety)
  const myTeamId = useMemo(() => {
    const sessionTeamId = passedTeamId || session?.team_id || session?.teamId || session?.user?.user_metadata?.team_id;
    if (!sessionTeamId || !match) return null;
    
    // Standardize to lowercase string for comparison
    const sId = String(sessionTeamId).toLowerCase();
    if (String(match.team1_id).toLowerCase() === sId) return match.team1_id;
    if (String(match.team2_id).toLowerCase() === sId) return match.team2_id;
    return null;
  }, [match, session, passedTeamId]);

  // 2️⃣ FORMAT DERIVATION
  const formatRules = useMemo(() => {
    const type = match?.best_of === 3 ? 'BO3' : 'BO1';
    return MATCH_FORMATS[type] || MATCH_FORMATS['BO1'];
  }, [match]);

  // 3️⃣ STATE CALCULATION (With Fuzzy Matching)
  const vetoState = useMemo(() => {
    if (!formatRules || !match) return { isMyTurn: false, action: 'WAIT', availableMaps: MAP_POOL };

    const totalSteps = formatRules.sequence.length;
    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= totalSteps;

    // 🧠 FUZZY MATCHING: Normalizes "Dust 2" to "dust2"
    const normalize = (name) => String(name).toLowerCase().replace(/\s/g, '');
    
    const usedMapNames = new Set(vetoes.map(v => normalize(v.map_name)));
    const availableMaps = MAP_POOL.filter(m => !usedMapNames.has(normalize(m.id)));

    if (isComplete) {
      return { isMyTurn: false, action: 'COMPLETE', activeTeamId: null, availableMaps };
    }

    const currentStep = formatRules.sequence[currentStepIndex];
    let activeTeamId = (currentStep.team === 'A') ? match.team1_id : match.team2_id;

    return {
      isMyTurn: String(myTeamId).toLowerCase() === String(activeTeamId).toLowerCase(),
      action: currentStep.type,
      activeTeamId,
      stepIndex: currentStepIndex,
      totalSteps,
      availableMaps
    };
  }, [vetoes, formatRules, match, myTeamId]);

  // 4️⃣ DATA FETCHING & REALTIME
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

  // 5️⃣ SUBMIT ACTION
  const submitVeto = async (mapId) => {
    if (!vetoState.isMyTurn || loading) return;
    
    // Final Frontend Guard
    const normalize = (name) => String(name).toLowerCase().replace(/\s/g, '');
    if (vetoes.some(v => normalize(v.map_name) === normalize(mapId))) {
      toast.error("Map already processed");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('api_submit_veto', {
        p_match_id: match.id,
        p_team_id: myTeamId,
        p_map_name: mapId,
        p_type: vetoState.action,
        p_pick_order: vetoes.length + 1
      });

      if (error) throw error;
      toast.success(`${mapId} ${vetoState.action}ED`);
      await fetchVetoes();
    } catch (err) {
      toast.error(err.message || "Veto submission failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    vetoes,
    ...vetoState,
    progress: `${vetoState.stepIndex || 0} / ${vetoState.totalSteps || 0}`,
    submitVeto,
    loading
  };
};
