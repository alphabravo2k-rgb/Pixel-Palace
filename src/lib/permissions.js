import { ROLE_CAPABILITIES } from './roles';
import { MATCH_STATUS } from './constants';
import { PERM_CAPABILITIES } from './permissions.actions';

/**
 * STATE GUARDS
 * Defines when an action is ILLEGAL regardless of role.
 */
const STATE_GUARDS = {
  [PERM_CAPABILITIES.ACT_AS_CAPTAIN]: (match) => {
    // Strict Phase Check: Veto only allowed in VETO status
    return match?.status === MATCH_STATUS.VETO;
  },
  [PERM_CAPABILITIES.REPORT_SCORE]: (match) => {
    // Can only report active matches
    return match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked;
  },
  [PERM_CAPABILITIES.MANAGE_MATCH]: (match) => {
    // Admins cannot touch locked matches without unlocking them first
    // (Unless they have OVERRIDE_MATCH, handled in logic below)
    return !match?.is_locked; 
  }
};

/**
 * THE ENFORCER
 * @param {string} capability - One of PERM_CAPABILITIES
 * @param {object} session - Must contain { role, team_id }
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
  if (capability === PERM_CAPABILITIES.ACT_AS_CAPTAIN) {
      // 🛡️ CRITICAL FIX: Explicit Team ID Check
      const userTeamId = session.team_id; 
      
      if (!userTeamId || !context) return false;

      const isParticipant = userTeamId === context.team1_id || userTeamId === context.team2_id;
      
      // Explicit Override Check (No hardcoded 'ADMIN' string)
      const hasOverride = userCapabilities.includes(PERM_CAPABILITIES.OVERRIDE_MATCH);

      if (!isParticipant && !hasOverride) return false;
  }

  // 4. STATE GUARD CHECK
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    // Admins with OVERRIDE capability bypass State Guards (e.g., can edit locked match)
    const hasOverride = userCapabilities.includes(PERM_CAPABILITIES.OVERRIDE_MATCH);
    if (!hasOverride) {
       return guard(context);
    }
  }

  return true;
};
