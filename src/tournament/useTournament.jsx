import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query 
} from "firebase/firestore";
import { db } from '../firebase/client';
import { useAuth } from '../auth/useAuth';

const TournamentContext = createContext();

const APP_ID = "cs2-tournament-manager"; 

export const TournamentProvider = ({ children }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Guarded listener for Teams
    const teamsQuery = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'teams'));
    const unsubTeams = onSnapshot(teamsQuery, (snapshot) => {
      setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Teams Sync Error:", err);
      setError("Failed to sync teams. Please check connection.");
    });

    // Guarded listener for Matches
    const matchesQuery = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'matches'));
    const unsubMatches = onSnapshot(matchesQuery, (snapshot) => {
      const ms = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      ms.sort((a, b) => (a.round - b.round) || (a.matchIndex - b.matchIndex));
      setMatches(ms);
      setLoading(false);
    }, (err) => {
      console.error("Matches Sync Error:", err);
      setError("Failed to sync matches.");
      setLoading(false);
    });

    return () => {
      unsubTeams();
      unsubMatches();
    };
  }, [user]);

  // WRAPPED ACTIONS WITH ERROR HANDLING

  const createTeam = async (name) => {
    if (!user) throw new Error("Not authenticated");
    try {
      await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'teams'), {
        name,
        captainId: user.uid,
        players: [{ uid: user.uid, name: `Player ${user.uid.slice(0,4)}`, rank: 'Unranked' }],
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      throw err; // Propagate to component for UI handling
    }
  };

  const joinTeam = async (teamId, playerName, rank) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");
    if (team.players.length >= 5) throw new Error("Team is full");
    
    try {
        const newPlayers = [...team.players, { uid: user.uid, name: playerName, rank }];
        await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'teams', teamId), {
          players: newPlayers
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
  };

  const createMatch = async (round, index, team1Id, team2Id) => {
    try {
        await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'matches'), {
          round,
          matchIndex: index,
          team1Id,
          team2Id,
          winnerId: null,
          status: 'scheduled',
          vetoState: {
            phase: 'ban',
            turn: team1Id, // Team 1 starts banning
            bannedMaps: [],
            pickedMap: null
          }
        });
    } catch (err) {
        console.error("Create Match Failed", err);
        setError("Failed to create match.");
    }
  };

  const updateMatch = async (matchId, data) => {
    try {
        await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'matches', matchId), data);
    } catch (err) {
        console.error("Update Match Failed", err);
        throw err;
    }
  };

  return (
    <TournamentContext.Provider value={{ 
      teams, 
      matches, 
      loading, 
      error,
      createTeam, 
      joinTeam, 
      createMatch, 
      updateMatch,
      currentUserId: user?.uid 
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
