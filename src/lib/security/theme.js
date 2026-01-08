/**
 * 🎨 VISUAL DNA: THE UNIFORMS
 * ---------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * FEATURES:
 * 1. FULL COVERAGE: Maps every role in definitions.js to a visual theme.
 * 2. GLOW ENGINE: Generates CSS shadow strings for Neon/Holographic effects.
 */
import { ROLES } from './definitions';

export const ROLE_THEMES = {
  [ROLES.OWNER]:     { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/50' },
  [ROLES.ADMIN]:     { color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/50',    glow: 'shadow-red-500/50' },
  [ROLES.ORGANIZER]: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', glow: 'shadow-orange-500/50' },
  [ROLES.CASTER]:    { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', glow: 'shadow-purple-500/50' },
  [ROLES.CREW]:      { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/50' },
  [ROLES.STREAMER]:  { color: 'text-fuchsia-400',bg: 'bg-fuchsia-500/10',border: 'border-fuchsia-500/50',glow: 'shadow-fuchsia-500/50' },
  [ROLES.CAPTAIN]:   { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/50',glow: 'shadow-emerald-500/50' },
  [ROLES.SCOUT]:     { color: 'text-lime-400',   bg: 'bg-lime-500/10',   border: 'border-lime-500/50',   glow: 'shadow-lime-500/50' },
  [ROLES.PLAYER]:    { color: 'text-zinc-100',   bg: 'bg-zinc-800',      border: 'border-zinc-700',      glow: 'shadow-zinc-500/10' },
  [ROLES.SPECTATOR]: { color: 'text-zinc-500',   bg: 'bg-black/50',      border: 'border-white/5',       glow: 'shadow-none' },
  [ROLES.GUEST]:     { color: 'text-zinc-600',   bg: 'bg-transparent',   border: 'border-transparent',   glow: 'shadow-none' }
};

// 🛠️ HELPER: Safe Access
export const getRoleTheme = (roleId) => {
  return ROLE_THEMES[roleId] || ROLE_THEMES[ROLES.GUEST];
};
