/**
 * 🧮 TOURNAMENT UTILS: PURE MATH KERNEL
 * VERSION: 2050.5.0
 * STATUS: SECURED // ALGORITHM HARDENED
 */

// --- 1. ELO RATING SYSTEM (The "Faceit" Algorithm) ---

export const calculateEloChange = (playerElo, opponentElo, result) => {
  // result: 1 for Win, 0 for Loss, 0.5 for Draw
  const K = 32; // Volatility Factor (Higher = faster rank changes)
  
  // Calculate Expected Score based on Elo difference
  // Formula: 1 / (1 + 10 ^ ((Opponent - Player) / 400))
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  
  // Calculate new rating
  const change = Math.round(K * (result - expectedScore));
  
  return {
    newElo: playerElo + change,
    change: change > 0 ? `+${change}` : `${change}`
  };
};

export const getTierFromElo = (elo) => {
  if (elo >= 3000) return { name: "TITAN", tier: 10, color: "text-brand-glow" };
  if (elo >= 2500) return { name: "IMMORTAL", tier: 9, color: "text-red-500" };
  if (elo >= 2000) return { name: "LEGEND", tier: 8, color: "text-orange-500" };
  if (elo >= 1500) return { name: "MASTER", tier: 7, color: "text-yellow-500" };
  if (elo >= 1000) return { name: "ELITE", tier: 5, color: "text-emerald-500" };
  return { name: "ROOKIE", tier: 1, color: "text-zinc-500" };
};

// --- 2. BRACKET GENERATION (Power of 2 Logic) ---

export const generateSeeds = (teams) => {
  // Sort teams by ELO (High seed vs Low seed logic)
  const sorted = [...teams].sort((a, b) => b.elo - a.elo);
  
  // Pad with "BYE" to reach next power of 2 (2, 4, 8, 16, 32...)
  const count = sorted.length;
  const powerOf2 = Math.pow(2, Math.ceil(Math.log2(count)));
  const byesNeeded = powerOf2 - count;
  
  const bracket = [];
  
  // Standard Seeding: 1 vs 16, 2 vs 15, etc.
  for (let i = 0; i < powerOf2 / 2; i++) {
    // If we run out of real teams, insert a BYE
    const teamA = sorted[i];
    const teamB = sorted[powerOf2 - 1 - i] || { id: 'BYE', name: 'BYE', isBye: true };
    
    bracket.push({
      matchId: crypto.randomUUID(), // Local ID for UI rendering
      round: 1,
      position: i + 1,
      team1: teamA,
      team2: teamB,
      status: teamB.isBye ? 'completed' : 'scheduled',
      winner: teamB.isBye ? teamA.id : null // Auto-win vs BYE
    });
  }
  
  return bracket;
};
