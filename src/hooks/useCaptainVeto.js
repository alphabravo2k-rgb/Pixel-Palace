import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export const useCaptainVeto = (pinCode) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. SECURE READ (RPC)
  // Wrapped in useCallback so it's stable for useEffect dependencies
  const fetchState = useCallback(async () => {
    if (!pinCode || pinCode.length < 4) return;
    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('api_get_captain_state', { 
        p_pin: pinCode 
      });

      if (rpcError) throw rpcError;
      if (!data) throw new Error("Invalid PIN");

      setGameState(data);
      setError(null);
    } catch (err) {
      setGameState(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pinCode]);

  // Initial Fetch
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // 2. REALTIME LISTENER
  useEffect(() => {
    if (!gameState?.match_id) return;

    const subscription = supabase
      .channel(`match-${gameState.match_id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${gameState.match_id}` }, 
        () => {
          // Re-fetch state on change
          fetchState();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [gameState?.match_id, fetchState]);

  // 3. WRITE OPERATION (RPC)
  const submitVeto = async (mapName) => {
    if (!gameState?.is_my_turn) return;

    try {
      const { error: rpcError } = await supabase.rpc('cmd_submit_veto', {
        p_match_id: gameState.match_id,
        p_pin_code: pinCode,
        p_map_name: mapName,
        p_action: 'ban' 
      });

      if (rpcError) throw rpcError;
    } catch (err) {
      setError(err.message.replace("P0001: ", ""));
    }
  };

  return { gameState, loading, error, submitVeto };
};
