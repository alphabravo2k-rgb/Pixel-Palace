import { PERM_ACTIONS } from './permissions.actions';

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  REFEREE: 'REFEREE',
  CAPTAIN: 'CAPTAIN',
  PLAYER: 'PLAYER',
  SUBSTITUTE: 'SUBSTITUTE',
  GUEST: 'GUEST'
};

// Map database roles to capabilities
export const ROLE_CAPABILITIES = {
  OWNER: Object.values(PERM_ACTIONS), // Can do everything
  ADMIN: [
    PERM_ACTIONS.SYNC_ROSTER,
    PERM_ACTIONS.GENERATE_BRACKET,
    PERM_ACTIONS.UPDATE_MATCH,
    PERM_ACTIONS.CAN_MANAGE_MATCH,
    PERM_ACTIONS.CAN_MANAGE_BRACKET,
    PERM_ACTIONS.SWAP_TEAMS,
    PERM_ACTIONS.CHANGE_CONFIG,
    PERM_ACTIONS.EDIT_PLAYER,
    PERM_ACTIONS.VIEW_LOGS
  ],
  REFEREE: [
    PERM_ACTIONS.UPDATE_MATCH,
    PERM_ACTIONS.CAN_MANAGE_MATCH,
    PERM_ACTIONS.VIEW_LOGS
  ]
};

export const normalizeRole = (role) => {
  if (!role) return 'PLAYER';
  const r = role.toString().trim().toUpperCase();
  
  if (['CAPTAIN', 'CAPT', 'C', 'IGL', 'LEADER'].includes(r)) return 'CAPTAIN';
  if (['SUB', 'SUBSTITUTE', 'S', 'RESERVE', 'BENCH'].includes(r)) return 'SUBSTITUTE';
  if (['ADMIN', 'ADMINISTRATOR', 'OFFICER'].includes(r)) return 'ADMIN';
  if (['OWNER', 'HOST'].includes(r)) return 'OWNER';
  if (['REF', 'REFEREE'].includes(r)) return 'REFEREE';
  
  return 'PLAYER';
};

export const ROLE_THEMES = {
  OWNER: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', label: 'Owner' },
  ADMIN: { color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/50', label: 'Admin' },
  REFEREE: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', label: 'Referee' },
  CAPTAIN: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50', label: 'Captain' },
  GUEST: { color: 'text-zinc-500', bg: 'bg-zinc-800', border: 'border-zinc-700', label: 'Guest' }
};
