import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS } from '../lib/constants';

export const useCaptainVeto = (match) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1️⃣ SCOPED IDENTITY: Are you a captain *of this match*?
  const myTeamId = useMemo(() => {
    if (!session?.team_id || !match) return null;
    if (match.team1_id === session.team_id) return match.team1_id;
    if (match.team2_id === session.team_id) return match.team2_id;
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
    if (!formatRules) return { isMyTurn: false, action: 'WAIT' };

    const totalSteps = formatRules.sequence.length;
    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= totalSteps;

    if (isComplete) {
      return { isMyTurn: false, action: 'COMPLETE', activeTeamId: null };
    }

    // Logic: Look up the sequence step (e.g., Step 0 = Ban Team A)
    const currentStep = formatRules.sequence[currentStepIndex]; 
    
    // Resolve 'A' (Team 1) or 'B' (Team 2)
    // Team 1 is usually the "Home" or "High Seed" team
    const activeTeamId = currentStep.team === 'A' ? match.team1_id : match.team2_id;
    
    return {
      isMyTurn: myTeamId === activeTeamId,
      action: currentStep.type, // 'BAN' or 'PICK'
      activeTeamId
    };
  }, [vetoes, formatRules, match, myTeamId]);

  // 4️⃣ DATA FETCHING
  const fetchVetoes = useCallback(async () => {
    if (!match?.id) return;
    const { data, error } = await supabase
      .from('match_vetoes') // ✅ FIXED: Plural
      .select('*')
      .eq('match_id', match.id)
      .order('pick_order', { ascending: true }); // ✅ FIXED: Correct Column

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
        table: 'match_vetoes', // ✅ FIXED: Plural
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
      // Determines if this is a BAN or PICK
      const type = vetoState.action; 
      // Calculate next order index (0, 1, 2...)
      const nextOrder = vetoes.length; 

      const { error } = await supabase.rpc('api_submit_veto', {
        p_match_id: match.id,
        p_team_id: myTeamId,
        p_map_name: mapId,
        p_type: type,
        p_pick_order: nextOrder
      });

      if (error) throw error;

      // Immediate refresh to update UI
      await fetchVetoes();

    } catch (err) {
      console.error("Veto Error:", err);
      alert("Failed to update veto: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    vetoes,
    isMyTurn: vetoState.isMyTurn,
    currentAction: vetoState.action,
    activeTeamId: vetoState.activeTeamId,
    submitVeto,
    loading
  };
};
