import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS } from '../lib/constants'; // ✅ Single Source of Truth

export const useCaptainVeto = (match) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1️⃣ CRITICAL FIX: SCOPED IDENTITY
  // Do not trust session.team_id blindly. Only trust it if it belongs to THIS match.
  const myTeamId = useMemo(() => {
    if (!session?.team_id) return null;
    if (match.team1_id === session.team_id) return match.team1_id;
    if (match.team2_id === session.team_id) return match.team2_id;
    return null; // You might be a captain, but not for THIS match.
  }, [match, session]);

  // 2️⃣ FORMAT DERIVATION (Don't hardcode rules in UI)
  const formatRules = useMemo(() => {
    // Fallback to BO1 if unknown, but try to read from constants
    const type = match.best_of === 3 ? 'BO3' : 'BO1'; 
    return MATCH_FORMATS[type] || MATCH_FORMATS['BO1'];
  }, [match.best_of]);

  // 3️⃣ STATE CALCULATION (Deterministic)
  const vetoState = useMemo(() => {
    const totalSteps = formatRules.sequence.length;
    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= totalSteps;

    if (isComplete) {
      return { isMyTurn: false, action: 'WAIT', activeTeamId: null };
    }

    const currentStep = formatRules.sequence[currentStepIndex]; // { action: 'BAN', team: 'A' }
    
    // Resolve 'A' or 'B' to actual Team IDs
    // Assuming Team A = team1 (Higher seed/Home) and Team B = team2
    const activeTeamId = currentStep.team === 'A' ? match.team1_id : match.team2_id;
    
    return {
      isMyTurn: myTeamId === activeTeamId,
      action: currentStep.type, // 'BAN' or 'PICK'
      activeTeamId
    };
  }, [vetoes, formatRules, match, myTeamId]);

  // 4️⃣ DATA FETCHING (The "Source of Truth")
  const fetchVetoes = useCallback(async () => {
    const { data, error } = await supabase
      .from('match_veto')
      .select('*')
      .eq('match_id', match.id)
      .order('sequence_no', { ascending: true });

    if (!error) setVetoes(data || []);
  }, [match.id]);

  // Initial Load & Subscription
  useEffect(() => {
    fetchVetoes();

    // 🛡️ CRITICAL FIX: REALTIME DEDUPLICATION
    // Instead of appending rows blindly, we just trigger a full refetch.
    // This is slightly slower but 100% accurate (no race conditions).
    const subscription = supabase
      .channel(`veto_sync_${match.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_veto', filter: `match_id=eq.${match.id}` }, 
        () => fetchVetoes()
      )
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [match.id, fetchVetoes]);

  // 5️⃣ ACTION SUBMISSION (With Revalidation)
  const submitVeto = async (mapId) => {
    if (!vetoState.isMyTurn || loading) return;
    setLoading(true);

    try {
      // Optimistic Update (Optional - skipped for safety in Phase 1)
      
      const { error } = await supabase.rpc('api_submit_veto', {
        p_match_id: match.id,
        p_team_id: myTeamId,
        p_map_name: mapId
      });

      if (error) throw error;

      // 🛡️ FORCE REVALIDATION
      // Don't wait for realtime. Fetch immediately to confirm backend state.
      await fetchVetoes();

    } catch (err) {
      console.error("Veto Error:", err);
      alert("Failed to submit veto: " + err.message);
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
