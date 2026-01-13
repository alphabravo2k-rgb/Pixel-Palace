/**
 * 🗺️ VETO CONTROLLER: STRATEGIC SELECTION
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // REAL-TIME SYNCED
 */

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { 
    Ban, CheckCircle, Clock, Lock, Trophy, Loader2, 
    Flame, Sun, Building2, Radiation, Leaf, Tornado, Skull, Zap
} from 'lucide-react';
import { MATCH_FORMATS } from '../../lib/constants';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', icon: Building2, color: 'text-amber-400', border: 'hover:border-amber-400', glow: 'shadow-amber-500/20' },
  { id: 'de_inferno', name: 'Inferno', icon: Flame, color: 'text-red-500', border: 'hover:border-red-500', glow: 'shadow-red-500/20' },
  { id: 'de_nuke', name: 'Nuke', icon: Radiation, color: 'text-sky-400', border: 'hover:border-sky-400', glow: 'shadow-sky-500/20' },
  { id: 'de_vertigo', name: 'Vertigo', icon: Tornado, color: 'text-zinc-300', border: 'hover:border-zinc-300', glow: 'shadow-zinc-500/20' },
  { id: 'de_ancient', name: 'Ancient', icon: Leaf, color: 'text-green-400', border: 'hover:border-green-400', glow: 'shadow-green-500/20' },
  { id: 'de_anubis', name: 'Anubis', icon: Skull, color: 'text-yellow-600', border: 'hover:border-yellow-600', glow: 'shadow-yellow-600/20' },
  { id: 'de_dust2', name: 'Dust 2', icon: Sun, color: 'text-yellow-400', border: 'hover:border-yellow-400', glow: 'shadow-yellow-500/20' }
];

export const VetoController = ({ match, onUpdate }) => {
  const { user } = useNexus();
  const [vetoLog, setVetoLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🛰️ REAL-TIME UPLINK
  useEffect(() => {
    const fetchVetoes = async () => {
        const { data } = await supabase.from('match_vetoes').select('*').eq('match_id', match.id).order('pick_order');
        setVetoLog(data || []);
    };
    fetchVetoes();

    const channel = supabase.channel(`veto_vortex:${match.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_vetoes', filter: `match_id=eq.${match.id}` }, p => {
            setVetoLog(prev => [...prev, p.new]);
            try { SoundNexus.play(CUES.UI_NOTIFICATION); } catch(e){}
            if(onUpdate) onUpdate();
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, [match.id, onUpdate]);

  // 🧠 LOGIC ENGINE: Protocol Resolution
  const sequence = useMemo(() => {
    const formatKey = `BO${match.best_of || 1}`;
    return MATCH_FORMATS[formatKey]?.sequence || MATCH_FORMATS.BO1.sequence;
  }, [match.best_of]);
  
  const currentStepIndex = vetoLog.length;
  const isComplete = currentStepIndex >= sequence.length;
  const currentStepData = !isComplete ? sequence[currentStepIndex] : null;
  const currentAction = currentStepData?.type || 'WAIT';
  
  // Safely determine which team is active based on step data
  const activeTeamKey = currentStepData?.team?.toLowerCase() === 'team1' ? 'team1_id' : 'team2_id';
  const currentActorTeamId = currentStepData ? match[activeTeamKey] : null;
  
  const isMyTurn = user?.teamId === currentActorTeamId && !isComplete;

  const handleAction = async (mapId) => {
    if (loading || !isMyTurn) return;
    
    try { SoundNexus.play(CUES.UI_CLICK_HEAVY); } catch(e){}
    const mapName = MAP_POOL.find(m => m.id === mapId)?.name;
    
    if (!window.confirm(`CONFIRM STRATEGIC ${currentAction}: ${mapName}?`)) return;
    
    setLoading(true);
    try {
        const { error } = await supabase.rpc('api_submit_veto', { 
            p_match_id: match.id, p_map_name: mapId, p_type: currentAction 
        });
        if(error) throw error;

        Telemetry.log(EVENTS.ACTION, { action: `VETO_${currentAction}`, map: mapId }, user.id);
        try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
    } catch(e) { 
        toast.error(e.message.toUpperCase());
        try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
    } finally { 
        setLoading(false); 
    }
  };

  const getMapStatus = (mapId) => {
    const entry = vetoLog.find(v => v.map_name === mapId);
    return entry ? entry.type : 'AVAILABLE';
  };

  // 🏆 CONCLUDED STATE: Strategic Result
  if (isComplete) {
      const pickedMaps = vetoLog.filter(v => v.type === 'PICK').map(v => v.map_name);
      const bannedMaps = vetoLog.filter(v => v.type === 'BAN').map(v => v.map_name);
      const deciderId = MAP_POOL.find(m => !pickedMaps.includes(m.id) && !bannedMaps.includes(m.id))?.id;
      
      let finalMapIds = match.best_of === 1 ? [deciderId] : [...pickedMaps, deciderId];
      // Filter out undefined in case logic fails
      const displayMaps = finalMapIds.filter(id => id).map(id => MAP_POOL.find(m => m.id === id));

      return (
        <div className="text-center p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-sm animate-in zoom-in-95 duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05),_transparent)]" />
            <Trophy className="w-16 h-16 text-emerald-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">Veto Concluded</h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-2 uppercase tracking-[0.4em]">Theatre of War Defined</p>
            
            <div className="flex justify-center gap-6 flex-wrap mt-10 relative z-10">
                {displayMaps.map((m, idx) => (
                    <div key={idx} className="flex flex-col items-center group">
                        <div className="w-44 h-28 rounded-sm bg-black border border-emerald-500/40 relative flex items-center justify-center shadow-2xl transition-all group-hover:border-emerald-500 group-hover:-translate-y-1">
                             <m.icon className={cn("w-12 h-12 opacity-40 transition-all group-hover:opacity-100", m.color)} />
                             <span className="absolute bottom-3 text-white font-black uppercase text-[11px] tracking-widest">{m?.name}</span>
                             <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-sm tracking-tighter">
                                {idx === displayMaps.length - 1 && match.best_of > 1 ? 'DECIDER' : `MAP ${idx + 1}`}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       {/* TURN INDICATOR */}
       <div className={cn(
         "p-6 rounded-sm border flex items-center justify-between transition-all duration-700 relative overflow-hidden",
         isMyTurn ? "bg-fuchsia-600/5 border-fuchsia-500 shadow-[0_0_40px_rgba(192,38,211,0.1)]" : "bg-zinc-950 border-zinc-800 opacity-40 grayscale"
       )}>
          <div className="flex items-center gap-6 relative z-10">
             <div className={cn(
               "w-14 h-14 rounded-sm flex items-center justify-center border-2 transition-all duration-500 rotate-45",
               isMyTurn ? "border-fuchsia-500 text-fuchsia-400 animate-pulse bg-fuchsia-500/10" : "border-zinc-800 text-zinc-700"
             )}>
                {loading ? <Loader2 className="animate-spin -rotate-45" /> : isMyTurn ? <Zap size={24} className="-rotate-45" /> : <Lock size={24} className="-rotate-45" />}
             </div>
             <div>
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.4em]">Protocol Status</p>
                <h3 className={cn("text-2xl font-display font-black uppercase italic tracking-tighter mt-1", isMyTurn ? "text-white" : "text-zinc-600")}>
                    {isMyTurn ? `Your Turn to ${currentAction}` : `Awaiting Opponent ${currentAction}...`}
                </h3>
             </div>
          </div>
          {isMyTurn && <div className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest animate-pulse mr-4">Action Required</div>}
       </div>

       {/* MAP GRID */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {MAP_POOL.map(map => {
             const status = getMapStatus(map.id);
             const isBanned = status === 'BAN';
             const isPicked = status === 'PICK';
             const isAvailable = status === 'AVAILABLE';
             const Icon = map.icon;
             
             return (
               <button 
                 key={map.id} 
                 disabled={!isAvailable || !isMyTurn || loading} 
                 onClick={() => handleAction(map.id)}
                 className={cn(
                   "relative h-32 rounded-sm border transition-all duration-500 group flex flex-col items-center justify-center gap-3 bg-zinc-900/20 overflow-hidden",
                   isBanned && "border-red-900/30 opacity-20 grayscale cursor-not-allowed",
                   isPicked && "border-emerald-500 bg-emerald-500/5 shadow-lg",
                   isAvailable && "border-zinc-800",
                   isAvailable && isMyTurn && "hover:border-fuchsia-500 hover:bg-fuchsia-500/5 cursor-pointer hover:-translate-y-1 shadow-2xl"
                 )}
               >
                 <Icon className={cn("w-10 h-10 transition-all duration-700 group-hover:scale-110", map.color)} />
                 <span className="text-white font-display font-black text-lg uppercase italic tracking-tighter">{map.name}</span>
                 
                 {isBanned && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                     <Ban className="w-12 h-12 text-red-600 rotate-12 opacity-50" />
                   </div>
                 )}
                 {isPicked && (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <CheckCircle className="w-12 h-12 text-emerald-500/40" />
                   </div>
                 )}
                 {isAvailable && isMyTurn && (
                   <div className={cn(
                     "absolute bottom-2 text-[8px] font-black uppercase tracking-widest transition-all translate-y-4 group-hover:translate-y-0",
                     currentAction === 'BAN' ? 'text-red-500' : 'text-emerald-500'
                   )}>
                     Confirm {currentAction}
                   </div>
                 )}
               </button>
             );
          })}
       </div>
    </div>
  );
};
