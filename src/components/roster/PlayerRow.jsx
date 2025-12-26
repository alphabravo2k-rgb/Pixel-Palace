import React from 'react';
import { Crown } from 'lucide-react';
import { SocialIcons } from '../SocialIcons'; // Ensure path is correct for your project structure
import { normalizeRole } from '../../lib/roles';

// 🛡️ ROBUST INITIALS HELPER
const getInitials = (name) => {
  if (!name) return '??';
  const clean = name.replace(/[^\w\s]/gi, '').trim();
  if (!clean) return name.substring(0, 2).toUpperCase(); 
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const PlayerRow = ({ player, isHovered }) => {
  const role = normalizeRole(player.role);
  const isCaptain = role === 'CAPTAIN';
  const isSub = role === 'SUBSTITUTE';

  const initials = getInitials(player.name || player.username);
  const faceitElo = player.faceit_elo || player.elo || null;

  return (
    <div className={`group flex items-center justify-between p-3 transition-colors rounded ${isHovered ? 'bg-white/5' : 'bg-transparent'} ${isSub ? 'bg-yellow-900/5' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs rounded border transition-colors ${isCaptain ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : isSub ? 'bg-yellow-600/10 border-yellow-600/30 text-yellow-600' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
          {isCaptain ? <Crown className="w-4 h-4" /> : initials}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-bold uppercase tracking-wide text-sm ${isCaptain ? 'text-fuchsia-400' : 'text-zinc-300'}`}>
              {player.name || player.username || 'Unknown'}
            </span>
            {isSub && <span className="text-[9px] bg-yellow-900/50 text-yellow-500 px-1 rounded border border-yellow-500/30 font-bold">SUB</span>}
            {faceitElo && <span className="text-[9px] bg-orange-900/20 text-orange-400 px-1.5 rounded font-mono border border-orange-500/20">{faceitElo} ELO</span>}
          </div>
          <span className="text-[10px] text-zinc-600 font-mono uppercase">{isCaptain ? 'TEAM CAPTAIN' : isSub ? 'RESERVE' : 'OPERATOR'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
        <SocialIcons discord={player.discord_id || player.discord} steam={player.steam_id || player.steam} twitter={player.twitter_handle || player.twitter} />
      </div>
    </div>
  );
};
