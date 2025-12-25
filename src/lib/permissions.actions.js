/**
 * CORE PERMISSION ACTIONS
 * Single Source of Truth for Admin Capabilities.
 */
export const PERM_ACTIONS = {
  // Tournament Lifecycle
  SYNC_ROSTER: 'SYNC_ROSTER',
  GENERATE_BRACKET: 'GENERATE_BRACKET',
  RESET_TOURNAMENT: 'RESET_TOURNAMENT',
  
  // Match Operations
  CAN_MANAGE_MATCH: 'UPDATE_MATCH', // Used by hooks
  CAN_MANAGE_BRACKET: 'GENERATE_BRACKET', // Used by hooks
  UPDATE_MATCH: 'UPDATE_MATCH',
  SWAP_TEAMS: 'SWAP_TEAMS',
  CHANGE_CONFIG: 'CHANGE_CONFIG',
  
  // Roster Operations
  EDIT_PLAYER: 'EDIT_PLAYER',
  
  // System
  VIEW_LOGS: 'VIEW_LOGS',
  MANAGE_ADMINS: 'MANAGE_ADMINS'
};
