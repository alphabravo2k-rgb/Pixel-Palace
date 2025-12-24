/**
 * 4️⃣ Architecture-Level Truth
 * This file models competition rules, not just UI data.
 * It is the single source of truth for scaling tournament logic.
 */

// ------------------------------------------------------------------
// 1. MATCH FORMAT ENUM (BO1/BO3/BO5)
// ------------------------------------------------------------------
export const MATCH_FORMATS = {
  BO1: {
    id: 'BO1',
    label: 'Best of 1',
    mapsNeeded: 1,
    vetoCount: 6, // 7 maps - 1 pick = 6 bans
    description: 'Single map elimination.'
  },
  BO3: {
    id: 'BO3',
    label: 'Best of 3',
    mapsNeeded: 3, // 2 wins needed, but 3 maps drafted (Pick/Pick/Decider)
    vetoCount: 4, // 7 maps - 3 picks = 4 bans
    description: 'Standard competitive series.'
  },
  BO5: {
    id: 'BO5',
    label: 'Best of 5',
    mapsNeeded: 5,
    vetoCount: 2,
    description: 'Grand Finals format.'
  }
};

// ------------------------------------------------------------------
// 2. ROLE TAXONOMY (Expandable)
// ------------------------------------------------------------------
// Centralized priority list for sorting and permissions.
// Lower number = Higher Priority in UI/Logic.
export const ROLE_TAXONOMY = {
  OWNER: { id: 'OWNER', priority: -1, label: 'Tournament Owner' },
  ADMIN: { id: 'ADMIN', priority: 0, label: 'Administrator' },
  
  // Competitive Roles
  CAPTAIN: { id: 'CAPTAIN', priority: 1, label: 'Team Captain' },
  WILDCARD: { id: 'WILDCARD', priority: 2, label: 'Wildcard Entry' },
  PLAYER: { id: 'PLAYER', priority: 3, label: 'Operator' },
  SUBSTITUTE: { id: 'SUBSTITUTE', priority: 4, label: 'Reserve / Sub' },
  
  // Fallback
  GUEST: { id: 'GUEST', priority: 99, label: 'Spectator' }
};

// Helper to get priority safely
export const getRolePriority = (roleString) => {
  const key = roleString?.toUpperCase()?.trim();
  return ROLE_TAXONOMY[key]?.priority ?? 99;
};

// ------------------------------------------------------------------
// 3. TOURNAMENT RULES OBJECT
// ------------------------------------------------------------------
// Defines the constraints for a valid tournament.
// This prevents "logic fragmentation" across components.
export const TOURNAMENT_RULES = {
  // Roster Constraints
  ROSTER: {
    MIN_SIZE: 5,
    MAX_SIZE: 7, // 5 Main + 2 Subs
    REQUIRES_CAPTAIN: true,
    ALLOW_Emergency_SUB: true
  },
  
  // Phase Definitions
  PHASES: {
    REGISTRATION: 'REGISTRATION',
    CHECK_IN: 'CHECK_IN',
    GROUP_STAGE: 'GROUP_STAGE',
    PLAYOFFS: 'PLAYOFFS',
    COMPLETED: 'COMPLETED'
  },

  // Scoring / Ranking
  SCORING: {
    WIN_POINTS: 3,
    DRAW_POINTS: 1,
    LOSS_POINTS: 0
  },
  
  // Default Configuration
  DEFAULTS: {
    matchFormat: MATCH_FORMATS.BO1,
    teamSize: 5,
    mapPool: ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox', 'Breeze', 'Fracture'] // Standard Pool
  }
};
