export const can = (action, session, context = {}) => {
  try {
    if (!session || !session.isAuthenticated) return false;
    
    // 🛡️ THE GOD-MODE OVERRIDE (Upper-case for safety)
    const sessionRole = session.role?.toUpperCase();
    if (sessionRole === 'OWNER') return true; 

    // 1. Role Check
    const allowedActions = ROLE_PERMISSIONS[sessionRole] || [];
    const hasPermission = allowedActions.includes(action) || allowedActions.includes('*');
    
    if (!hasPermission) return false;

    // 2. State Check (If match context provided)
    if (context.match) {
      const allowedStates = STATE_GUARDS[action];
      if (allowedStates && !allowedStates.includes(context.match.status)) {
        return false;
      }
    }

    // 3. Scope Check (Ownership for Captains)
    if ([PERM_ACTIONS.VETO_ACT].includes(action)) {
      const userTeamId = session.identity?.id; 
      if (!userTeamId || !context.match) return false;

      const isParticipant = userTeamId === context.match.team1_id || userTeamId === context.match.team2_id;
      // Admins/Owners bypass this check via the God-Mode above, 
      // but we keep this logic for Captains.
      if (!isParticipant) return false;
    }

    return true;
  } catch (err) {
    console.error("Permission Check Failed:", err);
    return false;
  }
};
