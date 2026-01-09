/**
 * 🏅 ELO BADGE: COMPETITIVE IDENTITY
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // 3D & HAPTIC ENABLED
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
// Note: Ensure SoundNexus exists in /lib/soundNexus.js. 
// Safe navigation handles missing audio engine.
import { SoundNexus, CUES } from '../lib/soundNexus';

export const EloBadge = ({ level = 1, elo = 1000, size = 'md', showElo = true, interactive = false }) => {
  
  // 🎨 THE COMPETITIVE SPECTRUM (FACEIT+ EVOLUTION)
  const getRankConfig = (lvl) => {
    if (lvl <= 0) return { color: "bg-zinc-900 border-zinc-700 text-zinc-600", label: "EXILED", glow: "" };
    if (lvl < 4) return { color: "bg-zinc-600 border-zinc-500 text-white", label: "CITIZEN", glow: "" };
    if (lvl < 7) return { color: "bg-yellow-500 border-yellow-400 text-black", label: "COMBATANT", glow: "shadow-neon-yellow" };
    if (lvl < 9) return { color: "bg-orange-600 border-orange-500 text-white", label: "ELITE", glow: "shadow-neon-orange" };
    if (lvl === 10) return { color: "bg-red-600 border-red-400 text-white", label: "PRO", glow: "shadow-neon-red shadow-[0_0_20px_rgba(239,68,68,0.5)]" };
    return { color: "bg-brand border-brand-glow text-white", label: "LEGEND", glow: "shadow-neon animate-pulse" };
  };

  const rank = getRankConfig(level);

  const sizeClasses = {
    sm: "w-5 h-5 text-[9px]",
    md: "w-8 h-8 text-xs",
    lg: "w-14 h-14 text-2xl",
    xl: "w-20 h-20 text-4xl"
  };

  const handleHover = () => {
    if (interactive) {
        try {
            // Pitch shifts higher for higher ranks (0.5 to 1.5)
            SoundNexus.playSpatial(CUES.UI_HOVER, { pitch: 0.5 + (level / 10) });
        } catch (e) {}
    }
  };

  return (
    <div 
      className={cn("flex items-center gap-3", interactive && "cursor-help")}
      onMouseEnter={handleHover}
    >
      <motion.div 
        whileHover={interactive ? { scale: 1.1, rotate: 5, translateZ: 20 } : {}}
        className={cn(
          "relative flex items-center justify-center font-display font-black border-2 transition-all duration-500",
          rank.color,
          rank.glow,
          sizeClasses[size],
          // 📐 DYNAMIC SHAPE: Circles for low tiers, Diamonds for high tiers
          level >= 10 ? "clip-path-slant" : "rounded-sm"
        )}
      >
        {/* INTERNAL GLITCH DECOR FOR HIGH TIERS */}
        {level >= 10 && (
          <div className="absolute inset-0 opacity-20 bg-scanline animate-scan pointer-events-none" />
        )}
        
        <span className="relative z-10 select-none">
          {level > 0 ? level : "!"}
        </span>

        {/* 🔘 LEVEL PROGRESS RING (Optional visual flare for Profile Headers) */}
        {size === 'xl' && (
          <svg className="absolute -inset-2 w-24 h-24 -rotate-90 opacity-20 pointer-events-none">
            <circle
              cx="48" cy="48" r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="289"
              // Mock calculation: Assumes 250 ELO per level
              strokeDashoffset={289 - (289 * (elo % 250) / 250)}
            />
          </svg>
        )}
      </motion.div>

      {(showElo && size !== 'sm') && (
        <div className="flex flex-col justify-center leading-none">
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-1">
            {rank.label}
          </span>
          <span className={cn(
            "font-hud font-bold tracking-widest",
            size === 'lg' ? "text-xl" : "text-xs",
            level >= 10 ? "text-white text-neon" : "text-zinc-300"
          )}>
            {elo} <span className="text-[8px] opacity-40 ml-0.5">PTS</span>
          </span>
        </div>
      )}
    </div>
  );
};
