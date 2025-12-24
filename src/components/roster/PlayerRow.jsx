import React from 'react';
import { Crown, Shield, Globe } from 'lucide-react';
import { SocialIcons } from './SocialIcons'; // Ensure this component exists
import { normalizeRole } from '../lib/roles';

export const PlayerRow = ({ player, isHovered }) => {
  const role = normalizeRole(player.role);
  const isCaptain = role === 'CAPTAIN';
  const isSub = role === 'SUBSTITUTE';

  // Aesthetic Initials
  const initials = (player.name || '??').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
  
  // Format ELO if available
  const faceitElo = player.faceit_elo ? `${player.faceit_elo} ELO` : null;

  return (
    <div className={`
      group flex items-center justify-between p-3 transition-colors
      ${isHovered ? 'bg-white/5' : 'bg-transparent'}
      ${isSub ? 'bg-yellow-900/10' : ''} 
    `}>
      <div className="flex items-center gap-3">
        {/* Avatar / Role Indicator */}
        <div className={`
          w-8 h-8 flex items-center justify-center font-bold text-xs rounded border
          ${isCaptain ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 
            isSub ? 'bg-yellow-600/20 border-yellow-600/50 text-yellow-500' : 
            'bg-zinc-800 border-zinc-700 text-zinc-400'}
        `}>
          {isCaptain ? <Crown className="w-4 h-4" /> : initials}
        </div>

        {/* Name & Role Label */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-bold uppercase tracking-wide text-sm ${isCaptain ? 'text-fuchsia-400' : 'text-zinc-300'}`}>
              {player.name}
            </span>
            {isSub && (
              <span className="text-[9px] bg-yellow-900/50 text-yellow-500 px-1 rounded border border-yellow-500/30">
                SUB
              </span>
            )}
            {/* FACEIT ELO BADGE */}
            {faceitElo && (
              <span className="text-[9px] bg-orange-900/30 text-orange-400 px-1 rounded font-mono border border-orange-500/20">
                {faceitElo}
              </span>
            )}
          </div>
          
          {/* Tagline / Secondary Info */}
          <span className="text-[10px] text-zinc-600 font-mono">
            {isCaptain ? 'TEAM CAPTAIN' : isSub ? 'RESERVE' : 'OPERATOR'}
          </span>
        </div>
      </div>

      {/* Socials & Actions */}
      <div className="flex items-center gap-3">
        {/* Pass player data to SocialIcons */}
        <SocialIcons 
          discord={player.discord_id} 
          steam={player.steam_id} 
          twitter={player.twitter_handle} // Assuming these fields exist
        />
      </div>
    </div>
  );
};
