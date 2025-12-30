import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession'; // Need session to know who "I" am

export const useCaptainVeto = (match) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const matchId = match?.id;
  const myTeamId = session?.team_id; 

  // 1. Live Data Sync
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

  // 2. Deterministic State Engine
  const vetoState = useMemo(() => {
    if (!match) return { isMyTurn: false, currentAction: 'WAIT' };

    if (match.status !== 'veto') {
      return { isMyTurn: false, currentAction: 'LOCKED', isComplete: true };
    }

    const totalVetoes = vetoes.length;
    // Standard Logic (To be moved to DB rules later)
    // Team A Bans, Team B Bans, Team A Picks, Team B Picks...
    const turnOrder = match.best_of === 3 
        ? ['BAN', 'BAN', 'PICK', 'PICK', 'BAN', 'BAN', 'DECIDER'] 
        : ['BAN', 'BAN', 'BAN', 'BAN', 'BAN', 'BAN', 'PICK'];

    const currentAction = turnOrder[totalVetoes] || 'COMPLETE';
    
    // Team 1 acts on even indexes (0, 2...), Team 2 on odd
    const isTeam1Turn = totalVetoes % 2 === 0; 
    const activeTeamId = isTeam1Turn ? match.team1_id : match.team2_id;
    
    return {
      isMyTurn: myTeamId === activeTeamId,
      currentAction,
      activeTeamId,
      isComplete: totalVetoes >= turnOrder.length
    };
  }, [match, vetoes, myTeamId]);

  // 3. Secure Submission
  const submitVeto = async (mapName) => {
    if (!matchId || !myTeamId || !vetoState.isMyTurn) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.rpc('api_submit_veto', {
        p_match_id: matchId,
        p_team_id: myTeamId,
        p_map_name: mapName,
        p_type: vetoState.currentAction // Auto-detects BAN vs PICK
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
