/**
 * Role Normalization Utility
 * ❌ No more duplicate role logic across files.
 * ✅ Centralized definition for easy updates (wildcards, playoffs, etc).
 */
export const normalizeRole = (role) => {
  if (!role) return 'PLAYER';
  
  const r = role.toString().trim().toUpperCase();
  
  if (['CAPTAIN', 'CAPT', 'C'].includes(r)) return 'CAPTAIN';
  if (['SUB', 'SUBSTITUTE', 'S'].includes(r)) return 'SUBSTITUTE';
  
  return 'PLAYER';
};
