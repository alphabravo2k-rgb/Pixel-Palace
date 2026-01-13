/**
 * 🧬 MATCH NODE: BRACKET CELL
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // HIGH-FIDELITY
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Tv, Shield, Lock, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

// MASTER INTEGRATION
import { SoundNexus, CUES } from '../../lib/soundNexus';

// 🎨 DYNAMIC THEME ENGINE
const getStatusStyles = (status) => {
  const themes = {
    live: { 
        label: 'LIVE ENGAGEMENT', 
        border: 'border-red-500', 
        bg: 'bg-red-950/20', 
        text: 'text-red-500', 
        glow: 'shadow-[0_0_25px_rgba(239,68,68,0.15)]' 
    },
    veto: { 
        label: 'STRATEGIC VETO', 
        border: 'border-fuchsia-500', 
        bg: 'bg-fuchsia-950/20', 
        text: 'text-fuchsia-400', 
        glow: 'shadow-[0_0_20px_rgba(192,38,211,0.15)]' 
    },
    completed: { 
        label: 'CONCLUDED', 
        border: 'border-zinc-800', 
        bg: 'bg-zinc-900/40', 
        text: 'text-zinc-500', 
        glow: '' 
    },
    scheduled: { 
        label: 'STANDBY', 
        border: 'border-zinc-800/50', 
        bg: 'bg-black/40', 
        text: 'text-zinc-600', 
        glow: '' 
    },
    disputed: {
        label: 'BREACH DETECTED',
        border: 'border-yellow-500',
        bg: 'bg-yellow-950/30',
        text: 'text-yellow-500',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.2)] animate-pulse'
    }
  };
  return themes[status] || themes.scheduled;
};

// 🛡️ SUB-COMPONENT: TEAM ROW
const TeamSlot = ({ team, score, isWinner, isTBD }) => (
  <div className={cn(
      "flex items-center justify-between px-3 py-3 transition-all duration-300 relative overflow-hidden",
      isWinner ? "bg-emerald-500/5" : "bg-transparent",
      isTBD && "opacity-40"
  )}>
    {/* Winner Highlight Bar */}
    {isWinner && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981]" />}

    <div className="flex items-center gap-3 overflow-hidden pl-1">
      <div className={cn(
          "w-7 h-7 rounded-sm bg-black flex-shrink-0 flex items-center justify-center border transition-colors",
          isWinner ? "border-emerald-500/40 shadow-inner" : "border-zinc-800"
      )}>
        {team?.logo_url ? (
            <img src={team.logo_url} className="w-full h-full object-contain p-1" alt={team.name} />
        ) : (
            <Shield size={12} className={isWinner ? "text-emerald-500" : "text-zinc-800"} />
        )}
      </div>
      
      <div className="flex flex-col leading-tight overflow-hidden">
          <span className={cn(
              "text-[10px] font-black uppercase truncate font-display tracking-wider",
              isWinner ? "text-white" : "text-zinc-400"
          )}>
            {team?.name || 'Awaiting Unit'}
          </span>
          {team?.seed_number && (
              <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">Seed Index: {team.seed_number}</span>
          )}
      </div>
    </div>

    <div className={cn(
        "font-mono font-black text-xs w-8 text-right pr-1",
        isWinner ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-zinc-700"
    )}>
      {score ?? '--'}
    </div>
  </div>
);

export const MatchNode = ({ match, onClick }) => {
  const theme = getStatusStyles(match.status);
  
  const s1 = match.score_team1;
  const s2 = match.score_team2;
  const hasTeams = match.team1_id || match.team2_id; 
  const isLocked = match.is_locked;
  const canOpen = !!(match.team1_id && match.team2_id); 

  const handleInteraction = () => {
    if (!canOpen) return;
    SoundNexus.play(CUES.UI_CLICK);
    onClick(match);
  };

  return (
    <motion.div 
        whileHover={canOpen ? { y: -2, scale: 1.01, filter: 'brightness(1.15)' } : {}}
        whileTap={canOpen ? { scale: 0.98 } : {}}
        onMouseEnter={() => canOpen && SoundNexus.play(CUES.UI_HOVER, { volume: 0.03 })}
        onClick={handleInteraction}
        className={cn(
            "relative w-full flex flex-col rounded-sm border backdrop-blur-md transition-all duration-500 group overflow-hidden",
            theme.border, theme.bg, theme.glow,
            canOpen ? "cursor-pointer shadow-2xl" : "opacity-60 grayscale cursor-not-allowed"
        )}
    >
      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* 1. HEADER */}
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2">
           {match.status === 'live' && <Zap size={10} className="text-red-500 animate-pulse" />}
           <span className={cn("text-[8px] font-black tracking-[0.2em] uppercase font-mono", theme.text)}>
             {theme.label}
           </span>
        </div>
        <span className="text-[8px] font-mono text-zinc-700 font-bold uppercase tracking-tighter">Node ID: {match.match_position || 'XX'}</span>
      </div>

      {/* 2. TEAMS */}
      <div className="flex-1 flex flex-col divide-y divide-white/5">
        <TeamSlot 
            team={match.team1} 
            score={s1} 
            isWinner={match.winner_id === match.team1_id} 
            isTBD={!match.team1_id}
        />
        <TeamSlot 
            team={match.team2} 
            score={s2} 
            isWinner={match.winner_id === match.team2_id} 
            isTBD={!match.team2_id}
        />
      </div>

      {/* 3. TACTICAL FOOTER */}
      <div className={cn(
          "px-3 py-1.5 border-t border-white/5 flex items-center justify-between w-full text-[8px] font-black tracking-[0.2em] uppercase transition-colors",
          canOpen ? "bg-white/0 group-hover:bg-white/5 text-zinc-500 group-hover:text-white" : "text-zinc-800"
      )}>
        <span className="flex items-center gap-2">
            {isLocked ? <Lock size={10} className="text-red-500" /> : <ChevronRight size={10} className="text-zinc-600" />}
            {match.status === 'disputed' && <AlertCircle size={10} className="text-yellow-500 animate-bounce" />}
            {match.stream_url && <Tv size={10} className="text-fuchsia-500" />}
            
            {!hasTeams ? 'Wait State' : isLocked ? 'Registry Locked' : match.status === 'completed' ? 'Archive View' : 'Execute Command'}
        </span>
      </div>
    </motion.div>
  );
};
