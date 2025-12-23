import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export const useCaptainVeto = (pinCode) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchState = useCallback(async () => {
    if (!pinCode || pinCode.length < 3) return;
    
    // Only set loading on initial fetch to prevent UI flickering during live updates
    if (!gameState) setLoading(true);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('api_get_captain_state', { 
        p_pin: pinCode 
      });

      if (rpcError) throw rpcError;
      if (!data) throw new Error("Invalid PIN or Session Expired");

      setGameState(data);
      setError(null);
    } catch (err) {
      console.error("Veto State Error:", err);
      // Don't wipe state on minor network blips, only on auth failures
      if (err.message.includes("Invalid PIN")) setGameState(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pinCode, gameState]);

  // Initial Fetch
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Realtime Subscription
  useEffect(() => {
    if (!gameState?.match_id) return;
    
    const channel = supabase
      .channel(`veto-${gameState.match_id}`)
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${gameState.match_id}` }, 
        () => {
          console.log("⚡ Veto Update Detected - Refreshing...");
          fetchState();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameState?.match_id, fetchState]);

  const submitVeto = async (mapIdOrName) => {
    if (!gameState?.is_my_turn) return;
    
    // 🛡️ Optimistic Update (makes UI feel faster)
    const previousState = { ...gameState };
    setGameState(prev => ({ ...prev, is_my_turn: false })); 

    try {
      const { error: rpcError } = await supabase.rpc('cmd_submit_veto', {
        p_match_id: gameState.match_id,
        p_pin_code: pinCode,
        p_map_name: mapIdOrName, // API likely handles both ID and Name strings
        p_action: 'ban' 
      });

      if (rpcError) throw rpcError;
      
    } catch (err) {
      console.error("Veto Submit Error:", err);
      setError(err.message.replace("P0001: ", ""));
      setGameState(previousState); // Revert on failure
    }
  };

  return { gameState, loading, error, submitVeto };
};
