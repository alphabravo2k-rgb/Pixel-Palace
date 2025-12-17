/**
 * Canonical roles for the Pixel Palace system.
 * Defines the hierarchy and access levels.
 */
export const ROLES = {
  SYSTEM_OWNER: 'SYSTEM_OWNER',   // Platform root, billing, kill-switch
  OWNER: 'OWNER',                 // Organization / Tournament owner (Must be scoped to tournamentId)
  ADMIN: 'ADMIN',                 // Operations staff
  REFEREE: 'REFEREE',             // Live match authority
  CAPTAIN: 'CAPTAIN',             // Team decision-maker (Vetoes, Disputes)
  PLAYER: 'PLAYER',               // Rostered player (View IP, Play)
  SPECTATOR: 'SPECTATOR',         // Logged-in viewer
  USER: 'USER',                   // Registered but inactive
  GUEST: 'GUEST'                  // Public, unauthenticated
};

/**
 * Match Lifecycle States.
 * Permissions are often dependent on the current state of the match.
 */
export const MATCH_STATES = {
  CREATED: 'CREATED',
  CHECK_IN: 'CHECK_IN',
  READY_CHECK: 'READY_CHECK',     // Anti-cheat / client status check
  VETO: 'VETO',
  SERVER_ASSIGNMENT: 'SERVER_ASSIGNMENT',
  LIVE: 'LIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',         // Admin-aborted matches
  DISPUTED: 'DISPUTED'
};

/**
 * Visual themes for badges and UI elements based on role.
 */
export const ROLE_THEMES = {
  [ROLES.SYSTEM_OWNER]: { color: 'purple', label: 'PLATFORM ROOT' },
  [ROLES.OWNER]: { color: 'red', label: 'TOURNAMENT DIRECTOR' },
  [ROLES.ADMIN]: { color: 'orange', label: 'TOURNAMENT ADMIN' },
  [ROLES.REFEREE]: { color: 'yellow', label: 'MATCH REFEREE' },
  [ROLES.CAPTAIN]: { color: 'blue', label: 'TEAM CAPTAIN' },
  [ROLES.PLAYER]: { color: 'emerald', label: 'ACTIVE PLAYER' },
  [ROLES.SPECTATOR]: { color: 'slate', label: 'SPECTATOR' },
  [ROLES.GUEST]: { color: 'gray', label: 'GUEST' }
};

/**
 * Static Permission Definitions.
 * Maps specific actions to the roles allowed to perform them.
 * Note: Runtime checks should also verify Match State and Scope.
 */
export const PERMISSIONS = {
  // Operational
  'match.update': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE],
  'match.force_win': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN],
  'match.pause': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE],
  'match.resume': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE],
  
  // Veto Process - Split for Live vs Result vs Public visibility
  'match.veto.view.live': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE, ROLES.CAPTAIN],
  'match.veto.view.result': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE, ROLES.CAPTAIN, ROLES.PLAYER],
  'match.veto.view.result.public': [ROLES.SPECTATOR, ROLES.GUEST, ROLES.USER], // Delayed visibility
  
  // Veto Actions - Explicit Overrides
  'match.veto.act': [ROLES.CAPTAIN], // Standard flow
  'match.veto.override': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE], // Admin intervention
  
  // Sensitive Info - Segregated Access
  'server.ip.view': [ROLES.CAPTAIN, ROLES.PLAYER], // Operational players only
  'server.ip.view.audit': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE], // Staff for support/audit
  
  'server.password.view': [ROLES.CAPTAIN, ROLES.PLAYER],
  'server.password.view.audit': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE],
  
  // Disputes
  'match.dispute.raise': [ROLES.CAPTAIN, ROLES.PLAYER], // Player fallback allowed if Captain absent (Requires Backend Guard)
  'match.dispute.resolve': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE]
};

/**
 * State-Gated Permissions.
 * Maps permissions to the specific match states where they are valid.
 * This prevents actions like viewing server IPs before the match is ready.
 */
export const PERMISSION_STATES = {
  'server.ip.view': [MATCH_STATES.SERVER_ASSIGNMENT, MATCH_STATES.LIVE, MATCH_STATES.PAUSED],
  'server.password.view': [MATCH_STATES.SERVER_ASSIGNMENT, MATCH_STATES.LIVE],
  'match.veto.act': [MATCH_STATES.VETO],
  'match.veto.view.live': [MATCH_STATES.VETO],
  'match.veto.view.result': [MATCH_STATES.SERVER_ASSIGNMENT, MATCH_STATES.LIVE, MATCH_STATES.COMPLETED],
  'match.veto.view.result.public': [MATCH_STATES.LIVE, MATCH_STATES.COMPLETED], // Prevents stream sniping
  'match.dispute.raise': [MATCH_STATES.LIVE, MATCH_STATES.PAUSED, MATCH_STATES.COMPLETED]
};

/**
 * Action Weighting.
 * Classifies permissions by impact level to trigger audits and confirmations.
 */
export const PERMISSION_WEIGHT = {
  'match.force_win': 'CRITICAL',
  'match.veto.override': 'HIGH',
  'match.dispute.resolve': 'HIGH',
  'match.pause': 'MEDIUM',
  'server.ip.view': 'LOW'
};
