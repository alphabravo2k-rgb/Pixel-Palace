import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { Bracket } from './Bracket';
import { RefreshCw, Loader2 } from 'lucide-react';
import { AdminMatchModal } from './admin/AdminMatchModal'; // Ensure this path is correct

export const BracketView = () => {
  // 1. Context Binding (The Single Source of Truth)
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null); // Controls the Admin Modal

  // 2. Fetch Logic (Strictly typed to Supabase structure)
  const fetchBracket = async () => {
    if (!selectedTournamentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(id, name, logo_url),
          team2:teams!matches_team2_id_fkey(id, name, logo_url)
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

  // 3. Lifecycle & Realtime
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

  // Loading States
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
          onMatchClick={(m) => setSelectedMatch(m)} // Pass the click handler down
        />
      </div>

      {/* ADMIN MODAL (Lives at the top level) */}
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
