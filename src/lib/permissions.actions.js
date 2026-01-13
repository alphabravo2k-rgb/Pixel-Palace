/**
 * ⚖️ PERMISSION DICTIONARY: THE COMMAND PROTOCOL
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: ENFORCED // TRACEABLE
 */

/**
 * 🛰️ CAPABILITIES (UI & Logic Gates)
 * Used with can(PERM_CAPABILITIES.X) to hide/show UI elements.
 */
export const PERM_CAPABILITIES = {
  // --- Administrative ---
  VIEW_ADMIN_DASHBOARD: 'CAP_VIEW_ADMIN_DASHBOARD',
  VIEW_HIDDEN_DATA:     'CAP_VIEW_HIDDEN',      // IP addresses, server passwords
  MANAGE_TOURNAMENT:    'CAP_MANAGE_TOURNAMENT', // Brackets, Seeding, Settings
  
  // --- Tactical ---
  MANAGE_MATCH:         'CAP_MANAGE_MATCH',     // Pause, Resume, Reset
  OVERRIDE_MATCH:       'CAP_OVERRIDE_MATCH',   // Force win, rollback
  VETO_CONTROL:         'CAP_VETO_CONTROL',     // Manual ban/pick override
  
  // --- Competitive ---
  ACT_AS_CAPTAIN:       'CAP_ACT_AS_CAPTAIN',
  REPORT_SCORE:         'CAP_REPORT_SCORE',
  EDIT_ROSTER:          'CAP_EDIT_ROSTER',
  VIEW_TELEMETRY:       'CAP_VIEW_TELEMETRY'    // Advanced player stats
};

/**
 * 📝 OPERATIONS (Audit & Telemetry)
 * Used in SecurityService.auditLog() to record physical database changes.
 */
export const PERM_OPERATIONS = {
  // --- System Actions ---
  GENERATE_BRACKET:     'OP_GENERATE_BRACKET',
  SYNC_ROSTER:          'OP_SYNC_ROSTER',
  
  // --- Match Actions ---
  FORCE_WIN:            'OP_FORCE_WIN',
  UPDATE_SCORE:         'OP_UPDATE_SCORE',
  SUBMIT_VETO:          'OP_SUBMIT_VETO',
  
  // --- Security Actions ---
  FILE_DISPUTE:         'OP_FILE_DISPUTE',
  BAN_USER:             'OP_BAN_USER',
  VERIFY_IDENTITY:      'OP_VERIFY_IDENTITY'
};

// Freeze to prevent runtime "Shadow Permissions"
Object.freeze(PERM_CAPABILITIES);
Object.freeze(PERM_OPERATIONS);
