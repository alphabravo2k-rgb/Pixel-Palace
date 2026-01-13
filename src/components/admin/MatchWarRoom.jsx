/**
 * ⚔️ MATCH WAR ROOM: COMMAND OVERRIDE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // REAL-TIME UPLINK
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Activity, RefreshCw, AlertTriangle, Monitor, ArrowLeft, Trophy, Skull, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { AdminMatchControls } from './AdminMatchControls';
import { MatchActivityLog } from '../match/MatchActivityLog'; 
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const MatchWarRoom = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { can, user } = useNexus();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🛡️ SECURITY: Level 60+ Clearance (Caster/Admin/Owner)
  // Ensures standard players cannot stumble into this URL
  const hasAccess = can('CAP_VIEW_WAR_ROOM');

  // 1. DATA UPLINK (The Intelligence Feed)
  const fetchMatch = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, team1:team1_id(name), team2:team2_id(name)')
        .eq('id', matchId)
        .single();

      if (error) throw error;
      setMatch(data);
    } catch (e) {
      toast.error("WAR ROOM LINK FAILURE");
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  }, [matchId, navigate]);

  useEffect(() => {
    if (!hasAccess) return;
    fetchMatch();

    // 📡 REAL-TIME VORTEX: Listens for any change to THIS specific match
    const channel = supabase.channel(`war_room_vortex:${matchId}`)
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'matches', 
            filter: `id=eq.${matchId}` 
        }, (payload) => {
            setMatch(prev => ({ ...prev, ...payload.new }));
            // Subtle notification sound for background updates
            try { SoundNexus.play(CUES.UI_NOTIFICATION); } catch(e){}
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, [matchId, fetchMatch, hasAccess]);

  // 2. CRITICAL ACTION: FORCE TERMINATION
  const handleForceWin = async (winnerId, teamName) => {
    SoundNexus.play(CUES.DISPUTE_TRIGGER);
    
    const confirmText = "TERMINATE";
    const input = window.prompt(`☢️ EXECUTING TERMINATION PROTOCOL\n\nForce win for [${teamName}]?\nThis will LOCK the match and ADVANCE the bracket.\n\nType "${confirmText}" to confirm:`);
    
    if (input !== confirmText) return;
    
    setSaving(true);
    Telemetry.log(EVENTS.ACTION, { action: 'FORCE_WIN', matchId, winner: teamName }, user.id);
    
    try {
        // A. Atomic Match Update
        const { error } = await supabase.from('matches').update({
            winner_id: winnerId,
            status: 'completed',
            score_team1: winnerId === match.team1_id ? 1 : 0,
            score_team2: winnerId === match.team2_id ? 1 : 0,
            is_locked: true,
            admin_notes: `Force win by ${user.username} at ${new Date().toISOString()}`
        }).eq('id', matchId);

        if (error) throw error;

        // B. Invoke Bracket Geometry Engine
        await supabase.rpc('advance_bracket', { p_match_id: matchId });
        
        SoundNexus.play(CUES.UI_SUCCESS);
        toast.success(`VICTORY ASSIGNED: ${teamName}`);
        fetchMatch();
    } catch (e) {
        toast.error("TERMINATION ABORTED: " + e.message);
        SoundNexus.play(CUES.UI_ERROR);
    } finally {
        setSaving(false);
    }
  };

  if (!hasAccess) return <div className="p-20 text-center font-mono text-red-500">CLEARANCE VOID // INTERCEPT DENIED</div>;
  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-mono text-zinc-700 animate-pulse tracking-[0.5em]">INITIALIZING WAR ROOM...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
      
      {/* 🌌 AMBIENCE */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-fuchsia-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        
        {/* TACTICAL HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-8 gap-6">
           <div className="flex items-center gap-6">
              <button onClick={() => navigate('/admin/dashboard')} className="p-3 bg-zinc-900 border border-white/10 rounded-sm hover:border-fuchsia-500/50 text-zinc-500 hover:text-white transition-all active:scale-95 shadow-2xl">
                  <ArrowLeft size={20} />
              </button>
              <div>
                  <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter flex items-center gap-4">
                      <Shield className="text-fuchsia-500 shadow-neon" size={32} />
                      Command Room <span className="text-zinc-800 font-sans not-italic font-thin">/</span> M-{match.match_position}
                  </h1>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-2">
                      <div className="flex items-center gap-1.5">
                        <Activity size={12} className={match.status === 'live' ? "text-red-500 animate-pulse" : "text-zinc-700"} />
                        Status: <span className="text-white">{match.status}</span>
                      </div>
                      <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <span>Round {match.round_number}</span>
                  </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
               {match.status === 'disputed' && (
                   <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="px-6 py-2.5 bg-red-600/10 border border-red-500/50 text-red-500 text-[10px] font-black uppercase rounded-sm flex items-center gap-3 shadow-lg shadow-red-500/10"
                   >
                       <AlertTriangle size={14} className="animate-bounce" /> Containment Breach Detected
                   </motion.div>
               )}
               <button onClick={fetchMatch} className="p-2.5 bg-zinc-900 border border-white/5 rounded-sm hover:bg-white/5 transition-colors">
                   <RefreshCw size={18} className={saving ? "animate-spin" : ""} />
               </button>
           </div>
        </div>

        {/* COMMAND GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDE: CONTROLS (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* VICTORY OVERRIDE */}
                <div className="bg-[#09090b] border border-white/5 rounded-sm p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy size={80} />
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        <Skull size={14} className="text-red-600" /> Termination Protocol
                    </div>
                    
                    <div className="space-y-4">
                        {[
                          { id: match.team1_id, name: match.team1?.name },
                          { id: match.team2_id, name: match.team2?.name }
                        ].map((team, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-zinc-950 border border-white/5 rounded-sm group/row hover:border-red-500/30 transition-all">
                              <span className="font-display font-black text-white italic text-lg">{team.name || 'UNASSIGNED'}</span>
                              <button 
                                onClick={() => handleForceWin(team.id, team.name)}
                                disabled={!team.id || saving || match.status === 'completed'}
                                className="px-5 py-2 bg-red-950/20 text-red-500 border border-red-900/40 rounded-sm text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-20 active:scale-95"
                              >
                                 Assign Win
                              </button>
                          </div>
                        ))}
                    </div>
                </div>

                {/* SYSTEM CONFIGS */}
                <AdminMatchControls match={match} onUpdate={fetchMatch} />
                
                {/* SERVER TELEMETRY */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-sm p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        <Monitor size={14} className="text-fuchsia-500" /> Network Infrastructure
                    </div>
                    <div className="space-y-4 font-mono text-[11px]">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-zinc-600 uppercase">Primary Relay</span>
                            <span className="text-white">{match.server_ip || 'PENDING...'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600 uppercase">Map Index</span>
                            <span className="text-fuchsia-500 uppercase">{match.map_name || 'VETO PHASE'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: FEED (8 COLS) */}
            <div className="lg:col-span-8 h-[750px] bg-[#09090b] border border-white/5 rounded-sm shadow-inner relative">
                <div className="absolute top-4 right-4 z-10">
                   <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/5 text-[9px] font-mono text-zinc-500 uppercase">
                      <Zap size={10} className="text-fuchsia-500 animate-pulse" /> Real-time Feed Active
                   </div>
                </div>
                <MatchActivityLog matchId={match.id} />
            </div>

        </div>
      </div>
    </div>
  );
};
