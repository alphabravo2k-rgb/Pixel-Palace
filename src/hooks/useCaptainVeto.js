/**
 * ⚡ PIXEL PALACE: USE CAPTAIN VETO
 * FILE: src/hooks/useCaptainVeto.js
 * -----------------------------------------
 * VERSION: 2050.5.2 (MASTER OMNI)
 * DATE: 2026-01-22
 * STATUS: OPERATIONAL // GOD_HAND_ACTIVE
 * -----------------------------------------
 * DESCRIPTION:
 * The strategic kernel for the Map Veto system.
 * Manages turn logic, real-time subscriptions, and admin overrides.
 * * UPGRADES (V5.0):
 * - [God Hand]: Admins (Level 50+) can force picks for any team.
 * - [Security Trap]: Specific handling for Postgres Error 23505 (Duplicate Entry).
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { MATCH_FORMATS, MAP_POOL } from '../lib/constants';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry } from '../lib/telemetry';
import { toast } from 'react-hot-toast';
import { getClearanceLevel } from '../lib/security/clearance'; 

export const useCaptainVeto = (match, passedTeamId) => {
  const { session, user } = useSession();
  const [vetoes, setVetoes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1️⃣ IDENTITY & SECURITY RESOLUTION
  // Determine if the current user is a "God Hand" (Admin/Referee)
  const isGodHand = useMemo(() => {
    const level = getClearanceLevel(user?.role);
    return level >= 50; 
  }, [user]);

  // Resolve the user's Team ID (if they are a player)
  const myTeamId = useMemo(() => {
    const sId = passedTeamId || session?.team_id || user?.team_id;
    if (!sId || !match) return null;
    
    if (match.team1_id === sId) return match.team1_id;
    if (match.team2_id === sId) return match.team2_id;
    return null;
  }, [match, session, user, passedTeamId]);

  // 2️⃣ SEQUENCE CALCULATION
  const formatRules = useMemo(() => {
    if (!match) return MATCH_FORMATS.BO1;
    const key = match.best_of === 3 ? 'BO3' : match.best_of === 5 ? 'BO5' : 'BO1';
    return MATCH_FORMATS[key];
  }, [match]);

  // 3️⃣ STATE MACHINE (THE ENFORCER)
  const vetoState = useMemo(() => {
    if (!formatRules || !match) return { isMyTurn: false, action: 'WAIT', availableMaps: MAP_POOL };

    const currentStepIndex = vetoes.length;
    const isComplete = currentStepIndex >= formatRules.sequence.length;

    // Filter used maps
    const usedMapIds = new Set(vetoes.map(v => v.map_name));
    const availableMaps = MAP_POOL.filter(m => !usedMapIds.has(m.id));

    if (isComplete) {
      return { isMyTurn: false, action: 'COMPLETE', activeTeamId: null, availableMaps: [] };
    }

    const currentStep = formatRules.sequence[currentStepIndex];
    const activeTeamId = (currentStep.team === 'team1') ? match.team1_id : match.team2_id;
    
    // 🛡️ GOD HAND LOGIC: Admin is authorized regardless of team ownership
    const isMyTurn = isGodHand || (myTeamId === activeTeamId);

    return {
      isMyTurn,
      isGodHand, // Expose for UI Badges (e.g. "ADMIN OVERRIDE ACTIVE")
      action: currentStep.type, // 'BAN' | 'PICK'
      activeTeamId,
      stepIndex: currentStepIndex,
      totalSteps: formatRules.sequence.length,
      availableMaps
    };
  }, [vetoes, formatRules, match, myTeamId, isGodHand]);

  // 4️⃣ AUDIO-REACTIVE TRIGGER
  useEffect(() => {
    if (vetoState.isMyTurn && !loading) {
      // Admin monitoring doesn't need loud alerts, but Captains do.
      if (!isGodHand) {
         try { SoundNexus.playVortex(CUES.NOTIFICATION, 1000); } catch(e){}
         toast("YOUR TURN TO " + vetoState.action, { icon: '⚔️' });
      }
    }
  }, [vetoState.isMyTurn, vetoState.action, loading, isGodHand]);

  // 5️⃣ ACTION: SUBMIT DECISION (SECURITY HARDENED)
  const submitVeto = async (mapId) => {
    if (!vetoState.isMyTurn || loading) return;

    setLoading(true);
    const startLog = Telemetry.time('veto_submission');

    try {
      // 🛡️ INTELLIGENT SUBMISSION
      // If Admin, submit on behalf of the active team.
      // If Captain, submit as self.
      const teamIdToSubmit = isGodHand ? vetoState.activeTeamId : myTeamId;

      const { error } = await supabase.from('match_vetoes').insert({
        match_id: match.id,
        team_id: teamIdToSubmit,
        map_name: mapId,
        type: vetoState.action,
        pick_order: vetoes.length + 1
      });

      if (error) {
        // 🛑 DUBAI STANDARD: CATCH THE HACKER
        // Error 23505 = Unique Violation (Map + Match ID already exists)
        if (error.code === '23505') {
            throw new Error("SECURITY VIOLATION: MAP ALREADY PROCESSED.");
        }
        throw error;
      }

      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
      
      if (isGodHand) {
          toast.success(`ADMIN OVERRIDE: ${vetoState.action} FORCED`);
      }
      
      startLog.end(user?.id);
    } catch (err) {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      
      // FLUSH TOAST: Alert user of rejection (Preferred Style from Code 1)
      toast.error(err.message.toUpperCase(), {
        icon: '🛡️',
        style: { background: '#000', border: '1px solid #ef4444', color: '#ef4444' }
      });
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

    // Live Subscription
    const channel = supabase
      .channel(`live_veto:${match.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'match_vetoes', 
        filter: `match_id=eq.${match.id}` 
      }, (payload) => {
        setVetoes(prev => [...prev, payload.new].sort((a,b) => a.pick_order - b.pick_order));
        
        // 🔊 Spatial Slam Effect
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
