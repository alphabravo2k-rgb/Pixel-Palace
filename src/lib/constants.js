// --- VETO FLOW (Standard Competitive V8) ---
export const VETO_FLOW = { 
  "BO1": [
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "NONE", action: "DECIDER" } // Last map auto-picked
  ],
  "BO3": [
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "A", action: "PICK" }, 
    { team: "B", action: "SIDE" }, // Team B picks side for Map 1
    { team: "B", action: "PICK" }, 
    { team: "A", action: "SIDE" }, // Team A picks side for Map 2
    { team: "A", action: "BAN" }, { team: "B", action: "BAN" },
    { team: "NONE", action: "DECIDER" }
  ]
};
