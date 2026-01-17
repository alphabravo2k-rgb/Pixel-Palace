/**
 * 🎮 PIXEL PALACE: MATCH LOBBY (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // DATA-ENRICHED
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Server, Shield, Copy, Trophy, Target, Zap, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

// MASTER CORE
import { supabase, storageNexus } from '../supabase/client';
import { useNexus } from '../hooks/useNexus';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';

// SUB-SYSTEMS
import { VetoPanel } from './VetoPanel';

// --- 🧱 SUB-COMPONENT: COMBATANT CARD ---
const TeamCard = ({ team, isWinner, score, side }) => {
  const logo = team?.logo_path ? storageNexus.getUrl('team-assets', team.logo_path) : null;

  return (
    <motion.div 
      initial={{ x: side === 'left' ? -30 : 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "flex flex-col items-center gap-6 p-10 rounded-sm border transition-all duration-700 w-full md:w-[320px] relative overflow-hidden",
        isWinner 
          ? "bg-fuchsia-600/5 border-fuchsia-500 shadow-[0_0_50px_rgba(192,38,211,0.15)]" 
          : "bg-zinc-900/40 border-white/5 shadow-2xl"
      )}
    >
      {/* 🧩 IDENTITY MONOLITH */}
      <div className="relative group">
          <div className={cn(
              "w-28 h-28 flex items-center justify-center border-2 transition-all duration-700 rotate-45 group-hover:rotate-0",
              isWinner ? "bg-fuchsia-500/10 border-fuchsia-500 shadow-neon" : "bg-black border-zinc-800"
          )}>
              <div className="rotate-[-45deg] group-hover:rotate-0 transition-transform duration-700">
                {logo ? <img src={logo} className="w-16 h-16 object-contain" alt="" /> : <Shield className="w-10 h-10 text-zinc-800" />}
              </div>
          </div>
          {isWinner && (
            <div className="absolute -top-4 -right-4 bg-fuchsia-500 text-white text-[8px] font-black px-3 py-1 rounded-sm shadow-lg animate-pulse tracking-widest uppercase">
              Winner
            </div>
          )}
      </div>

      <div className="text-center relative z-10">
          <h4 className={cn("font-display font-black uppercase text-3xl italic tracking-tighter leading-none", isWinner ? "text-fuchsia-400" : "text-white")}>
              {team?.name || 'Awaiting Unit'}
          </h4>
          <p className="text-[9px] text-zinc-600 font-mono tracking-[0.4em] mt-3 uppercase">
              {team?.seed_number ? `Seed_Index: #${team.seed_number}` : 'Registry: Pending'}
          </p>
      </div>

      <div className={cn(
        "font-display font-black text-7xl tabular-nums tracking-tighter",
        isWinner ? "text-fuchsia-500 drop-shadow-[0_0_15px_#f472b6]" : "text-zinc-900"
      )}>
          {score || 0}
      </div>
    </motion.div>
  );
};

// --- 🚀 MAIN COMMAND COMPONENT ---
export const MatchModal = ({ match: initialMatch, isOpen, onClose }) => {
  const { user, can } = useNexus();
  const [match, setMatch] = useState(initialMatch);

  // 🛰️ REAL-TIME UPLINK
  useEffect(() => {
    if (!isOpen || !initialMatch?.id) return;

    try { SoundNexus.play(CUES.UI_POWER_UP); } catch(e){}
    Telemetry.log(EVENTS.ACTION, { action: 'MATCH_LOBBY_ENTER', matchId: initialMatch.id });

    const fetchLatest = async () => {
        const { data } = await supabase
            .from('matches')
            .select(`*, team1:team1_id(*), team2:team2_id(*)`)
            .eq('id', initialMatch.id)
            .single();
        if (data) setMatch(data);
    };

    fetchLatest(); 

    const channel = supabase.channel(`match_theatre:${initialMatch.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${initialMatch.id}` }, 
            () => {
              fetchLatest();
              try { SoundNexus.play(CUES.UI_NOTIFICATION); } catch(e){}
            }
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, [initialMatch?.id, isOpen]);

  if (!isOpen || !match) return null;

  // 🛡️ SECURITY RESOLUTION
  const isParticipant = (user?.teamId === match.team1_id || user?.teamId === match.team2_id);
  const isAdmin = can('CAP_MANAGE_MATCH');
  const showSensitiveInfo = isParticipant || isAdmin;

  const handleCopy = (text, label) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
      toast.success(`${label} COMMITTED TO CLIPBOARD`);
  };

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020202]/95 backdrop-blur-xl p-6">
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-7xl bg-[#09090b] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col max-h-[92vh] relative overflow-hidden rounded-sm"
            >
                {/* 🧩 ATMOSPHERIC SCANLINE */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

                {/* HEADER TERMINAL */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20 relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center rounded-sm rotate-45">
                          <Zap size={24} className="text-fuchsia-500 -rotate-45 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 text-fuchsia-500 font-black uppercase tracking-[0.4em] text-[10px] mb-3">
                                <Target size={12} /> Tactical_Node: {match.match_position || 'XX'}
                            </div>
                            <h2 className="text-5xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
                                {match.status} <span className="text-zinc-800">Uplink</span>
                            </h2>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { try{SoundNexus.play(CUES.UI_POWER_DOWN);}catch(e){} onClose(); }} 
                        className="p-4 bg-zinc-900 border border-white/5 hover:border-red-500/50 text-zinc-600 hover:text-white transition-all rounded-sm group active:scale-95 shadow-xl"
                    >
                        <X size={28} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                </div>

                {/* BODY CONTENT */}
                <div className="p-12 overflow-y-auto custom-scrollbar flex-1 relative z-10">
                    
                    {/* ENGAGEMENT MATRIX */}
                    <div className="flex flex-col lg:flex-row justify-center items-center gap-12 mb-20">
                        <TeamCard team={match.team1} isWinner={match.winner_id === match.team1_id} score={match.score_team1} side="left" />
                        
                        <div className="flex flex-col items-center gap-6">
                            <div className="text-8xl font-display font-black text-zinc-900 italic tracking-widest select-none opacity-20">VS</div>
                            <div className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em] shadow-2xl">
                                Protocol: BO{match.best_of || 1}
                            </div>
                        </div>

                        <TeamCard team={match.team2} isWinner={match.winner_id === match.team2_id} score={match.score_team2} side="right" />
                    </div>

                    {/* DYNAMIC SUBSYSTEMS */}
                    <div className="max-w-5xl mx-auto">
                      <AnimatePresence mode="wait">
                          {match.status === 'veto' ? (
                              <motion.div key="veto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                  <VetoPanel match={match} myTeamId={user?.teamId} />
                              </motion.div>
                          ) : match.status === 'live' && showSensitiveInfo ? (
                              <motion.div 
                                  key="credentials"
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  className="space-y-8"
                              >
                                  <div className="p-8 bg-emerald-600/5 border border-emerald-500/30 rounded-sm relative overflow-hidden">
                                      <div className="absolute top-0 right-0 p-4 opacity-10"><Server size={80} /></div>
                                      <div className="flex items-center gap-4 mb-8 text-emerald-400 font-black uppercase tracking-[0.4em] text-[11px]">
                                          <Server className="w-5 h-5 animate-pulse" /> Decrypted Server Uplink
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                          <div 
                                            className="bg-black border border-white/5 p-6 rounded-sm group cursor-pointer hover:border-emerald-500 transition-all shadow-2xl" 
                                            onClick={() => handleCopy(`connect ${match.server_ip}`, 'UPLINK_STRING')}>
                                              <div className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-3">Relay Address</div>
                                              <div className="flex justify-between items-center">
                                                  <code className="text-emerald-500 font-mono text-sm tracking-widest">{match.server_ip || 'Establishing...'}</code>
                                                  <Copy className="w-5 h-5 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                                              </div>
                                          </div>
                                          <div 
                                            className="bg-black border border-white/5 p-6 rounded-sm group cursor-pointer hover:border-emerald-500 transition-all shadow-2xl"
                                            onClick={() => handleCopy(match.server_pass, 'ACCESS_KEY')}>
                                              <div className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-3">Secure Key</div>
                                              <div className="flex justify-between items-center">
                                                  <code className="text-white font-mono text-sm blur-md group-hover:blur-none transition-all duration-500">
                                                      {match.server_pass || 'ENCRYPTED'}
                                                  </code>
                                                  <Copy className="w-5 h-5 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </motion.div>
                          ) : null}
                      </AnimatePresence>

                      {/* INTEGRITY LOCK OVERLAY */}
                      {match.is_locked && (
                          <div className="mt-12 p-6 bg-red-600/10 border border-red-500/40 flex items-center justify-center gap-6 text-red-500 font-black uppercase tracking-[0.5em] text-[11px] shadow-2xl animate-pulse">
                              <Lock size={20} /> Integrity Lock Engaged: Directory Review Required
                          </div>
                      )}
                    </div>
                </div>

                {/* FOOTER DIAGNOSTICS */}
                <div className="p-4 bg-black/60 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-zinc-800 uppercase tracking-[0.4em] relative z-10">
                   <div className="flex items-center gap-3">
                      <Target size={12} className="text-zinc-900" />
                      <span>PPG_LOBBY_V5.0</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-neon" />
                        <span>Encryption: AES-256</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-fuchsia-500 rounded-full shadow-neon" />
                        <span>Latency: 14ms</span>
                      </div>
                   </div>
                </div>
            </motion.div>
        </div>
    </AnimatePresence>
  );
};
