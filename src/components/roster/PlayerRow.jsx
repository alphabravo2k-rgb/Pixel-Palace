import React from 'react';
import { SocialButton } from './SocialIcons';

export const PlayerRow = ({ player }) => {
  // Defensive Role Normalization
  const role = (player.role || 'PLAYER').toUpperCase();
  const isCap = player.is_captain || role === 'CAPTAIN' || role === 'CAPT';
  const isSub = player.is_substitute || role === 'SUB' || role === 'SUBSTITUTE';
  
  let tag = 'PLY';
  let tagColor = 'bg-zinc-800 text-zinc-500 border border-zinc-700/50';

  if (isCap) {
    tag = 'CPT';
    tagColor = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  } else if (isSub) {
    tag = 'SUB';
    tagColor = 'bg-blue-600/30 text-blue-300 border border-blue-500/50';
  }

  return (
    <div className={`relative group w-full h-12 border-b border-white/5 last:border-0 flex items-center overflow-hidden will-change-transform ${isSub ? 'bg-blue-900/10' : 'bg-[#0a0a0c]'}`}>
      
      {/* Sub Pattern */}
      {isSub && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 20px)' }} 
        />
      )}

      {/* DEFAULT VIEW LAYER */}
      {/* ✅ FIX: pointer-events-auto by default, BUT pointer-events-none when hovered so it doesn't block the layer below */}
      <div className="absolute inset-0 flex items-center justify-between px-4 z-10 transition-transform duration-300 group-hover:-translate-y-full pointer-events-auto group-hover:pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden relative">
            {player.avatar ? (
               <img src={player.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
               <span className="text-[10px] font-bold opacity-30 text-zinc-500">{(player.name || '??').substring(0,2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate max-w-[110px] font-['Rajdhani'] ${isCap ? 'text-yellow-500' : 'text-zinc-300'}`}>
               {player.nickname || player.name || 'Unknown'}
            </span>
          </div>
        </div>
        
        {/* TAG */}
        <span className={`text-[9px] px-2 py-0.5 rounded-sm font-mono font-bold tracking-wider ${tagColor}`}>
            {tag}
        </span>
      </div>

      {/* HOVER VIEW - INTERACTIVE LAYER */}
      {/* ✅ FIX: pointer-events-none by default (so you can click 'through' it), BUT auto on hover */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-4 bg-[#0a0a0c] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
        
        {/* Social Buttons */}
        <div className="flex items-center gap-2 relative z-50" onClick={(e) => e.stopPropagation()}>
           <SocialButton href={player.socials?.faceit} type="FACEIT" />
           <SocialButton href={player.socials?.steam} type="STEAM" />
           <SocialButton href={player.socials?.discord} type="DISCORD" />
        </div>

        <span className="text-[10px] font-medium text-zinc-100 uppercase tracking-tighter truncate max-w-[120px] px-4">
           {player.nickname}
        </span>
        
        <span className={`text-[9px] px-2 py-0.5 rounded-sm font-mono font-bold tracking-wider ${tagColor}`}>{tag}</span>
      </div>

      {/* Accents */}
      <div className={`absolute left-0 top-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${isCap ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-fuchsia-500 shadow-[0_0_10px_#d946ef]'}`} />
    </div>
  );
};
