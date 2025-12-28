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
  ARCHIVED: 'archived' // Optional, if you use it
};

// 2. MAP POOL (CS2 Active Duty)
export const MAP_POOL = {
  de_mirage: { id: 'de_mirage', name: 'Mirage', image: 'https://img.cdn-thg.com/v1/page/876d705d-639a-412f-9818-da0256d09c2d/Mirage_CS2.jpg' },
  de_inferno: { id: 'de_inferno', name: 'Inferno', image: 'https://img.cdn-thg.com/v1/page/2b425b03-9993-41c3-9824-3a4a796696d0/Inferno_CS2.jpg' },
  de_nuke: { id: 'de_nuke', name: 'Nuke', image: 'https://img.cdn-thg.com/v1/page/7c865264-8844-4235-9054-04663126743c/Nuke_CS2.jpg' },
  de_overpass: { id: 'de_overpass', name: 'Overpass', image: 'https://img.cdn-thg.com/v1/page/370d046c-c72e-48cb-a719-2196023308ba/Overpass_CS2.jpg' },
  de_vertigo: { id: 'de_vertigo', name: 'Vertigo', image: 'https://img.cdn-thg.com/v1/page/202613c2-d3f3-4d43-85f0-61d76372d627/Vertigo_CS2.jpg' },
  de_ancient: { id: 'de_ancient', name: 'Ancient', image: 'https://img.cdn-thg.com/v1/page/4235226c-da5c-4394-8149-6f9202422207/Ancient_CS2.jpg' },
  de_anubis: { id: 'de_anubis', name: 'Anubis', image: 'https://img.cdn-thg.com/v1/page/39665670-8025-4c07-8890-a7d0832a517e/Anubis_CS2.jpg' },
  de_dust2: { id: 'de_dust2', name: 'Dust 2', image: 'https://img.cdn-thg.com/v1/page/6d36e232-a396-4448-b427-023a4993952f/Dust2_CS2.jpg' },
  de_train: { id: 'de_train', name: 'Train', image: 'https://cdn.akamai.steamstatic.com/apps/csgo/images/train/train_clean.jpg' }
};

// 3. MATCH FORMATS
export const MATCH_FORMATS = {
  1: { id: 1, label: 'Best of 1', mapsNeeded: 1 },
  3: { id: 3, label: 'Best of 3', mapsNeeded: 3 },
  5: { id: 5, label: 'Best of 5', mapsNeeded: 5 }
};

// 4. VETO FLOWS (Explicit Actors)
// 'actor' must resolve to a specific Team ID at runtime
export const VETO_FLOWS = {
  1: [ // BO1
    { actor: 'TEAM_1', action: 'BAN' },
    { actor: 'TEAM_2', action: 'BAN' },
    { actor: 'TEAM_1', action: 'BAN' },
    { actor: 'TEAM_2', action: 'BAN' },
    { actor: 'TEAM_1', action: 'BAN' },
    { actor: 'TEAM_2', action: 'BAN' },
    { actor: 'TEAM_1', action: 'PICK' } // Last remaining
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
