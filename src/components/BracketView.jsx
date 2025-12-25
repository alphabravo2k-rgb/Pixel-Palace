import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { Bracket } from './Bracket';
import { RefreshCw, Loader2 } from 'lucide-react';
// ✅ FIX: Correct path based on your file structure
import { AdminMatchModal } from './admin/AdminMatchModal';

export const BracketView = () => {
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const fetchBracket = async () => {
    if (!selectedTournamentId) return;
    
    setLoading(true);
    try {
      // ✅ FIX: Simplified Query
      // Using 'team1:team1_id(...)' relies on Supabase auto-detecting the FK.
      // If this fails, we can revert to the explicit string, but this is cleaner.
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBracket();

    const subscription = supabase
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
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [selectedTournamentId]);

  if (contextLoading) return <div className="h-screen flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin w-8 h-8" /></div>;
  if (!selectedTournamentId) return <div className="h-screen flex items-center justify-center text-zinc-500 uppercase font-mono tracking-widest">No Tournament Selected</div>;

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* View Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
           <h1 className="text-3xl font-['Teko'] uppercase font-bold tracking-wider text-white">
             {tournamentData?.name || 'Tournament Bracket'}
           </h1>
           <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
             <span className={`w-2 h-2 rounded-full ${matches.length > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
             {matches.length > 0 ? 'LIVE BRACKET' : 'OFFLINE'}
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

      {/* RENDER THE BRACKET */}
      <div className="relative min-h-[600px] bg-[url('/grid-pattern.svg')] bg-fixed overflow-x-auto custom-scrollbar">
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

export default BracketView;
