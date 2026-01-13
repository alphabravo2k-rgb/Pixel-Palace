/**
 * 🏛️ PIXEL PALACE: SOURCE OF TRUTH
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: LOCKED // PRODUCTION READY
 */

// 1. MATCH STATUS (Lifecycle States)
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled', // Awaiting players
  VETO: 'veto',           // Strategy phase
  LIVE: 'live',           // Active on server
  COMPLETED: 'completed', // Result recorded
  DISPUTED: 'disputed',   // Under Admin review
  CANCELLED: 'cancelled'
};

// 2. MAP POOL (Active Duty 7 - CS2 Standards)
const CDN_BASE = "https://raw.githubusercontent.com/Marocco2/cs2-map-images/main/images";

export const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', image: `${CDN_BASE}/mirage.jpg` },
  { id: 'de_inferno', name: 'Inferno', image: `${CDN_BASE}/inferno.jpg` },
  { id: 'de_nuke', name: 'Nuke', image: `${CDN_BASE}/nuke.jpg` },
  { id: 'de_vertigo', name: 'Vertigo', image: `${CDN_BASE}/vertigo.jpg` },
  { id: 'de_ancient', name: 'Ancient', image: `${CDN_BASE}/ancient.jpg` },
  { id: 'de_anubis', name: 'Anubis', image: `${CDN_BASE}/anubis.jpg` },
  { id: 'de_dust2', name: 'Dust 2', image: `${CDN_BASE}/dust2.jpg` }
];

// 3. COMPETITIVE SEQUENCES (The Veto Logic)
// Sequence defines the turn order for the Automated Veto Engine.
export const MATCH_FORMATS = {
  BO1: {
    id: 1,
    label: 'Best of 1',
    mapsNeeded: 1,
    description: 'Single map elimination.',
    sequence: [
      { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team2' },
      { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team2' },
      { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team2' }
      // Result: 1 Map remains (Decider)
    ]
  },
  BO3: {
    id: 3,
    label: 'Best of 3',
    mapsNeeded: 3,
    description: 'Standard competitive series.',
    sequence: [
      { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team2' },
      { type: 'PICK', team: 'team1' }, { type: 'PICK', team: 'team2' },
      { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team2' }
      // Result: 2 Picks + 1 Decider = 3 Maps
    ]
  },
  BO5: {
    id: 5,
    label: 'Best of 5',
    mapsNeeded: 5,
    description: 'Grand Finals format.',
    sequence: [
      { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team2' },
      { type: 'PICK', team: 'team1' }, { type: 'PICK', team: 'team2' },
      { type: 'PICK', team: 'team1' }, { type: 'PICK', team: 'team2' }
      // Result: 4 Picks + 1 Decider = 5 Maps
    ]
  }
};

/**
 * 🛠️ UTILS: TACTICAL ASSET RESOLVER
 */
export const getMapImage = (mapId) => {
  const map = MAP_POOL.find(m => m.id === mapId);
  return map ? map.image : `${CDN_BASE}/random.jpg`;
};

export const getMapName = (mapId) => {
  const map = MAP_POOL.find(m => m.id === mapId);
  return map ? map.name : 'Unknown Sector';
};
