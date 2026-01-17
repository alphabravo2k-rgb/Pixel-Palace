/**
 * 📊 PIXEL PALACE: STATS CARD V3.5 (SENSORY EDITION)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // GPU-ACCELERATED
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingDown, Minus, Shield, Zap, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

// MASTER INTEGRATION
import { SoundNexus, CUES } from '../lib/soundNexus';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon = Shield, 
  trend = 'neutral', 
  unit = '',
  className,
  onClick
}) => {
  
  // 1. TACTICAL TREND CONFIGURATION
  const trendConfig = {
    up: { icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "ASCENDING" },
    down: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "DEPRECIATING" },
    neutral: { icon: Minus, color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20", label: "STABLE" }
  }[trend] || { icon: Minus, color: "text-zinc-500", label: "N/A" };

  const TrendIcon = trendConfig.icon;

  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.01 }}
      onMouseEnter={() => { try{ SoundNexus.play(CUES.UI_HOVER, { volume: 0.05, rate: 1.8 }); }catch(e){} }}
      className={cn(
        "group relative overflow-hidden rounded-sm bg-[#09090b] border border-white/5 p-8 flex flex-col justify-between h-full transition-all duration-500",
        "hover:border-fuchsia-500/40 hover:shadow-[0_0_40px_rgba(192,38,211,0.1)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      
      {/* 🎨 GPU ACCELERATED BACKGROUND DECOR */}
      {/* Rotating watermark icon with hardware-compositing */}
      <div className="absolute -right-8 -top-8 text-white opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-1000 pointer-events-none rotate-[25deg] group-hover:rotate-[0deg] will-change-transform"
           style={{ transform: 'translateZ(0)' }}>
        <Icon size={160} strokeWidth={1} />
      </div>

      {/* HEADER SECTION: TELEMETRY LABELS */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
             <Activity size={10} className="text-fuchsia-500 animate-pulse" />
             <span className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.4em] leading-none">
               Intel: {title}
             </span>
          </div>
          {/* Reactive Energy Bar */}
          <div className="w-6 h-[1.5px] bg-fuchsia-600/40 group-hover:w-12 group-hover:bg-fuchsia-500 transition-all duration-700" />
        </div>
        
        {/* TREND BADGE */}
        <div className={cn("px-3 py-1 rounded-sm border flex items-center gap-2 transition-all duration-500 group-hover:scale-110", trendConfig.bg, trendConfig.border)}>
            <TrendIcon className={cn("w-3 h-3", trendConfig.color)} />
            <span className={cn("text-[9px] font-black uppercase tracking-widest", trendConfig.color)}>
              {trendConfig.label}
            </span>
        </div>
      </div>
      
      {/* VALUE SECTION: THE DATA CORE */}
      <div className="mt-8 z-10 flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
            <span className="text-6xl font-display font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl transition-all group-hover:text-fuchsia-50">
              {value}
            </span>
            {unit && <span className="text-xs font-black text-zinc-700 uppercase tracking-[0.3em] group-hover:text-zinc-500 transition-colors">{unit}</span>}
        </div>
        <p className="text-[8px] text-zinc-800 font-mono uppercase tracking-widest mt-2 group-hover:text-zinc-600">
           Real-time Nexus Uplink Active
        </p>
      </div>
      
      {/* 🚀 DECORATIVE ACCENTS: THE DIGITAL CRT FEEL */}
      {/* Left Scanline */}
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-fuchsia-500/60 via-fuchsia-500/10 to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
      
      {/* Energy Bolt (Bottom Left Corner) */}
      <div className="absolute bottom-3 right-3 opacity-10 group-hover:opacity-30 group-hover:scale-125 transition-all duration-500">
          <Zap size={14} className="text-fuchsia-500" />
      </div>
      
      {/* BOTTOM SHINE: THE "HAPTIC LIFELINE" */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-[2px] group-hover:translate-y-0 shadow-[0_0_15px_#f472b6]" />
      
    </motion.div>
  );
};

export default StatsCard;
