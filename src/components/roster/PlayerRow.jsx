/**
 * 👤 PLAYER ROW: OPERATOR UNIT
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // HIGH-FIDELITY
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, ShieldAlert, User, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

// MASTER CORE
import { normalizeRole } from '../../lib/security/engine'; 
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { SocialIcons } from './SocialIcons';

// 🛡️ ROBUST INITIALS ENGINE
const getInitials = (name) => {
  if (!name) return '??';
  const clean = name.replace(/[^\w\s]/gi, '').trim();
  if (!clean) return name.substring(0, 2).toUpperCase(); 
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const PlayerRow = ({ player, isHovered, index = 0 }) => {
  const role = normalizeRole(player.role); 
  const isCaptain = role === 'captain';
  const isSub = role === 'substitute';

  const initials = getInitials(player.name || player.username);
  
  // 🛰️ DATA NORMALIZATION MATRIX
  const faceitElo = player.faceit_elo || player.elo || null;
  const discord = player.discord_handle || player.discord_id || player.discord;
  const steam = player.steam_url || player.steam_id || player.steam;
  const faceit = player.faceit_url || player.faceit;
  const twitter = player.twitter_handle || player.twitter;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30, 
        delay: index * 0.04 
      }}
      onMouseEnter={() => { try{ SoundNexus.play(CUES.UI_HOVER, { volume: 0.03 }); }catch(e){} }}
      className={cn(
        "group flex items-center justify-between p-4 transition-all duration-300 border-b border-white/5 last:border-0 relative overflow-hidden",
        isHovered ? "bg-white/[0.03]" : "bg-transparent",
        isSub && "bg-amber-500/[0.02]" 
      )}
    >
      {/* 🧩 SELECTION GLOW (Only on Hover) */}
      {isHovered && (
          <motion.div 
            layoutId="playerGlow"
            className="absolute inset-y-0 left-0 w-1 bg-fuchsia-500 shadow-[0_0_15px_#f472b6]" 
          />
      )}
      
      {/* LEFT SIDE: Identity Cluster */}
      <div className="flex items-center gap-4 relative z-10">
        {/* AVATAR SYSTEM */}
        <div className={cn(
            "w-10 h-10 flex items-center justify-center font-black text-xs rounded-sm border transition-all duration-500 rotate-45 group-hover:rotate-0",
            isCaptain 
                ? "bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-500 shadow-[0_0_15px_rgba(244,114,182,0.1)]" 
                : isSub 
                    ? "bg-amber-900/20 border-amber-600 text-amber-500" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-600"
        )}>
          <div className="-rotate-45 group-hover:rotate-0 transition-transform duration-500">
            {isCaptain ? <Crown size={16} /> : isSub ? <ShieldAlert size={16} /> : initials}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className={cn(
                "font-display font-black uppercase italic tracking-tighter text-base leading-none truncate max-w-[160px] transition-colors",
                isCaptain ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
            )}>
              {player.username || player.name || 'ANON_OPERATOR'}
            </span>
            
            {/* POWER INDICATORS */}
            {faceitElo > 0 && (
                <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-sm border border-white/5 font-mono text-[9px] text-zinc-500" title="Faceit ELO">
                    <Zap size={8} className="text-amber-500" />
                    {faceitElo}
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1.5">
             <span className={cn(
               "text-[8px] font-black uppercase tracking-[0.2em]",
               isCaptain ? "text-fuchsia-500" : "text-zinc-700"
             )}>
                {isCaptain ? 'Mission Captain' : isSub ? 'Reserve Unit' : 'Field Operator'}
             </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Comms Linkage */}
      <div className="flex items-center opacity-10 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 relative z-10">
        <SocialIcons 
            discord={discord} 
            steam={steam} 
            faceit={faceit} 
            twitter={twitter} 
        />
      </div>
    </motion.div>
  );
};
