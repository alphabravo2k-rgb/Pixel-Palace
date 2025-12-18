// --- OFFICIAL CS2 MAP POOL ---
export const MAP_POOL = [
  { id: 'de_ancient', name: 'Ancient', slug: 'ancient', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_ancient.png', active: true },
  { id: 'de_anubis', name: 'Anubis', slug: 'anubis', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_anubis.png', active: true },
  { id: 'de_inferno', name: 'Inferno', slug: 'inferno', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_inferno.png', active: true },
  { id: 'de_mirage', name: 'Mirage', slug: 'mirage', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_mirage.png', active: true },
  { id: 'de_nuke', name: 'Nuke', slug: 'nuke', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_nuke.png', active: true },
  { id: 'de_dust2', name: 'Dust 2', slug: 'dust-2', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_dust2.png', active: true },
  { id: 'de_train', name: 'Train', slug: 'train', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_train.png', active: true },
  { id: 'de_overpass', name: 'Overpass', slug: 'overpass', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_overpass.png', active: false },
  { id: 'de_vertigo', name: 'Vertigo', slug: 'vertigo', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_vertigo.png', active: false }
];

// --- PERMISSION ACTION CONSTANTS ---
export const PERM_ACTIONS = {
  // Match Operations
  MATCH_UPDATE: 'match.update',
  MATCH_FORCE_WIN: 'match.force_win',
  MATCH_PAUSE: 'match.pause',
  MATCH_RESUME: 'match.resume',
  
  // Veto
  VETO_ACT: 'match.veto.act',
  VETO_OVERRIDE: 'match.veto.override',
  
  // Sensitive Data
  VIEW_SERVER_IP: 'server.view_connect',
  VIEW_SENSITIVE: 'server.view_sensitive',
  
  // Disputes
  DISPUTE_RAISE: 'match.dispute'
};

// --- REGION MAPPING ---
export const COUNTRY_MAP = {
  'PAK': 'pk', 'PK': 'pk', 'PAKISTAN': 'pk',
  'IND': 'in', 'IN': 'in', 'INDIA': 'in',
  'IRN': 'ir', 'IR': 'ir', 'IRAN': 'ir',
  'UAE': 'ae', 'AE': 'ae',
  'SAU': 'sa', 'SA': 'sa',
  'BAN': 'bd', 'BD': 'bd',
  'AFG': 'af', 'AF': 'af',
  'LKA': 'lk', 'LK': 'lk',
  'NPL': 'np', 'NP': 'np'
};

// --- VETO FLOW (Standard Competitive) ---
export const VETO_FLOW = { 
  "BO1": [
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" }
  ],
  "BO3": [
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "PICK" }, { team: "B", action: "SIDE" },
    { team: "B", action: "PICK" }, { team: "A", action: "SIDE" },
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" }
  ],
  "BO5": [
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "PICK" }, { team: "B", action: "SIDE" },
    { team: "B", action: "PICK" }, { team: "A", action: "SIDE" },
    { team: "A", action: "PICK" }, { team: "B", action: "SIDE" },
    { team: "B", action: "PICK" }, { team: "A", action: "SIDE" }
  ]
};
