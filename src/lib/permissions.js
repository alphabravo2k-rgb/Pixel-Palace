import { ROLES, ROLE_CAPABILITIES, PERMISSIONS, normalizeRole } from './roles';

/**
 * 🚦 MATCH STATUS CONSTANTS
 * (Defining them here keeps this file self-contained, or move to constants.js later)
 */
const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed',
  DISPUTED: 'disputed'
};

// State Guards: The "When" can an action happen?
const STATE_GUARDS = {
  [PERMISSIONS.ACT_AS_CAPTAIN]: (match) => match?.status === MATCH_STATUS.VETO,
  [PERMISSIONS.REPORT_SCORE]: (match) => match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked,
  [PERMISSIONS.MANAGE_MATCH]: (match) => !match?.is_locked
};

/**
 * 🛡️ CENTRAL PERMISSION CHECKER
 * Evaluates Role (RBAC), Scope (Ownership), and State (Match Status)
 * * Usage: if (can(PERMISSIONS.MANAGE_MATCH, session, matchData)) { ... }
 */
export const can = (capability, session, context = null) => {
  // 1. Session Validity Check
  if (!session || !session.user || !session.role) return false;

  const userRole = normalizeRole(session.role);

  // 2. OWNER Override (God Mode)
  // Owners can do anything, anytime, regardless of locks.
  if (userRole === ROLES.OWNER) return true;

  // 3. RBAC: Does this role have this capability?
  const userCapabilities = ROLE_CAPABILITIES[userRole] || [];
  const hasCapability = userCapabilities.includes(capability);
  
  if (!hasCapability) return false;

  // 4. SCOPE CHECK: Is this user allowed to touch this specific object?
  // Example: A Captain can only act on THEIR match, not others.
  if (capability === PERMISSIONS.ACT_AS_CAPTAIN) {
      const userTeamId = session.teamId; 
      
      if (!userTeamId || !context) return false;

      // Check if user's team is part of the match (team1 or team2)
      const isParticipant = userTeamId === context.team1_id || userTeamId === context.team2_id;
      
      if (!isParticipant) return false;
  }

  // 5. STATE GUARD: Is the object in a valid state for this action?
  // Example: Can't vote if the match is already over.
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    // Admins/Owners usually have the power to OVERRIDE state guards
    const hasOverride = userCapabilities.includes(PERMISSIONS.OVERRIDE_MATCH);
    if (!hasOverride) {
        return guard(context);
    }
  }

  return true;
};
