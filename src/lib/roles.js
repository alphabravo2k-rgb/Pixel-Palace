/**
 * Canonical roles for the Pixel Palace system.
 */
export const ROLES = {
  SYSTEM_OWNER: 'SYSTEM_OWNER',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  REFEREE: 'REFEREE',
  CAPTAIN: 'CAPTAIN',
  PLAYER: 'PLAYER',
  SPECTATOR: 'SPECTATOR',
  GUEST: 'GUEST'
};

/**
 * Visual themes updated for the new Cyber-Manifesto Aesthetic.
 */
export const ROLE_THEMES = {
  [ROLES.SYSTEM_OWNER]: { color: 'fuchsia', label: 'PLATFORM ROOT' },
  [ROLES.OWNER]: { color: 'fuchsia', label: 'TOURNAMENT DIRECTOR' },
  [ROLES.ADMIN]: { color: 'purple', label: 'TOURNAMENT ADMIN' },
  [ROLES.REFEREE]: { color: 'yellow', label: 'MATCH REFEREE' },
  [ROLES.CAPTAIN]: { color: 'cyan', label: 'TEAM CAPTAIN' },
  [ROLES.PLAYER]: { color: 'emerald', label: 'ACTIVE PLAYER' },
  [ROLES.SPECTATOR]: { color: 'zinc', label: 'SPECTATOR' },
  [ROLES.GUEST]: { color: 'zinc', label: 'GUEST' }
};

/**
 * Static Permission Definitions.
 */
export const PERMISSIONS = {
  'match.update': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE],
  'match.force_win': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN],
  'match.pause': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE],
  'match.resume': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE],
  'match.veto.view.live': [ROLES.SYSTEM_OWNER, ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE, ROLES.CAPTAIN],
  'match.veto.act': [ROLES.CAPTAIN],
  'server.ip.view': [ROLES.CAPTAIN, ROLES.PLAYER, ROLES.ADMIN, ROLES.OWNER], 
  'server.password.view': [ROLES.CAPTAIN, ROLES.PLAYER]
};
