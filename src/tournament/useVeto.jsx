/**
 * 🗺️ USE VETO: MAP STRATEGY ENGINE
 * STATUS: SECURED // AUDIO-REACTIVE
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SoundNexus, CUES } from '../lib/soundNexus';

const MAP_POOL = ['Mirage', 'Inferno', 'Nuke', 'Overpass', 'Vertigo', 'Ancient', 'Anubis'];

export const useVeto = (matchId, currentTeamId) => {
  const [vetoState, setVetoState] = useState({
    pool: MAP_POOL,
    banned: [],
    picked: [],
    turn: null, // 'team1_id' or 'team2_id'
    status: 'loading' // loading, banning, picking, decided
  });

  // 1. SYNC WITH DB
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`veto:${matchId}`)
      .on('postgres_changes', { 
        event: '*', schema: 'public', table: 'match_vetoes', filter: `match_id=eq.${matchId}` 
      }, (payload) => {
        // When a new veto happens:
        SoundNexus.playSpatial(CUES.UI_CLICK_HEAVY); // "THUD" sound
        fetchVetoState(); // Refresh local state
      })
      .subscribe();

    fetchVetoState();
    return () => supabase.removeChannel(channel);
  }, [matchId]);

  const fetchVetoState = async () => {
    // Logic to fetch 'match_vetoes' table and calculate whose turn it is
    // ( Simplified for brevity: In prod, this logic is complex )
    // setVetoState(...)
  };

  // 2. ACTIONS
  const banMap = async (mapName) => {
    // 🛡️ Security Check: Is it my turn?
    if (vetoState.turn !== currentTeamId) {
      SoundNexus.play(CUES.UI_ERROR);
      return; // Ignore clicks out of turn
    }

    // Optimistic UI Update
    SoundNexus.play(CUES.UI_SUCCESS); 
    
    // DB Commit
    await supabase.from('match_vetoes').insert({
      match_id: matchId,
      team_id: currentTeamId,
      map_name: mapName,
      type: 'BAN'
    });
  };

  return { vetoState, actions: { banMap } };
};
