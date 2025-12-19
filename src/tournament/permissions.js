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

// --- PERMISSION MATRIX ---
const ROLE_PERMISSIONS = {
  [ROLES.SYSTEM_OWNER]: ['*'], 
  [ROLES.OWNER]: [
    PERM_ACTIONS.MATCH_UPDATE, 
    PERM_ACTIONS.MATCH_FORCE_WIN, 
    PERM_ACTIONS.VETO_OVERRIDE, 
    PERM_ACTIONS.VIEW_SENSITIVE
  ],
  [ROLES.ADMIN]: [
    PERM_ACTIONS.MATCH_UPDATE, 
    PERM_ACTIONS.MATCH_FORCE_WIN, 
    PERM_ACTIONS.VETO_OVERRIDE, 
    PERM_ACTIONS.VIEW_SENSITIVE
  ],
  [ROLES.CAPTAIN]: [
    PERM_ACTIONS.VETO_ACT, 
    PERM_ACTIONS.VIEW_SERVER_IP,
    PERM_ACTIONS.DISPUTE_RAISE
  ],
  [ROLES.PLAYER]: [
    PERM_ACTIONS.VIEW_SERVER_IP
  ],
  [ROLES.SPECTATOR]: []
};

// --- STATE GUARDS (Law of Visibility) ---
const STATE_GUARDS = {
  [PERM_ACTIONS.VETO_ACT]: [MATCH_STATUS.LIVE, MATCH_STATUS.VETO],
  [PERM_ACTIONS.VIEW_SERVER_IP]: [MATCH_STATUS.LIVE]
};

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
    
    if (!hasPermission) return false;

    // 2. State Check
    if (context.match) {
      const allowedStates = STATE_GUARDS[action];
      if (allowedStates && !allowedStates.includes(context.match.status)) {
        return false;
      }
    }

    // 3. Scope Check (Ownership)
    if ([PERM_ACTIONS.VETO_ACT, PERM_ACTIONS.VIEW_SERVER_IP].includes(action)) {
      const userTeamId = session.teamId;
      if (!userTeamId || !context.match) return false;

      const isParticipant = userTeamId === context.match.team1Id || userTeamId === context.match.team2Id;
      if (!isParticipant && ![ROLES.ADMIN, ROLES.OWNER].includes(session.role)) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("Permission Check Failed:", err);
    return false;
  }
};

export const isAdmin = (session) => {
  return [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN].includes(session?.role);
};
