import React, { useState, useCallback, createContext, useContext } from 'react';

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

// 1. Create the Context
const TournamentContext = createContext(null);

/**
 * Internal logic hook that manages state.
 * This is used by the TournamentProvider to create the state object.
 */
const useTournamentSource = () => {
  const [rounds, setRounds] = useState([]);
  const [champion, setChampion] = useState(null);
  const [isTournamentActive, setIsTournamentActive] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Helper to pad participants to the nearest power of 2
   */
  const padParticipants = (participants) => {
    const count = participants.length;
    if (count === 0) return [];
    
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(count)));
    const byesNeeded = nextPowerOf2 - count;
    
    const padded = [...participants];
    for (let i = 0; i < byesNeeded; i++) {
      padded.push({ id: `bye-${i}`, name: 'BYE', isBye: true });
    }
    return padded;
  };

  /**
   * Internal helper to move a winner to the next bracket slot.
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
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const targetMatch = nextRound[nextMatchIdx];

    // Determine slot (Even index -> Player 1, Odd index -> Player 2)
    if (matchIdx % 2 === 0) {
      targetMatch.player1 = winner;
    } else {
      targetMatch.player2 = winner;
    }

    // Update status if opponent is already there
    if (targetMatch.player1 && targetMatch.player2) {
      targetMatch.status = 'ready';
    }
  };

  /**
   * Generates the initial bracket structure.
   */
  const createTournament = useCallback((participants, shuffle = false) => {
    if (!participants || participants.length < 2) {
      setError('Tournament requires at least 2 participants.');
      return;
    }

    // Reset State
    setError(null);
    setChampion(null);
    setIsTournamentActive(true);

    let currentParticipants = [...participants];
    if (shuffle) {
      currentParticipants.sort(() => Math.random() - 0.5);
    }

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
      });
    }
    newRounds.push(round1);

    // --- Generate Subsequent Rounds ---
    let matchCount = paddedParticipants.length / 4;
    for (let r = 1; r < totalRounds; r++) {
      const roundMatches = [];
      for (let m = 0; m < matchCount; m++) {
        roundMatches.push({
          id: `r${r}-m${m}`,
          roundIndex: r,
          matchIndex: m,
          player1: null,
          player2: null,
          winner: null,
          status: 'pending'
        });
      }
      newRounds.push(roundMatches);
      matchCount /= 2;
    }

    // --- Process Initial Byes Synchronously ---
    if (newRounds.length > 0) {
        const r1 = newRounds[0];
        r1.forEach(match => {
        if (!match.winner) {
            let winner = null;
            if (match.player1?.isBye && match.player2 && !match.player2.isBye) {
            winner = match.player2;
            } else if (match.player2?.isBye && match.player1 && !match.player1.isBye) {
            winner = match.player1;
            }

            if (winner) {
            match.winner = winner;
            match.status = 'completed';
            propagateWinner(newRounds, 0, match.matchIndex, winner);
            }
        }
        });
    }

    setRounds(newRounds);
  }, []);

  /**
   * Advances a winner for a specific match.
   */
  const setMatchWinner = useCallback((roundIndex, matchIndex, winner) => {
    setRounds(prevRounds => {
      const newRounds = JSON.parse(JSON.stringify(prevRounds));
      const currentMatch = newRounds[roundIndex][matchIndex];

      if (!currentMatch || currentMatch.winner) return prevRounds;

      currentMatch.winner = winner;
      currentMatch.status = 'completed';

      propagateWinner(newRounds, roundIndex, matchIndex, winner);

      return newRounds;
    });
  }, []);

  const resetTournament = useCallback(() => {
    setRounds([]);
    setChampion(null);
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

// 2. Export the Provider
export const TournamentProvider = ({ children }) => {
  const tournamentUtils = useTournamentSource();

  return (
    <TournamentContext.Provider value={tournamentUtils}>
      {children}
    </TournamentContext.Provider>
  );
};

// 3. Export the Consumer Hook
export const useTournament = () => {
  const context = useContext(TournamentContext);
  
  if (!context) {
    // Return safe default to prevent crashes if provider is missing
    return {
        rounds: [],
        champion: null,
        isTournamentActive: false,
        error: 'Tournament Context Missing',
        createTournament: () => {},
        setMatchWinner: () => {},
        resetTournament: () => {}
    };
  }
  return context;
};

export default useTournament;
