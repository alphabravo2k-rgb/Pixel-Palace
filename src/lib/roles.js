import { PERM_CAPABILITIES } from './permissions.actions';

/**
 * ROLE CAPABILITY MATRIX (RBAC)
 * The ONLY place where roles are assigned permissions.
 */

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  REFEREE: 'REFEREE',
  CAPTAIN: 'CAPTAIN',
  PLAYER: 'PLAYER',
  GUEST: 'GUEST'
};

// Define capabilities for each role
export const ROLE_CAPABILITIES = {
  [ROLES.OWNER]: [
    PERM_CAPABILITIES.MANAGE_TOURNAMENT,
    PERM_CAPABILITIES.VIEW_HIDDEN_DATA,
    PERM_CAPABILITIES.MANAGE_MATCH,
    PERM_CAPABILITIES.OVERRIDE_MATCH,
    PERM_CAPABILITIES.EDIT_ROSTER
  ],
  [ROLES.ADMIN]: [
    PERM_CAPABILITIES.MANAGE_TOURNAMENT,
    PERM_CAPABILITIES.MANAGE_MATCH,
    PERM_CAPABILITIES.OVERRIDE_MATCH,
    PERM_CAPABILITIES.VIEW_HIDDEN_DATA
  ],
  [ROLES.REFEREE]: [
    PERM_CAPABILITIES.MANAGE_MATCH, 
    PERM_CAPABILITIES.VIEW_ADMIN_DASHBOARD
  ],
  [ROLES.CAPTAIN]: [
    PERM_CAPABILITIES.ACT_AS_CAPTAIN,
    PERM_CAPABILITIES.REPORT_SCORE,
    PERM_CAPABILITIES.EDIT_ROSTER
  ],
  [ROLES.PLAYER]: [],
  [ROLES.GUEST]: []
};

// UI Themes for Roles (Used by AdminToolbar)
export const ROLE_THEMES = {
  OWNER: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', label: 'Owner' },
  ADMIN: { color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/50', label: 'Admin' },
  REFEREE: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', label: 'Referee' },
  CAPTAIN: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50', label: 'Captain' },
  GUEST: { color: 'text-zinc-500', bg: 'bg-zinc-800', border: 'border-zinc-700', label: 'Guest' }
};

export const normalizeRole = (role) => {
  if (!role) return ROLES.PLAYER;
  const r = role.toString().trim().toUpperCase();
  if (['CAPTAIN', 'CAPT', 'IGL'].includes(r)) return ROLES.CAPTAIN;
  if (['ADMIN', 'OFFICER'].includes(r)) return ROLES.ADMIN;
  if (['OWNER', 'HOST'].includes(r)) return ROLES.OWNER;
  if (['REFEREE', 'REF'].includes(r)) return ROLES.REFEREE;
  return ROLES.PLAYER;
};
