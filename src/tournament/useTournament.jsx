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

  // Helper: Parse Structured Veto State from DB (JSONB) -> UI Format
  const parseVetoState = (vetoMeta) => {
      const banned = [];
      let picked = null; 
      
      const maps = vetoMeta?.maps || [];
      if (Array.isArray(maps)) {
          maps.forEach(entry => {
              if (entry.action === 'BAN') banned.push(entry.map_id);
              if (entry.action === 'PICK') picked = entry.map_id; 
          });
      }
      return { banned, picked };
  };

  const fetchData = async () => {
    try {
        setLoading(true);
        
        // 1. Fetch Matches
        const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`*, player1:player1_id(display_name), player2:player2_id(display_name), winner:winner_id(display_name)`)
            .order('round', { ascending: true });

        if (matchesError) throw matchesError;

        // 2. Fetch Teams
        const { data: teamsData, error: teamsError } = await supabase
            .from('players')
            .select('*')
            .order('seed_number', { ascending: true });

        if (teamsError) throw teamsError;

        // 3. Map Data
        const uiTeams = teamsData.map(t => ({
            id: t.id,
            name: t.display_name,
            captainId: null, 
            players: [],
            ...t
        }));

        const uiMatches = matchesData.map(m => {
            const { banned, picked } = parseVetoState(m.metadata?.veto);
            
            // Derive turn from metadata (calculated by SQL backend now)
            const turnId = m.metadata?.turn === 'B' ? m.player2_id : m.player1_id;

            return {
                id: m.id,
                round: m.round,
                matchIndex: 0, // SQL sort order handles visual placement
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
                metadata: m.metadata, // Keep raw metadata for logs/debug
                server_ip: m.server_ip,
                gotv_ip: m.gotv_ip,
                stream_url: m.stream_url,
                score: m.score
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

    // Realtime: Listen for DB changes
    const channel = supabase.channel('tournament_db_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchData())
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- RPC ACTIONS (Secure Backend Calls) ---

  const submitVeto = async (matchId, vetoData, actionDescription) => {
    if (!session.pin) throw new Error("Authorization Required");
    
    // Parse the UI action string ("Banned Ancient") to get parameters for the SQL RPC
    const isBan = actionDescription.toUpperCase().includes('BAN');
    const isPick = actionDescription.toUpperCase().includes('PICK');
    const action = isBan ? 'BAN' : isPick ? 'PICK' : 'SIDE';
    
    const mapName = actionDescription.replace(/^(Banned|Picked)\s+/i, '').replace(/\s+\(.*\)$/, '').trim();
    
    const mapObj = MAP_POOL.find(m => m.name.toLowerCase() === mapName.toLowerCase());
    if (!mapObj) throw new Error("Invalid Map Name");

    // Call the Secure SQL RPC
    const { data, error } = await supabase.rpc('submit_veto', {
        match_id: matchId,
        input_pin: session.pin,
        action: action,
        target_map_id: mapObj.id
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
  };

  const adminUpdateMatch = async (matchId, updates) => {
    if (!session.pin) throw new Error("Authorization Required");
    if (session.role !== ROLES.ADMIN && session.role !== ROLES.OWNER) {
        throw new Error("Unauthorized");
    }

    // Map UI updates to SQL column names
    const sqlUpdates = {};
    
    if (updates.status === 'completed') {
        sqlUpdates.state = 'complete';
        sqlUpdates.is_locked = false; // Unlock if forcing end
    } else if (updates.status) {
        // Map other UI statuses back to SQL
        sqlUpdates.state = updates.status === 'live' ? 'open' : updates.status === 'scheduled' ? 'pending' : updates.status;
    }

    if (updates.winnerId) sqlUpdates.winner_id = updates.winnerId;
    if (updates.stream_url !== undefined) sqlUpdates.stream_url = updates.stream_url;
    if (updates.server_ip !== undefined) sqlUpdates.server_ip = updates.server_ip;
    if (updates.gotv_ip !== undefined) sqlUpdates.gotv_ip = updates.gotv_ip;
    if (updates.score !== undefined) sqlUpdates.score = updates.score;

    const { data, error } = await supabase.rpc('admin_update_match', {
        match_id: matchId,
        input_pin: session.pin,
        updates: sqlUpdates
    });

    if (error) throw new Error(error.message);
    if (data && !data.success) throw new Error(data.error);
  };

  const fetchMatchTimeline = async (matchId) => {
      const { data, error } = await supabase
          .from('audit_logs') // or 'match_events' depending on your exact SQL setup choice
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: false });
      
      if (error) {
          console.error("Timeline Fetch Error:", error);
          return [];
      }
      return data;
  };

  const createTeam = async () => alert("Use SQL Registration Script in Supabase Dashboard.");
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
      fetchMatchTimeline
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
