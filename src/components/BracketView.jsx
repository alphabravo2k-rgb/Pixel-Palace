/**
 * PIXEL PALACE: BATTLE MAP (BRACKET VIEW)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // REAL-TIME SYNCED
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, storageNexus } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { useNexus } from '../hooks/useNexus';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';
import { 
  RefreshCw, WifiOff, Loader2, Trophy, Layout, 
  Activity, ShieldAlert, Zap, Crosshair 
} from 'lucide-react'; 
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

// 🏗️ SUB-COMPONENTS
import { Bracket } from './Bracket'; 
import { MatchWarRoom } from './admin/MatchWarRoom'; 
import { MatchModal } from './MatchModal'; 

export const BracketView = ({ adminMode = false }) => {
  const { user, can } = useNexus();
  const { selectedTournamentId, tournamentData, loading: contextLoading } = useTournament(); 
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [warRoomMatchId, setWarRoomMatchId] = useState(null);

  const isAdmin = adminMode || can('CAP_ACCESS_GOD_MODE');

  /**
   * 🔄 DATA SYNC ENGINE
   * Pulls the entire tournament structure and resolves cloud assets.
   */
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

      // 📁 ASSET RESOLUTION: Map internal paths to public CDN URLs
      const resolvedMatches = data.map(match => ({
        ...match,
        team1: match.team1 ? { ...match.team1, logo: storageNexus.getUrl('team-assets', match.team1.logo_path) } : null,
        team2: match.team2 ? { ...match.team2, logo: storageNexus.getUrl('team-assets', match.team2.logo_path) } : null,
      }));

      setMatches(resolvedMatches);
      setError(null);
      Telemetry.log(EVENTS.ACTION, { action: 'bracket_sync_complete', tournamentId: selectedTournamentId });
    } catch (err) {
      setError("Nexus Sync Interrupted");
      toast.error("BRACKET UPLINK FAILED");
    } finally {
      setLoading(false);
    }
  }, [selectedTournamentId]);

  /**
   * ⚡ COMMAND: ATOMIC BRACKET GENERATION
   * Nukes and rebuilds the tournament geometry.
   */
  const handleGenerate = async () => {
    if (!can('CAP_RECONSTRUCT_BRACKET')) {
      try{SoundNexus.play(CUES.DISPUTE_TRIGGER);}catch(e){}
      toast.error("UNAUTHORIZED: Level 100 Clearance Required.");
      return;
    }
    
    if (!window.confirm("☢️ NUCLEAR OPTION: Wipe match history and rebuild bracket geometry?")) return;

    try{SoundNexus.play(CUES.UI_CLICK_HEAVY);}catch(e){}
    setGenerating(true);
    
    try {
        const { error } = await supabase.rpc('admin_generate_bracket', { 
            p_tournament_id: selectedTournamentId 
        });
        
        if (error) throw error;

        Telemetry.log(EVENTS.ACTION, { action: 'BRACKET_RECONSTRUCTED' }, user.id);
        try{SoundNexus.play(CUES.UI_SUCCESS);}catch(e){}
        toast.success("TOURNAMENT GEOMETRY INITIALIZED");
        fetchBracket();
    } catch (err) {
        toast.error(err.message);
        try{SoundNexus.play(CUES.UI_ERROR);}catch(e){}
    } finally {
        setGenerating(false);
    }
  };

  useEffect(() => {
    if (!selectedTournamentId) return;
    fetchBracket();
    
    const channel = supabase
      .channel(`bracket_live:${selectedTournamentId}`)
      .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'matches', 
          filter: `tournament_id=eq.${selectedTournamentId}` 
      }, () => {
          fetchBracket();
          try{SoundNexus.play(CUES.UI_NOTIFICATION);}catch(e){}
      }) 
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [selectedTournamentId, fetchBracket]);

  const handleMatchClick = (match) => {
    if (!match.team1_id && !match.team2_id && !isAdmin) return; 

    try{SoundNexus.play(CUES.UI_CLICK);}catch(e){}
    if (isAdmin) {
      setWarRoomMatchId(match.id);
    } else {
      setSelectedMatch(match);
    }
  };

  if (contextLoading) return (
    <div className="h-full flex flex-col items-center justify-center bg-black gap-4">
      <Loader2 className="animate-spin text-fuchsia-500 w-12 h-12 opacity-20" />
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Synchronizing Nexus...</span>
    </div>
  );
  
  const mainBracketMatches = matches.filter(m => !m.is_third_place);
  const thirdPlaceMatch = matches.find(m => m.is_third_place);

  return (
    <div className="h-full flex flex-col bg-[#050505] relative overflow-hidden font-sans">
        
       {/* 1. COMMAND HUD OVERLAY */}
       <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-50">
         <div className="bg-[#09090b]/80 backdrop-blur-3xl border border-white/5 p-6 rounded-sm pointer-events-auto flex items-center gap-6 shadow-2xl relative overflow-hidden group">
            {/* SCANLINE DECORATOR */}
            <div className="absolute inset-0 bg-fuchsia-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="relative">
              <div className={cn(
                "absolute -inset-2 rounded-full blur-md opacity-20", 
                matches.some(m => m.status === 'live') ? "bg-red-500 animate-pulse" : "bg-fuchsia-500"
              )} />
              <Activity className={cn("relative w-6 h-6", matches.some(m => m.status === 'live') ? "text-red-500 animate-pulse" : "text-fuchsia-500")} />
            </div>
            <div>
              <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
                  {tournamentData?.name || 'GENESIS_PROTOCOL'}
              </h2>
              <div className="flex items-center gap-3 mt-3">
                  <Zap size={10} className="text-emerald-500" />
                  <p className="text-[9px] text-zinc-500 font-black tracking-[0.4em] uppercase">
                    {matches.length} NODES // {matches.filter(m => m.status === 'completed').length} SECURED
                  </p>
              </div>
            </div>
         </div>

         <div className="flex gap-4 pointer-events-auto">
             {isAdmin && (
                 <button 
                    onClick={handleGenerate} 
                    disabled={generating || loading}
                    className="px-6 py-3 bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white rounded-sm flex items-center gap-3 transition-all duration-500 group shadow-2xl"
                 >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Layout className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500"/>}
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reconstruct</span>
                 </button>
             )}

             <button onClick={fetchBracket} className="p-4 bg-zinc-900/50 backdrop-blur-xl border border-white/5 hover:border-fuchsia-500/50 text-zinc-500 hover:text-white transition-all rounded-sm shadow-2xl">
               <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
             </button>
         </div>
       </div>

       {/* 2. ATMOSPHERIC WARNINGS */}
       {error && (
         <div className="absolute top-40 left-1/2 -translate-x-1/2 bg-red-600 px-8 py-3 rounded-sm text-white text-[10px] font-black uppercase tracking-[0.4em] z-[60] flex items-center gap-4 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-in slide-in-from-top-4">
           <WifiOff size={16} /> {error}
         </div>
       )}

       {/* 3. THE BRACKET ENGINE: GPU ACCELERATED */}
       <div className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing will-change-transform" style={{ transform: 'translateZ(0)' }}>
          <Bracket matches={mainBracketMatches} onMatchClick={handleMatchClick} />
       </div>

       {/* 4. 3RD PLACE MATCH (TACTICAL INSET) */}
       {thirdPlaceMatch && (
           <div className="absolute bottom-10 right-10 z-40 animate-in slide-in-from-right-8 duration-1000">
               <div 
                   onClick={() => handleMatchClick(thirdPlaceMatch)}
                   className="bg-[#09090b]/90 backdrop-blur-2xl border border-zinc-800 p-6 rounded-sm shadow-2xl cursor-pointer hover:border-amber-500/50 transition-all group overflow-hidden"
               >
                   <div className="absolute inset-0 bg-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                   <h3 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mb-4 text-center flex items-center justify-center gap-3 group-hover:text-amber-500 transition-colors">
                       <Crosshair size={12} className="text-amber-900"/> Bronze Engagement
                   </h3>
                   <div className="flex flex-col gap-1 w-56 relative z-10">
                       {[
                         { name: thirdPlaceMatch.team1?.name, score: thirdPlaceMatch.team1_score },
                         { name: thirdPlaceMatch.team2?.name, score: thirdPlaceMatch.team2_score }
                       ].map((t, idx) => (
                        <div key={idx} className="flex justify-between px-4 py-3 bg-black/60 border border-white/5 text-[11px] font-black text-zinc-400 group-hover:text-white transition-colors">
                            <span className="truncate italic uppercase tracking-tighter">{t.name || 'AWAITING_DATA'}</span>
                            <span className="font-mono text-fuchsia-500">{t.score ?? '0'}</span>
                        </div>
                       ))}
                   </div>
               </div>
           </div>
       )}

       {/* 5. ADMIN OVERRIDE TERMINAL */}
       {warRoomMatchId && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-8 animate-in zoom-in-95 duration-500">
            <div className="absolute inset-0" onClick={() => setWarRoomMatchId(null)} />
            <div className="relative z-10 w-full max-w-[1700px] h-[92vh] shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10 rounded-sm overflow-hidden">
                <MatchWarRoom 
                    matchId={warRoomMatchId} 
                    onClose={() => setWarRoomMatchId(null)} 
                />
            </div>
         </div>
       )}

       {/* 6. OPERATOR LOBBY */}
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
