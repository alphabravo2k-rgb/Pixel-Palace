export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  REFEREE: 'REFEREE',
  CAPTAIN: 'CAPTAIN',
  SPECTATOR: 'SPECTATOR'
};

export const ROLE_THEMES = {
  [ROLES.OWNER]: { color: 'red', label: 'SYSTEM OWNER' },
  [ROLES.ADMIN]: { color: 'orange', label: 'TOURNAMENT ADMIN' },
  [ROLES.REFEREE]: { color: 'yellow', label: 'MATCH REFEREE' },
  [ROLES.CAPTAIN]: { color: 'blue', label: 'TEAM CAPTAIN' },
  [ROLES.SPECTATOR]: { color: 'slate', label: 'SPECTATOR' }
};

export const DEFAULT_PERMISSIONS = {
  [ROLES.OWNER]: ['all'],
  [ROLES.ADMIN]: ['match.update', 'match.force_win', 'bracket.seed'],
  [ROLES.REFEREE]: ['match.pause', 'match.resume'],
  [ROLES.CAPTAIN]: ['team.join', 'map.veto'],
  [ROLES.SPECTATOR]: []
};
