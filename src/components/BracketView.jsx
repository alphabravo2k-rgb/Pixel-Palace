import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { Bracket } from './Bracket';
import { RefreshCw, Loader2, WifiOff } from 'lucide-react';
// ✅ Import Admin Modal (Logic is in admin folder, exported via barrel file potentially, or direct)
import { AdminMatchModal } from './admin/AdminMatchModal'; 

export const BracketView = () => {
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // 🛡️ LIFECYCLE HYGIENE: Track the channel to kill it properly
  const channelRef = useRef(null);

  const fetchBracket = async () => {
    if (!selectedTournamentId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Explicit FK hint usually safer, but this works if FKs are named standardly
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
      console.error("Bracket Load Error:", err);
      setError(err.message || "Failed to sync bracket data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTournamentId) return;

    // 1. Initial Load
    fetchBracket();

    // 2. CLEANUP: Kill previous subscription before starting new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // 3. SUBSCRIBE
    const channel = supabase
      .channel(`bracket-live-${selectedTournamentId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'matches',
        filter: `tournament_id=eq.${selectedTournamentId}` 
      }, () => {
        console.log("⚡ Bracket Update Detected");
        fetchBracket();
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
             console.error("Realtime connection failed");
             setError("Live updates disconnected.");
        }
      });

    channelRef.current = channel;

    // 4. UNMOUNT CLEANUP
    return () => { 
        if (channelRef.current) supabase.removeChannel(channelRef.current); 
    };
  }, [selectedTournamentId]);

  // --- RENDER STATES ---

  if (contextLoading) return <div className="h-screen flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin w-8 h-8" /></div>;
  if (!selectedTournamentId) return <div className="h-screen flex items-center justify-center text-zinc-500 uppercase font-mono tracking-widest">No Tournament Selected</div>;

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      {/* View Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
           <h1 className="text-3xl font-['Teko'] uppercase font-bold tracking-wider text-white">
             {tournamentData?.name || 'Tournament Bracket'}
           </h1>
           <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
             <span className={`w-2 h-2 rounded-full ${matches.length > 0 && !error ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
             {error ? 'CONNECTION ERROR' : matches.length > 0 ? 'LIVE BRACKET' : 'OFFLINE'}
           </div>
        </div>

        <button 
          onClick={fetchBracket} 
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-900/20 border-b border-red-500/20 p-2 text-center text-red-400 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <WifiOff size={14} /> {error}
        </div>
      )}

      {/* RENDER THE BRACKET */}
      <div className="relative flex-1 bg-[url('/grid-pattern.svg')] bg-fixed overflow-x-auto custom-scrollbar">
        <Bracket 
          matches={matches} 
          onMatchClick={(m) => setSelectedMatch(m)} 
        />
      </div>

      {/* ADMIN MODAL */}
      {selectedMatch && (
        <AdminMatchModal 
          match={selectedMatch} 
          isOpen={!!selectedMatch} 
          onClose={() => setSelectedMatch(null)}
          onUpdate={fetchBracket} 
        />
      )}
    </div>
  );
};
