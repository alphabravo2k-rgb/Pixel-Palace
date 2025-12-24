import React, { useState } from 'react';
import { Users, Shield, Trophy } from 'lucide-react';
import { PlayerRow } from './PlayerRow'; 
import { normalizeRole } from '../lib/roles'; // ✅ Imported strict utility

export const TeamCard = ({ team, rank }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fallback for empty teams
  if (!team) return null;

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
          <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center font-black text-2xl text-zinc-600 italic font-['Teko']">
            #{rank}
          </div>
          <div>
            <h3 className={`text-3xl font-black italic tracking-tighter uppercase font-['Teko'] leading-none ${isHovered ? 'text-white' : 'text-zinc-400'}`}>
              {team.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
              <Users className="w-3 h-3" />
              <span>{team.players?.length || 0} Operators</span>
            </div>
          </div>
        </div>
        {rank === 1 && <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />}
      </div>

      {/* Roster List */}
      <div className="divide-y divide-white/5">
        {(team.players || []).map((player) => {
          
          /**
           * ❌ FIX 1: Tag derivation logic is too implicit
           * Replaced: const isCap = player.is_captain || role === 'CAPTAIN'
           * With: Strict normalization. Backend enforces flags, not UI guessing.
           */
          const role = normalizeRole(player.role);
          const isCap = role === 'CAPTAIN';
          // const isSub = role === 'SUBSTITUTE'; // Available if needed for row styling

          /**
           * ⚠️ FIX 2: Avatar fallback logic
           * Replaced: (player.name || '??').substring(0,2)
           * With: Sanitized regex for production-grade aesthetics.
           */
          const initials = (player.name || '??')
            .replace(/[^a-zA-Z0-9]/g, '') // Remove emojis/symbols
            .slice(0, 2)
            .toUpperCase();

          return (
            <PlayerRow 
              key={player.id} 
              player={{
                ...player,
                role: role, // Pass normalized role down
                initials: initials // Pass sanitized initials if PlayerRow needs them
              }} 
              isHovered={isHovered} 
            />
          );
        })}
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
