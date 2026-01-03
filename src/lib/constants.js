/**
 * PIXEL PALACE - SOURCE OF TRUTH
 * Alignment: V2 Backend Standard & Veto Engine
 */

// 1. MATCH STATUS (Must match Postgres Enum exactly)
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed',
  ARCHIVED: 'archived', // ⚡ DB Update Required for this
  DISPUTED: 'disputed'
};

// 2. MAP POOL (Aligned with Backend CHECK constraints)
export const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', image: 'https://img.youtube.com/vi/F91V3V6Qh6U/maxresdefault.jpg' },
  { id: 'de_inferno', name: 'Inferno', image: 'https://blob.faceit.com/static/img/maps/cs2/inferno_bg.jpg' },
  { id: 'de_nuke', name: 'Nuke', image: 'https://blob.faceit.com/static/img/maps/cs2/nuke_bg.jpg' },
  { id: 'de_overpass', name: 'Overpass', image: 'https://blob.faceit.com/static/img/maps/cs2/overpass_bg.jpg' },
  { id: 'de_vertigo', name: 'Vertigo', image: 'https://blob.faceit.com/static/img/maps/cs2/vertigo_bg.jpg' },
  { id: 'de_ancient', name: 'Ancient', image: 'https://blob.faceit.com/static/img/maps/cs2/ancient_bg.jpg' },
  { id: 'de_anubis', name: 'Anubis', image: 'https://blob.faceit.com/static/img/maps/cs2/anubis_bg.jpg' },
  { id: 'de_dust2', name: 'Dust 2', image: 'https://blob.faceit.com/static/img/maps/cs2/dust2_bg.jpg' },
  { id: 'de_train', name: 'Train', image: 'https://blob.faceit.com/static/img/maps/cs2/train_bg.jpg' }
];

// 3. MATCH FORMATS (Updated with Veto Sequences)
export const MATCH_FORMATS = {
  BO1: {
    id: 1, // Matches DB INT 'best_of'
    label: 'Best of 1',
    mapsNeeded: 1,
    description: 'Single map elimination.',
    // ⚡ REQUIRED FOR VETO ENGINE:
    sequence: [
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'DECIDER', team: 'SYSTEM' } // The last map left
    ]
  },
  BO3: {
    id: 3,
    label: 'Best of 3',
    mapsNeeded: 3, 
    description: 'Standard competitive series.',
    // ⚡ REQUIRED FOR VETO ENGINE:
    sequence: [
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'PICK', team: 'A' }, // Map 1
      { type: 'PICK', team: 'B' }, // Map 2
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'DECIDER', team: 'SYSTEM' } // Map 3
    ]
  },
  BO5: {
    id: 5,
    label: 'Best of 5',
    mapsNeeded: 5,
    description: 'Grand Finals format.',
    sequence: [
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'PICK', team: 'A' },
      { type: 'PICK', team: 'B' },
      { type: 'PICK', team: 'A' },
      { type: 'PICK', team: 'B' },
      { type: 'DECIDER', team: 'SYSTEM' }
    ]
  }
};

// 4. ROLE TAXONOMY (Expanded for V2)
export const ROLE_TAXONOMY = {
  OWNER: { id: 'OWNER', priority: -1, label: 'Tournament Owner' },
  ADMIN: { id: 'ADMIN', priority: 0, label: 'Administrator' },
  REFEREE: { id: 'REFEREE', priority: 0, label: 'Match Referee' },
  CAPTAIN: { id: 'CAPTAIN', priority: 1, label: 'Team Captain' },
  WILDCARD: { id: 'WILDCARD', priority: 2, label: 'Wildcard Entry' },
  PLAYER: { id: 'PLAYER', priority: 3, label: 'Operator' },
  SUBSTITUTE: { id: 'SUBSTITUTE', priority: 4, label: 'Reserve / Sub' },
  GUEST: { id: 'GUEST', priority: 99, label: 'Spectator' }
};

// 5. TOURNAMENT RULES
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

// 🛠️ HELPER: Safe Map Image Getter
export const getMapImage = (mapId) => {
    const map = MAP_POOL.find(m => m.id === mapId);
    return map ? map.image : 'https://wallpapers.com/images/hd/counter-strike-global-offensive-4k-gaming-poster-u3a3e6q3q6t1v6r1.jpg'; // Fallback Generic CS2 Image
};
