import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { Bracket } from './Bracket';
import { RefreshCw, Loader2, WifiOff } from 'lucide-react';
import { AdminMatchModal } from './admin/AdminMatchModal'; 

export const BracketView = () => {
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const channelRef = useRef(null);

  // 1. Initial Fetch
  const fetchBracket = async () => {
    if (!selectedTournamentId) return;
    setLoading(true);
    try {
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
    } catch (err) {
      console.error(err);
      setError("Failed to load bracket.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Realtime Listener (Surgical)
  useEffect(() => {
    if (!selectedTournamentId) return;

    fetchBracket();

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`bracket-${selectedTournamentId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `tournament_id=eq.${selectedTournamentId}` },
        (payload) => {
          // ⚡ SURGICAL UPDATE: Update only the specific match that changed
          // We assume 'team1' and 'team2' foreign objects might not be in the payload,
          // so for structural changes (team swaps), we might still need to refetch.
          // But for scores/status, we can patch.
          
          setMatches(prevMatches => prevMatches.map(m => {
             if (m.id === payload.new.id) {
                // Merge new data while keeping existing relations (teams)
                return { ...m, ...payload.new };
             }
             return m;
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') setError("Live updates disconnected.");
      });

    channelRef.current = channel;

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [selectedTournamentId]);

  if (contextLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;
  if (!selectedTournamentId) return <div className="h-screen flex items-center justify-center text-zinc-600 font-mono">SELECT TOURNAMENT</div>;

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div>
           <h1 className="text-3xl font-['Teko'] uppercase font-bold tracking-wider text-white">
             {tournamentData?.name || 'Bracket'}
           </h1>
           <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
             <span className={`w-2 h-2 rounded-full ${!error ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
             {error ? 'OFFLINE' : 'LIVE FEED ACTIVE'}
           </div>
        </div>
        <button onClick={fetchBracket} disabled={loading} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <div className="bg-red-900/20 p-2 text-center text-red-400 text-xs font-bold"><WifiOff size={14} className="inline mr-2"/>{error}</div>}

      <div className="flex-1 bg-[url('/grid-pattern.svg')] bg-fixed">
        <Bracket matches={matches} onMatchClick={setSelectedMatch} />
      </div>

      {selectedMatch && (
        <AdminMatchModal 
          match={selectedMatch} 
          isOpen={!!selectedMatch} 
          onClose={() => setSelectedMatch(null)}
          onUpdate={fetchBracket} // Full refresh on manual admin save is safer
        />
      )}
    </div>
  );
};
