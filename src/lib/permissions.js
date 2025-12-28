import { ROLE_CAPABILITIES } from './roles';
import { MATCH_STATUS } from './constants';
import { PERM_CAPABILITIES } from './permissions.actions';

/**
 * STATE GUARDS
 * Defines when an action is ILLEGAL regardless of role.
 */
const STATE_GUARDS = {
  [PERM_CAPABILITIES.ACT_AS_CAPTAIN]: (match) => {
    // Strict Phase Check
    return match?.status === MATCH_STATUS.VETO;
  },
  [PERM_CAPABILITIES.REPORT_SCORE]: (match) => {
    // Can only report active matches
    return match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked;
  },
  [PERM_CAPABILITIES.MANAGE_MATCH]: (match) => {
    // Admins cannot touch locked matches without unlocking them first
    return !match?.is_locked; 
  }
};

/**
 * THE ENFORCER
 * @param {string} capability - One of PERM_CAPABILITIES
 * @param {object} session - The user session object
 * @param {object} context - (Optional) The match or tournament object
 */
export const can = (capability, session, context = null) => {
  if (!session || !session.role) return false;

  // 1. RBAC CHECK: Does the role have the capability?
  const userCapabilities = ROLE_CAPABILITIES[session.role] || [];
  const hasPermission = userCapabilities.includes(capability);

  // 2. OWNER OVERRIDE: God Mode (The only implicit bypass allowed)
  if (session.role === 'OWNER') return true;

  if (!hasPermission) return false;

  // 3. SCOPE CHECK (The "Identity" Fix)
  // If the action is Team-Scoped (e.g., Veto), we MUST check team ownership.
  if (capability === PERM_CAPABILITIES.ACT_AS_CAPTAIN) {
      // 🛡️ CRITICAL FIX: Do not assume identity.id is team_id.
      // The session MUST provide a 'team_id' (resolved from team_members table).
      const userTeamId = session.team_id; 
      
      if (!userTeamId || !context) return false;

      const isParticipant = userTeamId === context.team1_id || userTeamId === context.team2_id;
      
      // If not a participant, check if they have OVERRIDE capability (Admins)
      const hasOverride = userCapabilities.includes(PERM_CAPABILITIES.OVERRIDE_MATCH);

      if (!isParticipant && !hasOverride) return false;
  }

  // 4. STATE GUARD CHECK: Is the action valid for the current state?
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    return guard(context);
  }

  return true;
};
