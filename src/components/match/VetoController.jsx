import React, { useState } from 'react';
import { useCaptainVeto } from '../../hooks/useCaptainVeto';
import { MAP_POOL } from '../../lib/constants';
import { Ban, CheckCircle, Clock, Lock, Trophy, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const VetoController = ({ match }) => {
  // 🪝 Use the Master Hook for Logic (Realtime, State, Permissions)
  const { 
    vetoes, 
    isMyTurn, 
    currentAction, 
    submitVeto, 
    loading 
  } = useCaptainVeto(match);

  const [hoveredMap, setHoveredMap] = useState(null);

  // Helper to check map status
  const getMapStatus = (mapId) => {
    const entry = vetoes.find(v => v.map_name === mapId);
    if (entry) return entry.type; // 'BAN', 'PICK', 'DECIDER'
    return 'AVAILABLE';
  };

  // Safe Submit Handler
  const handleAction = async (mapId) => {
    if (loading || !isMyTurn) return;
    
    // Safety confirm for BAN actions
    if (currentAction === 'BAN') {
        const confirm = window.confirm(`Confirm BAN for ${MAP_POOL.find(m => m.id === mapId)?.name}?`);
        if (!confirm) return;
    }
    
    await submitVeto(mapId);
  };

  const isComplete = match.status === 'completed' || match.status === 'live' || (vetoes.length >= (match.best_of === 3 ? 6 : 6));

  // 🏁 COMPLETION VIEW
  if (isComplete) {
     const finalMaps = vetoes.filter(v => v.type === 'PICK' || v.type === 'DECIDER');
     return (
        <div className="text-center p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-lg animate-in fade-in">
            <Trophy className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Veto Sequence Complete</h3>
            <div className="flex justify-center gap-4 mt-4">
                {finalMaps.map(m => (
                    <div key={m.map_name} className="flex flex-col items-center">
                        <div className="w-24 h-14 rounded overflow-hidden border border-emerald-500/50 relative">
                             <img src={MAP_POOL.find(p => p.id === m.map_name)?.image} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-mono text-emerald-400 mt-1 uppercase">{m.map_name.replace('de_', '')}</span>
                    </div>
                ))}
            </div>
        </div>
     );
  }

  // 🎮 ACTIVE INTERFACE
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
       
       {/* TURN INDICATOR */}
       <div className={cn(
           "p-4 rounded-lg border flex items-center justify-between transition-all duration-300",
           isMyTurn 
             ? "bg-bg-panel border-brand shadow-[0_0_15px_rgba(var(--color-brand)/0.2)]" 
             : "bg-zinc-900 border-zinc-800 opacity-80"
       )}>
          <div className="flex items-center gap-4">
             <div className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center border",
                 isMyTurn ? "bg-brand/20 border-brand text-brand-glow animate-pulse" : "bg-zinc-800 border-zinc-700 text-zinc-500"
             )}>
                {loading ? <Loader2 className="animate-spin" /> : isMyTurn ? <Clock /> : <Lock />}
             </div>
             <div>
                <h3 className={cn("text-lg font-bold uppercase leading-none", isMyTurn ? "text-white" : "text-zinc-500")}>
                    {isMyTurn ? `Your Turn to ${currentAction}` : `Opponent is ${currentAction}ING...`}
                </h3>
                {isMyTurn && <p className="text-[10px] text-brand-glow font-mono mt-1">SELECT A MAP BELOW</p>}
             </div>
          </div>
       </div>

       {/* MAP GRID */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MAP_POOL.map(map => {
             const status = getMapStatus(map.id); // 'BAN', 'PICK', 'AVAILABLE'
             const isBanned = status === 'BAN';
             const isPicked = status === 'PICK';
             const isAvailable = status === 'AVAILABLE';
             
             // Dynamic Styling
             let borderColor = "border-zinc-800";
             let opacity = "opacity-100";
             
             if (isBanned) {
                 borderColor = "border-red-900";
                 opacity = "opacity-40 grayscale";
             } else if (isPicked) {
                 borderColor = "border-emerald-500";
             } else if (isAvailable && isMyTurn) {
                 borderColor = currentAction === 'BAN' ? "hover:border-red-500" : "hover:border-emerald-500";
             }

             return (
               <button 
                 key={map.id} 
                 disabled={!isAvailable || !isMyTurn || loading} 
                 onClick={() => handleAction(map.id)}
                 onMouseEnter={() => setHoveredMap(map.id)}
                 onMouseLeave={() => setHoveredMap(null)}
                 className={cn(
                    "relative h-32 md:h-40 rounded-lg overflow-hidden border-2 transition-all duration-300 group",
                    borderColor,
                    opacity,
                    isAvailable && isMyTurn ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg" : "cursor-not-allowed"
                 )}
               >
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${map.image})` }} />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                  
                  {/* Label */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black to-transparent">
                     <span className="text-white font-black text-lg uppercase tracking-widest font-display shadow-black drop-shadow-md">
                        {map.name}
                     </span>
                  </div>

                  {/* Status Overlay Icons */}
                  <div className="absolute inset-0 flex items-center justify-center">
                      {isBanned && <Ban className="w-12 h-12 text-red-600 rotate-12 drop-shadow-lg" />}
                      {isPicked && <CheckCircle className="w-12 h-12 text-emerald-500 drop-shadow-lg" />}
                      
                      {/* Hover Action Preview */}
                      {isAvailable && isMyTurn && hoveredMap === map.id && (
                          <div className={cn(
                              "px-3 py-1 rounded text-xs font-bold uppercase shadow-lg animate-in zoom-in",
                              currentAction === 'BAN' ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                          )}>
                             {currentAction}
                          </div>
                      )}
                  </div>
               </button>
             );
          })}
       </div>
    </div>
  );
};
