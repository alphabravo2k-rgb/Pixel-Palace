import { ROLES, ROLE_CAPABILITIES, PERMISSIONS, normalizeRole } from './roles';

const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed',
  DISPUTED: 'disputed'
};

const STATE_GUARDS = {
  [PERMISSIONS.ACT_AS_CAPTAIN]: (match) => match?.status === MATCH_STATUS.VETO || match?.status === MATCH_STATUS.SCHEDULED,
  [PERMISSIONS.REPORT_SCORE]: (match) => match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked,
  [PERMISSIONS.MANAGE_MATCH]: (match) => !match?.is_locked
};

export const can = (capability, session, context = null) => {
  // 1. Session Validity Check
  if (!session || !session.role) return false;

  const userRole = normalizeRole(session.role);

  // 2. OWNER Override
  if (userRole === ROLES.OWNER) return true;

  // 3. RBAC Check
  const userCapabilities = ROLE_CAPABILITIES[userRole] || [];
  if (!userCapabilities.includes(capability)) return false;

  // 4. SCOPE CHECK (The Captain Logic)
  if (capability === PERMISSIONS.ACT_AS_CAPTAIN) {
      // Robustly find the Team ID from the session object
      // It might be at session.identity.team_id (new auth) or session.team_id (old auth)
      const userTeamId = session.identity?.team_id || session.team_id || session.user?.user_metadata?.team_id;
      
      if (!userTeamId || !context) return false;

      // Is user's team part of this match?
      const isParticipant = userTeamId === context.team1_id || userTeamId === context.team2_id;
      if (!isParticipant) return false;
  }

  // 5. STATE GUARD
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    const hasOverride = userCapabilities.includes(PERMISSIONS.OVERRIDE_MATCH);
    if (!hasOverride) {
        return guard(context);
    }
  }

  return true;
};
