import React from 'react';
import { Shield, User, RefreshCw } from 'lucide-react';
import { normalizeRole } from '../lib/roles'; // ✅ Imported utility

export const PlayerRow = ({ player, isHovered }) => {
  // ✅ Logic is now centralized. No exception.
  const role = normalizeRole(player.role);
  
  const isCaptain = role === 'CAPTAIN';
  const isSub = role === 'SUBSTITUTE';

  return (
    <div 
      className={`
        group relative flex items-center justify-between p-3 
        ${isHovered ? 'bg-white/10 translate-x-1' : 'bg-black/20'} 
        border-b border-white/5 last:border-0 transition-all duration-300
      `}
    >
      {/* LEFT: Identity */}
      <div className="flex items-center gap-3">
        {/* Role Icon */}
        <div className={`
          w-8 h-8 flex items-center justify-center rounded 
          ${isCaptain ? 'bg-yellow-500/20 text-yellow-500' : 
            isSub ? 'bg-purple-500/20 text-purple-400' : 
            'bg-zinc-800 text-zinc-500'}
        `}>
          {isCaptain ? <Shield className="w-4 h-4" /> : 
           isSub ? <RefreshCw className="w-3 h-3" /> : 
           <User className="w-4 h-4" />}
        </div>
        
        {/* Name & Handle */}
        <div className="flex flex-col">
          <span className={`
            font-['Teko'] text-xl uppercase leading-none tracking-wide
            ${isCaptain ? 'text-yellow-500' : 'text-zinc-200'}
          `}>
            {player.name}
          </span>
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
            {role}
          </span>
        </div>
      </div>

      {/* RIGHT: Stats/Status (Placeholder for now) */}
      <div className={`
        text-xs font-bold text-zinc-700 opacity-0 -translate-x-2 
        group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300
      `}>
        READY
      </div>
    </div>
  );
};
