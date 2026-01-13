/**
 * 🎣 USE CAPTAIN VETO: THE STRATEGIC KERNEL
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // REALTIME-SYNCED
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS, MAP_POOL } from '../lib/constants';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';
import { toast } from 'react-hot-toast';

export const useCaptainVeto = (match, passedTeamId) => {
  const { session } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1️⃣ IDENTITY RESOLUTION (Tactical Handshake)
  const myTeamId = useMemo(() => {
    const sId = passedTeamId || session?.team_id || session?.user?.user_metadata?.team_id;
    if (!sId || !match) return null;
    
    // Strict comparison to match match.team1_id (UUID)
    if (match.team1_id === sId) return match.team1_id;
    if (match.team2_id === sId) return match.team2_id;
    return null;
  }, [match, session, passedTeamId]);

  // 2️⃣ SEQUENCE CALCULATION
  const formatRules = useMemo(() => {
    if (!match) return MATCH_FORMATS.BO1;
    const key = match.best_of === 3 ? 'BO3' : match.best_of === 5 ? 'BO5' : 'BO1';
    return MATCH_FORMATS[key];
  }, [match]);

  // 3️⃣ STATE MACHINE (The Enforcer)
  const vetoState = useMemo(() => {
    if (!formatRules || !match) return { isMyTurn: false, action: 'WAIT', availableMaps: MAP_POOL };

    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= formatRules.sequence.length;

    // Filter out used maps
    const usedMapIds = new Set(vetoes.map(v => v.map_name));
    const availableMaps = MAP_POOL.filter(m => !usedMapIds.has(m.id));

    if (isComplete) {
      return { isMyTurn: false, action: 'COMPLETE', activeTeamId: null, availableMaps: [] };
    }

    const currentStep = formatRules.sequence[currentStepIndex];
    const activeTeamId = (currentStep.team === 'team1') ? match.team1_id : match.team2_id;
    const isMyTurn = myTeamId === activeTeamId;

    return {
      isMyTurn,
      action: currentStep.type, // 'BAN' | 'PICK'
      activeTeamId,
      stepIndex: currentStepIndex,
      totalSteps: formatRules.sequence.length,
      availableMaps
    };
  }, [vetoes, formatRules, match, myTeamId]);

  // 4️⃣ AUDIO-REACTIVE TURN TRIGGER
  useEffect(() => {
    if (vetoState.isMyTurn && !loading) {
      // 🔊 HAPTIC: Alert the captain it is their turn using 8D Audio
      SoundNexus.playVortex(CUES.NOTIFICATION, 1000);
      toast("YOUR TURN TO " + vetoState.action, { icon: '⚔️' });
    }
  }, [vetoState.isMyTurn, vetoState.action, loading]);

  // 5️⃣ ACTION: SUBMIT DECISION
  const submitVeto = async (mapId) => {
    if (!vetoState.isMyTurn || loading) return;

    setLoading(true);
    // ⏱️ Track performance latency
    const startLog = Telemetry.time('veto_submission');

    try {
      const { error } = await supabase.from('match_vetoes').insert({
        match_id: match.id,
        team_id: myTeamId,
        map_name: mapId,
        type: vetoState.action,
        pick_order: vetoes.length + 1
      });

      if (error) throw error;

      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
      startLog.end(session?.user?.id);
    } catch (err) {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      toast.error("VETO FAILED: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6️⃣ REALTIME UPLINK
  useEffect(() => {
    if (!match?.id) return;

    // Initial Fetch
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('match_vetoes')
        .select('*')
        .eq('match_id', match.id)
        .order('pick_order', { ascending: true });
      if (data) setVetoes(data);
    };

    fetchInitial();

    // Live Sub
    const channel = supabase
      .channel(`live_veto:${match.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'match_vetoes', 
        filter: `match_id=eq.${match.id}` 
      }, (payload) => {
        setVetoes(prev => [...prev, payload.new].sort((a,b) => a.pick_order - b.pick_order));
        
        // 🔊 Spatial Slam Effect on new veto
        try { SoundNexus.playSpatial(CUES.VETO_SLAM, Math.random() * 2 - 1); } catch(e){}
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [match?.id]);

  return {
    vetoes,
    ...vetoState,
    progress: `${vetoState.stepIndex} / ${vetoState.totalSteps}`,
    submitVeto,
    loading
  };
};
