import { useState, useCallback } from 'react';

/**
 * @typedef {Object} Participant
 * @property {string|number} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} [avatar] - Optional avatar URL
 */

/**
 * @typedef {Object} Match
 * @property {string} id - Unique match ID
 * @property {Participant | null} player1 - First competitor (null if waiting)
 * @property {Participant | null} player2 - Second competitor (null if waiting)
 * @property {Participant | null} winner - The winner of the match
 * @property {number} roundIndex - The round this match belongs to
 * @property {number} matchIndex - The index of the match within the round
 * @property {string} status - 'pending' | 'ready' | 'completed'
 */

/**
 * useTournament Hook
 * * Manages state and logic for a tournament bracket system.
 * Handles bracket generation, advancing winners, and determining the champion.
 * * @returns {Object} Tournament control object
 */
export const useTournament = () => {
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [champion, setChampion] = useState(null);
  const [isTournamentActive, setIsTournamentActive] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Helper to pad participants to the nearest power of 2
   * This ensures a balanced binary tree for the bracket.
   * @param {Participant[]} participants 
   */
  const padParticipants = (participants) => {
    const count = participants.length;
    if (count === 0) return [];
    
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(count)));
    const byesNeeded = nextPowerOf2 - count;
    
    // Create "Bye" participants. 
    // In a real UI, these are auto-resolved, but for structure we keep them.
    const padded = [...participants];
    for (let i = 0; i < byesNeeded; i++) {
      padded.push({ id: `bye-${i}`, name: 'BYE', isBye: true });
    }
    return padded;
  };

  /**
   * Generates the initial bracket structure based on participants.
   * @param {Participant[]} participants - Array of player objects
   * @param {boolean} shuffle - Whether to randomize seeds
   */
  const createTournament = useCallback((participants, shuffle = false) => {
    if (!participants || participants.length < 2) {
      setError('Tournament requires at least 2 participants.');
      return;
    }

    setError(null);
    setChampion(null);
    setCurrentRoundIndex(0);

    let currentParticipants = [...participants];

    if (shuffle) {
      currentParticipants.sort(() => Math.random() - 0.5);
    }

    // Pad with Byes for balanced bracket
    const paddedParticipants = padParticipants(currentParticipants);
    const totalRounds = Math.log2(paddedParticipants.length);
    const newRounds = [];

    // --- Generate Round 1 ---
    const round1 = [];
    for (let i = 0; i < paddedParticipants.length; i += 2) {
      const p1 = paddedParticipants[i];
      const p2 = paddedParticipants[i + 1];

      round1.push({
        id: `r0-m${i / 2}`,
        roundIndex: 0,
        matchIndex: i / 2,
        player1: p1,
        player2: p2,
        winner: null,
        status: (p1.isBye || p2.isBye) ? 'completed' : 'ready' 
        // Note: Auto-resolving byes happens in a separate step or effect usually,
        // but for simplicity, we mark them ready. Logic below handles bye advancement.
      });
    }
    newRounds.push(round1);

    // --- Generate Placeholder Rounds (2 to N) ---
    // Each subsequent round has half the matches of the previous
    let matchCount = paddedParticipants.length / 4; // Start at Round 2 (matches = half of R1 matches)
    
    for (let r = 1; r < totalRounds; r++) {
      const roundMatches = [];
      for (let m = 0; m < matchCount; m++) {
        roundMatches.push({
          id: `r${r}-m${m}`,
          roundIndex: r,
          matchIndex: m,
          player1: null, // Waiting for previous round
          player2: null,
          winner: null,
          status: 'pending'
        });
      }
      newRounds.push(roundMatches);
      matchCount /= 2;
    }

    setRounds(newRounds);
    setIsTournamentActive(true);

    // Initial check to auto-advance any Byes in Round 1
    // We wrap this in a timeout to ensure state is settled or call a helper immediately.
    // For this purely logic hook, we'll return the structure and let the UI trigger 'autoResolve' if needed,
    // or simply process the byes here:
    processInitialByes(newRounds);

  }, []);

  /**
   * Internal helper to immediately advance players matched against 'BYE'
   */
  const processInitialByes = (currentRounds) => {
    const r1 = currentRounds[0];
    let updatesNeeded = false;
    const nextRounds = JSON.parse(JSON.stringify(currentRounds)); // Deep copy for safety

    r1.forEach(match => {
      if (!match.winner) {
        if (match.player1?.isBye && match.player2 && !match.player2.isBye) {
           // P2 wins automatically
           match.winner = match.player2;
           match.status = 'completed';
           propagateWinner(nextRounds, 0, match.matchIndex, match.player2);
           updatesNeeded = true;
        } else if (match.player2?.isBye && match.player1 && !match.player1.isBye) {
           // P1 wins automatically
           match.winner = match.player1;
           match.status = 'completed';
           propagateWinner(nextRounds, 0, match.matchIndex, match.player1);
           updatesNeeded = true;
        }
      }
    });

    if (updatesNeeded) {
      setRounds(nextRounds);
    }
  };

  /**
   * Internal helper to move a winner to the next bracket slot.
   * @param {Array} bracketStructure - The full rounds array
   * @param {number} roundIdx - Current round index
   * @param {number} matchIdx - Current match index
   * @param {Participant} winner - The winning player
   */
  const propagateWinner = (bracketStructure, roundIdx, matchIdx, winner) => {
    const nextRoundIdx = roundIdx + 1;
    
    // If this was the final round, we have a champion
    if (nextRoundIdx >= bracketStructure.length) {
      setChampion(winner);
      setIsTournamentActive(false);
      return;
    }

    const nextRound = bracketStructure[nextRoundIdx];
    // Calculate which match in the next round this feeds into
    // Matches 0 and 1 in R1 feed into Match 0 in R2. Matches 2 and 3 feed into Match 1.
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const targetMatch = nextRound[nextMatchIdx];

    // Determine if this winner goes to slot 1 or slot 2
    // Even index matches go to player1, Odd index matches go to player2
    if (matchIdx % 2 === 0) {
      targetMatch.player1 = winner;
    } else {
      targetMatch.player2 = winner;
    }

    // Update status of next match
    if (targetMatch.player1 && targetMatch.player2) {
      targetMatch.status = 'ready';
    }
  };

  /**
   * Advances a winner for a specific match.
   * @param {number} roundIndex 
   * @param {number} matchIndex 
   * @param {Participant} winner 
   */
  const setMatchWinner = useCallback((roundIndex, matchIndex, winner) => {
    setRounds(prevRounds => {
      const newRounds = JSON.parse(JSON.stringify(prevRounds)); // Deep clone
      const currentMatch = newRounds[roundIndex][matchIndex];

      // Validation
      if (!currentMatch) return prevRounds;
      if (currentMatch.status === 'pending') return prevRounds; // Can't decide pending matches
      if (currentMatch.winner) return prevRounds; // Already decided

      // Update current match
      currentMatch.winner = winner;
      currentMatch.status = 'completed';

      // Move winner to next spot
      propagateWinner(newRounds, roundIndex, matchIndex, winner);

      return newRounds;
    });
  }, []);

  /**
   * Resets the tournament to initial state
   */
  const resetTournament = useCallback(() => {
    setRounds([]);
    setChampion(null);
    setCurrentRoundIndex(0);
    setIsTournamentActive(false);
    setError(null);
  }, []);

  return {
    rounds,
    champion,
    isTournamentActive,
    error,
    createTournament,
    setMatchWinner,
    resetTournament
  };
};

export default useTournament;
