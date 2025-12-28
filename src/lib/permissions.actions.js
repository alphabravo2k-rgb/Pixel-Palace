/**
 * PERMISSION DICTIONARY (STRICT)
 * Single Source of Truth for Action Keys.
 */

// 1. CAPABILITIES (Used in checks: can(CAPABILITY))
export const PERM_CAPABILITIES = {
  // Tournament Level
  MANAGE_TOURNAMENT: 'CAP_MANAGE_TOURNAMENT', // Sync, Bracket, Settings
  VIEW_HIDDEN_DATA: 'CAP_VIEW_HIDDEN',       // IP logs, raw roster data

  // Match Level
  MANAGE_MATCH: 'CAP_MANAGE_MATCH',          // Reset, Force Win, Update Score
  OVERRIDE_MATCH: 'CAP_OVERRIDE_MATCH',      // Unlock, Force State Change (Admins Only)
  
  // Participant Level
  ACT_AS_CAPTAIN: 'CAP_ACT_AS_CAPTAIN',      // Veto, Dispute
  REPORT_SCORE: 'CAP_REPORT_SCORE'           // Self-reporting
};

// 2. OPERATIONS (Used in logs/RPC calls only)
export const PERM_OPERATIONS = {
  SYNC_ROSTER: 'OP_SYNC_ROSTER',
  GENERATE_BRACKET: 'OP_GENERATE_BRACKET',
  FORCE_WIN: 'OP_FORCE_WIN',
  UPDATE_SCORE: 'OP_UPDATE_SCORE',
  SUBMIT_VETO: 'OP_SUBMIT_VETO',
  FILE_DISPUTE: 'OP_FILE_DISPUTE'
};
