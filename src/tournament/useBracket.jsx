/**
 * 🧬 USE BRACKET: TOURNAMENT STRUCTURE GENERATOR
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // RECURSIVE CONNECTIVITY
 */

import { useMemo } from 'react';

export const useBracket = (matches = []) => {
  
  const bracketData = useMemo(() => {
    if (!matches || matches.length === 0) return [];

    // 1. NEURAL GROUPING: Organize raw match list by Round Number
    const roundsMap = matches.reduce((acc, match) => {
      const r = match.round_number || 1;
      if (!acc[r]) acc[r] = [];
      
      // Enrich match object with topological data for drawing lines
      acc[r].push({
        ...match,
        // ID of this specific node (e.g., "R1-M1")
        connectionId: `round-${r}-match-${match.match_position}`,
        // ID of the node this feeds into (e.g., "R2-M1")
        // Logic: Position 1 & 2 feed into Next Round Position 1.
        targetConnectionId: `round-${r + 1}-match-${Math.ceil(match.match_position / 2)}`
      });
      return acc;
    }, {});

    const totalRounds = Object.keys(roundsMap).length;

    // 2. STRUCTURAL SORTING & FLATTENING
    return Object.keys(roundsMap)
      .sort((a, b) => Number(a) - Number(b)) // Ensure Round 1 -> Round 2 -> Round 3
      .map(roundNum => {
        const num = Number(roundNum);
        return {
          id: num,
          name: getRoundName(num, totalRounds),
          // Sort matches within round (Top to Bottom visual flow)
          matches: roundsMap[roundNum].sort((a, b) => a.match_position - b.match_position),
          // Tactical Meta-data for UI styling
          isFinal: num === totalRounds,
          isOpening: num === 1
        };
      });
  }, [matches]);

  return { bracketData };
};

/**
 * 🏷️ ROUND NAMING KERNEL
 * Ensures semantic clarity for the HUD
 */
const getRoundName = (roundIdx, totalRounds) => {
  const diff = totalRounds - roundIdx;
  switch (diff) {
    case 0: return "CHAMPIONSHIP ASCENSION"; // Grand Final
    case 1: return "SEMI-FINAL MATRIX";
    case 2: return "QUARTER-FINAL NODE";
    case 3: return "ROUND OF SIXTEEN";
    default: return `SECTOR ${roundIdx}`;
  }
};
