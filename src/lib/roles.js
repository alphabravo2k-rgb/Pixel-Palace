/**
 * 🛡️ ROLE & PERMISSION MATRIX (RBAC)
 * The central brain for security checks.
 */

// 1. DEFINITIONS (Aligned with DB)
export const ROLES = {
  OWNER: 'owner',     // Full Access
  ADMIN: 'admin',     // Tournament Ops
  CREW: 'crew',       // Read-Only Staff (Casters/Observers)
  CAPTAIN: 'captain', // Team Leader
  PLAYER: 'player',   // Regular User
  GUEST: 'guest'      // Unauthenticated
};

// 2. CAPABILITIES (What can they do?)
export const PERMISSIONS = {
  // Admin Powers
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  MANAGE_TOURNAMENT: 'manage_tournament',   // Start/Stop, Settings
  MANAGE_MATCH: 'manage_match',             // War Room: Set Scores, Servers
  OVERRIDE_MATCH: 'override_match',         // Force Win, Revert Round
  VIEW_HIDDEN_DATA: 'view_hidden_data',     // See Server Passwords/IPs
  
  // User Powers
  ACT_AS_CAPTAIN: 'act_as_captain',
  REPORT_SCORE: 'report_score',
  EDIT_ROSTER: 'edit_roster'
};

// 3. THE MATRIX (Who gets what?)
export const ROLE_CAPABILITIES = {
  [ROLES.OWNER]: [
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.MANAGE_TOURNAMENT,
    PERMISSIONS.MANAGE_MATCH,
    PERMISSIONS.OVERRIDE_MATCH,
    PERMISSIONS.VIEW_HIDDEN_DATA,
    PERMISSIONS.EDIT_ROSTER
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.MANAGE_TOURNAMENT,
    PERMISSIONS.MANAGE_MATCH,
    PERMISSIONS.OVERRIDE_MATCH,
    PERMISSIONS.VIEW_HIDDEN_DATA
  ],
  [ROLES.CREW]: [
    PERMISSIONS.VIEW_ADMIN_DASHBOARD, // Can see dashboard
    PERMISSIONS.VIEW_HIDDEN_DATA      // Can see IPs (for Casting)
    // Cannot Edit/Manage matches
  ],
  [ROLES.CAPTAIN]: [
    PERMISSIONS.ACT_AS_CAPTAIN,
    PERMISSIONS.REPORT_SCORE,
    PERMISSIONS.EDIT_ROSTER
  ],
  [ROLES.PLAYER]: [],
  [ROLES.GUEST]: []
};

// 4. UI THEMES (For Badges & Toolbars)
export const ROLE_THEMES = {
  owner:   { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', label: 'Owner' },
  admin:   { color: 'text-brand-glow', bg: 'bg-brand/10',      border: 'border-brand/50',      label: 'Admin' },
  crew:    { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/50',   label: 'Crew' },
  captain: { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/50',label: 'Captain' },
  player:  { color: 'text-zinc-400',   bg: 'bg-zinc-800',      border: 'border-zinc-700',      label: 'Player' },
  guest:   { color: 'text-zinc-600',   bg: 'bg-transparent',   border: 'border-transparent',   label: 'Guest' }
};

// 5. HELPER: Normalize DB values to constants
export const normalizeRole = (role) => {
  if (!role) return ROLES.GUEST;
  
  const r = role.toString().trim().toLowerCase(); // Always force lowercase
  
  if (['owner', 'host', 'founder'].includes(r)) return ROLES.OWNER;
  if (['admin', 'administrator', 'mod'].includes(r)) return ROLES.ADMIN;
  if (['crew', 'referee', 'observer', 'caster'].includes(r)) return ROLES.CREW;
  if (['captain', 'igl', 'leader'].includes(r)) return ROLES.CAPTAIN;
  if (['player', 'member', 'user'].includes(r)) return ROLES.PLAYER;
  
  return ROLES.GUEST;
};

// 6. HELPER: Check Permission
export const hasPermission = (userRole, permission) => {
    const normalized = normalizeRole(userRole);
    const caps = ROLE_CAPABILITIES[normalized] || [];
    return caps.includes(permission);
};
