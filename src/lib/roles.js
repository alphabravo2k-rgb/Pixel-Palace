/**
 * 🛡️ PIXEL PALACE: SECURITY GATEWAY
 * --------------------------------
 * This file aggregates the modular security engine into a single import point.
 * This maintains the "Dubai Standard" of separation of concerns while keeping imports simple.
 */

export { ROLES, ROLE_DEF } from './security/definitions';
export { PERMISSIONS, ROLE_CAPABILITIES } from './security/permissions';
export { ROLE_THEMES } from './security/theme';
export { 
  normalizeRole, 
  getClearanceLevel, 
  hasPermission 
} from './security/engine';
