// --- OFFICIAL CS2 MAP POOL & LEGACY SUPPORT ---
// active: true = Available for new vetoes
// active: false = Kept for historical match display only
export const MAP_POOL = [
  { id: 'de_ancient', name: 'Ancient', slug: 'ancient', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_ancient.png', active: true },
  { id: 'de_anubis', name: 'Anubis', slug: 'anubis', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_anubis.png', active: true },
  { id: 'de_inferno', name: 'Inferno', slug: 'inferno', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_inferno.png', active: true },
  { id: 'de_mirage', name: 'Mirage', slug: 'mirage', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_mirage.png', active: true },
  { id: 'de_nuke', name: 'Nuke', slug: 'nuke', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_nuke.png', active: true },
  { id: 'de_dust2', name: 'Dust 2', slug: 'dust-2', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_dust2.png', active: true },
  { id: 'de_train', name: 'Train', slug: 'train', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_train.png', active: true },
  
  // Legacy / Reserve Maps
  { id: 'de_overpass', name: 'Overpass', slug: 'overpass', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_overpass.png', active: false },
  { id: 'de_vertigo', name: 'Vertigo', slug: 'vertigo', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_vertigo.png', active: false }
];

// --- UTILITIES: MAPS ---
export const ACTIVE_MAPS = MAP_POOL.filter(m => m.active);
export const LEGACY_MAPS = MAP_POOL.filter(m => !m.active);

export const getActiveMaps = () => ACTIVE_MAPS;
export const getMapById = (id) => MAP_POOL.find(m => m.id === id) || null;

// Search Helpers
export const getActiveMapBySlug = (slug) => ACTIVE_MAPS.find(m => m.slug === slug) || null;
export const getLegacyMapBySlug = (slug) => LEGACY_MAPS.find(m => m.slug === slug) || null;
export const getMapBySlug = (slug) => MAP_POOL.find(m => m.slug === slug) || null;

// --- REGION MAPPING (ISO-3 to ISO-2) ---
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

// Reverse Map (ISO-2 -> ISO-3 Primary)
export const REVERSE_COUNTRY_MAP = Object.fromEntries(
  Object.entries(COUNTRY_MAP).map(([k, v]) => [v, k])
);

// --- UTILITIES: REGIONS ---
export const normalizeCountry = (code) => COUNTRY_MAP[code?.toUpperCase()] || 'un';
export const getCountryISO3 = (iso2) => REVERSE_COUNTRY_MAP[iso2?.toLowerCase()] || 'UNK';

// --- COMPETITIVE RANKS ---
export const RANKS = [
  'Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master',
  'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master',
  'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite',
  'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master',
  'Supreme Master First Class', 'Global Elite'
];

export const RANKS_OBJ = RANKS.map((r, i) => ({ name: r, level: i }));

// --- UTILITIES: RANKS ---
export const getRankIndex = (rank) => RANKS.indexOf(rank);
export const getRankByIndex = (i) => RANKS[i] || null;
export const compareRanks = (rankA, rankB) => getRankIndex(rankA) - getRankIndex(rankB);

// Convenience comparators
export const isRankHigher = (rankA, rankB) => compareRanks(rankA, rankB) > 0;
export const isRankLower = (rankA, rankB) => compareRanks(rankA, rankB) < 0;


// --- VETO PROTOCOLS (Standard V8) ---
export const VETO_FLOW = { 
  "BO1": [
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" }
    // Last map auto-picked
  ],
  "BO3": [
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "PICK" }, // Team A picks Map 1
    { team: "B", action: "SIDE" }, // Team B picks Side for Map 1
    { team: "B", action: "PICK" }, // Team B picks Map 2
    { team: "A", action: "SIDE" }, // Team A picks Side for Map 2
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" }
    // Last map is Decider
  ],
  "BO5": [
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "PICK" }, { team: "B", action: "SIDE" },
    { team: "B", action: "PICK" }, { team: "A", action: "SIDE" },
    { team: "A", action: "PICK" }, { team: "B", action: "SIDE" },
    { team: "B", action: "PICK" }, { team: "A", action: "SIDE" }
    // Last map is Decider
  ]
};

// --- UTILITIES: VETO ---
export const VETO_LENGTH = {
  BO1: VETO_FLOW.BO1.length + 1, // +1 for auto-pick
  BO3: VETO_FLOW.BO3.length + 1,
  BO5: VETO_FLOW.BO5.length + 1
};

export const getVetoAction = (bo, turnIndex) => {
  const flow = VETO_FLOW[bo] || [];
  return flow[turnIndex] || { team: null, action: 'AUTO' };
};
