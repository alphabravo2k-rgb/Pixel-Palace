import { ROLES } from '../lib/roles';
import { PERM_ACTIONS } from '../lib/constants';

// --- CONFIGURATION ---
const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true';

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  READY: 'ready',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed'
};

// --- REUSABLE PERMISSION SETS ---
const ADMIN_BASE_PERMISSIONS = [
  PERM_ACTIONS.MATCH_UPDATE, 
  PERM_ACTIONS.MATCH_FORCE_WIN, 
  PERM_ACTIONS.MATCH_PAUSE, 
  PERM_ACTIONS.VETO_OVERRIDE, 
  PERM_ACTIONS.VIEW_SENSITIVE
];

// --- PERMISSION MATRIX ---
const ROLE_PERMISSIONS = {
  [ROLES.SYSTEM_OWNER]: ['*'], 
  [ROLES.OWNER]: [...ADMIN_BASE_PERMISSIONS],
  [ROLES.ADMIN]: [...ADMIN_BASE_PERMISSIONS],
  [ROLES.REFEREE]: [
    PERM_ACTIONS.MATCH_UPDATE, PERM_ACTIONS.MATCH_PAUSE, 
    PERM_ACTIONS.MATCH_RESUME, PERM_ACTIONS.VIEW_SENSITIVE
  ],
  [ROLES.CAPTAIN]: [
    PERM_ACTIONS.VETO_ACT, PERM_ACTIONS.DISPUTE_RAISE, 
    PERM_ACTIONS.VIEW_SERVER_IP
  ],
  [ROLES.PLAYER]: [
    PERM_ACTIONS.DISPUTE_RAISE, PERM_ACTIONS.VIEW_SERVER_IP
  ],
  [ROLES.SPECTATOR]: [],
  [ROLES.GUEST]: []
};

// --- STATE GUARDS ---
const STATE_GUARDS = {
  [PERM_ACTIONS.VETO_ACT]: [MATCH_STATUS.VETO],
  [PERM_ACTIONS.VIEW_SERVER_IP]: [MATCH_STATUS.LIVE], 
  [PERM_ACTIONS.VIEW_SENSITIVE]: [MATCH_STATUS.LIVE, MATCH_STATUS.VETO, MATCH_STATUS.SCHEDULED], 
  [PERM_ACTIONS.MATCH_FORCE_WIN]: [MATCH_STATUS.LIVE, MATCH_STATUS.VETO, MATCH_STATUS.READY, MATCH_STATUS.SCHEDULED]
};

// --- SCOPE GUARDS ---
const TEAM_SCOPE_ACTIONS = [
  PERM_ACTIONS.VETO_ACT, 
  PERM_ACTIONS.VIEW_SERVER_IP,
  PERM_ACTIONS.DISPUTE_RAISE
];

/**
 * THE CENTRAL RESOLVER
 */
export const can = (action, session, context = {}) => {
  try {
    if (!session || !session.isAuthenticated) return false;
    if (session.role === ROLES.SYSTEM_OWNER) return true;

    // 1. Role Check
    const allowedActions = ROLE_PERMISSIONS[session.role] || [];
    const hasPermission = allowedActions.includes(action) || allowedActions.includes('*');
    
    if (!hasPermission) {
      if (IS_DEV) console.warn(`[Perms] Denied '${action}': Role '${session.role}' insufficient.`);
      return false;
    }

    // 2. State Check
    if (context.match) {
      const allowedStates = STATE_GUARDS[action];
      if (allowedStates && !allowedStates.includes(context.match.status)) {
        if (IS_DEV) console.warn(`[Perms] Denied '${action}': State '${context.match.status}' not in [${allowedStates}].`);
        return false;
      }
    }

    // 3. Scope Check (Team/Match Ownership)
    if (TEAM_SCOPE_ACTIONS.includes(action)) {
      if (!context.match) return false;
      
      const userTeamId = session.teamId;
      if (!userTeamId) {
        if (IS_DEV) console.warn(`[Perms] Denied '${action}': Scope required but user has no Team ID.`);
        return false;
      }

      const isTeam1 = userTeamId === context.match.team1Id;
      const isTeam2 = userTeamId === context.match.team2Id;
      
      if ([ROLES.CAPTAIN, ROLES.PLAYER].includes(session.role)) {
        if (!isTeam1 && !isTeam2) {
          if (IS_DEV) console.warn(`[Perms] Denied '${action}': User team '${userTeamId}' not in match.`);
          return false;
        }
      }
    }

    return true;
  } catch (err) {
    console.error("Permission Check Failed:", err);
    return false;
  }
};

// --- HELPER WRAPPERS ---
export const isAdmin = (session) => {
  return [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN].includes(session?.role);
};

export const isTeamCaptain = (session, teamId) => {
  if (!session?.isAuthenticated) return false;
  if (isAdmin(session)) return true; 
  return session.role === ROLES.CAPTAIN && session.teamId === teamId;
};
