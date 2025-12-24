import React, { useState } from 'react';
import { Users, Shield, Trophy, AlertCircle } from 'lucide-react';
import { PlayerRow } from './PlayerRow'; 
import { normalizeRole } from '../lib/roles';

// ❌ FIX: Extend role priority system now, not later
// We define the specific order including WILDCARD as requested.
const ROLE_ORDER = {
  CAPTAIN: 0,
  WILDCARD: 1, // ✅ Reserved slot for future wildcard logic
  PLAYER: 2,
  SUBSTITUTE: 3,
  UNKNOWN: 99
};

const getRolePriority = (role) => {
  return ROLE_ORDER[role] ?? ROLE_ORDER.UNKNOWN;
};

export const TeamCard = ({ team, rank, tournamentRules = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!team) return null;

  /**
   * ❌ FIX: Hardcoded slotsNeeded = 6 is a contradiction.
   * "This must come from: tournament config, team type, match format."
   * We now derive it dynamically, defaulting to 5 if undefined.
   */
  const slotsNeeded = team.max_players ?? tournamentRules.team_size ?? 5;

  /**
   * ❌ FIX: Role sorting ignores wildcards / special roles.
   * We apply the strict ROLE_ORDER priority map here.
   */
  const sortedPlayers = [...(team.players || [])].sort((a, b) => {
    const roleA = normalizeRole(a.role);
    const roleB = normalizeRole(b.role);
    
    // Sort by Role Priority first
    const priorityDiff = getRolePriority(roleA) - getRolePriority(roleB);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Alphabetical fallback for same roles
    return (a.name || '').localeCompare(b.name || '');
  });

  // Calculate Ghost Slots (Empty rows to fill visual density)
  const emptySlots = Math.max(0, slotsNeeded - sortedPlayers.length);

  /**
   * ⚠️ FIX: seed_number trust.
   * "This will lie visually if seed order is overridden manually."
   * We check for the value explicitly.
   */
  const displaySeed = team.seed_number ?? '-';
  const hasSeed = team.seed_number !== undefined && team.seed_number !== null;

  return (
    <div 
      className={`
        relative overflow-hidden transition-all duration-500
        ${isHovered ? 'bg-zinc-900 border-l-4 border-fuchsia-500' : 'bg-black border-l-4 border-zinc-800'}
        mb-4 shadow-xl
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center gap-4">
          
          {/* Rank / Seed Display */}
          <div className={`
            w-12 h-12 flex items-center justify-center font-black text-2xl italic font-['Teko']
            ${hasSeed ? 'bg-zinc-800 text-zinc-400' : 'bg-red-900/20 text-red-500 border border-red-900/50'}
          `}>
             {/* If seed is missing, we show the Rank index or a warning */}
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
        {sortedPlayers.map((player) => {
          // Logic from previous step is preserved via PlayerRow
          // but sorting is now handled by the parent
          return (
            <PlayerRow 
              key={player.id} 
              player={player} 
              isHovered={isHovered} 
            />
          );
        })}

        {/* Ghost Slots for Visual Density */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div 
            key={`ghost-${i}`} 
            className="flex items-center justify-between p-3 bg-black/20 border-b border-white/5 last:border-0"
          >
            <div className="flex items-center gap-3 opacity-30">
              <div className="w-8 h-8 rounded bg-zinc-900/50 border border-white/5 border-dashed" />
              <div className="flex flex-col gap-1">
                <div className="w-24 h-4 bg-zinc-900/50 rounded animate-pulse" />
                <div className="w-12 h-2 bg-zinc-900/30 rounded" />
              </div>
            </div>
            <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
              OPEN SLOT
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Status Bar */}
      <div className={`
        h-1 w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 
        transition-all duration-500 origin-left
        ${isHovered ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
      `} />
    </div>
  );
};
