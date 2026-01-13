/**
 * 🎨 VISUAL DNA: THE UNIFORMS (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // HDR OPTIMIZED
 */
import { ROLES } from './definitions';

export const ROLE_THEMES = {
  // 👑 HIGH CLEARANCE (Neon Glows & Animations)
  [ROLES.OWNER]: { 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/10', 
    border: 'border-yellow-500/50', 
    ring: 'ring-yellow-500', 
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]',
    shimmer: 'animate-pulse' // Unique to Founder
  },
  [ROLES.ADMIN]: { 
    color: 'text-red-500', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/50', 
    ring: 'ring-red-500', 
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
  },
  
  // 🏟️ STAFF & BROADCAST
  [ROLES.ORGANIZER]: { 
    color: 'text-orange-500', 
    bg: 'bg-orange-500/10', 
    border: 'border-orange-500/50', 
    ring: 'ring-orange-500', 
    glow: 'shadow-orange-500/30' 
  },
  [ROLES.CASTER]: { 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/50', 
    ring: 'ring-purple-500', 
    glow: 'shadow-purple-500/30' 
  },
  [ROLES.CREW]: { 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/50', 
    ring: 'ring-blue-500', 
    glow: 'shadow-blue-500/30' 
  },
  [ROLES.STREAMER]: { 
    color: 'text-fuchsia-400', 
    bg: 'bg-fuchsia-500/10', 
    border: 'border-fuchsia-500/50', 
    ring: 'ring-fuchsia-500', 
    glow: 'shadow-fuchsia-500/30' 
  },

  // 🎖️ COMBATANTS
  [ROLES.CAPTAIN]: { 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/50', 
    ring: 'ring-emerald-500', 
    glow: 'shadow-emerald-500/20' 
  },
  [ROLES.SCOUT]: { 
    color: 'text-lime-400', 
    bg: 'bg-lime-500/10', 
    border: 'border-lime-500/50', 
    ring: 'ring-lime-500', 
    glow: 'shadow-none' 
  },
  [ROLES.PLAYER]: { 
    color: 'text-zinc-100', 
    bg: 'bg-zinc-800/80', 
    border: 'border-zinc-700', 
    ring: 'ring-zinc-600', 
    glow: 'shadow-none' 
  },

  // 👤 OBSERVERS
  [ROLES.SPECTATOR]: { 
    color: 'text-zinc-500', 
    bg: 'bg-black/40', 
    border: 'border-zinc-800', 
    ring: 'ring-transparent', 
    glow: 'shadow-none' 
  },
  [ROLES.GUEST]: { 
    color: 'text-zinc-600', 
    bg: 'bg-transparent', 
    border: 'border-transparent', 
    ring: 'ring-transparent', 
    glow: 'shadow-none' 
  }
};

/**
 * 🛡️ RESOLVER: TACTICAL THEME SELECTOR
 * Safely extracts visual DNA with fallback.
 */
export const getRoleTheme = (role) => {
  if (!role) return ROLE_THEMES[ROLES.GUEST];
  const normalized = role.toLowerCase();
  return ROLE_THEMES[normalized] || ROLE_THEMES[ROLES.GUEST];
};
