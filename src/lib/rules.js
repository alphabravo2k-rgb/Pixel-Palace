// 1. MATCH FORMAT ENUM (BO1/BO3/BO5)
export const MATCH_FORMATS = {
  BO1: {
    id: '1', // Must match DB 'best_of' INT
    label: 'Best of 1',
    mapsNeeded: 1,
    vetoCount: 6,
    description: 'Single map elimination.'
  },
  BO3: {
    id: '3',
    label: 'Best of 3',
    mapsNeeded: 3, 
    vetoCount: 4,
    description: 'Standard competitive series.'
  },
  BO5: {
    id: '5',
    label: 'Best of 5',
    mapsNeeded: 5,
    vetoCount: 2,
    description: 'Grand Finals format.'
  }
};

// 2. ROLE TAXONOMY
export const ROLE_TAXONOMY = {
  OWNER: { id: 'OWNER', priority: -1, label: 'Tournament Owner' },
  ADMIN: { id: 'ADMIN', priority: 0, label: 'Administrator' },
  CAPTAIN: { id: 'CAPTAIN', priority: 1, label: 'Team Captain' },
  WILDCARD: { id: 'WILDCARD', priority: 2, label: 'Wildcard Entry' },
  PLAYER: { id: 'PLAYER', priority: 3, label: 'Operator' },
  SUBSTITUTE: { id: 'SUBSTITUTE', priority: 4, label: 'Reserve / Sub' },
  GUEST: { id: 'GUEST', priority: 99, label: 'Spectator' }
};

// 3. TOURNAMENT RULES
export const TOURNAMENT_RULES = {
  ROSTER: {
    MIN_SIZE: 5,
    MAX_SIZE: 7,
    REQUIRES_CAPTAIN: true
  },
  PHASES: {
    REGISTRATION: 'REGISTRATION',
    CHECK_IN: 'CHECK_IN',
    GROUP_STAGE: 'GROUP_STAGE',
    PLAYOFFS: 'PLAYOFFS',
    COMPLETED: 'COMPLETED'
  }
};
