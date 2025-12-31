import { ROLE_CAPABILITIES } from './roles';
import { MATCH_STATUS } from './constants';
import { PERM_CAPABILITIES } from './permissions.actions';

// State Guards: The "When" can an action happen?
const STATE_GUARDS = {
  [PERM_CAPABILITIES.ACT_AS_CAPTAIN]: (match) => match?.status === MATCH_STATUS.VETO,
  [PERM_CAPABILITIES.REPORT_SCORE]: (match) => match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked,
  [PERM_CAPABILITIES.MANAGE_MATCH]: (match) => !match?.is_locked
};

/**
 * CENTRAL PERMISSION CHECKER
 * @param {string} capability - The capability to check (from PERM_CAPABILITIES)
 * @param {object} session - The current user session object
 * @param {object} context - Optional context (e.g., match object) for scope checks
 */
export const can = (capability, session, context = null) => {
  // 1. Session Validity Check
  if (!session || !session.isAuthenticated || !session.role) return false;

  // 2. OWNER Override (God Mode)
  if (session.role === 'OWNER') return true;

  // 3. RBAC: Does this role have this capability?
  const userCapabilities = ROLE_CAPABILITIES[session.role] || [];
  const hasPermission = userCapabilities.includes(capability);
  
  if (!hasPermission) return false;

  // 4. SCOPE CHECK: Is this user allowed to touch this specific object?
  // e.g., Captains can only veto for THEIR match
  if (capability === PERM_CAPABILITIES.ACT_AS_CAPTAIN) {
      const userTeamId = session.team_id; 
      
      if (!userTeamId || !context) return false;

      // Check if user's team is part of the match (team1 or team2)
      const isParticipant = userTeamId === context.team1_id || userTeamId === context.team2_id;
      
      if (!isParticipant) return false;
  }

  // 5. STATE GUARD: Is the object in a valid state for this action?
  // e.g., Cannot manage a locked match
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    const hasOverride = userCapabilities.includes(PERM_CAPABILITIES.OVERRIDE_MATCH);
    if (!hasOverride) return guard(context);
  }

  return true;
};
