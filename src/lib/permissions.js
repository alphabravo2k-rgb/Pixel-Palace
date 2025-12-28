import { ROLE_CAPABILITIES } from './roles';
import { MATCH_STATUS } from './constants';
import { PERM_CAPABILITIES } from './permissions.actions';

const STATE_GUARDS = {
  [PERM_CAPABILITIES.ACT_AS_CAPTAIN]: (match) => match?.status === MATCH_STATUS.VETO,
  [PERM_CAPABILITIES.REPORT_SCORE]: (match) => match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked,
  [PERM_CAPABILITIES.MANAGE_MATCH]: (match) => !match?.is_locked
};

export const can = (capability, session, context = null) => {
  if (!session || !session.isAuthenticated || !session.role) return false;

  // 1. RBAC CHECK
  const userCapabilities = ROLE_CAPABILITIES[session.role] || [];
  const hasPermission = userCapabilities.includes(capability);

  // 2. OWNER OVERRIDE (Only if role is verified by session hydration)
  // We trust session.role ONLY because it comes from our secure session_profiles view
  if (session.role === 'OWNER') return true;
  
  if (!hasPermission) return false;

  // 3. SCOPE CHECK (Context Awareness)
  if (capability === PERM_CAPABILITIES.ACT_AS_CAPTAIN) {
      const userTeamId = session.team_id; 
      if (!userTeamId || !context) return false;

      // Are they actually playing in this match?
      const isParticipant = userTeamId === context.team1_id || userTeamId === context.team2_id;
      // Admins with override capability can bypass participation check
      const hasOverride = userCapabilities.includes(PERM_CAPABILITIES.OVERRIDE_MATCH);

      if (!isParticipant && !hasOverride) return false;
  }

  // 4. STATE GUARD
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    const hasOverride = userCapabilities.includes(PERM_CAPABILITIES.OVERRIDE_MATCH);
    if (!hasOverride) return guard(context);
  }

  return true;
};
