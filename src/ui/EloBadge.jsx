import React from 'react';
import { cn } from '../lib/utils';

/**
 * 🏅 ELO BADGE
 * Renders the Faceit Level 1-10 style badge with neon glows.
 */
export const EloBadge = ({ level = 1, elo = 1000, size = 'md' }) => {
  
  // FACEIT Color Logic
  const getLevelColor = (lvl) => {
    if (lvl >= 10) return "bg-red-600 shadow-neon-red text-white";
    if (lvl >= 8)  return "bg-orange-500 shadow-neon-orange text-black";
    if (lvl >= 4)  return "bg-yellow-500 shadow-neon-yellow text-black";
    return "bg-zinc-600 text-white"; // Low levels
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-12 h-12 text-lg font-black"
  };

  return (
    <div className="flex items-center gap-2 font-display">
      <div className={cn(
        "flex items-center justify-center rounded-sm font-bold shadow-lg transition-all",
        getLevelColor(level),
        sizeClasses[size]
      )}>
        {level}
      </div>
      {size !== 'sm' && (
        <span className="text-zinc-500 font-mono text-xs tracking-wider">
          {elo} ELO
        </span>
      )}
    </div>
  );
};
