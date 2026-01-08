/**
 * 🧠 SECURITY ENGINE: THE ENFORCER
 * --------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * PERFORMANCE: O(1) Lookup speeds.
 * SECURITY: Strict default-to-guest policy.
 */

import { ROLE_DEF, ROLES } from './definitions';
import { ROLE_CAPABILITIES } from './permissions';

// 🚀 AUTO-GENERATED LOOKUP MAPS
// Creates: { 'mod': 'admin', 'god': 'owner', 'igl': 'captain' }
const ALIAS_MAP = Object.values(ROLE_DEF).reduce((acc, def) => {
  acc[def.id] = def.id; // Self-map
  def.aliases.forEach(alias => acc[alias] = def.id);
  return acc;
}, {});

// Creates: { 'owner': 100, 'admin': 90 }
const LEVEL_MAP = Object.values(ROLE_DEF).reduce((acc, def) => {
  acc[def.id] = def.level;
  return acc;
}, {});

// 1. NORMALIZE (The Input Filter)
export const normalizeRole = (role) => {
  if (!role) return ROLES.GUEST;
  const clean = String(role).trim().toLowerCase();
  
  // 🛡️ SECURITY PATCH: Default to GUEST, not PLAYER.
  // Unknown entities must be treated as spectators, not combatants.
  return ALIAS_MAP[clean] || ROLES.GUEST; 
};

// 2. CLEARANCE CHECK (The Bouncer)
export const getClearanceLevel = (role) => {
  const normalized = normalizeRole(role);
  return LEVEL_MAP[normalized] || 0;
};

// 3. PERMISSION GUARD (The Keycard)
export const hasPermission = (userRoles, permission) => {
  // Support multi-role users (Array) or single role (String)
  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
  
  // God Mode Bypass (Owner has all keys)
  if (rolesArray.some(r => normalizeRole(r) === ROLES.OWNER)) return true;

  return rolesArray.some(role => {
    const normalized = normalizeRole(role);
    const caps = ROLE_CAPABILITIES[normalized];
    return caps && caps.includes(permission);
  });
};
