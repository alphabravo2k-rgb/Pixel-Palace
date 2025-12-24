/**
 * Role Normalization & Configuration Utility
 * Acts as the single source of truth for role definitions and logic.
 */

// 1. ROLE DEFINITIONS
export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  CAPTAIN: 'CAPTAIN',
  PLAYER: 'PLAYER',
  SUBSTITUTE: 'SUBSTITUTE',
  GUEST: 'GUEST'
};

// 2. ROLE NORMALIZATION LOGIC
export const normalizeRole = (role) => {
  if (!role) return 'PLAYER';
  
  const r = role.toString().trim().toUpperCase();
  
  if (['CAPTAIN', 'CAPT', 'C'].includes(r)) return 'CAPTAIN';
  if (['SUB', 'SUBSTITUTE', 'S'].includes(r)) return 'SUBSTITUTE';
  if (['ADMIN', 'ADMINISTRATOR'].includes(r)) return 'ADMIN';
  if (['OWNER'].includes(r)) return 'OWNER';
  
  return 'PLAYER';
};

// 3. UI THEMES FOR ROLES (Used by AdminToolbar, etc.)
export const ROLE_THEMES = {
  OWNER: { 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/10', 
    border: 'border-yellow-500/50',
    label: 'Owner' 
  },
  ADMIN: { 
    color: 'text-fuchsia-500', 
    bg: 'bg-fuchsia-500/10', 
    border: 'border-fuchsia-500/50',
    label: 'Admin' 
  },
  CAPTAIN: { 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/50',
    label: 'Captain' 
  },
  GUEST: { 
    color: 'text-zinc-500', 
    bg: 'bg-zinc-800', 
    border: 'border-zinc-700',
    label: 'Guest' 
  }
};
