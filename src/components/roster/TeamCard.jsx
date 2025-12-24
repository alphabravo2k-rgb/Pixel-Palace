import React, { useState } from 'react';
import { Users, Trophy, AlertCircle } from 'lucide-react';
import { PlayerRow } from './PlayerRow'; 
import { normalizeRole } from '../../lib/roles';

// 1. STRICT SORTING ORDER
const ROLE_ORDER = {
  CAPTAIN: 0,
  WILDCARD: 1,
  PLAYER: 2,
  SUBSTITUTE: 3,
  SUB: 3, // Handle variations
  UNKNOWN: 99
};

const getRolePriority = (role) => {
  const norm = normalizeRole(role);
  return ROLE_ORDER[norm] ?? ROLE_ORDER.UNKNOWN;
};

export const TeamCard = ({ team, rank, tournamentRules = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!team) return null;

  // Determine slots based on team max or tournament rules (default 5)
  const slotsNeeded = team.max_players ?? tournamentRules.team_size ?? 5;

  // 2. APPLY SORTING LOGIC
  const sortedPlayers = [...(team.players || [])].sort((a, b) => {
    // Sort by Role Priority first
    const pA = getRolePriority(a.role);
    const pB = getRolePriority(b.role);
    if (pA !== pB) return pA - pB;
    
    // Alphabetical fallback
    return (a.name || '').localeCompare(b.name || '');
  });

  const emptySlots = Math.max(0, slotsNeeded - sortedPlayers.length);
  const displaySeed = team.seed_number ?? '-';
  const hasSeed = team.seed_number !== undefined && team.seed_number !== null;

  return (
    <div 
      className={`
        relative overflow-hidden transition-all duration-500
        ${isHovered ? 'bg-zinc-900 border-l-4 border-fuchsia-500' : 'bg-black border-l-4 border-zinc-800'}
        mb-4 shadow-xl rounded-r-lg
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 flex items-center justify-center font-black text-2xl italic font-['Teko']
            ${hasSeed ? 'bg-zinc-800 text-zinc-400' : 'bg-red-900/20 text-red-500 border border-red-900/50'}
          `}>
             {hasSeed ? `#${displaySeed}` : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className={`text-3xl font-black italic tracking-tighter uppercase font-['Teko'] leading-none ${isHovered ? 'text-white' : 'text-zinc-400'}`}>
              {team.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
              <Users className="w-3 h-3" />
              <span>{sortedPlayers.length} / {slotsNeeded} Operators</span>
            </div>
          </div>
        </div>
        {rank === 1 && <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />}
      </div>

      {/* Roster List */}
      <div className="divide-y divide-white/5">
        {sortedPlayers.map((player) => (
          <PlayerRow 
            key={player.id} 
            player={player} 
            isHovered={isHovered} 
          />
        ))}

        {/* Ghost Slots (Visual Filler) */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`ghost-${i}`} className="flex items-center justify-between p-3 bg-black/20 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3 opacity-30">
              <div className="w-8 h-8 rounded bg-zinc-900/50 border border-white/5 border-dashed" />
              <div className="flex flex-col gap-1">
                <div className="w-24 h-4 bg-zinc-900/50 rounded animate-pulse" />
              </div>
            </div>
            <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
              OPEN SLOT
            </div>
          </div>
        ))}
      </div>
      
      {/* Interactive Footer Gradient */}
      <div className={`
        h-1 w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 
        transition-all duration-500 origin-left
        ${isHovered ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
      `} />
    </div>
  );
};
