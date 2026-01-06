/**
 * 🧬 SECURITY DNA
 * Single Source of Truth for the Pixel Palace Hierarchy.
 * Future-Proofing: Add a role here, and the entire app (Logic + UI) updates automatically.
 */

export const ROLE_DEF = {
  OWNER:    { id: 'owner',    level: 100, label: 'Founder',   aliases: ['god', 'host', 'creator'] },
  ADMIN:    { id: 'admin',    level: 90,  label: 'Admin',     aliases: ['mod', 'op', 'sysadmin'] },
  ORGANIZER:{ id: 'organizer',level: 80,  label: 'Organizer', aliases: ['host', 'to'] },
  CASTER:   { id: 'caster',   level: 70,  label: 'Caster',    aliases: ['voice', 'commentator'] },
  CREW:     { id: 'crew',     level: 60,  label: 'Crew',      aliases: ['ref', 'referee', 'observer'] },
  STREAMER: { id: 'streamer', level: 50,  label: 'Verified',  aliases: ['partner', 'content'] },
  CAPTAIN:  { id: 'captain',  level: 20,  label: 'Captain',   aliases: ['igl', 'leader'] },
  SCOUT:    { id: 'scout',    level: 15,  label: 'Scout',     aliases: ['agent', 'recruiter'] },
  PLAYER:   { id: 'player',   level: 10,  label: 'Player',    aliases: ['member', 'user'] },
  SPECTATOR:{ id: 'spectator',level: 5,   label: 'Fan',       aliases: ['viewer'] },
  GUEST:    { id: 'guest',    level: 0,   label: 'Guest',     aliases: ['anon'] }
};

// Freeze to prevent runtime tampering
Object.freeze(ROLE_DEF);

// 🛠️ Auto-Generated Constants for easy import
export const ROLES = Object.fromEntries(
  Object.entries(ROLE_DEF).map(([key, val]) => [key, val.id])
);
