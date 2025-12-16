export const MAP_POOL = [
  { id: 'de_ancient', name: 'Ancient', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_ancient.png' },
  { id: 'de_dust2', name: 'Dust 2', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_dust2.png' },
  { id: 'de_inferno', name: 'Inferno', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_inferno.png' },
  { id: 'de_mirage', name: 'Mirage', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_mirage.png' },
  { id: 'de_nuke', name: 'Nuke', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_nuke.png' },
  { id: 'de_overpass', name: 'Overpass', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_overpass.png' },
  { id: 'de_train', name: 'Train', image: 'https://raw.githubusercontent.com/sivert-io/cs2-server-manager/master/map_thumbnails/de_train.png' }
];

export const RANKS = [
  'Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master',
  'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master',
  'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite',
  'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master',
  'Supreme Master First Class', 'Global Elite'
];

// CANONICAL VETO FLOWS (V8 Standard)
export const VETO_FLOW = { 
  "BO1": [
    "A:BAN", "B:BAN", 
    "A:BAN", "B:BAN", 
    "A:BAN", "B:BAN" 
    // Last map is auto-picked
  ],
  "BO3": [
    "A:BAN", "B:BAN", 
    "A:PICK", // Team A picks Map 1
    "B:SIDE", // Team B picks Side for Map 1
    "B:PICK", // Team B picks Map 2
    "A:SIDE", // Team A picks Side for Map 2
    "A:BAN", "B:BAN" 
    // Last map is Decider
  ],
  "BO5": [
    "A:BAN", "B:BAN",
    "A:PICK", "B:SIDE",
    "B:PICK", "A:SIDE",
    "A:PICK", "B:SIDE",
    "B:PICK", "A:SIDE"
    // Last map is Decider
  ]
};
