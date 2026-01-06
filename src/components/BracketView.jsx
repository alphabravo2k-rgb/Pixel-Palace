import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { useSession } from '../auth/useSession';
import { ROLES, normalizeRole } from '../lib/roles';
import { RefreshCw, WifiOff, Loader2, Trophy, Layout } from 'lucide-react'; 
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

// SUB-COMPONENTS
import Bracket from './Bracket'; 
import { MatchWarRoom } from './admin/MatchWarRoom'; 
import { MatchModal } from './MatchModal'; 

export const BracketView = ({ adminMode = false }) => {
  const { session } = useSession();
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false); 
  const [error, setError] = useState(null);
  
  // Modals
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [warRoomMatchId, setWarRoomMatchId] = useState(null);

  // Helper: Check permissions
  const userRole = normalizeRole(session?.role);
  const isAdmin = adminMode || [ROLES.OWNER, ROLES.ADMIN].includes(userRole);

  const fetchBracket = async () => {
    if (!selectedTournamentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:team1_id(id, name, logo_url, seed_number),
          team2:team2_id(id, name, logo_url, seed_number)
        `)
        .eq('tournament_id', selectedTournamentId)
        .order('round_number', { ascending: true })
        .order('match_position', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to sync bracket data");
      toast.error("Bracket Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  // ⚡ ACTION: Generate Bracket
  const handleGenerate = async () => {
    if (!isAdmin) return;
    if (!window.confirm("⚠️ DANGER ZONE\n\nThis will DELETE the current bracket and existing match history to generate a fresh one.\n\nAre you sure you want to proceed?")) return;

    setGenerating(true);
    const toastId = toast.loading("Generating Bracket Structure...");

    try {
        const { error } = await supabase.rpc('admin_generate_bracket', { 
            p_tournament_id: selectedTournamentId 
        });
        
        if (error) throw error;
        
        toast.success("Bracket Generated Successfully", { id: toastId });
        fetchBracket(); 
    } catch (e) {
        console.error(e);
        toast.error("Generation Failed: " + e.message, { id: toastId });
    } finally {
        setGenerating(false);
    }
  };

  // Realtime Subscription
  useEffect(() => {
    if (!selectedTournamentId) return;
    fetchBracket();
    
    const channel = supabase
      .channel(`bracket-${selectedTournamentId}`)
      .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'matches', 
          filter: `tournament_id=eq.${selectedTournamentId}` 
      }, (payload) => {
          setMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
          fetchBracket(); 
      })
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [selectedTournamentId]);

  const handleMatchClick = (match) => {
      // Allow clicking empty matches in Admin Mode (for War Room overrides)
      if (!match.team1_id && !match.team2_id && !isAdmin) return; 

      if (isAdmin) {
          setWarRoomMatchId(match.id);
      } else {
          setSelectedMatch(match);
      }
  };

  if (contextLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;
  
  if (!selectedTournamentId) return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-600">
          <Trophy size={48} className="mb-4 opacity-20" />
          <span className="font-mono text-xs tracking-widest uppercase">Select a Tournament to Initialize</span>
      </div>
  );

  // 🟢 LOGIC: Separate Main Bracket from 3rd Place Match
  const mainBracketMatches = matches.filter(m => !m.is_third_place);
  const thirdPlaceMatch = matches.find(m => m.is_third_place);

  return (
    <div className="h-full flex flex-col bg-black relative">
        
        {/* HEADER OVERLAY */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
          <div className="bg-black/50 backdrop-blur border border-white/5 p-3 rounded pointer-events-auto">
            <h2 className="text-xl font-display font-bold text-white italic uppercase tracking-tighter leading-none">
              {tournamentData?.name || 'Tactical View'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                   {matches.length} NODES ACTIVE
                </span>
                {loading && <Loader2 size={10} className="animate-spin text-brand" />}
            </div>
          </div>

          <div className="flex gap-2 pointer-events-auto">
              {isAdmin && (
                  <button 
                    onClick={handleGenerate} 
                    disabled={generating || loading}
                    className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 rounded flex items-center gap-2 transition-all disabled:opacity-50"
                    title="Regenerate Bracket Tree"
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Layout className="w-4 h-4"/>}
                    <span className="text-xs font-bold uppercase hidden md:inline">Generate</span>
                  </button>
              )}

              <button onClick={fetchBracket} disabled={loading} className="p-2 bg-black/50 backdrop-blur border border-white/5 hover:border-brand/50 rounded text-zinc-400 hover:text-white transition-all">
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500/50 px-4 py-2 rounded text-red-200 text-xs font-bold z-20 flex items-center gap-2">
            <WifiOff size={12} /> {error}
          </div>
        )}

        {/* 📊 MAIN BRACKET ENGINE */}
        <div className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing pb-32">
           <Bracket matches={mainBracketMatches} onMatchClick={handleMatchClick} />
        </div>

        {/* 🥉 3rd PLACE MATCH (Floating Bottom Right) */}
        {thirdPlaceMatch && (
           <div className="absolute bottom-8 right-8 z-20 animate-in slide-in-from-bottom-8">
               <div className="bg-zinc-900/90 backdrop-blur border border-zinc-700 p-4 rounded-lg shadow-2xl">
                   <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 text-center flex items-center justify-center gap-2">
                       <Trophy size={10} className="text-amber-700"/> 3rd Place Match
                   </h3>
                   <div 
                       onClick={() => handleMatchClick(thirdPlaceMatch)}
                       className="cursor-pointer hover:scale-105 transition-transform"
                   >
                       <div className="flex flex-col gap-px w-48">
                           {/* Team 1 */}
                           <div className={cn(
                               "flex justify-between items-center px-3 py-2 rounded-t border border-zinc-800",
                               thirdPlaceMatch.winner_id && thirdPlaceMatch.winner_id === thirdPlaceMatch.team1_id 
                                ? "bg-amber-900/30 text-amber-500 border-amber-900/50" 
                                : "bg-black text-white"
                           )}>
                               <span className="text-xs font-bold truncate">{thirdPlaceMatch.team1?.name || 'Loser of Semi 1'}</span>
                               <span className="text-xs font-mono">{thirdPlaceMatch.team1_score}</span>
                           </div>
                           
                           {/* Team 2 */}
                           <div className={cn(
                               "flex justify-between items-center px-3 py-2 rounded-b border border-t-0 border-zinc-800",
                               thirdPlaceMatch.winner_id && thirdPlaceMatch.winner_id === thirdPlaceMatch.team2_id 
                                ? "bg-amber-900/30 text-amber-500 border-amber-900/50" 
                                : "bg-black text-white"
                           )}>
                               <span className="text-xs font-bold truncate">{thirdPlaceMatch.team2?.name || 'Loser of Semi 2'}</span>
                               <span className="text-xs font-mono">{thirdPlaceMatch.team2_score}</span>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
        )}

        {/* 🛠️ WAR ROOM (ADMIN) */}
        {warRoomMatchId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="absolute inset-0" onClick={() => setWarRoomMatchId(null)} />
             <div className="relative z-10 w-full max-w-7xl h-[95vh] flex flex-col">
                 <MatchWarRoom 
                    matchId={warRoomMatchId} 
                    onClose={() => setWarRoomMatchId(null)} 
                 />
             </div>
          </div>
        )}

        {/* 🎮 MATCH LOBBY (PLAYER) */}
        {selectedMatch && (
          <MatchModal 
            match={selectedMatch} 
            isOpen={!!selectedMatch}
            onClose={() => setSelectedMatch(null)} 
          />
        )}
    </div>
  );
};

export default BracketView;
