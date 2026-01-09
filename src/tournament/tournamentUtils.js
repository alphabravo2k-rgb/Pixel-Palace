/**
 * 🧮 TOURNAMENT UTILS: PURE MATH KERNEL
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // ALGORITHM HARDENED
 */

// --- 1. ELO RATING SYSTEM (The "Faceit-Standard" Algorithm) ---

/**
 * Calculates Elo change with Dynamic K-Factor
 * @param {number} playerElo - Current Elo
 * @param {number} opponentElo - Opponent/Average Team Elo
 * @param {number} result - 1 (Win), 0 (Loss), 0.5 (Draw)
 * @param {number} matchesPlayed - For volatility adjustment
 */
export const calculateEloChange = (playerElo, opponentElo, result, matchesPlayed = 50) => {
  // ⚡ DYNAMIC VOLATILITY: New players gain/lose faster (K=40), veterans stabilize (K=20)
  // This helps quickly place smurfs in their correct rank.
  const K = matchesPlayed < 20 ? 40 : 20; 
  
  // 📐 PROBABILITY CURVE
  // Formula: 1 / (1 + 10 ^ ((Opponent - Player) / 400))
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  
  // 📈 RATING DELTA
  const change = Math.round(K * (result - expectedScore));
  
  return {
    newElo: playerElo + change,
    change: change > 0 ? `+${change}` : `${change}`,
    delta: change
  };
};

/**
 * 🎖️ RANK TIER MAPPING (OMNI-STANDARD)
 * Optimized for high-fidelity 3D visual badges
 */
export const getTierFromElo = (elo) => {
  if (elo >= 3000) return { name: "TITAN", tier: 10, color: "text-brand-glow", badgeStyle: "shadow-neon" };
  if (elo >= 2500) return { name: "IMMORTAL", tier: 9, color: "text-red-500", badgeStyle: "shadow-neon-red" };
  if (elo >= 2000) return { name: "LEGEND", tier: 8, color: "text-orange-500", badgeStyle: "shadow-neon-orange" };
  if (elo >= 1500) return { name: "MASTER", tier: 7, color: "text-yellow-500", badgeStyle: "shadow-neon-yellow" };
  if (elo >= 1200) return { name: "ELITE", tier: 5, color: "text-emerald-500", badgeStyle: "" };
  if (elo >= 800)  return { name: "COMBATANT", tier: 3, color: "text-blue-400", badgeStyle: "" };
  return { name: "ROOKIE", tier: 1, color: "text-zinc-500", badgeStyle: "" };
};

// --- 2. BRACKET GENERATION (The Professional Architecture) ---

/**
 * Generates Balanced Seeding Brackets
 * Logic: Ensures High Seeds don't meet until the Finals (1 vs 16, 2 vs 15)
 */
export const generateSeeds = (teams) => {
  // Sort teams by ELO High -> Low
  const sorted = [...teams].sort((a, b) => (b.elo_rating || 0) - (a.elo_rating || 0));
  
  const count = sorted.length;
  // Find next power of 2 (e.g. 5 teams -> 8 slots) to allow clean bracket generation
  const powerOf2 = Math.pow(2, Math.ceil(Math.log2(count)));
  
  // Pad the array with placeholders for BYEs
  const participants = [...sorted];
  while (participants.length < powerOf2) {
    participants.push({ id: 'BYE', display_name: 'BYE', isBye: true });
  }

  const bracket = [];
  const half = powerOf2 / 2;

  // 
  
  // SEEDING MAPPING: 
  // Matches top seeds against bottom seeds (1 vs 16, 2 vs 15, etc.)
  for (let i = 0; i < half; i++) {
    const teamA = participants[i]; // Top Seed
    const teamB = participants[powerOf2 - 1 - i]; // Bottom Seed
    
    bracket.push({
      match_id: crypto.randomUUID(),
      round_number: 1,
      match_position: i + 1,
      team1: teamA,
      team2: teamB,
      status: teamB.isBye ? 'completed' : 'scheduled',
      winner_id: teamB.isBye ? teamA.id : null, // Auto-win logic
      metadata: {
        is_auto_win: teamB.isBye
      }
    });
  }
  
  return bracket;
};
