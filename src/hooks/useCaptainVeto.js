import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

export const useCaptainVeto = (match) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const matchId = match?.id;
  const myTeamId = session?.team_id;

  useEffect(() => {
    if (!matchId) return;

    const fetchVetoes = async () => {
      const { data } = await supabase
        .from('match_vetoes')
        .select('*')
        .eq('match_id', matchId)
        .order('pick_order', { ascending: true });
      if (data) setVetoes(data);
    };

    fetchVetoes();

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

  const vetoState = useMemo(() => {
    if (!match) return { isMyTurn: false, currentAction: 'WAIT' };

    if (match.status !== 'veto') {
      return { isMyTurn: false, currentAction: 'LOCKED', isComplete: true };
    }

    const activeTeamId = match.current_veto_team_id;
    const isMyTurn = activeTeamId === myTeamId;
    
    const totalVetoes = vetoes.length;
    const turnOrder = match.best_of === 3 
        ? ['BAN', 'BAN', 'PICK', 'PICK', 'BAN', 'BAN', 'DECIDER'] 
        : ['BAN', 'BAN', 'BAN', 'BAN', 'BAN', 'BAN', 'PICK'];

    const currentAction = turnOrder[totalVetoes] || 'COMPLETE';
    
    return {
      isMyTurn,
      currentAction,
      activeTeamId,
      isComplete: totalVetoes >= turnOrder.length
    };
  }, [match, vetoes, myTeamId]);

  const submitVeto = async (mapName) => {
    if (!matchId || !myTeamId || !vetoState.isMyTurn) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.rpc('api_submit_veto', {
        p_match_id: matchId,
        p_map_name: mapName,
        p_type: vetoState.currentAction
      });

      if (error) throw error;
    } catch (err) {
      console.error("Veto Failed:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { vetoes, ...vetoState, submitVeto, loading };
};
