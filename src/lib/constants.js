/**
 * PIXEL PALACE - SOURCE OF TRUTH
 * Alignment: Master DB Schema & Competitive Standards
 */

// 1. MATCH STATUS
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed',
  DISPUTED: 'disputed'
};

// 2. MAP POOL (Active Duty 7)
// ✅ Updated to use reliable GitHub raw images (No 403 errors)
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

// 3. MATCH FORMATS
export const MATCH_FORMATS = {
  BO1: {
    id: 1,
    label: 'Best of 1',
    mapsNeeded: 1,
    description: 'Single map elimination.',
    sequence: [
      { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team1' },
      { type: 'BAN', team: 'team2' }, { type: 'BAN', team: 'team2' }, { type: 'BAN', team: 'team2' },
      { type: 'BAN', team: 'team1' }
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
      { type: 'BAN', team: 'team2' }, { type: 'BAN', team: 'team1' }
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
    ]
  }
};

// 4. ROLE TAXONOMY
export const ROLE_TAXONOMY = {
  OWNER: { id: 'owner', label: 'Tournament Owner' },
  ADMIN: { id: 'admin', label: 'Administrator' },
  CREW: { id: 'crew', label: 'Crew / Observer' },
  CAPTAIN: { id: 'CAPTAIN', label: 'Team Captain' },
  PLAYER: { id: 'PLAYER', label: 'Player' },
  SUBSTITUTE: { id: 'SUBSTITUTE', label: 'Substitute' },
  COACH: { id: 'COACH', label: 'Coach' }
};

export const getMapImage = (mapId) => {
    const map = MAP_POOL.find(m => m.id === mapId);
    return map ? map.image : `${CDN_BASE}/random.jpg`;
};
