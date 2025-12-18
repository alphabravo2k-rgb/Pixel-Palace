import { ROLES } from '../lib/roles';

// --- CONSTANTS ---
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  READY: 'ready',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed'
};

// --- PERMISSION MATRIX ---
const ROLE_PERMISSIONS = {
  [ROLES.SYSTEM_OWNER]: ['*'], 
  [ROLES.OWNER]: ['match.update', 'match.force_win', 'match.pause', 'match.veto.override', 'server.view_sensitive'],
  [ROLES.ADMIN]: ['match.update', 'match.force_win', 'match.pause', 'match.veto.override', 'server.view_sensitive'],
  [ROLES.REFEREE]: ['match.update', 'match.pause', 'match.resume', 'server.view_sensitive'],
  [ROLES.CAPTAIN]: ['match.veto.act', 'match.dispute', 'server.view_connect'],
  [ROLES.PLAYER]: ['match.dispute', 'server.view_connect'],
  [ROLES.SPECTATOR]: [],
  [ROLES.GUEST]: []
};

const STATE_GUARDS = {
  'match.veto.act': [MATCH_STATUS.VETO],
  'server.view_connect': [MATCH_STATUS.LIVE], 
  'server.view_sensitive': [MATCH_STATUS.LIVE, MATCH_STATUS.VETO, MATCH_STATUS.SCHEDULED], 
  'match.force_win': [MATCH_STATUS.LIVE, MATCH_STATUS.VETO, MATCH_STATUS.READY, MATCH_STATUS.SCHEDULED]
};

const TEAM_SCOPE_ACTIONS = [
  'match.veto.act', 
  'server.view_connect',
  'match.dispute'
];

/**
 * CORE LOGIC
 */
export const can = (action, session, context = {}) => {
  if (!session || !session.isAuthenticated) return false;
  if (session.role === ROLES.SYSTEM_OWNER) return true;

  // 1. Role Check
  const allowedActions = ROLE_PERMISSIONS[session.role] || [];
  const hasPermission = allowedActions.includes(action) || allowedActions.includes('*');
  if (!hasPermission) return false;

  // 2. State Check
  if (context.match) {
    const allowedStates = STATE_GUARDS[action];
    if (allowedStates && !allowedStates.includes(context.match.status)) {
      return false;
    }
  }

  // 3. Scope Check (Ownership)
  if (TEAM_SCOPE_ACTIONS.includes(action)) {
    if (!context.match) return false;
    const isTeam1 = session.teamId === context.match.team1Id;
    const isTeam2 = session.teamId === context.match.team2Id;
    
    // Captains/Players must own the match
    if ([ROLES.CAPTAIN, ROLES.PLAYER].includes(session.role)) {
      if (!isTeam1 && !isTeam2) return false;
    }
  }

  return true;
};

// --- HELPERS ---
// Used by components for quick checks
export const isAdmin = (session) => {
  return [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN].includes(session?.role);
};

export const isTeamCaptain = (session, teamId) => {
  if (!session?.isAuthenticated) return false;
  if (isAdmin(session)) return true; // Admins override
  return session.role === ROLES.CAPTAIN && session.teamId === teamId;
};
