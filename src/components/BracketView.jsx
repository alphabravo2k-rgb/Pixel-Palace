import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { useSession } from '../auth/useSession';
import { ROLES, normalizeRole } from '../lib/roles'; // ✅ Mastered Roles
import { RefreshCw, WifiOff, Loader2, Trophy, ZoomIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

// SUB-COMPONENTS
import Bracket from './Bracket'; // Assuming this is your D3/SVG renderer
import { MatchWarRoom } from './admin/MatchWarRoom'; // 🛠️ Admin Control
import { MatchModal } from './MatchModal'; // 🎮 Player Veto/Lobby

export const BracketView = () => {
  const { session } = useSession();
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modals State
  const [selectedMatch, setSelectedMatch] = useState(null); // Player View
  const [warRoomMatchId, setWarRoomMatchId] = useState(null); // Admin View

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
        .order('round', { ascending: true })
        .order('match_no', { ascending: true });

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

  // ⚡ REALTIME SYNC
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
         // Optimistic Update
         setMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
         // Background Refresh to get relations (Team Names etc)
         fetchBracket(); 
      })
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [selectedTournamentId]);

  // 🖱️ SMART CLICK HANDLER
  const handleMatchClick = (match) => {
      if (!match.team1_id && !match.team2_id) return; // Ignore empty slots

      const userRole = normalizeRole(session?.role);
      const isStaff = [ROLES.OWNER, ROLES.ADMIN].includes(userRole);

      if (isStaff) {
          // 🛠️ Staff -> Open War Room
          setWarRoomMatchId(match.id);
      } else {
          // 🎮 Player/Guest -> Open Match Lobby
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

       {/* 📊 BRACKET ENGINE */}
       <div className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing">
          {/* Note: Bracket component handles its own panning/zooming */}
          <Bracket matches={matches} onMatchClick={handleMatchClick} />
       </div>

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
