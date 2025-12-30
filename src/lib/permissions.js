import { ROLE_CAPABILITIES } from './roles';
import { MATCH_STATUS } from './constants';
import { PERM_CAPABILITIES } from './permissions.actions';

// State Guards: The "When" can an action happen?
const STATE_GUARDS = {
  [PERM_CAPABILITIES.ACT_AS_CAPTAIN]: (match) => match?.status === MATCH_STATUS.VETO,
  [PERM_CAPABILITIES.REPORT_SCORE]: (match) => match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked,
  [PERM_CAPABILITIES.MANAGE_MATCH]: (match) => !match?.is_locked
};

export const can = (capability, session, context = null) => {
  // 1. Session Validity Check
  if (!session || !session.isAuthenticated || !session.role) return false;

  // 2. RBAC: Does this role have this capability?
  const userCapabilities = ROLE_CAPABILITIES[session.role] || [];
  const hasPermission = userCapabilities.includes(capability);

  // 3. OWNER Override (Verified by Session Hydration)
  if (session.role === 'OWNER') return true;
  
  if (!hasPermission) return false;

  // 4. SCOPE CHECK: Is this user allowed to touch this specific object?
  // Example: A Captain can only Veto matches their team is participating in.
  if (capability === PERM_CAPABILITIES.ACT_AS_CAPTAIN) {
      // 🛡️ SECURITY: Use explicit team_id from session (joined from backend)
      const userTeamId = session.team_id; 
      
      if (!userTeamId || !context) return false;

      // Are they actually playing in this match?
      // Context can be the match object itself or just an object with { team1_id, team2_id }
      const isParticipant = userTeamId === context.team1_id || userTeamId === context.team2_id;
      
      if (!isParticipant) return false;
  }

  // 5. STATE GUARD: Is the object in a valid state for this action?
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    // Admins usually bypass state guards via OVERRIDE_MATCH, but here we strictly check state for non-admins
    const hasOverride = userCapabilities.includes(PERM_CAPABILITIES.OVERRIDE_MATCH);
    if (!hasOverride) return guard(context);
  }

  return true;
};
