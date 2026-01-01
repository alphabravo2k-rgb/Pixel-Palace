import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import Bracket from './Bracket'; // Imports the engine
import { RefreshCw, WifiOff, Loader2 } from 'lucide-react';
import MatchModal from './MatchModal'; 

export const BracketView = () => {
  // 1. Get the Tournament ID dynamically from Context
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const channelRef = useRef(null);

  const fetchBracket = async () => {
    if (!selectedTournamentId) return;
    setLoading(true);
    try {
      // ⚠️ FIX: Explicitly select columns to prevent 400 Errors on joined tables
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:team1_id(id, name, logo_url),
          team2:team2_id(id, name, logo_url)
        `)
        .eq('tournament_id', selectedTournamentId)
        .order('match_no', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Grid Sync Failure");
    } finally {
      setLoading(false);
    }
  };

  // 2. Realtime Listener & Initial Fetch
  useEffect(() => {
    if (!selectedTournamentId) return;

    fetchBracket();
    
    const channel = supabase
      .channel(`bracket-${selectedTournamentId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `tournament_id=eq.${selectedTournamentId}` }, (payload) => {
         // Optimistic Update
         setMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
         fetchBracket(); // Full refresh to get team names
      })
      .subscribe();

    channelRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [selectedTournamentId]);

  if (contextLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;
  if (!selectedTournamentId) return <div className="h-screen flex items-center justify-center text-zinc-600 font-mono text-xs tracking-widest uppercase">Select a Tournament</div>;

  return (
    <div className="h-full flex flex-col bg-[#050505]">
       {/* Toolbar */}
       <div className="flex justify-between items-center p-4 border-b border-white/5 bg-zinc-950">
          <div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
               {tournamentData?.name || 'Tactical Bracket'}
            </h2>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
               {matches.length} Nodes Active
            </span>
          </div>
          <button onClick={fetchBracket} disabled={loading} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
       </div>

       {/* Error State */}
       {error && (
         <div className="bg-red-900/20 p-2 text-center text-red-400 text-xs font-bold border-b border-red-900/50">
           <WifiOff size={12} className="inline mr-2"/> {error}
         </div>
       )}

       {/* The Bracket Engine */}
       <div className="flex-1 overflow-hidden relative">
          <Bracket matches={matches} onMatchClick={setSelectedMatch} />
       </div>

       {/* Modal Layer */}
       {selectedMatch && (
         <MatchModal 
            match={selectedMatch} 
            onClose={() => setSelectedMatch(null)} 
         />
       )}
    </div>
  );
};

export default BracketView;
