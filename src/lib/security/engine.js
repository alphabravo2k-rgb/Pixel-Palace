/**
 * 🧠 SECURITY ENGINE: THE ENFORCER (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // O(1) COMPLEXITY
 */

import { ROLE_DEF, ROLES } from './definitions';
// ⚠️ DEPENDENCY: We must create this file next (see below)
import { ROLE_CAPABILITIES } from './permissions';

// ==========================================
// 🚀 PRE-COMPUTED HASH MAPS (The Memory Bank)
// ==========================================

// Creates: { 'mod': 'admin', 'god': 'owner', 'igl': 'captain' }
const ALIAS_MAP = Object.values(ROLE_DEF).reduce((acc, def) => {
  acc[def.id] = def.id; 
  def.aliases.forEach(alias => acc[alias] = def.id);
  return acc;
}, {});

// Creates: { 'owner': 100, 'admin': 90, 'guest': 0 }
const LEVEL_MAP = Object.values(ROLE_DEF).reduce((acc, def) => {
  acc[def.id] = def.level;
  return acc;
}, {});

// ==========================================
// 🛡️ CORE LOGIC (The Bouncer)
// ==========================================

/**
 * 1. NORMALIZE: Sanitizes any role input into a Master ID.
 * Prevents "Admin" vs "admin" mismatch errors.
 */
export const normalizeRole = (role) => {
  if (!role) return ROLES.GUEST;
  const clean = String(role).trim().toLowerCase();
  return ALIAS_MAP[clean] || ROLES.GUEST; 
};

/**
 * 2. CLEARANCE: Returns the numerical power level (0-100).
 * Useful for "Greater Than" checks (e.g. if (level > 50)).
 */
export const getClearanceLevel = (role) => {
  const normalized = normalizeRole(role);
  return LEVEL_MAP[normalized] || 0;
};

/**
 * 3. THE KEYCARD (can): The primary permission checker.
 * Checks if a specific Role or User has the right to perform an action.
 * Usage: if (can('BAN_USER', user)) ...
 */
export const can = (permission, userOrRole) => {
  // Resolve Role from User Object (supports 'role_id' from DB or 'role' from local state)
  const role = typeof userOrRole === 'object' 
    ? (userOrRole?.role_id || userOrRole?.role) 
    : userOrRole;
    
  const normalized = normalizeRole(role);

  // 👑 SOVEREIGN OVERRIDE: Level 90+ (Admin/Owner) bypasses all checks
  const level = LEVEL_MAP[normalized] || 0;
  if (level >= 90) return true;

  // 🔍 ATOMIC CAPABILITY LOOKUP
  const capabilities = ROLE_CAPABILITIES[normalized];
  return !!(capabilities && capabilities.includes(permission));
};

// Tactical Aliases for readability
export const hasPermission = can;
export const isAuthorized = (role, minLevel) => getClearanceLevel(role) >= minLevel;
