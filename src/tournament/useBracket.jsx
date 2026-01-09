/**
 * 🧬 USE BRACKET: TOURNAMENT STRUCTURE GENERATOR
 * STATUS: SECURED // RECURSIVE LOGIC
 */

import { useMemo } from 'react';

export const useBracket = (matches = []) => {
  
  const bracketData = useMemo(() => {
    if (!matches.length) return [];

    // 1. Group matches by Round Number
    const roundsMap = matches.reduce((acc, match) => {
      const r = match.round_number || 1;
      if (!acc[r]) acc[r] = [];
      acc[r].push(match);
      return acc;
    }, {});

    // 2. Sort rounds (1, 2, 3...) and matches within rounds (by position)
    return Object.keys(roundsMap)
      .sort((a, b) => a - b)
      .map(roundNum => ({
        id: roundNum,
        name: getRoundName(roundNum, Object.keys(roundsMap).length),
        matches: roundsMap[roundNum].sort((a, b) => a.match_position - b.match_position)
      }));
  }, [matches]);

  return { bracketData };
};

// Helper: Converts Round 3 -> "Semi-Finals"
const getRoundName = (roundIdx, totalRounds) => {
  const diff = totalRounds - roundIdx;
  if (diff === 0) return "GRAND FINAL";
  if (diff === 1) return "SEMI-FINALS";
  if (diff === 2) return "QUARTER-FINALS";
  return `ROUND ${roundIdx}`;
};
