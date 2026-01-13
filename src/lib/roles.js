/**
 * 🛡️ PIXEL PALACE: SECURITY GATEWAY (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // AGGREGATED
 * --------------------------------------------------
 * This is the primary entry point for all Role/Permission logic.
 * Use this to keep your component imports clean and tactical.
 */

// 1. DATA & HIERARCHY
export { ROLES, ROLE_DEF } from './security/definitions';

// 2. THE LAW (CAPABILITIES)
export { PERMISSIONS, ROLE_CAPABILITIES } from './security/permissions';

// 3. THE UNIFORMS (VISUALS)
export { ROLE_THEMES, getRoleTheme } from './security/theme';

// 4. THE ENFORCER (LOGIC)
export { 
  normalizeRole, 
  getClearanceLevel, 
  can,             // Primary Permission Check
  hasPermission,   // Legacy Alias
  isAuthorized     // Level-based check
} from './security/engine';

/**
 * 💡 TACTICAL USAGE EXAMPLE:
 * import { can, PERMISSIONS, getRoleTheme } from '../lib/roles';
 * * const theme = getRoleTheme(user.role);
 * if (can(PERMISSIONS.MANAGE_MATCH, user)) { ... }
 */
