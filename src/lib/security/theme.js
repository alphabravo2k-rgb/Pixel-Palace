/**
 * 🎨 VISUAL DNA
 * Defines the look of badges and rank indicators.
 */
import { ROLES } from './definitions';

export const ROLE_THEMES = {
  [ROLES.OWNER]:    { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50' },
  [ROLES.ADMIN]:    { color: 'text-brand-glow', bg: 'bg-brand/10',      border: 'border-brand/50' },
  [ROLES.CASTER]:   { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50' },
  [ROLES.CREW]:     { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/50' },
  [ROLES.STREAMER]: { color: 'text-fuchsia-400',bg: 'bg-fuchsia-500/10',border: 'border-fuchsia-500/50' },
  [ROLES.CAPTAIN]:  { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/50' },
  [ROLES.PLAYER]:   { color: 'text-zinc-400',   bg: 'bg-zinc-800',      border: 'border-zinc-700' },
  [ROLES.GUEST]:    { color: 'text-zinc-600',   bg: 'bg-transparent',   border: 'border-transparent' }
};
