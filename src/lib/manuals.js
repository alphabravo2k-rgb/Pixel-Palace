/**
 * 📘 PIXEL PALACE: KNOWLEDGE MATRIX
 * --------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * VERSION: 2.0.0
 * PURPOSE: Central repository for all Standard Operating Procedures (SOPs).
 */

export const MANUALS = {
  // --- LVL 0: PUBLIC ---
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
      
      ## Access Protocols
      Pixel Palace is an invite-only competitive ecosystem. To participate, you must belong to a registered Unit (Team).
      
      ### Joining a Unit
      Ask your Team Captain for the unique **Access PIN**. This code links your device to your team's live dashboard.
      
      ### Spectating
      Live matches are broadcast via the "Watch" tab on the public landing page. No login is required for spectators unless you wish to view advanced telemetry.
    `
  },

  // --- LVL 1: OBSERVER ---
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
      
      As a Premium Spectator, you have access to real-time scoring data that is usually restricted.
      
      ## Features
      - **Live Brackets:** Watch the tournament tree update instantly.
      - **Roster Inspection:** Click on team names to view player histories.
      - **Delay Free:** Scoreboard updates are synchronized with the server via WebSocket.
    `
  },

  // --- LVL 2: OPERATOR ---
  player: {
    title: "Operator Field Manual",
    description: "Standard Combat Protocols",
    short: [
      { step: 1, text: "Check 'Next Match' timer on Dashboard." },
      { step: 2, text: "Wait for Captain to complete Veto." },
      { step: 3, text: "Copy Server IP and join within 10 minutes." }
    ],
    detailed: `
      # OPERATIONAL STANDARDS
      
      ## Pre-Match Checks
      1. **Anti-Cheat:** Ensure your AC client is active before the lobby opens.
      2. **Steam ID:** Verify your Steam ID matches the roster registration.
      
      ## Match Sequence
      - **Standby:** When match status is "VETO", wait for your Captain.
      - **Connect:** When status becomes "LIVE", the Server IP will appear in your Match Lobby.
      - **Execution:** Join the server immediately. Failure to connect results in automatic forfeiture.
    `
  },

  // --- LVL 3: INTELLIGENCE ---
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

  // --- LVL 4: COMMANDER ---
  captain: {
    title: "Squad Command Interface",
    description: "Unit Management & Tactics",
    short: [
      { step: 1, text: "Manage Roster: Ensure 5/5 active slots." },
      { step: 2, text: "Veto Phase: You have 30s per ban/pick." },
      { step: 3, text: "Disputes: Use the 'War Room' request for admin intervention." }
    ],
    detailed: `
      # COMMAND PROTOCOLS
      
      ## Responsibility
      You are the primary link between your unit and the Tournament Operations. Your actions (Vetoes, Forfeits) are binding.
      
      ## Veto Authority
      When a match enters "VETO" state, a specialized UI will unlock on your dashboard.
      - **Ban:** Remove maps you do not wish to play.
      - **Pick:** Select your stronghold.
      - **Side:** Choose CT/T starting side.
      
      *Warning: Failure to act within the time limit will result in an automated random selection.*
    `
  },

  // --- LVL 5: MEDIA ---
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
      You have access to high-res transparent logos for all teams in the tournament.
      
      ## Rules of Engagement
      - **Delay:** Minimum 90 seconds (120s for Playoffs).
      - **HUD:** You may use your own HUD or the official "Clean Feed" provided in the lobby.
      - **Spoiler Free:** Do not reveal results before the delayed feed catches up.
    `
  },

  // --- LVL 6: SUPPORT ---
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
      - **Pauses:** You have rcon access to pause/unpause matches during tech issues.
    `
  },

  // --- LVL 7: VOICE ---
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
      Your account is whitelisted for the "Caster Slot" on all servers. Do not share this IP.
      
      ## Production Stats
      Use the Admin Dashboard to see real-time economy and loadout stats that may not be visible in-game.
    `
  },

  // --- LVL 8: ARCHITECT ---
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
      You define the rules: BO1/BO3, Elimination Type (Single/Double), and Prize Pool distribution.
      
      ## Seeding
      Drag and drop teams in the "Seeds" tab to adjust initial bracket placement.
    `
  },

  // --- LVL 9: OVERSEER ---
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
      If the bracket desyncs, use the "Regenerate Bracket" tool. Warning: This wipes current match history.
    `
  },

  // --- LVL 10: FOUNDER ---
  owner: {
    title: "THE ARCHITECT'S CODEX",
    description: "Genesis Level Clearance",
    short: [
      { step: 1, text: "The System answers to you." },
      { step: 2, text: "Manage Admins and Finances." },
      { step: 3, text: "Global System Configuration." }
    ],
    detailed: `
      # MASTER CONTROL
      
      You have Level 100 Clearance.
      - **Financials:** Access Stripe/Payment gateways.
      - **Audit Logs:** View every action taken by every user.
      - **System Health:** Monitor server loads and database integrity.
      
      *With great power comes absolute responsibility.*
    `
  }
};
