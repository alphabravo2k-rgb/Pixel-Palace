/**
 * PIXEL PALACE - SOURCE OF TRUTH
 * Alignment: V2 Backend Standard
 */

// 1. MATCH STATUS (Must match Postgres Enum exactly)
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

// 2. MAP POOL
export const MAP_POOL = {
  de_mirage: { id: 'de_mirage', name: 'Mirage', image: '/maps/mirage.jpg' },
  de_inferno: { id: 'de_inferno', name: 'Inferno', image: '/maps/inferno.jpg' },
  de_nuke: { id: 'de_nuke', name: 'Nuke', image: '/maps/nuke.jpg' },
  de_overpass: { id: 'de_overpass', name: 'Overpass', image: '/maps/overpass.jpg' },
  de_vertigo: { id: 'de_vertigo', name: 'Vertigo', image: '/maps/vertigo.jpg' },
  de_ancient: { id: 'de_ancient', name: 'Ancient', image: '/maps/ancient.jpg' },
  de_anubis: { id: 'de_anubis', name: 'Anubis', image: '/maps/anubis.jpg' },
  de_dust2: { id: 'de_dust2', name: 'Dust 2', image: '/maps/dust2.jpg' },
  de_train: { id: 'de_train', name: 'Train', image: '/maps/train.jpg' }
};

// 3. VETO FLOWS (Explicit Actors)
export const VETO_FLOWS = {
  1: [ // BO1
    { actor: 'TEAM_1', action: 'BAN' },
    { actor: 'TEAM_2', action: 'BAN' },
    { actor: 'TEAM_1', action: 'BAN' },
    { actor: 'TEAM_2', action: 'BAN' },
    { actor: 'TEAM_1', action: 'BAN' },
    { actor: 'TEAM_2', action: 'BAN' },
    { actor: 'TEAM_1', action: 'PICK' }
  ],
  3: [ // BO3
    { actor: 'TEAM_1', action: 'BAN' },
    { actor: 'TEAM_2', action: 'BAN' },
    { actor: 'TEAM_1', action: 'PICK' },
    { actor: 'TEAM_2', action: 'PICK' },
    { actor: 'TEAM_1', action: 'BAN' },
    { actor: 'TEAM_2', action: 'BAN' },
    { actor: 'DECIDER', action: 'PICK' }
  ]
};

// 4. MATCH FORMATS (Derived dynamically to prevent drift)
export const MATCH_FORMATS = {
  1: { 
      id: 1, 
      label: 'Best of 1', 
      mapsNeeded: 1, 
      decisionCount: VETO_FLOWS[1].length 
  },
  3: { 
      id: 3, 
      label: 'Best of 3', 
      mapsNeeded: 3, 
      decisionCount: VETO_FLOWS[3].length 
  }
};
