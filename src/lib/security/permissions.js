/**
 * ⚖️ PERMISSION MATRIX: THE SOVEREIGN CODE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: ENFORCED // ATOMIC
 */

import { ROLES } from './definitions';

// 1. ATOMIC CAPABILITIES (The Keycards)
export const PERMISSIONS = {
  // 🛰️ INFRASTRUCTURE & INTEL
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_IP_RECORDS: 'view_ip_records',   // Sensitive server data
  MANAGE_USERS: 'manage_users',         // Ban/Unban/Verify
  
  // 🏆 TOURNAMENT COMMAND
  MANAGE_TOURNAMENT: 'manage_tournament',
  MANAGE_BRACKET: 'manage_bracket',
  FORCE_WIN: 'force_win',               // Overriding score manually
  
  // ⚔️ MATCH OPERATIONS
  MANAGE_MATCH: 'manage_match',         // Pause/Resume/Start
  VETO_OVERRIDE: 'veto_override',       // Manually banning/picking
  BROADCAST_ACCESS: 'broadcast_access', // GOTV/Spectator data
  
  // 🛡️ TEAM & IDENTITY
  ACT_AS_CAPTAIN: 'act_as_captain',
  EDIT_ROSTER: 'edit_roster',
  UPLOAD_ASSETS: 'upload_assets',       // Team logos/Player banners
  VIEW_ANALYTICS: 'view_analytics'      // Deep ELO/Stat tracking
};

// 2. INHERITANCE KERNELS (The Blocks)
// Grouping permissions so they can be distributed efficiently.
const STAFF_CORE = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_ANALYTICS,
  PERMISSIONS.VIEW_IP_RECORDS
];

const COMPETITIVE_CORE = [
  PERMISSIONS.ACT_AS_CAPTAIN,
  PERMISSIONS.EDIT_ROSTER,
  PERMISSIONS.UPLOAD_ASSETS
];

// 3. THE MASTER ASSIGNMENT MATRIX
export const ROLE_CAPABILITIES = {
  // 👑 GOD-MODE: Full Array Access
  [ROLES.OWNER]: Object.values(PERMISSIONS),

  // 🛡️ ADMINISTRATION
  [ROLES.ADMIN]: [
    ...STAFF_CORE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_TOURNAMENT,
    PERMISSIONS.MANAGE_MATCH,
    PERMISSIONS.FORCE_WIN,
    PERMISSIONS.VETO_OVERRIDE
  ],

  // 🏟️ ORGANIZER
  [ROLES.ORGANIZER]: [
    ...STAFF_CORE,
    PERMISSIONS.MANAGE_TOURNAMENT,
    PERMISSIONS.MANAGE_BRACKET
  ],

  // 🎥 MEDIA / CASTING
  [ROLES.CASTER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.BROADCAST_ACCESS,
    PERMISSIONS.VIEW_ANALYTICS
  ],

  // 🏁 MATCH CREW (Referees)
  [ROLES.CREW]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_MATCH,
    PERMISSIONS.VIEW_IP_RECORDS
  ],

  // 🎖️ COMPETITORS
  [ROLES.CAPTAIN]: [...COMPETITIVE_CORE],
  [ROLES.PLAYER]: [PERMISSIONS.UPLOAD_ASSETS, PERMISSIONS.VIEW_ANALYTICS],
  
  // 👤 PUBLIC
  [ROLES.SPECTATOR]: [PERMISSIONS.VIEW_ANALYTICS],
  [ROLES.GUEST]: []
};

// Freeze to prevent runtime injection of permissions
Object.freeze(PERMISSIONS);
Object.freeze(ROLE_CAPABILITIES);
