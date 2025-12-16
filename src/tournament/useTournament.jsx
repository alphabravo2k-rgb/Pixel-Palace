import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { MAP_POOL } from '../lib/constants';

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
  const { session } = useSession();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: Parse SQL Veto Log
  const parseVetoLog = (log = []) => {
      const banned = [];
      let picked = null;
      if (Array.isArray(log)) {
          log.forEach(entry => {
              if (typeof entry !== 'string') return;
              const parts = entry.split(' '); 
              if (parts.length < 2) return;
              const action = parts[0].toUpperCase();
              const mapName = parts.slice(1).join(' '); 
              const mapObj = MAP_POOL.find(m => m.name.toLowerCase() === mapName.toLowerCase());
              if (mapObj) {
                  if (action === 'BAN') banned.push(mapObj.id);
                  if (action === 'PICK') picked = mapObj.id;
              }
          });
      }
      return { banned, picked };
  };

  const fetchData = async () => {
    try {
        setLoading(true);
        
        // Fetch Matches
        const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`*, player1:player1_id(display_name), player2:player2_id(display_name), winner:winner_id(display_name)`)
            .order('round', { ascending: true });
        if (matchesError) throw matchesError;

        // Fetch Teams
        const { data: teamsData, error: teamsError } = await supabase
            .from('players')
            .select('*')
            .order('seed_number', { ascending: true });
        if (teamsError) throw teamsError;

        const uiTeams = teamsData.map(t => ({
            id: t.id,
            name: t.display_name,
            captainId: null,
            players: [],
            ...t
        }));

        const uiMatches = matchesData.map(m => {
            const { banned, picked } = parseVetoLog(m.metadata?.veto_log);
            const turnId = m.metadata?.turn === 'B' ? m.player2_id : m.player1_id;

            return {
                id: m.id,
                round: m.round,
                matchIndex: 0,
                team1Id: m.player1_id,
                team2Id: m.player2_id,
                winnerId: m.winner_id,
                status: m.state === 'open' ? 'live' : m.state === 'complete' ? 'completed' : 'scheduled',
                vetoState: {
                    phase: m.state === 'complete' ? 'complete' : 'ban',
                    turn: turnId,
                    bannedMaps: banned,
                    pickedMap: picked
                },
                metadata: m.metadata,
                server_ip: m.server_ip,
                gotv_ip: m.gotv_ip,
                stream_url: m.stream_url
            };
        });

        setTeams(uiTeams);
        setMatches(uiMatches);
        setLoading(false);

    } catch (err) {
        console.error("Supabase Sync Error:", err);
        setError(err.message);
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('tournament_db_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchData())
        .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- TIMELINE FETCHING ---
  const fetchMatchTimeline = async (matchId) => {
      const { data, error } = await supabase
          .from('match_events')
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: false }); // Newest first
      
      if (error) {
          console.error("Timeline Fetch Error:", error);
          return [];
      }
      return data;
  };

  // --- RPC ACTIONS ---

  const submitVeto = async (matchId, vetoData, actionDescription) => {
    if (!session.pin) throw new Error("Authorization Required");
    
    const mapName = actionDescription.replace(/^(Banned|Picked)\s+/i, '').replace(/\s+\(.*\)$/, '').trim();
    const actionType = actionDescription.toUpperCase().includes('PICK') ? 'PICK' : 'BAN';
    const logEntry = `${actionType} ${mapName}`;

    const currentMatch = matches.find(m => m.id === matchId);
    const oldLog = currentMatch?.metadata?.veto_log || [];
    const newLog = [...oldLog, logEntry];
    const nextTurn = currentMatch?.metadata?.turn === 'A' ? 'B' : 'A';

    const newMetadata = { veto_log: newLog, turn: nextTurn };

    const { data, error } = await supabase.rpc('submit_veto', {
        match_id: matchId,
        input_pin: session.pin,
        new_metadata: newMetadata
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Authorization Required");
    if (session.role !== ROLES.ADMIN && session.role !== ROLES.OWNER) {
        throw new Error("Unauthorized");
    }

    const sqlUpdates = {};
    if (updates.status === 'completed') {
        sqlUpdates.state = 'complete';
        sqlUpdates.is_locked = false;
    }
    if (updates.winnerId) sqlUpdates.winner_id = updates.winnerId;
    if (updates.stream_url !== undefined) sqlUpdates.stream_url = updates.stream_url;
    if (updates.server_ip !== undefined) sqlUpdates.server_ip = updates.server_ip;
    if (updates.gotv_ip !== undefined) sqlUpdates.gotv_ip = updates.gotv_ip;
    // Pass manual score update
    if (updates.score !== undefined) sqlUpdates.score = updates.score;

    const { data, error } = await supabase.rpc('admin_update_match', {
        match_id: matchId,
        input_pin: session.pin,
        updates: sqlUpdates
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
  };

  const createTeam = async () => alert("Use SQL Registration Script");
  const joinTeam = async () => alert("Use SQL Registration Script");
  const createMatch = async () => alert("Use SQL Generation Script");

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
      fetchMatchTimeline
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
