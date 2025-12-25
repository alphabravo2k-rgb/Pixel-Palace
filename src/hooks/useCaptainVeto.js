import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

export const useCaptainVeto = (match) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Validate Inputs
  if (!match?.id || !session) {
    return { vetoes: [], isMyTurn: false, loading: false, currentAction: 'WAITING' };
  }

  // 2. Realtime Subscription
  useEffect(() => {
    const fetchVetoes = async () => {
      const { data } = await supabase
        .from('match_vetoes')
        .select('*')
        .eq('match_id', match.id)
        .order('pick_order', { ascending: true });
      if (data) setVetoes(data);
    };
    fetchVetoes();

    const channel = supabase
      .channel(`veto-${match.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'match_vetoes', 
        filter: `match_id=eq.${match.id}` 
      }, (payload) => {
          setVetoes((prev) => [...prev, payload.new].sort((a,b) => a.pick_order - b.pick_order));
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'match_vetoes', 
        filter: `match_id=eq.${match.id}` 
      }, () => setVetoes([])) 
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [match.id]);

  // 3. Turn Calculation Logic
  const isTeam1 = session.identity?.id === match.team1_id;
  const isTeam2 = session.identity?.id === match.team2_id;
  const turnCount = vetoes.length;
  
  let isMyTurn = false;
  let currentAction = 'WAITING';

  if (match.best_of === 1) {
    // BO1: Strict Alternating Bans (Team 1 Starts)
    const isTeam1Turn = (turnCount % 2) === 0;
    isMyTurn = (isTeam1 && isTeam1Turn) || (isTeam2 && !isTeam1Turn);
    currentAction = 'BAN';
  } else if (match.best_of === 3) {
    // BO3: Ban(1), Ban(2), Pick(1), Pick(2), Ban(1), Ban(2)...
    // 0: T1 Ban, 1: T2 Ban, 2: T1 Pick, 3: T2 Pick, 4: T1 Ban, 5: T2 Ban
    const isTeam1Turn = [0, 2, 4].includes(turnCount);
    isMyTurn = (isTeam1 && isTeam1Turn) || (isTeam2 && !isTeam1Turn);
    currentAction = [2, 3].includes(turnCount) ? 'PICK' : 'BAN';
  }

  // 4. Submit Action
  const submitVeto = async (mapName) => {
    if (!isMyTurn || loading) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('api_submit_veto', {
        p_match_id: match.id,
        p_team_id: session.identity.id, // 🛡️ Identity Check
        p_map_name: mapName,
        p_format: match.best_of
      });

      if (error) throw error;
      if (data && !data.success) {
        alert(data.message);
      }
    } catch (err) {
      console.error("Veto Error:", err);
      alert("Veto Failed: Server rejected request.");
    } finally {
      setLoading(false);
    }
  };

  return { vetoes, isMyTurn, currentAction, submitVeto, loading };
};
