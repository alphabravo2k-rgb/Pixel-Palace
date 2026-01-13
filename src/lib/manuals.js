/**
 * 📘 PIXEL PALACE: KNOWLEDGE MATRIX
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // READ-ONLY
 * PURPOSE: Central repository for Standard Operating Procedures (SOPs).
 */

export const MANUALS = {
  // 🛰️ LVL 0: CIVILIAN (GUEST)
  guest: {
    title: "Civilian Access Protocol",
    description: "Restricted Access Terminal",
    short: [
      { step: 1, text: "Obtain a Team Access PIN from your Captain." },
      { step: 2, text: "Enter the 6-digit PIN on the Login Terminal." },
      { step: 3, text: "Authenticate to enter the Tournament Dashboard." }
    ],
    detailed: `
      # WELCOME TO PIXEL PALACE
      Pixel Palace is an elite, sovereign competitive ecosystem.
      
      ## Access Procedures
      To enter the active war rooms, you must belong to a registered Unit (Team). 
      Input your **Unit PIN** at the terminal to sync your device with your team's tactical feed.
      
      ## Spectating
      Live matches are broadcast via the "Watch" tab. No login is required for standard spectators.
    `
  },

  // 👁️ LVL 1: OBSERVER (SPECTATOR)
  spectator: {
    title: "Spectator Telemetry",
    description: "Premium Observation Suite",
    short: [
      { step: 1, text: "Navigate to the Bracket View." },
      { step: 2, text: "Click on any LIVE match to open the Lobby." },
      { step: 3, text: "View live scores and roster details." }
    ],
    detailed: `
      # OBSERVATION DECK
      
      As a Premium Spectator, you have access to real-time scoring data.
      
      ## Features
      - **Live Brackets:** Watch the tournament tree update instantly.
      - **Roster Inspection:** Click on team names to view player histories.
      - **Zero Latency:** Scoreboard updates are synchronized via WebSocket.
    `
  },

  // ⚔️ LVL 2: OPERATOR (PLAYER)
  player: {
    title: "Operator Field Manual",
    description: "Standard Combat Protocols",
    short: [
      { step: 1, text: "Sync Anti-Cheat and verify Steam ID." },
      { step: 2, text: "Monitor Match Status for 'VETO' completion." },
      { step: 3, text: "Deploy to Server IP within the 10-minute window." }
    ],
    detailed: `
      # OPERATIONAL STANDARDS
      
      ## Pre-Match Checks
      1. **Anti-Cheat:** Ensure your AC client is active before the lobby opens.
      2. **Steam ID:** Verify your Steam ID matches the roster registration.
      
      ## Deployment Phase
      Once the status shifts to **LIVE**, the Server IP will materialize on your HUD.
      Failure to establish a connection within the deployment window results in an automatic **Deficiency Forfeit**.
    `
  },

  // 🔭 LVL 3: INTELLIGENCE (SCOUT)
  scout: {
    title: "Talent Acquisition Interface",
    description: "Deep Data Access",
    short: [
      { step: 1, text: "Access the 'Roster' tab." },
      { step: 2, text: "View hidden player metrics (ADR, ELO)." },
      { step: 3, text: "Download demo files for review." }
    ],
    detailed: `
      # SCOUTING NETWORK
      
      You have been granted Level 3 clearance to assess talent.
      
      ## Data Access
      - **Heatmaps:** View player positioning data post-match.
      - **Demo Archive:** Access GOTV demos immediately after match conclusion.
      - **Profiles:** View contact info for Team Captains to arrange transfers.
    `
  },

  // 🎖️ LVL 4: COMMANDER (CAPTAIN)
  captain: {
    title: "Squad Command Interface",
    description: "Unit Management & Strategy",
    short: [
      { step: 1, text: "Manage Roster: Ensure 5/5 combat-ready slots." },
      { step: 2, text: "Veto Phase: 30s per strategic decision." },
      { step: 3, text: "War Room: Request Admin intervention if required." }
    ],
    detailed: `
      # COMMANDER PROTOCOLS
      You are the singular authority for your Unit. Your actions (Vetoes, Forfeits) are binding.
      
      ## Veto Logic
      During the Veto phase, you must Ban/Pick maps to define the battlefield. 
      If the timer elapses, the **Nexus AI** will perform a random selection to maintain schedule integrity.
    `
  },

  // 🎥 LVL 5: MEDIA (STREAMER)
  streamer: {
    title: "Broadcast Partner Kit",
    description: "Media Assets & Feeds",
    short: [
      { step: 1, text: "Access 'Media' tab for Clean Feed URL." },
      { step: 2, text: "Download official overlay assets." },
      { step: 3, text: "Stream with required 90s delay." }
    ],
    detailed: `
      # BROADCAST GUIDELINES
      
      ## Asset Pack
      You have access to high-res transparent logos for all teams.
      
      ## Rules of Engagement
      - **Delay:** Minimum 90 seconds (120s for Playoffs) to prevent sniping.
      - **HUD:** You may use your own HUD or the official "Clean Feed" provided in the lobby.
      - **Spoiler Free:** Do not reveal results before the delayed feed catches up.
    `
  },

  // 🏁 LVL 6: SUPPORT (CREW)
  crew: {
    title: "Operations Crew Handbook",
    description: "Support & Mediation",
    short: [
      { step: 1, text: "Monitor 'Active Disputes' on Dashboard." },
      { step: 2, text: "Join lobbies as 'Observer' to mediate." },
      { step: 3, text: "Escalate critical failures to Level 9 (Admin)." }
    ],
    detailed: `
      # FLOOR OPERATIONS
      
      ## Duties
      - **Check-in:** Verify all teams are present 15m before start.
      - **Disputes:** Review screenshots/logs for minor rule violations.
      - **Pauses:** You have RCON access to pause/unpause matches during tech issues.
    `
  },

  // 🎙️ LVL 7: VOICE (CASTER)
  caster: {
    title: "Production Uplink",
    description: "Voice of the Arena",
    short: [
      { step: 1, text: "Connect via the 'Caster IP' (No delay)." },
      { step: 2, text: "Access the 'Run of Show' schedule." },
      { step: 3, text: "Sync with Production Crew on Discord." }
    ],
    detailed: `
      # ON-AIR PROTOCOLS
      
      ## Connectivity
      Your account is whitelisted for the "Caster Slot" on all servers. Do not share this IP; it bypasses the standard delay for live commentary.
      
      ## Production Stats
      Use the Admin Dashboard to see real-time economy and loadout stats that may not be visible in-game.
    `
  },

  // 🏗️ LVL 8: ARCHITECT (ORGANIZER)
  organizer: {
    title: "Tournament Director Log",
    description: "Event Architecture",
    short: [
      { step: 1, text: "Configure Tournament Structure." },
      { step: 2, text: "Approve/Reject Team Applications." },
      { step: 3, text: "Publish Schedule." }
    ],
    detailed: `
      # EVENT MANAGEMENT
      
      ## Structure
      You define the rules of engagement: BO1/BO3 formats, Elimination Type (Single/Double), and Prize Pool distribution.
      
      ## Seeding
      Drag and drop teams in the "Seeds" tab to adjust initial bracket placement before generating the tree.
    `
  },

  // 🛡️ LVL 9: OVERSEER (ADMIN)
  admin: {
    title: "System Overseer Manual",
    description: "Full Operational Control",
    short: [
      { step: 1, text: "War Room: Override any match result." },
      { step: 2, text: "Server Control: Restart/Change Maps via RCON." },
      { step: 3, text: "Ban Hammer: Remove users instantly." }
    ],
    detailed: `
      # GOD MODE PROTOCOLS
      
      ## Force Win
      In the War Room, you can terminate a match and advance a team manually. This is irreversible.
      
      ## Emergency Protocol
      If the bracket desyncs, use the "Regenerate Bracket" tool. 
      *Warning: This wipes current match history.*
    `
  },

  // 👑 LVL 10: FOUNDER (OWNER)
  owner: {
    title: "THE ARCHITECT'S CODEX",
    description: "Genesis Level Clearance",
    short: [
      { step: 1, text: "Total System Sovereignty." },
      { step: 2, text: "Oversee Admin Infrastructure." },
      { step: 3, text: "Global Financial & Audit Control." }
    ],
    detailed: `
      # MASTER CONTROL
      
      You have Level 100 Clearance. Every action on this platform is logged under your surveillance. 
      Use the **Audit Logs** to track system integrity and the **Financial Vault** for prize distribution.
      
      *With great power comes absolute responsibility.*
    `
  }
};

/**
 * 🛠️ UTILITY: MANUAL FETCH
 * Safely retrieves the manual for a specific role, defaulting to Guest.
 */
export const getManual = (role) => MANUALS[role?.toLowerCase()] || MANUALS.guest;
