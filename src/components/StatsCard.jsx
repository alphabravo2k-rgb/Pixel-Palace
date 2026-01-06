import React from 'react';
import { ArrowUpRight, TrendingDown, Minus, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * PIXEL PALACE: STATS CARD V3.0 (MASTER HYBRID)
 * STATUS: MASTERED (DUBAI STANDARD)
 * - GPU Accelerated Decorative Layer
 * - Dynamic Trend Analysis
 * - Reactive Theme Shadowing
 */
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon = Shield, 
  trend = 'neutral', 
  unit = '',
  className 
}) => {
  
  // 1. TREND CONFIGURATION
  const trendConfig = {
    up: { icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    down: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    neutral: { icon: Minus, color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" }
  }[trend] || { icon: Minus, color: "text-zinc-500" };

  const TrendIcon = trendConfig.icon;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-sm bg-bg-panel border border-white/5 p-6 flex flex-col justify-between h-full transition-all duration-500",
      "hover:border-brand/40 hover:shadow-[0_0_30px_rgba(var(--color-brand)/0.15)]",
      className
    )}>
      
      {/* 🎨 GPU ACCELERATED BACKGROUND DECOR */}
      {/* Massive faded icon that rotates on hover */}
      <div className="absolute -right-6 -top-6 text-white opacity-[0.015] group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none rotate-[15deg] group-hover:rotate-[0deg] will-change-transform"
           style={{ transform: 'translateZ(0)' }}>
        <Icon size={120} strokeWidth={1} />
      </div>

      {/* HEADER SECTION */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.2em] leading-none">
            {title}
          </span>
          {/* Animated Underline */}
          <div className="w-4 h-[1px] bg-brand/40 group-hover:w-8 transition-all duration-500" />
        </div>
        
        {/* TREND BADGE */}
        <div className={cn("px-2 py-1 rounded-sm border flex items-center gap-1 transition-colors", trendConfig.bg, trendConfig.border)}>
            <TrendIcon className={cn("w-2.5 h-2.5", trendConfig.color)} />
            <span className={cn("text-[8px] font-black uppercase tracking-tighter", trendConfig.color)}>
              {trend === 'neutral' ? 'STABLE' : trend}
            </span>
        </div>
      </div>
      
      {/* VALUE SECTION */}
      <div className="mt-6 z-10 flex items-baseline gap-1">
        <span className="text-5xl font-display font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">
          {value}
        </span>
        {unit && <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">{unit}</span>}
      </div>
      
      {/* 🚀 DECORATIVE ACCENT: SCANLINE */}
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-brand/50 to-transparent opacity-30" />
      
      {/* BOTTOM SHINE: THE "LIFELINE" */}
      {/* Moves up slightly on hover to look like it's activating */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-[1px] group-hover:translate-y-0" />
    </div>
  );
};

export default StatsCard;
