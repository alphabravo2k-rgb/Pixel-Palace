import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';

export const useCaptainVeto = (match) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    if (!match?.id) return;
    const fetchVetoes = async () => {
      const { data } = await supabase
        .from('match_vetoes')
        .select('*')
        .eq('match_id', match.id)
        .order('pick_order', { ascending: true });
      if (data) setVetoes(data);
    };
    fetchVetoes();

    // 2. Realtime Subscription (The Pulse)
    const channel = supabase
      .channel(`veto-${match.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_vetoes', filter: `match_id=eq.${match.id}` }, 
        (payload) => {
          setVetoes((prev) => [...prev, payload.new].sort((a,b) => a.pick_order - b.pick_order));
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'match_vetoes', filter: `match_id=eq.${match.id}` },
        () => setVetoes([]) // Handle Reset
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [match?.id]);

  // 3. Logic: Whose Turn Is It?
  const isTeam1 = session.identity?.id === match.team1_id;
  const isTeam2 = session.identity?.id === match.team2_id;
  
  // Logic Mirroring Backend (For UI State only)
  // BO1: 0(T1), 1(T2), 2(T1)...
  // BO3: 0(T1), 1(T2), 2(T1-Pick), 3(T2-Pick)...
  const turnCount = vetoes.length;
  let isMyTurn = false;
  let currentAction = 'WAITING';

  if (match.best_of === 1) {
    const isTeam1Turn = (turnCount % 2) === 0;
    isMyTurn = (isTeam1 && isTeam1Turn) || (isTeam2 && !isTeam1Turn);
    currentAction = 'BAN';
  } else if (match.best_of === 3) {
    // 0,2,4 = Team 1 | 1,3,5 = Team 2
    // But actions change
    const isTeam1Turn = [0, 2, 4].includes(turnCount);
    isMyTurn = (isTeam1 && isTeam1Turn) || (isTeam2 && !isTeam1Turn);
    currentAction = [2, 3].includes(turnCount) ? 'PICK' : 'BAN';
  }

  // 4. Action: Submit Veto
  const submitVeto = async (mapName) => {
    if (!isMyTurn || loading) return;
    
    // Optimistic UI update could go here, but risky for race conditions
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('api_submit_veto', {
        p_match_id: match.id,
        p_team_id: session.identity.id,
        p_map_name: mapName,
        p_format: match.best_of
      });

      if (error) throw error;
      if (!data.success) {
        alert(data.message); // "Not your turn" or "Map taken"
      }
    } catch (err) {
      console.error("Veto Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { vetoes, isMyTurn, currentAction, submitVeto, loading };
};
