import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase/client';

export const useCaptainVeto = (match, session) => {
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1. HOOK RULES: Always define state/effects at top level. No early returns.
  const matchId = match?.id;
  const teamId = session?.identity?.team_id; 

  // 2. Load Veto History
  useEffect(() => {
    if (!matchId) return; // Guard inside effect

    const fetchVetoes = async () => {
      const { data } = await supabase
        .from('match_vetoes')
        .select('*')
        .eq('match_id', matchId)
        .order('pick_order', { ascending: true });
      
      if (data) setVetoes(data);
    };

    fetchVetoes();

    // Subscribe to changes
    const channel = supabase
      .channel(`veto-${matchId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'match_vetoes', 
        filter: `match_id=eq.${matchId}` 
      }, (payload) => {
        setVetoes(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  // 3. LOGIC: Derive State from Data (Not DOM/UI)
  const vetoState = useMemo(() => {
    if (!match) return { isMyTurn: false, phase: 'IDLE' };

    // Authority: Database Status
    // If backend says match is LIVE or SCHEDULED, vetoes are done/paused.
    if (match.status !== 'veto') {
      return { isMyTurn: false, phase: 'CLOSED', isComplete: true };
    }

    const totalVetoes = vetoes.length;
    // Standard BO1 Logic: Ban-Ban-Ban-Ban-Ban-Ban-Pick
    const turnOrder = match.best_of === 3 
        ? ['Ban', 'Ban', 'Pick', 'Pick', 'Ban', 'Ban', 'Decider'] 
        : ['Ban', 'Ban', 'Ban', 'Ban', 'Ban', 'Ban', 'Pick'];

    const currentTurnType = turnOrder[totalVetoes] || 'Complete';
    
    // Determine whose turn it is (A-B-A-B...)
    const isTeam1Turn = totalVetoes % 2 === 0; 
    const activeTeamId = isTeam1Turn ? match.team1_id : match.team2_id;
    
    const isMyTurn = teamId === activeTeamId;

    return {
      isMyTurn,
      currentTurnType,
      activeTeamId,
      isComplete: totalVetoes >= turnOrder.length
    };
  }, [match, vetoes, teamId]);

  // 4. ACTION: Submit Veto
  const submitVeto = async (mapName) => {
    if (!matchId || !teamId || !vetoState.isMyTurn) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.rpc('api_submit_veto', {
        p_match_id: matchId,
        p_team_id: teamId,
        p_map_name: mapName,
        p_type: vetoState.currentTurnType.toUpperCase() // 'PICK' or 'BAN'
      });

      if (error) throw error;
    } catch (err) {
      console.error("Veto Error:", err);
      alert("Failed to submit veto. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    vetoes,
    ...vetoState,
    submitVeto,
    loading
  };
};
