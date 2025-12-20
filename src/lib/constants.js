// --- PERMISSION CONSTANTS (The missing link) ---
export const PERM_ACTIONS = {
  MATCH_UPDATE: 'match.update',
  MATCH_FORCE_WIN: 'match.force_win',
  VETO_OVERRIDE: 'veto.override',
  VIEW_SENSITIVE: 'view.sensitive',
  VETO_ACT: 'veto.act',
  VIEW_SERVER_IP: 'server.ip.view',
  DISPUTE_RAISE: 'dispute.raise'
};

// --- MAP POOL (High Res) ---
export const MAP_POOL = [
  { id: 'de_ancient', name: 'Ancient', image: 'https://img.cdn-thg.com/v1/page/4235226c-da5c-4394-8149-6f9202422207/Ancient_CS2.jpg' },
  { id: 'de_anubis', name: 'Anubis', image: 'https://img.cdn-thg.com/v1/page/39665670-8025-4c07-8890-a7d0832a517e/Anubis_CS2.jpg' },
  { id: 'de_dust2', name: 'Dust 2', image: 'https://img.cdn-thg.com/v1/page/6d36e232-a396-4448-b427-023a4993952f/Dust2_CS2.jpg' },
  { id: 'de_inferno', name: 'Inferno', image: 'https://img.cdn-thg.com/v1/page/2b425b03-9993-41c3-9824-3a4a796696d0/Inferno_CS2.jpg' },
  { id: 'de_mirage', name: 'Mirage', image: 'https://img.cdn-thg.com/v1/page/876d705d-639a-412f-9818-da0256d09c2d/Mirage_CS2.jpg' },
  { id: 'de_nuke', name: 'Nuke', image: 'https://img.cdn-thg.com/v1/page/7c865264-8844-4235-9054-04663126743c/Nuke_CS2.jpg' },
  { id: 'de_overpass', name: 'Overpass', image: 'https://img.cdn-thg.com/v1/page/370d046c-c72e-48cb-a719-2196023308ba/Overpass_CS2.jpg' },
  { id: 'de_train', name: 'Train', image: 'https://cdn.akamai.steamstatic.com/apps/csgo/images/train/train_clean.jpg' },
  { id: 'de_vertigo', name: 'Vertigo', image: 'https://img.cdn-thg.com/v1/page/202613c2-d3f3-4d43-85f0-61d76372d627/Vertigo_CS2.jpg' }
];

export const RANKS = [
  'Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master',
  'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master',
  'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite',
  'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master',
  'Supreme Master First Class', 'Global Elite'
];

export const VETO_FLOW = { 
  "BO1": [ "A:BAN", "B:BAN", "A:BAN", "B:BAN", "A:BAN", "B:BAN" ], 
  "BO3": [ "A:BAN", "B:BAN", "A:PICK", "B:PICK", "A:BAN", "B:BAN" ], 
  "BO5": [ "A:BAN", "B:BAN", "A:PICK", "B:PICK", "A:PICK", "B:PICK" ] 
};
