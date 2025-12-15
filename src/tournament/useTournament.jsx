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
import { useSession } from '../auth/useSession'; // FIXED: Imports Session, not Auth
import { ROLES } from '../lib/roles';

const TournamentContext = createContext();
const APP_ID = "cs2-tournament-manager"; 

export const TournamentProvider = ({ children }) => {
  const { session } = useSession(); // FIXED: Uses session
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync Logic - Always runs
  useEffect(() => {
    setLoading(true);
    const teamsQuery = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'teams'));
    const unsubTeams = onSnapshot(teamsQuery, (snapshot) => {
      setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Teams Sync Error", err));

    const matchesQuery = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'matches'));
    const unsubMatches = onSnapshot(matchesQuery, (snapshot) => {
      const ms = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      ms.sort((a, b) => (a.round - b.round) || (a.matchIndex - b.matchIndex));
      setMatches(ms);
      setLoading(false);
    }, (err) => console.error("Matches Sync Error", err));

    return () => { unsubTeams(); unsubMatches(); };
  }, []);

  // --- ACTIONS ---

  const createTeam = async (name) => {
    if (!session.isAuthenticated) throw new Error("Must be logged in");
    try {
      await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'teams'), {
        name,
        captainName: session.identity,
        players: [{ 
            name: session.identity, 
            role: 'CAPTAIN', 
            addedAt: new Date().toISOString() 
        }],
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const joinTeam = async (teamId, playerName, rank) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");
    
    if (team.players.length >= 6) throw new Error("Roster full (5 Main + 1 Sub)");
    
    const role = team.players.length >= 5 ? 'SUBSTITUTE' : 'PLAYER';
    
    try {
        const newPlayers = [...team.players, { name: playerName, rank, role, addedAt: new Date().toISOString() }];
        await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'teams', teamId), {
          players: newPlayers
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
  };

  const submitVeto = async (matchId, vetoData, actionDescription) => {
    const matchRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'matches', matchId);
    
    const logEntry = {
        actor: session.identity,
        role: session.role,
        action: actionDescription,
        timestamp: new Date().toISOString(),
        payload: vetoData
    };
    
    try {
        const currentMatch = matches.find(m => m.id === matchId);
        const currentLog = currentMatch.vetoLog || [];

        await updateDoc(matchRef, {
            ...vetoData,
            vetoLog: [...currentLog, logEntry]
        });
    } catch (err) {
        console.error("Veto Failed", err);
        throw err;
    }
  };

  const adminUpdateMatch = async (matchId, data) => {
      if (session.role !== ROLES.ADMIN && session.role !== ROLES.OWNER) {
          throw new Error("Unauthorized: Admin Access Required");
      }
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'matches', matchId), data);
  };
  
  const createMatch = async (round, index, team1Id, team2Id) => {
    if (session.role !== ROLES.ADMIN && session.role !== ROLES.OWNER) return;
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
            turn: team1Id,
            bannedMaps: [],
            pickedMap: null
          }
        });
    } catch (err) {
        console.error("Create Match Failed", err);
        setError("Failed to create match.");
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
      submitVeto, 
      adminUpdateMatch,
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
