/**
 * ⚡ PIXEL PALACE: MATCHMAKING CORTEX
 * FILE: src/lib/matchmaking/algorithm.js
 * -----------------------------------------
 * VERSION: 2050.5.0 (MASTER OMNI)
 * DATE: 2026-01-22
 * STATUS: OPERATIONAL // MATHEMATICALLY_PROVEN
 * -----------------------------------------
 * DESCRIPTION:
 * The logic core for creating fair matches.
 * Uses a brute-force combinatorics engine to find the absolute minimum ELO delta 
 * from the 126 possible 5v5 split permutations of a 10-player lobby.
 * * UPGRADES (V5.0):
 * - [Exhaustive Solver]: Replaced "Snake Draft" with a permutation engine that checks ALL possibilities.
 * - [Win Probability]: Calculates expected win % based on standard Chess ELO formulas.
 */

export const Matchmaker = {
  // CONFIGURATION
  TOLERANCE: 0.05, // 5% Deviation warning threshold
  K_FACTOR: 32,    // Standard ELO volatility

  /**
   * ⚖️ BALANCE LOBBY (THE SOLVER)
   * Perfectly balances 10 players into two teams.
   * @param {Array} players - Array of 10 player objects { id, elo, display_name }
   * @returns {Object} { team1, team2, meta }
   */
  balance: (players) => {
    // 1. SANITY CHECK
    if (!players || players.length !== 10) {
        throw new Error(`INVALID_LOBBY_SIZE: Expected 10, got ${players?.length || 0}`);
    }

    // Normalize ELO (Handle nulls as 1000)
    const roster = players.map(p => ({ ...p, elo: p.elo || 1000 }));
    const totalElo = roster.reduce((sum, p) => sum + p.elo, 0);
    
    // 2. THE COMBINATORICS ENGINE
    // We fix Player 0 to Team A to reduce permutations by half (Mirror symmetry).
    // We then need to choose 4 teammates from the remaining 9 players.
    // Total checks: 9C4 = 126. This is instantaneous for a CPU.
    
    let bestSplit = null;
    let minDelta = Infinity;

    const others = roster.slice(1);
    const pivot = roster[0];

    // Helper: Recursive Combination Generator
    function getCombinations(source, k) {
        if (k === 0) return [[]];
        if (source.length === 0) return [];
        
        const [head, ...tail] = source;
        const withHead = getCombinations(tail, k - 1).map(c => [head, ...c]);
        const withoutHead = getCombinations(tail, k);
        
        return [...withHead, ...withoutHead];
    }

    // Generate all 126 valid team configurations
    const possibleTeammates = getCombinations(others, 4);

    for (const teammates of possibleTeammates) {
        // Construct Team A (Pivot + 4)
        const teamA = [pivot, ...teammates];
        const teamAIds = new Set(teamA.map(p => p.id));
        
        // Construct Team B (Everyone else)
        const teamB = others.filter(p => !teamAIds.has(p.id));

        // Calculate Stats
        const eloA = teamA.reduce((sum, p) => sum + p.elo, 0);
        const eloB = teamB.reduce((sum, p) => sum + p.elo, 0);
        const delta = Math.abs(eloA - eloB);

        // Optimization: Atomic Update
        if (delta < minDelta) {
            minDelta = delta;
            bestSplit = {
                team1: teamA,
                team2: teamB,
                elo1: eloA,
                elo2: eloB,
                avg1: Math.round(eloA / 5),
                avg2: Math.round(eloB / 5)
            };
            
            // Optimization: Perfect split found? Stop immediately.
            if (minDelta === 0) break; 
        }
    }

    // 3. WIN PROBABILITY (Logistic Curve)
    // Formula: E_a = 1 / (1 + 10 ^ ((Rb - Ra) / 400))
    const winProb1 = 1 / (1 + Math.pow(10, (bestSplit.avg2 - bestSplit.avg1) / 400));
    
    return {
        team1: bestSplit.team1,
        team2: bestSplit.team2,
        metadata: {
            delta: minDelta,
            fairness_score: Math.max(0, 100 - (minDelta / (totalElo / 10)) * 100).toFixed(1),
            team1_avg: bestSplit.avg1,
            team2_avg: bestSplit.avg2,
            team1_win_prob: (winProb1 * 100).toFixed(1) + '%',
            is_perfect: minDelta === 0
        }
    };
  }
};
