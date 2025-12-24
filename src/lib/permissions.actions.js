/**
 * CORE PERMISSION ACTIONS
 * Single Source of Truth for Admin Capabilities.
 * Do not delete. Do not mock.
 */
export const PERM_ACTIONS = {
  // Tournament Lifecycle
  SYNC_ROSTER: 'SYNC_ROSTER',
  GENERATE_BRACKET: 'GENERATE_BRACKET',
  RESET_TOURNAMENT: 'RESET_TOURNAMENT',
  
  // Match Operations
  UPDATE_MATCH: 'UPDATE_MATCH', // Scores, Winners
  SWAP_TEAMS: 'SWAP_TEAMS',
  CHANGE_CONFIG: 'CHANGE_CONFIG', // BO1/3/5
  
  // Roster Operations
  EDIT_PLAYER: 'EDIT_PLAYER',
  
  // System
  VIEW_LOGS: 'VIEW_LOGS',
  MANAGE_ADMINS: 'MANAGE_ADMINS'
};

// Map database roles to capabilities
export const ROLE_CAPABILITIES = {
  OWNER: Object.values(PERM_ACTIONS), // Can do everything
  ADMIN: [
    PERM_ACTIONS.SYNC_ROSTER,
    PERM_ACTIONS.GENERATE_BRACKET,
    PERM_ACTIONS.UPDATE_MATCH,
    PERM_ACTIONS.SWAP_TEAMS,
    PERM_ACTIONS.CHANGE_CONFIG,
    PERM_ACTIONS.EDIT_PLAYER,
    PERM_ACTIONS.VIEW_LOGS
  ],
  REFEREE: [
    PERM_ACTIONS.UPDATE_MATCH,
    PERM_ACTIONS.VIEW_LOGS
  ]
};
