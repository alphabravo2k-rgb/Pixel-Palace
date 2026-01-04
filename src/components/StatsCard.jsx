import React from 'react';
import { ArrowUpRight, Minus, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon = Shield, // Default to Shield if no icon provided
  trend = 'neutral',   // 'up', 'down', or 'neutral'
  className 
}) => {
  
  // Logic: Color coding based on trend
  const trendConfig = {
    up: { icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    down: { icon: Minus, color: "text-red-500", bg: "bg-red-500/10" },
    neutral: { icon: Minus, color: "text-zinc-500", bg: "bg-zinc-500/10" }
  }[trend] || { icon: Minus, color: "text-zinc-500" };

  const TrendIcon = trendConfig.icon;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded bg-bg-panel border border-tactical p-5 flex flex-col justify-between h-full transition-all duration-300",
      "hover:border-brand/50 hover:shadow-[0_0_20px_rgba(var(--color-brand)/0.1)]", // Glow on hover
      className
    )}>
      
      {/* 🎨 Background Decoration (Huge Faded Icon) */}
      <div className="absolute -right-4 -top-4 text-white opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none rotate-12">
        <Icon size={90} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest leading-none">
          {title}
        </span>
        
        {/* Trend Indicator */}
        <div className={cn("p-1 rounded-full", trendConfig.bg)}>
            <TrendIcon className={cn("w-3 h-3", trendConfig.color)} />
        </div>
      </div>
      
      {/* Value */}
      <div className="mt-3 z-10">
        <span className="text-4xl font-display font-bold text-white tracking-wide shadow-black drop-shadow-sm">
          {value}
        </span>
      </div>
      
      {/* Bottom Shine Line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default StatsCard;
