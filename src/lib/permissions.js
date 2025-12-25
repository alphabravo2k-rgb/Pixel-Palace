import { ROLES } from './roles';
import { PERM_ACTIONS } from './permissions.actions'; 

const LOCAL_MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  READY: 'ready',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed'
};

const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: ['*'], 
  [ROLES.ADMIN]: [
    PERM_ACTIONS.MATCH_UPDATE, 
    PERM_ACTIONS.VETO_OVERRIDE, 
    PERM_ACTIONS.VIEW_SENSITIVE,
    PERM_ACTIONS.CAN_MANAGE_BRACKET,
    PERM_ACTIONS.CAN_MANAGE_MATCH,
    PERM_ACTIONS.GENERATE_BRACKET,
    PERM_ACTIONS.SYNC_ROSTER
  ],
  [ROLES.CAPTAIN]: [
    PERM_ACTIONS.VETO_ACT, 
    PERM_ACTIONS.VIEW_SERVER_IP
  ],
  [ROLES.REFEREE]: [
    PERM_ACTIONS.MATCH_UPDATE,
    PERM_ACTIONS.CAN_MANAGE_MATCH,
    PERM_ACTIONS.VIEW_LOGS
  ],
  [ROLES.PLAYER]: [],
  [ROLES.GUEST]: []
};

const STATE_GUARDS = {
  [PERM_ACTIONS.VETO_ACT]: [LOCAL_MATCH_STATUS.LIVE, LOCAL_MATCH_STATUS.VETO, LOCAL_MATCH_STATUS.SCHEDULED],
  [PERM_ACTIONS.VIEW_SERVER_IP]: [LOCAL_MATCH_STATUS.LIVE]
};

export const can = (action, session, context = {}) => {
  try {
    if (!session || !session.isAuthenticated) return false;
    
    // 1. Role Check
    const allowedActions = ROLE_PERMISSIONS[session.role] || [];
    const hasPermission = allowedActions.includes(action) || allowedActions.includes('*');
    
    if (!hasPermission) return false;

    // 2. State Check (If match context provided)
    if (context.match) {
      const allowedStates = STATE_GUARDS[action];
      if (allowedStates && !allowedStates.includes(context.match.status)) {
        return false;
      }
    }

    // 3. Scope Check (Ownership)
    if ([PERM_ACTIONS.VETO_ACT].includes(action)) {
      const userTeamId = session.identity?.id; 
      if (!userTeamId || !context.match) return false;

      const isParticipant = userTeamId === context.match.team1_id || userTeamId === context.match.team2_id;
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
