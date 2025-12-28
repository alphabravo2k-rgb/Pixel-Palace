import { ROLE_CAPABILITIES } from './roles';
import { MATCH_STATUS } from './constants';
import { PERM_CAPABILITIES } from './permissions.actions';

/**
 * STATE GUARDS
 * Defines when an action is ILLEGAL regardless of role.
 * e.g., You cannot Veto if the match is Completed.
 */
const STATE_GUARDS = {
  [PERM_CAPABILITIES.ACT_AS_CAPTAIN]: (match) => {
    // Can only act if match is in VETO phase
    return match?.status === MATCH_STATUS.VETO;
  },
  [PERM_CAPABILITIES.REPORT_SCORE]: (match) => {
    // Can only report if match is LIVE or SCHEDULED (not completed)
    return match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked;
  },
  [PERM_CAPABILITIES.MANAGE_MATCH]: (match) => {
    // Admins can manage anytime unless locked by higher power
    return true; 
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

  // 1. OWNER OVERRIDE: God Mode
  if (session.role === 'OWNER') return true;

  // 2. RBAC CHECK: Does the role have the capability?
  const userCapabilities = ROLE_CAPABILITIES[session.role] || [];
  const hasPermission = userCapabilities.includes(capability);

  if (!hasPermission) return false;

  // 3. STATE GUARD CHECK: Is the action valid for the current state?
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    return guard(context);
  }

  return true;
};
