import { ROLES } from '../lib/roles';

// --- CONFIGURATION: MATCH STATES ---
// These match the 'status' derived in useTournament.jsx
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  READY: 'ready',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed'
};

// --- CONFIGURATION: PERMISSION MATRIX ---
// Defines WHO can do WHAT
const ROLE_PERMISSIONS = {
  [ROLES.SYSTEM_OWNER]: ['*'], // God mode
  [ROLES.OWNER]: ['match.update', 'match.force_win', 'match.pause', 'match.veto.override', 'server.view_sensitive'],
  [ROLES.ADMIN]: ['match.update', 'match.force_win', 'match.pause', 'match.veto.override', 'server.view_sensitive'],
  [ROLES.REFEREE]: ['match.update', 'match.pause', 'match.resume', 'server.view_sensitive'],
  [ROLES.CAPTAIN]: ['match.veto.act', 'match.dispute', 'server.view_connect'],
  [ROLES.PLAYER]: ['match.dispute', 'server.view_connect'],
  [ROLES.SPECTATOR]: [],
  [ROLES.GUEST]: []
};

// --- CONFIGURATION: STATE GUARDS ---
// Defines WHEN an action is allowed
const STATE_GUARDS = {
  'match.veto.act': [MATCH_STATUS.VETO],
  'server.view_connect': [MATCH_STATUS.LIVE], // Players only see IP when live
  'server.view_sensitive': [MATCH_STATUS.LIVE, MATCH_STATUS.VETO, MATCH_STATUS.SCHEDULED], // Admins see IP earlier for setup
  'match.force_win': [MATCH_STATUS.LIVE, MATCH_STATUS.VETO, MATCH_STATUS.READY, MATCH_STATUS.SCHEDULED]
};

// --- CONFIGURATION: SCOPE GUARDS ---
// Defines which actions require the user to be part of the specific match/team
const TEAM_SCOPE_ACTIONS = [
  'match.veto.act', 
  'server.view_connect',
  'match.dispute'
];

/**
 * THE CENTRAL RESOLVER
 * @param {string} action - The action string (e.g., 'server.view_connect')
 * @param {object} session - The user session object
 * @param {object} context - Contextual data (match, teamId, etc.)
 * @returns {boolean}
 */
export const can = (action, session, context = {}) => {
  if (!session || !session.isAuthenticated) return false;
  if (session.role === ROLES.SYSTEM_OWNER) return true;

  // 1. Role Check
  const allowedActions = ROLE_PERMISSIONS[session.role] || [];
  const hasPermission = allowedActions.includes(action) || allowedActions.includes('*');
  if (!hasPermission) return false;

  // 2. State Check (if applicable)
  if (context.match) {
    const allowedStates = STATE_GUARDS[action];
    if (allowedStates && !allowedStates.includes(context.match.status)) {
      return false; // Action not allowed in this match state
    }
  }

  // 3. Scope Check (Team/Match Ownership)
  // Dynamic mapping based on TEAM_SCOPE_ACTIONS array
  if (TEAM_SCOPE_ACTIONS.includes(action)) {
    // Must be part of the teams playing
    if (!context.match) return false;
    const isTeam1 = session.teamId === context.match.team1Id;
    const isTeam2 = session.teamId === context.match.team2Id;
    
    // Enforce team scope for Captains and Players
    if (session.role === ROLES.CAPTAIN || session.role === ROLES.PLAYER) {
      if (!isTeam1 && !isTeam2) return false;
    }
  }

  return true;
};

// --- HELPER WRAPPERS ---

export const isAdmin = (session) => {
  return [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN].includes(session?.role);
};

export const isTeamCaptain = (session, teamId) => {
  if (!session?.isAuthenticated) return false;
  if (isAdmin(session)) return true; // Admins act as super-captains
  return session.role === ROLES.CAPTAIN && session.teamId === teamId;
};

/**
 * Specific check for "Can I see the server IP?"
 * Wraps the complex logic of Role + Match State + Team membership
 */
export const canViewServerInfo = (session, match) => {
  if (isAdmin(session)) return true; // Admins always see
  return can('server.view_connect', session, { match });
};
