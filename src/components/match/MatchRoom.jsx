/**
 * 🏟️ MATCH ROOM: THE BATTLEFIELD (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // REAL-TIME SYNCED
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, AlertTriangle, CheckCircle, Lock, 
  Map as MapIcon, Clock, Swords, Trophy, 
  Server, Copy, Activity, Zap 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// SUB-SYSTEMS
import { VetoPanel } from '../VetoPanel';

const TeamCard = ({ team, score, isWinner, side }) => (
  <motion.div 
    initial={{ x: side === 'left' ? -40 : 40, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className={cn(
      "flex flex-col p-10 bg-[#09090b] border rounded-sm shadow-2xl relative overflow-hidden transition-all duration-700",
      isWinner ? "border-fuchsia-500 shadow-[0_0_60px_rgba(192,38,211,0.1)]" : "border-zinc-800"
  )}>
    {/* HOLOGRAPHIC WATERMARK */}
    {team?.logo_url && (
        <img src={team.logo_url} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.02] grayscale pointer-events-none" />
    )}

    <div className="relative z-10 flex flex-col items-center text-center">
        <div className={cn(
            "w-28 h-28 mb-6 rounded-sm flex items-center justify-center border shadow-2xl transition-all duration-500",
            isWinner ? "border-fuchsia-500 bg-fuchsia-500/5 rotate-3" : "border-zinc-800 bg-black"
        )}>
             {team?.logo_url ? <img src={team.logo_url} className="w-16 h-16 object-contain" /> : <Shield className="w-12 h-12 text-zinc-800" />}
        </div>

        <div className="text-3xl font-display font-black uppercase italic tracking-tighter text-white leading-none mb-4">
            {team?.name || 'Awaiting Unit'}
        </div>
        
        <div className={cn(
          "text-8xl font-display font-black tracking-tighter tabular-nums",
          isWinner ? "text-fuchsia-500 drop-shadow-[0_0_20px_#c026d3]" : "text-zinc-900"
        )}>
            {score ?? 0}
        </div>
    </div>
  </motion.div>
);

export const MatchRoom = ({ matchId }) => {
  const { user, can, identity } = useNexus();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputing, setIsDisputing] = useState(false);

  const canManage = can('CAP_MANAGE_MATCH'); 
  const isParticipant = (match?.team1_id === user?.teamId || match?.team2_id === user?.teamId);

  const fetchMatch = useCallback(async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`*, team1:team1_id(name, logo_url), team2:team2_id(name, logo_url)`)
      .eq('id', matchId)
      .single();
      
    if (!error) setMatch(data);
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
    const subscription = supabase
      .channel(`tactical_theatre:${matchId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, (payload) => {
        setMatch(prev => ({ ...prev, ...payload.new })); 
        fetchMatch(); 
        try { SoundNexus.play(CUES.UI_NOTIFICATION); } catch(e){}
      })
      .subscribe();

    try { SoundNexus.playSpatial(CUES.UI_POWER_UP, 0); } catch(e){}

    return () => { supabase.removeChannel(subscription); };
  }, [matchId, fetchMatch]);

  const handleDispute = async () => {
    if (!disputeReason) return;
    try { SoundNexus.play(CUES.DISPUTE_TRIGGER); } catch(e){}
    try {
        const { error } = await supabase.from('matches').update({ 
          status: 'disputed', 
          admin_notes: `[DISPUTE_INIT]: ${disputeReason} | BY: ${user.username}` 
        }).eq('id', matchId);

        if (error) throw error;

        Telemetry.log(EVENTS.ACTION, { action: 'DISPUTE_FILED', matchId, reason: disputeReason }, user.id);
        setIsDisputing(false);
        setDisputeReason("");
        toast.error("PROTOCOL: CONTAINMENT BREACH // MATCH LOCKED");
    } catch (err) { 
      toast.error("UPLINK INTERRUPTED"); 
    }
  };

  const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
      try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
      toast.success("UPLINK CREDENTIALS COPIED");
  };

  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-zinc-700 animate-pulse font-mono tracking-[0.5em] uppercase text-[10px]">Establishing Uplink...</div>;
  if (!match) return <div className="h-screen bg-[#050505] flex items-center justify-center text-red-500 font-mono tracking-[0.2em] uppercase">Sector Lost // 404</div>;

  // 🛡️ CONTAINMENT MODE (LOCKED/DISPUTED)
  if (match.is_locked || match.status === 'disputed') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-950/5 animate-pulse" />
          <div className="max-w-2xl w-full p-16 bg-[#09090b] border border-red-600/30 rounded-sm text-center shadow-2xl relative z-10">
            <div className="w-24 h-24 bg-red-600/10 border border-red-600/30 rounded-sm flex items-center justify-center mx-auto mb-10 rotate-45 group">
              <Lock className="w-12 h-12 text-red-600 -rotate-45 drop-shadow-[0_0_10px_#ef4444]" />
            </div>
            <h2 className="text-5xl font-display font-black text-white uppercase italic tracking-tighter leading-none mb-6">Sector Locked</h2>
            <div className="bg-black/60 border border-white/5 p-6 rounded-sm">
                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-3">Kernel Exception Trace:</p>
                <p className="text-red-500 font-mono text-xs uppercase leading-relaxed tracking-widest">
                  {match.admin_notes || 'AUTOMATIC INTEGRITY LOCK ACTIVE'}
                </p>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-12 overflow-x-hidden relative">
      
      {/* SCANLINES */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

      {/* MATCH HUD HEADER */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-col items-center relative z-10">
         <div className="flex items-center gap-6 px-5 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-[9px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-8 shadow-2xl">
             <div className="flex items-center gap-2"><Activity size={12} className="text-fuchsia-500 animate-pulse" /> S-ID: {match.match_position}</div>
             <div className="w-px h-3 bg-zinc-800" />
             <div className="flex items-center gap-2"><Clock size={12} /> Round {match.round_number}</div>
         </div>
         <h1 className="text-8xl font-display font-black text-white/5 italic uppercase tracking-[0.2em] leading-none absolute -top-4 pointer-events-none select-none">BATTLEFIELD</h1>
         <div className="mt-2 px-6 py-2 rounded-sm bg-fuchsia-600 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-lg shadow-fuchsia-600/20">
            Protocols: Best of {match.best_of || 1}
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
        
        {/* TEAM 1 (COL-3) */}
        <div className="lg:col-span-3">
          <TeamCard team={match.team1} score={match.score_team1} isWinner={match.winner_id === match.team1_id} side="left" />
        </div>

        {/* CENTER CONTROL (COL-6) */}
        <div className="lg:col-span-6 space-y-8">
            
            {/* SERVER UPLINK */}
            {match.status === 'live' && (isParticipant || canManage) && match.server_ip && (
                <motion.div 
                    initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="bg-emerald-600/10 border border-emerald-500/30 rounded-sm p-6 backdrop-blur-xl shadow-2xl"
                >
                    <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                      <Server size={14}/> Secure Relay credentials
                    </h3>
                    <div className="space-y-3">
                        <div 
                          className="flex justify-between items-center bg-black/60 p-4 rounded-sm border border-emerald-500/20 cursor-pointer hover:border-emerald-500 transition-all group" 
                          onClick={() => handleCopy(`connect ${match.server_ip}`)}
                        >
                            <span className="text-xs font-mono text-zinc-300 group-hover:text-white transition-colors">connect {match.server_ip}</span>
                            <Copy size={14} className="text-zinc-700 group-hover:text-emerald-500" />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* VETO / MAP ENGINE */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-sm p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 to-transparent pointer-events-none" />
                {match.status === 'veto' ? (
                    <VetoPanel match={match} myTeamId={user?.teamId} />
                ) : (
                    <div className="flex flex-col items-center justify-center text-center min-h-[350px] space-y-8 relative z-10">
                        {match.status === 'live' ? (
                            <>
                                <div className="relative">
                                  <Swords size={80} className="text-fuchsia-500 animate-pulse absolute blur-xl opacity-20" />
                                  <Swords size={80} className="text-fuchsia-500" />
                                </div>
                                <div>
                                  <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">Engagement Active</h3>
                                  <p className="text-zinc-600 text-[9px] mt-4 uppercase tracking-[0.5em] font-mono">Signal frequency: stable // GLHF</p>
                                </div>
                            </>
                        ) : match.status === 'completed' ? (
                            <>
                                <div className="w-24 h-24 bg-fuchsia-600/10 rounded-sm border border-fuchsia-500/30 flex items-center justify-center rotate-45 shadow-2xl">
                                  <Trophy size={40} className="text-fuchsia-500 -rotate-45" />
                                </div>
                                <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">Mission Concluded</h3>
                            </>
                        ) : (
                            <>
                                <MapIcon size={64} className="text-zinc-800" />
                                <h3 className="text-xl font-black text-zinc-700 uppercase tracking-[0.4em]">Awaiting tactical Veto</h3>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ACTION INTERFACE */}
            {(canManage || isParticipant) && !['completed'].includes(match.status) && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                   <button 
                      className="p-5 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-emerald-500/50 rounded-sm font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
                      onClick={() => { try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} toast.success("READY SIGNAL TRANSMITTED"); }}
                   >
                      <CheckCircle size={14} /> Ready Signal
                   </button>
                   <button 
                      onClick={() => { setIsDisputing(!isDisputing); try{SoundNexus.play(CUES.UI_CLICK_HEAVY);}catch(e){} }}
                      className="p-5 bg-red-600/5 border border-red-900/20 hover:border-red-600/50 text-red-600 rounded-sm font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95"
                   >
                      <AlertTriangle size={14} /> File Dispute
                   </button>
                </div>
            )}

            {/* DISPUTE CONSOLE */}
            <AnimatePresence>
                {isDisputing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="p-8 bg-black border-2 border-red-600 shadow-[0_0_80px_rgba(220,38,38,0.15)] rounded-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
                        <h4 className="text-red-500 font-black uppercase text-[11px] tracking-[0.4em] mb-6 flex items-center gap-3">
                          <Zap size={14} /> Critical Action: Emergency Dispute
                        </h4>
                        <textarea 
                            className="w-full bg-zinc-950 border border-zinc-900 p-5 text-sm text-white mb-6 focus:border-red-600 outline-none font-mono min-h-[120px] transition-all"
                            placeholder="State the integrity breach details..." 
                            value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-5">
                            <button onClick={() => setIsDisputing(false)} className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-widest">Abort</button>
                            <button onClick={handleDispute} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded-sm uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95">Commit Lock</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* TEAM 2 (COL-3) */}
        <div className="lg:col-span-3">
          <TeamCard team={match.team2} score={match.score_team2} isWinner={match.winner_id === match.team2_id} side="right" />
        </div>

      </div>
    </div>
  );
};
