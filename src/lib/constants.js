/**
 * PIXEL PALACE - SOURCE OF TRUTH
 * Alignment: Master DB Schema & Competitive Standards
 */

// 1. MATCH STATUS (Matches DB Check Constraint exactly)
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  VETO: 'veto',
  LIVE: 'live',
  COMPLETED: 'completed',
  DISPUTED: 'disputed'
};

// 2. MAP POOL (Current Active Duty 7)
// IMPORTANT: Keeps Veto math simple (7 maps - 6 bans = 1 decider)
export const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', image: 'https://img.youtube.com/vi/F91V3V6Qh6U/maxresdefault.jpg' },
  { id: 'de_inferno', name: 'Inferno', image: 'https://blob.faceit.com/static/img/maps/cs2/inferno_bg.jpg' },
  { id: 'de_nuke', name: 'Nuke', image: 'https://blob.faceit.com/static/img/maps/cs2/nuke_bg.jpg' },
  { id: 'de_vertigo', name: 'Vertigo', image: 'https://blob.faceit.com/static/img/maps/cs2/vertigo_bg.jpg' },
  { id: 'de_ancient', name: 'Ancient', image: 'https://blob.faceit.com/static/img/maps/cs2/ancient_bg.jpg' },
  { id: 'de_anubis', name: 'Anubis', image: 'https://blob.faceit.com/static/img/maps/cs2/anubis_bg.jpg' },
  { id: 'de_dust2', name: 'Dust 2', image: 'https://blob.faceit.com/static/img/maps/cs2/dust2_bg.jpg' }
];

// 3. MATCH FORMATS (Veto Logic)
export const MATCH_FORMATS = {
  BO1: {
    id: 1,
    label: 'Best of 1',
    mapsNeeded: 1,
    description: 'Single map elimination.',
    // Logic: 7 Maps -> 6 Bans -> 1 Decider
    sequence: [
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'DECIDER', team: 'SYSTEM' }
    ]
  },
  BO3: {
    id: 3,
    label: 'Best of 3',
    mapsNeeded: 3, 
    description: 'Standard competitive series.',
    // Logic: 7 Maps -> 2 Bans -> 2 Picks -> 2 Bans -> 1 Decider
    sequence: [
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'PICK', team: 'A' }, // Map 1
      { type: 'PICK', team: 'B' }, // Map 2
      { type: 'BAN', team: 'A' },
      { type: 'BAN', team: 'B' },
      { type: 'DECIDER', team: 'SYSTEM' } // Map 3
    ]
  }
};

// 4. ROLE TAXONOMY (Matches DB 'app_admins' & 'team_members')
export const ROLE_TAXONOMY = {
  // Staff Roles (Lowercase in DB)
  OWNER: { id: 'owner', label: 'Tournament Owner' },
  ADMIN: { id: 'admin', label: 'Administrator' },
  CREW: { id: 'crew', label: 'Crew / Observer' },
  
  // Team Roles (Uppercase in DB)
  CAPTAIN: { id: 'CAPTAIN', label: 'Team Captain' },
  PLAYER: { id: 'PLAYER', label: 'Player' },
  SUBSTITUTE: { id: 'SUBSTITUTE', label: 'Substitute' },
  COACH: { id: 'COACH', label: 'Coach' }
};

// 5. HELPER: Safe Map Image Getter
export const getMapImage = (mapId) => {
    const map = MAP_POOL.find(m => m.id === mapId);
    return map ? map.image : 'https://wallpapers.com/images/hd/counter-strike-global-offensive-4k-gaming-poster-u3a3e6q3q6t1v6r1.jpg';
};
