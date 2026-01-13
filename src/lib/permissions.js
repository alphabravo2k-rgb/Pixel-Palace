/**
 * ⚖️ PERMISSION ENGINE: THE STATE ENFORCER
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // CONTEXT-AWARE
 */

// Import from the Security Core we built previously
import { ROLES, normalizeRole } from './security/definitions';
import { ROLE_CAPABILITIES, PERMISSIONS } from './security/permissions';

const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed',
  DISPUTED: 'disputed'
};

/**
 * 🛡️ STATE GUARDS (Contextual Physics)
 * Logic that prevents actions based on the "Current Reality" of a match.
 */
const STATE_GUARDS = {
  // Captains can only act during the Strategy (Veto) or Prep phases
  [PERMISSIONS.ACT_AS_CAPTAIN]: (match) => 
    [MATCH_STATUS.SCHEDULED, MATCH_STATUS.VETO].includes(match?.status),
  
  // Scores cannot be altered once the match is officially finalized or locked
  [PERMISSIONS.REPORT_SCORE]: (match) => 
    match?.status !== MATCH_STATUS.COMPLETED && !match?.is_locked,
    
  // Match management (Pausing/Restarts) is disabled if the match is archived
  [PERMISSIONS.MANAGE_MATCH]: (match) => !match?.is_locked
};

/**
 * 🧠 THE MASTER PERMISSION GATE (can)
 * Evaluates Role + Capability + Scope + State.
 * * @param {string} capability - The permission string (e.g. 'manage_match')
 * @param {object} session - The user session object (must contain role/identity)
 * @param {object|null} context - The target object (Match, Team, etc.)
 */
export const can = (capability, session, context = null) => {
  // 1. IDENTITY HANDSHAKE
  if (!session || !session.role) return false;
  const userRole = normalizeRole(session.role);

  // 2. 👑 SOVEREIGN OVERRIDE (Owner/Admin God Mode)
  // Owner level (100) or Admin level (90) bypass standard checks
  if (userRole === ROLES.OWNER || userRole === ROLES.ADMIN) return true;

  // 3. RBAC (Role-Based Access Control)
  const userCapabilities = ROLE_CAPABILITIES[userRole] || [];
  if (!userCapabilities.includes(capability)) return false;

  // 4. 🎯 SCOPE VALIDATION (The "My Team" Rule)
  if (capability === PERMISSIONS.ACT_AS_CAPTAIN || capability === PERMISSIONS.REPORT_SCORE) {
    // Robustly find Team ID (Support new Identity Auth or Legacy Auth)
    const userTeamId = session.identity?.team_id || session.team_id || session.user?.user_metadata?.team_id;
    
    // If we're checking a match-specific action, verify the user belongs to a competing team
    if (context && (context.team1_id || context.team2_id)) {
      const isParticipant = userTeamId === context.team1_id || userTeamId === context.team2_id;
      if (!isParticipant) return false;
    }
  }

  // 5. ⏳ STATE ENFORCEMENT
  // Even if you are a Captain, you can't veto if the match state isn't 'VETO'
  const guard = STATE_GUARDS[capability];
  if (guard && context) {
    // Admins with OVERRIDE_MATCH capability can bypass State Guards
    const canOverride = userCapabilities.includes(PERMISSIONS.OVERRIDE_MATCH);
    if (!canOverride) {
      return guard(context);
    }
  }

  return true;
};
