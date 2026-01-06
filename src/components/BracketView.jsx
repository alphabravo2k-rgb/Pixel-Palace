import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, storageNexus } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { useNexusStore } from '../store/useNexusStore';
import { getClearanceLevel } from '../lib/roles';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { RefreshCw, WifiOff, Loader2, Trophy, Layout, Activity, ShieldAlert } from 'lucide-react'; 
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

// 🏗️ SUB-COMPONENTS (Assumed to exist or will be built next)
import Bracket from './Bracket'; 
import { MatchWarRoom } from './admin/MatchWarRoom'; 
import { MatchModal } from './MatchModal'; 

/**
 * PIXEL PALACE: BATTLE MAP (BRACKET VIEW)
 * ---------------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * VERSION: 4.0.0
 * * FEATURES:
 * 1. GPU ACCELERATION: 'translateZ(0)' forces hardware compositing for smooth panning.
 * 2. ASSET RESOLUTION: Auto-converts logo paths to CDN URLs.
 * 3. REAL-TIME NODE SYNC: Updates specific match nodes without full re-render.
 */

export const BracketView = ({ adminMode = false }) => {
  const { profile } = useNexusStore(); // Global Brain
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament(); // Tournament Context
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal State
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [warRoomMatchId, setWarRoomMatchId] = useState(null);

  // 🛡️ SECURITY RESOLUTION
  const clearance = useMemo(() => getClearanceLevel(profile?.role), [profile]);
  // Level 90+ (Admin) gets write access
  const isAdmin = adminMode || clearance >= 90;

  // 🔄 DATA SYNC ENGINE
  const fetchBracket = useCallback(async () => {
    if (!selectedTournamentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:team1_id(id, name, logo_path, seed_number),
          team2:team2_id(id, name, logo_path, seed_number)
        `)
        .eq('tournament_id', selectedTournamentId)
        .order('round_number', { ascending: true })
        .order('match_position', { ascending: true });

      if (error) throw error;

      // 📁 HARD FILE RESOLUTION: Map logos through the Storage Nexus
      // This ensures <img> tags get valid https:// urls, not raw paths
      const resolvedMatches = data.map(match => ({
        ...match,
        team1: match.team1 ? { ...match.team1, logo: storageNexus.getUrl('team-assets', match.team1.logo_path) } : null,
        team2: match.team2 ? { ...match.team2, logo: storageNexus.getUrl('team-assets', match.team2.logo_path) } : null,
      }));

      setMatches(resolvedMatches);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Nexus Sync Interrupted");
      toast.error("Bracket Uplink Failed");
    } finally {
      setLoading(false);
    }
  }, [selectedTournamentId]);

  // ⚡ COMMAND: BRACKET GENERATION
  const handleGenerate = async () => {
    // Only Owner (Level 100) can nuke the bracket
    if (clearance < 100) {
      SoundNexus.play(CUES.DISPUTE_TRIGGER);
      toast.error("UNAUTHORIZED: Level 100 Clearance Required.");
      return;
    }
    
    if (!window.confirm("⚠️ DESTRUCTIVE ACTION: Wipe match history and rebuild bracket?")) return;

    SoundNexus.play(CUES.UI_CLICK);
    setGenerating(true);
    const { error } = await supabase.rpc('admin_generate_bracket', { 
        p_tournament_id: selectedTournamentId 
    });
    
    if (error) {
        toast.error(error.message);
    } else {
        SoundNexus.play(CUES.SUCCESS || CUES.NOTIFICATION);
        toast.success("Bracket Reconstructed Successfully");
        fetchBracket();
    }
    setGenerating(false);
  };

  // 📡 REAL-TIME SUBSCRIPTION
  useEffect(() => {
    if (!selectedTournamentId) return;
    fetchBracket();
    
    const channel = supabase
      .channel(`bracket:${selectedTournamentId}`)
      .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'matches', 
          filter: `tournament_id=eq.${selectedTournamentId}` 
      }, () => {
          // Debounce could be added here for high traffic
          fetchBracket();
      }) 
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [selectedTournamentId, fetchBracket]);

  // 🖱️ INTERACTION HANDLER
  const handleMatchClick = (match) => {
    // Prevent clicking empty slots unless Admin
    if (!match.team1_id && !match.team2_id && !isAdmin) return; 

    SoundNexus.play(CUES.UI_CLICK);

    if (isAdmin) {
      setWarRoomMatchId(match.id);
    } else {
      setSelectedMatch(match);
    }
  };

  if (contextLoading) return <div className="h-full flex flex-col items-center justify-center bg-black"><Loader2 className="animate-spin text-brand w-10 h-10" /></div>;
  
  // Logic: Separate 3rd Place for specific rendering
  const mainBracketMatches = matches.filter(m => !m.is_third_place);
  const thirdPlaceMatch = matches.find(m => m.is_third_place);

  return (
    <div className="h-full flex flex-col bg-[#020202] relative overflow-hidden">
        
       {/* 1. COMMAND HUD OVERLAY */}
       <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-50">
         <div className="bg-bg-panel/80 backdrop-blur-xl border border-white/5 p-5 rounded-sm pointer-events-auto flex items-center gap-5">
           <div className="relative">
              <div className={cn("absolute -inset-1 rounded-full blur-sm", matches.some(m => m.status === 'live') ? "bg-emerald-500/20" : "bg-brand/20")} />
              <Activity className={cn("relative w-5 h-5", matches.some(m => m.status === 'live') ? "text-emerald-500 animate-pulse" : "text-brand")} />
           </div>
           <div>
              <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
                  {tournamentData?.name || 'GENESIS MAP'}
              </h2>
              <p className="text-[9px] text-zinc-600 font-black tracking-[0.3em] uppercase mt-1">
                  {matches.length} NODES OPERATIONAL // {matches.filter(m => m.status === 'completed').length} SECURED
              </p>
           </div>
         </div>

         <div className="flex gap-3 pointer-events-auto">
             {clearance >= 100 && (
                 <button 
                    onClick={handleGenerate} 
                    disabled={generating || loading}
                    className="px-5 py-3 bg-red-950/20 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white rounded-sm flex items-center gap-3 transition-all duration-300 group"
                 >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Layout className="w-4 h-4 group-hover:rotate-90 transition-transform"/>}
                    <span className="text-[10px] font-black uppercase tracking-widest">Reconstruct</span>
                 </button>
             )}

             <button onClick={fetchBracket} className="p-4 bg-zinc-900/80 backdrop-blur border border-white/5 hover:border-brand/50 text-zinc-500 hover:text-white transition-all">
               <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
             </button>
         </div>
       </div>

       {/* 2. UPLINK FAILURE WARNING */}
       {error && (
         <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-red-600 px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest z-[60] flex items-center gap-3 animate-bounce">
           <WifiOff size={14} /> {error}
         </div>
       )}

       {/* 3. THE BRACKET ENGINE: GPU ACCELERATED CONTAINER */}
       <div className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing will-change-transform" style={{ transform: 'translateZ(0)' }}>
          <Bracket matches={mainBracketMatches} onMatchClick={handleMatchClick} />
       </div>

       {/* 4. 3RD PLACE MATCH (Floating Overlay) */}
       {thirdPlaceMatch && (
           <div className="absolute bottom-8 right-8 z-40 animate-in slide-in-from-bottom-8">
               <div 
                   onClick={() => handleMatchClick(thirdPlaceMatch)}
                   className="bg-zinc-900/90 backdrop-blur border border-zinc-700 p-4 rounded-lg shadow-2xl cursor-pointer hover:border-amber-600/50 hover:scale-105 transition-all group"
               >
                   <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 text-center flex items-center justify-center gap-2 group-hover:text-amber-500 transition-colors">
                       <Trophy size={10} className="text-amber-700"/> Bronze Match
                   </h3>
                   <div className="flex flex-col gap-px w-48">
                       <div className="flex justify-between px-3 py-2 bg-black border border-zinc-800 rounded-t text-xs font-bold text-zinc-300">
                           <span>{thirdPlaceMatch.team1?.name || 'TBD'}</span>
                           <span className="font-mono">{thirdPlaceMatch.team1_score}</span>
                       </div>
                       <div className="flex justify-between px-3 py-2 bg-black border border-t-0 border-zinc-800 rounded-b text-xs font-bold text-zinc-300">
                           <span>{thirdPlaceMatch.team2?.name || 'TBD'}</span>
                           <span className="font-mono">{thirdPlaceMatch.team2_score}</span>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* 5. ADMIN COMMAND TERMINAL */}
       {warRoomMatchId && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0" onClick={() => setWarRoomMatchId(null)} />
            <div className="relative z-10 w-full max-w-[1600px] h-[90vh] shadow-2xl border border-white/5">
                {/* 🛑 STUB: Ensure MatchWarRoom exists or app breaks */}
                <MatchWarRoom 
                    matchId={warRoomMatchId} 
                    onClose={() => setWarRoomMatchId(null)} 
                />
            </div>
         </div>
       )}

       {/* 6. PLAYER LOBBY */}
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
