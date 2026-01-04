import React from 'react';
import { Crown, ShieldAlert } from 'lucide-react';
import { SocialIcons } from './SocialIcons';
import { normalizeRole } from '../../lib/roles';
import { cn } from '../../lib/utils';

// 🛡️ ROBUST INITIALS HELPER
// Handles special chars, spaces, and single words
const getInitials = (name) => {
  if (!name) return '??';
  const clean = name.replace(/[^\w\s]/gi, '').trim();
  if (!clean) return name.substring(0, 2).toUpperCase(); 
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const PlayerRow = ({ player, isHovered }) => {
  const role = normalizeRole(player.role); // 'captain', 'player', 'substitute'
  const isCaptain = role === 'captain';
  const isSub = role === 'substitute';

  const initials = getInitials(player.name || player.username);
  
  // Normalize Data Keys (Handles differences between DB Views vs Direct Queries)
  const faceitElo = player.faceit_elo || player.elo || null;
  const discord = player.discord_handle || player.discord_id || player.discord;
  const steam = player.steam_url || player.steam_id || player.steam;
  const faceit = player.faceit_url || player.faceit;
  const twitter = player.twitter_handle || player.twitter;

  return (
    <div className={cn(
        "group flex items-center justify-between p-3 transition-colors duration-200 border-b border-white/5 last:border-0",
        isHovered ? "bg-white/5" : "bg-transparent",
        isSub && "bg-yellow-900/5" // Subtle tint for subs
    )}>
      
      {/* LEFT SIDE: Identity */}
      <div className="flex items-center gap-3">
        {/* Avatar / Icon */}
        <div className={cn(
            "w-9 h-9 flex items-center justify-center font-bold text-xs rounded-sm border transition-all",
            isCaptain 
                ? "bg-brand/20 border-brand text-brand-glow shadow-[0_0_10px_rgba(var(--color-brand)/0.2)]" 
                : isSub 
                    ? "bg-yellow-900/20 border-yellow-700 text-yellow-500" 
                    : "bg-zinc-800 border-zinc-700 text-zinc-500"
        )}>
          {isCaptain ? <Crown className="w-4 h-4" /> : isSub ? <ShieldAlert className="w-4 h-4" /> : initials}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={cn(
                "font-bold uppercase tracking-wide text-sm leading-none",
                isCaptain ? "text-white" : "text-zinc-300"
            )}>
              {player.name || player.username || 'Unknown Agent'}
            </span>
            
            {/* Status Badges */}
            {isSub && <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-1 rounded border border-yellow-500/20 font-bold uppercase">Reserve</span>}
            
            {faceitElo > 0 && (
                <span className="text-[9px] bg-black/40 text-zinc-400 px-1.5 rounded font-mono border border-white/5" title="Faceit ELO">
                    {faceitElo}
                </span>
            )}
          </div>
          
          <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest mt-0.5">
            {isCaptain ? 'Team Captain' : role === 'player' ? 'Operator' : role}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Socials (Fade in on hover) */}
      <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity duration-300">
        <SocialIcons 
            discord={discord} 
            steam={steam} 
            faceit={faceit} 
            twitter={twitter} 
        />
      </div>
    </div>
  );
};
