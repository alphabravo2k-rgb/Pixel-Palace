/**
 * 🛡️ SECURITY PROTOCOL: CLEARANCE LEVELS (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: IMMUTABLE // CORE_LOGIC
 * --------------------------------------
 * The "Burj Khalifa" Hierarchy of Pixel Palace.
 * Defines 15 Tiers of Authority for global scalability.
 */

// 1. ROLE IDENTIFIERS (The Sovereign Registry)
export const ROLES = {
  // --- TIER 1: SOVEREIGN COMMAND (90-100) ---
  MASTER: 'owner',          // The Architect (You)
  CEO: 'ceo',               // Executive Oversight
  DIRECTOR: 'director',     // Operational Strategy
  
  // --- TIER 2: SYSTEM OPERATORS (70-85) ---
  HEAD_ADMIN: 'head_admin', // Regional Lead
  SENIOR_ADMIN: 'sr_admin', // High-Clearance Oversight
  SERVER_HEAD: 'manager',    // Technical Infrastructure (Kancha)
  
  // --- TIER 3: FIELD OPERATIONS (40-65) ---
  ADMIN: 'admin',           // Daily Operations
  REF_HEAD: 'referee_lead', // Rules & Integrity Chief
  ORGANIZER: 'organizer',   // Outsourced Event Lead (Quotation-based)
  REFEREE: 'referee',       // Match Mediator
  
  // --- TIER 4: BROADCAST & MEDIA (30-35) ---
  CASTER: 'caster',         // Play-by-play Talent
  STREAMER: 'streamer',     // Content Creator
  
  // --- TIER 5: COMPETITORS (10-25) ---
  CAPTAIN: 'captain',       // Squad Commander
  PLAYER: 'player',         // Active Combatant
  
  // --- TIER 6: PUBLIC (0-5) ---
  SPECTATOR: 'spectator',   // Verified Viewer
  GUEST: 'guest'            // Unverified Identity
};

// 2. AUTHORITY MATRIX (The Power Index)
export const CLEARANCE = {
  // Sovereign
  [ROLES.MASTER]: 100,      // GOD_MODE: Absolute control, financial overrides
  [ROLES.CEO]: 98,         // EXEC_LEAD: Strategy, hiring, high-level bans
  [ROLES.DIRECTOR]: 95,    // OPS_LEAD: Tournament approvals, site-wide config
  
  // Operators
  [ROLES.SERVER_HEAD]: 90,  // TECH_LEAD: Server clusters, AC heartbeat, API keys
  [ROLES.HEAD_ADMIN]: 85,   // REGION_LEAD: Staff management, regional overrides
  [ROLES.SENIOR_ADMIN]: 80, // OVERSIGHT: Major dispute resolution, roster wipes
  
  // Field
  [ROLES.REF_HEAD]: 70,     // INTEGRITY: Appeals, rulebook modifications
  [ROLES.ADMIN]: 60,        // OPERATIONS: Ticket handling, match resets
  [ROLES.ORGANIZER]: 55,    // QUOTATION: Management of assigned events only
  [ROLES.REFEREE]: 50,      // FIELD: Live match pause/resume, result override
  
  // Media
  [ROLES.CASTER]: 35,       // TALENT: Access to lobby spectating/delay settings
  [ROLES.STREAMER]: 30,     // PARTNER: Priority queue, badge display
  
  // Competitors
  [ROLES.CAPTAIN]: 20,      // COMMAND: Team logic, vetoes, roster recruitment
  [ROLES.PLAYER]: 10,       // COMBAT: Dashboard access, queue entry
  
  // Public
  [ROLES.SPECTATOR]: 5,     // VIEW: Global chat, bracket interaction
  [ROLES.GUEST]: 0          // READ: Landing page only
};

/**
 * 🧠 CLEARANCE RESOLVER
 * Converts any role variant into its numerical power level.
 */
export const getClearanceLevel = (role) => {
  if (!role) return CLEARANCE[ROLES.GUEST];
  const normalized = String(role).toLowerCase().trim();
  return CLEARANCE[normalized] ?? CLEARANCE[ROLES.GUEST];
};

/**
 * 🔒 INHERITANCE CHECK
 * Determines if an operator has enough power to perform an action.
 */
export const isAuthorized = (userRole, requiredLevel) => {
  const currentLevel = getClearanceLevel(userRole);
  const targetLevel = typeof requiredLevel === 'string' 
    ? getClearanceLevel(requiredLevel) 
    : requiredLevel;
    
  return currentLevel >= targetLevel;
};

/**
 * 🏷️ ROLE CATEGORY HELPERS
 */
export const IdentityTags = {
  isStaff: (role) => getClearanceLevel(role) >= 50,
  isManagement: (role) => getClearanceLevel(role) >= 80,
  isSovereign: (role) => getClearanceLevel(role) >= 95,
  isCompetitor: (role) => {
    const level = getClearanceLevel(role);
    return level >= 10 && level <= 25;
  }
};
