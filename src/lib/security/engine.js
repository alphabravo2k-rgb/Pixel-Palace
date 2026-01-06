/**
 * 🧠 SECURITY ENGINE
 * The mathematical core that validates identity and clearance.
 * O(1) Lookup speeds for maximum performance.
 */

import { ROLE_DEF, ROLES } from './definitions';
import { ROLE_CAPABILITIES } from './permissions';

// 🚀 AUTO-GENERATED LOOKUP MAPS
// Creates a map like: { 'mod': 'admin', 'god': 'owner', 'igl': 'captain' }
const ALIAS_MAP = Object.values(ROLE_DEF).reduce((acc, def) => {
  acc[def.id] = def.id; // Self-map
  def.aliases.forEach(alias => acc[alias] = def.id);
  return acc;
}, {});

// Creates a map like: { 'owner': 100, 'admin': 90 }
const LEVEL_MAP = Object.values(ROLE_DEF).reduce((acc, def) => {
  acc[def.id] = def.level;
  return acc;
}, {});

// 1. NORMALIZE (The Input Filter)
export const normalizeRole = (role) => {
  if (!role) return ROLES.GUEST;
  const clean = String(role).trim().toLowerCase();
  return ALIAS_MAP[clean] || ROLES.PLAYER; // Default to Player if unknown
};

// 2. CLEARANCE CHECK (The Bouncer)
export const getClearanceLevel = (role) => {
  const normalized = normalizeRole(role);
  return LEVEL_MAP[normalized] || 0;
};

// 3. PERMISSION GUARD (The Keycard)
export const hasPermission = (userRoles, permission) => {
  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
  
  return rolesArray.some(role => {
    const normalized = normalizeRole(role);
    const caps = ROLE_CAPABILITIES[normalized];
    return caps && caps.includes(permission);
  });
};
