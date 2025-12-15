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

  // Helper: Parse SQL Veto Log strings (e.g. "BAN Mirage") -> UI Map IDs
  const parseVetoLog = (log = []) => {
      const banned = [];
      let picked = null;
      
      if (Array.isArray(log)) {
          log.forEach(entry => {
              if (typeof entry !== 'string') return;
              // Format assumption: "BAN MapName" or "PICK MapName"
              const parts = entry.split(' '); 
              if (parts.length < 2) return;
              
              const action = parts[0].toUpperCase();
              const mapName = parts.slice(1).join(' '); 
              
              // Find ID from Constant Pool
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
        
        // 1. Fetch Matches with Team Names (SQL Joins)
        const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`
                *, 
                player1:player1_id(display_name), 
                player2:player2_id(display_name), 
                winner:winner_id(display_name)
            `)
            .order('round', { ascending: true });

        if (matchesError) throw matchesError;

        // 2. Fetch Teams (From 'players' table)
        const { data: teamsData, error: teamsError } = await supabase
            .from('players')
            .select('*')
            .order('seed_number', { ascending: true });

        if (teamsError) throw teamsError;

        // 3. Map SQL Data -> UI Format
        const uiTeams = teamsData.map(t => ({
            id: t.id,
            name: t.display_name,
            captainId: null, // Logic managed by access_keys table, not exposed here directly
            players: [], // Roster logic requires separate query if needed
            ...t
        }));

        const uiMatches = matchesData.map(m => {
            const { banned, picked } = parseVetoLog(m.metadata?.veto_log);
            
            // Determine turn from metadata ("A" vs "B")
            // Default to Player 1 if waiting
            const turnId = m.metadata?.turn === 'B' ? m.player2_id : m.player1_id;

            return {
                id: m.id,
                round: m.round,
                matchIndex: 0, // SQL sort order handles this
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
                metadata: m.metadata, // Keep raw for debugging/RPCs
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

    // Realtime: Listen for ANY change to matches or players
    const channel = supabase.channel('tournament_db_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchData())
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- RPC ACTIONS (Executing SQL Functions) ---

  const submitVeto = async (matchId, vetoData, actionDescription) => {
    if (!session.pin) throw new Error("Authorization Required");
    
    // We need to format the log entry for SQL: "BAN MapName"
    const mapName = actionDescription.replace(/^(Banned|Picked)\s+/i, '').replace(/\s+\(.*\)$/, '').trim();
    const actionType = actionDescription.toUpperCase().includes('PICK') ? 'PICK' : 'BAN';
    const logEntry = `${actionType} ${mapName}`;

    // Get current match to calculate next state for the DB
    const currentMatch = matches.find(m => m.id === matchId);
    const oldLog = currentMatch?.metadata?.veto_log || [];
    const newLog = [...oldLog, logEntry];
    
    // Toggle Turn: A -> B -> A
    const nextTurn = currentMatch?.metadata?.turn === 'A' ? 'B' : 'A';

    const newMetadata = {
        veto_log: newLog,
        turn: nextTurn
    };

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

    // Map frontend updates to SQL columns
    const sqlUpdates = {};
    if (updates.status === 'completed') {
        sqlUpdates.state = 'complete';
        sqlUpdates.is_locked = false; // Unlock if forcing end
    }
    if (updates.winnerId) sqlUpdates.winner_id = updates.winnerId;
    
    // Server/Stream updates
    if (updates.stream_url !== undefined) sqlUpdates.stream_url = updates.stream_url;
    if (updates.server_ip !== undefined) sqlUpdates.server_ip = updates.server_ip;
    if (updates.gotv_ip !== undefined) sqlUpdates.gotv_ip = updates.gotv_ip;

    const { data, error } = await supabase.rpc('admin_update_match', {
        match_id: matchId,
        input_pin: session.pin,
        updates: sqlUpdates
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
  };

  // Stubs for actions now handled by SQL Scripts
  const createTeam = async () => alert("Please use the SQL Registration Script in Supabase Dashboard.");
  const joinTeam = async () => alert("Registration is handled via Discord/SQL.");
  const createMatch = async () => alert("Matches are generated via SQL Script.");

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
