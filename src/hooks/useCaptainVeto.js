import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS, MAP_POOL } from '../lib/constants';
import { toast } from 'react-hot-toast';

export const useCaptainVeto = (match) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1️⃣ SCOPED IDENTITY: Are you a captain *of this match*?
  const myTeamId = useMemo(() => {
    // Note: useSession provides 'teamId', DB provides 'team_id'
    const userTeamId = session?.teamId || session?.user?.user_metadata?.team_id; 
    
    if (!userTeamId || !match) return null;
    if (match.team1_id === userTeamId) return match.team1_id;
    if (match.team2_id === userTeamId) return match.team2_id;
    return null; 
  }, [match, session]);

  // 2️⃣ FORMAT DERIVATION (BO1 vs BO3)
  const formatRules = useMemo(() => {
    if (!match) return MATCH_FORMATS['BO1'];
    // Matches DB INT 'best_of' -> 1 or 3
    const type = match.best_of === 3 ? 'BO3' : 'BO1'; 
    return MATCH_FORMATS[type] || MATCH_FORMATS['BO1'];
  }, [match]);

  // 3️⃣ STATE CALCULATION (Whose turn is it?)
  const vetoState = useMemo(() => {
    if (!formatRules) return { isMyTurn: false, action: 'WAIT', availableMaps: [] };

    const totalSteps = formatRules.sequence.length;
    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= totalSteps;

    // 🗺️ Calculate Available Maps (Maps not yet in vetoes)
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

    // Logic: Look up the sequence step (e.g., Step 0 = Ban Team A)
    const currentStep = formatRules.sequence[currentStepIndex]; 
    
    // Resolve 'A' (Team 1) or 'B' (Team 2) or 'SYSTEM' (Auto-Decider)
    let activeTeamId = null;
    if (currentStep.team === 'A') activeTeamId = match.team1_id;
    else if (currentStep.team === 'B') activeTeamId = match.team2_id;
    
    return {
      isMyTurn: myTeamId === activeTeamId,
      action: currentStep.type, // 'BAN', 'PICK', or 'DECIDER'
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

  // Initial Load & Realtime Sync
  useEffect(() => {
    fetchVetoes();

    const subscription = supabase
      .channel(`veto_sync_${match?.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
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
      
      // Optimistic UI update handled by Realtime, but we fetch to be safe
      toast.success(`${type} Successful`);
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
    availableMaps: vetoState.availableMaps, // 👈 Critical for UI (Graying out buttons)
    progress: `${vetoState.stepIndex + 1} / ${vetoState.totalSteps}`,
    submitVeto,
    loading
  };
};
