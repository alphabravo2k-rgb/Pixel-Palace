/**
 * 🧬 SECURITY DNA: THE HIERARCHY (MASTER HYBRID)
 * ----------------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * PURPOSE:
 * Single Source of Truth for Role Power & Visual Identity.
 * * UPGRADES:
 * 1. VISUALS: Added 'color' and 'badge' for UI rendering.
 * 2. CONTEXT: Added 'description' for tooltips.
 */

export const ROLE_DEF = {
  OWNER: { 
    id: 'owner', 
    level: 100, 
    label: 'Founder', 
    aliases: ['god', 'host', 'creator'],
    color: 'text-yellow-500', // Gold
    badge: 'bg-yellow-500/10 border-yellow-500/20',
    description: 'System Architect. Full root access.'
  },
  ADMIN: { 
    id: 'admin', 
    level: 90, 
    label: 'Admin', 
    aliases: ['mod', 'op', 'sysadmin'],
    color: 'text-red-500', // Red
    badge: 'bg-red-500/10 border-red-500/20',
    description: 'Operations Lead. Disputes & Bans.'
  },
  ORGANIZER: { 
    id: 'organizer', 
    level: 80, 
    label: 'Organizer', 
    aliases: ['host', 'to'],
    color: 'text-orange-500', // Orange
    badge: 'bg-orange-500/10 border-orange-500/20',
    description: 'Tournament Manager. Bracket Control.'
  },
  CASTER: { 
    id: 'caster', 
    level: 70, 
    label: 'Caster', 
    aliases: ['voice', 'commentator'],
    color: 'text-fuchsia-500', // Neon Purple
    badge: 'bg-fuchsia-500/10 border-fuchsia-500/20',
    description: 'Media Access. Spectator Slots.'
  },
  CREW: { 
    id: 'crew', 
    level: 60, 
    label: 'Crew', 
    aliases: ['ref', 'referee', 'observer'],
    color: 'text-rose-500', // Rose
    badge: 'bg-rose-500/10 border-rose-500/20',
    description: 'Match Official. Pause/Resume.'
  },
  STREAMER: { 
    id: 'streamer', 
    level: 50, 
    label: 'Verified', 
    aliases: ['partner', 'content'],
    color: 'text-cyan-400', // Cyan
    badge: 'bg-cyan-500/10 border-cyan-500/20',
    description: 'Content Partner. Verified Badge.'
  },
  CAPTAIN: { 
    id: 'captain', 
    level: 20, 
    label: 'Captain', 
    aliases: ['igl', 'leader'],
    color: 'text-emerald-400', // Emerald
    badge: 'bg-emerald-500/10 border-emerald-500/20',
    description: 'Team Leader. Veto & Roster access.'
  },
  SCOUT: { 
    id: 'scout', 
    level: 15, 
    label: 'Scout', 
    aliases: ['agent', 'recruiter'],
    color: 'text-lime-400', // Lime
    badge: 'bg-lime-500/10 border-lime-500/20',
    description: 'Talent Scout. Enhanced Roster View.'
  },
  PLAYER: { 
    id: 'player', 
    level: 10, 
    label: 'Player', 
    aliases: ['member', 'user'],
    color: 'text-zinc-100', // White
    badge: 'bg-zinc-800 border-zinc-700',
    description: 'Combatant. Match Server Access.'
  },
  SPECTATOR: { 
    id: 'spectator', 
    level: 5, 
    label: 'Fan', 
    aliases: ['viewer'],
    color: 'text-zinc-500', // Grey
    badge: 'bg-black/50 border-transparent',
    description: 'Read-only access.'
  },
  GUEST: { 
    id: 'guest', 
    level: 0, 
    label: 'Guest', 
    aliases: ['anon'],
    color: 'text-zinc-600', // Dark Grey
    badge: 'bg-transparent border-transparent',
    description: 'Unauthenticated.'
  }
};

// Freeze to prevent runtime tampering
Object.freeze(ROLE_DEF);

// 🛠️ Auto-Generated Constants for easy import
export const ROLES = Object.fromEntries(
  Object.entries(ROLE_DEF).map(([key, val]) => [key, val.id])
);
