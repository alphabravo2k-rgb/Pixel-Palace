import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Server, Shield, Copy, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

// MASTER CORE
import { supabase, storageNexus } from '../supabase/client';
import { useNexusStore } from '../store/useNexusStore';
import { SoundNexus, CUES } from '../lib/soundNexus';

// SUB-SYSTEMS
import { VetoPanel } from './VetoPanel'; // ✅ THE INTERACTIVE ENGINE

/**
 * 🎮 PIXEL PALACE: MATCH LOBBY V5.0
 * ---------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * UPGRADES:
 * 1. INTERACTIVE VETO: Replaced static visual with live VetoPanel.
 * 2. 8D AUDIO: Sound feedback on lobby entry/exit.
 * 3. HOLOGRAPHIC UI: Advanced backdrop filters and animations.
 */

// --- 🧱 SUB-COMPONENT: TEAM CARD ---
const TeamCard = ({ team, isWinner, score }) => {
  const logo = team?.logo_path ? storageNexus.getUrl('team-assets', team.logo_path) : null;

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex flex-col items-center gap-5 p-8 rounded-sm border transition-all duration-500 w-full md:w-[300px]",
        isWinner 
          ? "bg-emerald-950/10 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.1)]" 
          : "bg-[#09090b] border-white/5"
      )}
    >
      <div className="relative group">
          <div className={cn(
              "w-24 h-24 bg-black rounded-full flex items-center justify-center border-2 overflow-hidden transition-transform duration-500 group-hover:scale-110",
              isWinner ? "border-emerald-500 shadow-neon" : "border-white/10"
          )}>
              {logo ? <img src={logo} className="w-16 h-16 object-contain" alt="" /> : <Shield className="w-10 h-10 text-zinc-800" />}
          </div>
          {isWinner && (
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[9px] font-black px-3 py-1 rounded-full animate-bounce">
              VICTORY
            </div>
          )}
      </div>
      <div className="text-center">
          <h4 className={cn("font-display font-black uppercase text-2xl italic tracking-tighter", isWinner ? "text-emerald-400" : "text-white")}>
              {team?.name || 'TBD'}
          </h4>
          <p className="text-[9px] text-zinc-600 font-black tracking-[0.2em] mt-2 uppercase">
              {team?.seed_number ? `SEED #${team.seed_number}` : 'PROVISIONAL'}
          </p>
      </div>
      <div className="font-display font-black text-6xl text-white mt-2 tabular-nums">
          {score || 0}
      </div>
    </motion.div>
  );
};

// --- 🚀 MAIN COMPONENT ---
export const MatchModal = ({ match: initialMatch, isOpen, onClose }) => {
  const { teamId, role } = useNexusStore(); // Updated to match store naming
  const [match, setMatch] = useState(initialMatch);

  // 🔊 AUDIO & SYNC
  useEffect(() => {
    if (!isOpen || !initialMatch?.id) return;

    SoundNexus.play(CUES.NAVIGATION_SWISH);

    const fetchLatest = async () => {
        const { data } = await supabase
            .from('matches')
            .select(`*, team1:team1_id(*), team2:team2_id(*)`)
            .eq('id', initialMatch.id)
            .single();
        if (data) setMatch(data);
    };

    fetchLatest(); 

    const sub = supabase.channel(`match-lobby-${initialMatch.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${initialMatch.id}` }, 
            () => fetchLatest()
        )
        .subscribe();

    return () => supabase.removeChannel(sub);
  }, [initialMatch?.id, isOpen]);

  if (!isOpen || !match) return null;

  // 🛡️ SECURITY CHECK
  // Normalizes IDs to strings to prevent Type Mismatches (UUID vs String)
  const userTeamId = String(teamId || '');
  const t1Id = String(match.team1_id || '');
  const t2Id = String(match.team2_id || '');
  
  const isParticipant = (userTeamId === t1Id || userTeamId === t2Id);
  const isAdmin = ['admin', 'owner', 'referee', 'organizer'].includes(role);
  const showSensitiveInfo = isParticipant || isAdmin;

  const handleCopy = (text, label) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      SoundNexus.play(CUES.UI_CLICK);
      toast.success(`${label} COPIED`);
  };

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-6xl bg-[#09090b] border border-white/10 shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
            >
                
                {/* TOP DECORATIVE SCANLINE */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />

                {/* HEADER */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                                <Clock className="w-3 h-3" /> MATCH ID: {match.match_position || '---'}
                            </div>
                            <h2 className="text-5xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
                                {match.status} <span className="text-zinc-700">ZONE</span>
                            </h2>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { SoundNexus.play(CUES.UI_ERROR); onClose(); }} 
                        className="p-3 bg-zinc-900 border border-white/5 hover:border-red-500/50 text-zinc-500 hover:text-white transition-all rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
                    
                    {/* COMBATANTS GRID */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-16">
                        <TeamCard team={match.team1} isWinner={match.winner_id === match.team1_id} score={match.score_team1} />
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-7xl font-display font-black text-zinc-900 italic tracking-tighter select-none">VS</div>
                            <div className="px-4 py-1 bg-zinc-900 border border-white/5 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                BO{match.best_of || 1} SERIES
                            </div>
                        </div>
                        <TeamCard team={match.team2} isWinner={match.winner_id === match.team2_id} score={match.score_team2} />
                    </div>

                    {/* 🧠 DYNAMIC INTERFACE: VETO (ACTIVE) */}
                    {match.status === 'veto' && (
                        <div className="mt-10">
                            {/* Pass userTeamId explicitly to the panel */}
                            <VetoPanel match={match} myTeamId={userTeamId} />
                        </div>
                    )}

                    {/* 🔌 DYNAMIC INTERFACE: LIVE CONNECTION */}
                    {match.status === 'live' && showSensitiveInfo && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="max-w-3xl mx-auto space-y-6"
                        >
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
                                <div className="flex items-center gap-3 mb-6 text-emerald-400 font-black uppercase tracking-[0.2em] text-xs">
                                    <Server className="w-4 h-4" /> Tactical Server Uplink
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-black border border-white/5 p-5 group cursor-pointer hover:border-brand transition-all" 
                                         onClick={() => handleCopy(match.server_ip, 'CONNECT STRING')}>
                                        <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">Console Command</div>
                                        <div className="flex justify-between items-center">
                                            <code className="text-emerald-500 font-mono text-xs">{match.server_ip || 'PENDING...'}</code>
                                            <Copy className="w-4 h-4 text-zinc-800 group-hover:text-brand" />
                                        </div>
                                    </div>
                                    <div className="bg-black border border-white/5 p-5 group cursor-pointer hover:border-brand transition-all"
                                         onClick={() => handleCopy(match.server_pass, 'PASSWORD')}>
                                        <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">Access Key</div>
                                        <div className="flex justify-between items-center">
                                            <code className="text-white font-mono text-xs blur-sm group-hover:blur-none transition-all">
                                                {match.server_pass || '••••••••'}
                                            </code>
                                            <Copy className="w-4 h-4 text-zinc-800 group-hover:text-brand" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* LOCK STATUS */}
                    {match.is_locked && (
                        <div className="max-w-xl mx-auto mt-10 p-4 bg-red-950/20 border border-red-500/30 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest text-[10px]">
                            <Shield size={16} /> MATCH LOCKED BY TOURNAMENT DIRECTORS
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    </AnimatePresence>
  );
};
