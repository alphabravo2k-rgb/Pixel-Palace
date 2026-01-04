import React, { useState } from 'react';
import { Users, Trophy, AlertCircle, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { normalizeRole } from '../../lib/roles';

// Internal Sub-Component for modularity
const PlayerRow = ({ player, isHovered }) => {
  const role = normalizeRole(player.role);
  const isCaptain = role === 'CAPTAIN';

  return (
    <div className={cn(
      "flex items-center justify-between p-3 border-b border-white/5 last:border-0 transition-colors duration-300",
      isHovered ? "bg-white/5" : "bg-transparent"
    )}>
      <div className="flex items-center gap-3">
        {/* Avatar / Role Icon */}
        <div className={cn(
          "w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold border",
          isCaptain 
            ? "bg-brand/10 text-brand-glow border-brand/50 shadow-[0_0_10px_rgba(var(--color-brand)/0.2)]" 
            : "bg-zinc-800 text-zinc-500 border-zinc-700"
        )}>
          {isCaptain ? "C" : player.name?.charAt(0).toUpperCase()}
        </div>
        
        {/* Name & Role */}
        <div className="flex flex-col">
          <span className={cn(
            "text-sm font-bold uppercase tracking-wide leading-none",
            isCaptain ? "text-white" : "text-zinc-400"
          )}>
            {player.name}
          </span>
          <span className="text-[9px] text-zinc-600 font-mono mt-0.5">
            {role}
          </span>
        </div>
      </div>

      {/* ELO / Status */}
      {player.elo > 0 && (
         <div className="text-[10px] font-mono font-bold text-zinc-500 bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
            {player.elo}
         </div>
      )}
    </div>
  );
};

const ROLE_ORDER = {
  captain: 0,
  player: 1,
  substitute: 2,
  coach: 3,
  guest: 99
};

const getRolePriority = (role) => {
  const norm = normalizeRole(role); // Returns 'captain', 'player', etc. (lowercase)
  return ROLE_ORDER[norm] ?? 99;
};

export const TeamCard = ({ team, rank, tournamentRules = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!team) return null;

  const slotsNeeded = team.max_players ?? tournamentRules.team_size ?? 6;

  // 1. Sort Players (Captain First)
  const sortedPlayers = [...(team.members || [])].sort((a, b) => {
    const pA = getRolePriority(a.role);
    const pB = getRolePriority(b.role);
    if (pA !== pB) return pA - pB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const emptySlots = Math.max(0, slotsNeeded - sortedPlayers.length);
  const displaySeed = team.seed_number;
  const hasSeed = displaySeed !== undefined && displaySeed !== null;

  return (
    <div 
      className={cn(
        "relative overflow-hidden transition-all duration-300 rounded-r border-l-4 mb-4 group",
        "bg-bg-panel shadow-lg hover:shadow-xl",
        isHovered ? "border-brand shadow-[0_0_20px_rgba(var(--color-brand)/0.1)]" : "border-tactical"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent relative">
        <div className="flex items-center gap-4 relative z-10">
          
          {/* Rank/Seed Badge */}
          <div className={cn(
            "w-12 h-12 flex items-center justify-center font-black text-2xl italic font-display border",
            hasSeed ? "bg-zinc-900 text-zinc-400 border-zinc-700" : "bg-red-900/20 text-red-500 border-red-900/50"
          )}>
             {hasSeed ? `#${displaySeed}` : <AlertCircle className="w-5 h-5" />}
          </div>

          {/* Info */}
          <div>
            <h3 className={cn(
                "text-2xl font-black italic tracking-tighter uppercase font-display leading-none transition-colors",
                isHovered ? "text-brand-glow" : "text-white"
            )}>
              {team.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
              <Users className="w-3 h-3" />
              <span>{sortedPlayers.length} / {slotsNeeded} Operators</span>
            </div>
          </div>
        </div>

        {/* Winner Trophy Icon */}
        {rank === 1 && <Trophy className="w-6 h-6 text-yellow-500 animate-pulse drop-shadow-md" />}
        {/* Logo Watermark */}
        {team.logo_url && (
            <img src={team.logo_url} className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-24 object-contain opacity-[0.05] grayscale group-hover:grayscale-0 transition-all pointer-events-none" />
        )}
      </div>

      {/* ROSTER LIST */}
      <div className="divide-y divide-white/5 bg-bg-surface/50">
        {sortedPlayers.map((player) => (
          <PlayerRow 
            key={player.id} 
            player={player} 
            isHovered={isHovered} 
          />
        ))}

        {/* GHOST SLOTS */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`ghost-${i}`} className="flex items-center justify-between p-3 opacity-30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/5 border border-white/10 border-dashed" />
              <div className="w-24 h-2 bg-white/10 rounded" />
            </div>
            <div className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
              VACANT
            </div>
          </div>
        ))}
      </div>
      
      {/* BOTTOM GLOW LINE */}
      <div className={cn(
        "h-0.5 w-full bg-gradient-to-r from-brand via-brand-glow to-brand transition-all duration-500 origin-left",
        isHovered ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
      )} />
    </div>
  );
};
