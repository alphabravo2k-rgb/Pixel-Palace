/**
 * 🗺️ USE VETO: STRATEGIC COMMAND ENGINE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // REAL-TIME // 8D SYNCED
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
// Note: Ensure SoundNexus exists in /lib/soundNexus.js.
// Safe navigation handles missing audio engine.
import { SoundNexus, CUES } from '../lib/soundNexus';

const MAP_POOL = ['Mirage', 'Inferno', 'Nuke', 'Overpass', 'Vertigo', 'Ancient', 'Anubis'];

export const useVeto = (matchId, currentTeamId, team1Id, team2Id) => {
  const [vetoState, setVetoState] = useState({
    pool: MAP_POOL,
    banned: [],
    picked: [],
    turn: team1Id, // Team 1 usually starts (Seed #1)
    status: 'loading', 
    timer: 30 // Seconds per turn (visual only, enforced by server)
  });

  // 1. DATA RECONSTRUCTION (The Logic Hub)
  const fetchVetoState = useCallback(async () => {
    if (!matchId) return;

    const { data: vetoes, error } = await supabase
      .from('match_vetoes')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) return;

    const banned = vetoes.filter(v => v.type === 'BAN').map(v => v.map_name);
    const picked = vetoes.filter(v => v.type === 'PICK').map(v => v.map_name);
    
    // Determine Turn Logic: 
    // If even number of vetoes (0, 2, 4...), it's Team 1's turn.
    // If odd (1, 3, 5...), it's Team 2's turn.
    const turn = vetoes.length % 2 === 0 ? team1Id : team2Id;
    
    // Check for Decider (Last map left)
    const remaining = MAP_POOL.filter(m => !banned.includes(m) && !picked.includes(m));
    
    setVetoState(prev => ({
      ...prev,
      banned,
      picked,
      turn,
      status: remaining.length === 1 ? 'decided' : 'active'
    }));

    // ⚡ AUTO-DECIDER: If 6 maps are banned, the 7th is the map.
    if (remaining.length === 1 && vetoes.length === 6) {
       handleAutoPick(remaining[0]);
    }
  }, [matchId, team1Id, team2Id]);

  // 2. AUTO-DECIDER LOGIC (Triggers Match Start)
  const handleAutoPick = async (finalMap) => {
    // Optimistic check to prevent double-writes
    if (vetoState.status === 'decided') return;

    await supabase.from('matches')
      .update({ map_name: finalMap, status: 'live' })
      .eq('id', matchId);
      
    try { SoundNexus.playSpatial(CUES.UI_SUCCESS, { pitch: 1.2 }); } catch(e) {}
  };

  // 3. REAL-TIME SUBSCRIPTION (The Pulse)
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`veto:${matchId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'match_vetoes', 
        filter: `match_id=eq.${matchId}` 
      }, () => {
        // Play the "Heavy Slam" sound across the network
        try { SoundNexus.playSpatial(CUES.UI_CLICK_HEAVY); } catch(e) {}
        fetchVetoState();
      })
      .subscribe();

    fetchVetoState();
    return () => { supabase.removeChannel(channel); };
  }, [matchId, fetchVetoState]);

  // 4. ACTION: BAN MAP (The Player Input)
  const banMap = async (mapName) => {
    // 🛡️ Security: Prevent clicks out of turn or if match decided
    if (vetoState.turn !== currentTeamId || vetoState.status === 'decided') {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e) {}
      return;
    }

    // Optimistic UI Sound
    try { SoundNexus.play(CUES.UI_CLICK); } catch(e) {}

    const { error } = await supabase.from('match_vetoes').insert({
      match_id: matchId,
      team_id: currentTeamId,
      map_name: mapName,
      type: 'BAN'
    });

    if (error) {
      console.error("Veto Failure:", error);
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e) {}
    }
  };

  return { vetoState, actions: { banMap } };
};
