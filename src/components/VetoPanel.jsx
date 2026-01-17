/**
 * 🗳️ VETO PANEL: THE WAR ROOM CONSOLE (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // HIGH-PHYSICS
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, CheckCircle, Clock, Lock, Trophy, Target, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

// MASTER CORE
import { useCaptainVeto } from '../hooks/useCaptainVeto';
import { MAP_POOL } from '../lib/constants';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';

// 🧩 SUB-COMPONENT: MAP TILE
const MapCard = React.memo(({ map, status, isSelected, isDisabled, onSelect, theme }) => {
  const isBanned = status === 'BAN';
  const isPicked = status === 'PICK';
  const isDecider = status === 'DECIDER';

  return (
    <motion.button
      layout
      whileHover={!isDisabled && !isBanned ? { y: -5, scale: 1.02 } : {}}
      whileTap={!isDisabled && !isBanned ? { scale: 0.98 } : {}}
      onMouseEnter={() => { if(!isDisabled && !isBanned) try{SoundNexus.play(CUES.UI_HOVER, { volume: 0.05 });}catch(e){} }}
      onClick={() => { try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} onSelect(map.id); }}
      disabled={isDisabled || isBanned}
      className={cn(
        "relative group overflow-hidden rounded-sm border transition-all duration-500 h-40 md:h-56 flex flex-col w-full text-left shadow-2xl",
        isBanned ? "border-red-900/20 opacity-30 grayscale cursor-not-allowed" : "border-white/5 hover:border-white/20",
        isPicked && "border-emerald-500/50 opacity-100 ring-1 ring-emerald-500/20",
        isDecider && "border-fuchsia-500/50 opacity-100 ring-1 ring-fuchsia-500/20",
        isSelected && `border-fuchsia-500 ring-4 ring-fuchsia-500/10 z-20`
      )}
    >
      {/* MAP TEXTURE */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
        style={{ backgroundImage: `url(${map.image})` }}
      />
      
      {/* VIGNETTE OVERLAY */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-black via-black/40 to-transparent",
        isSelected ? "opacity-40" : "opacity-80 group-hover:opacity-40"
      )} />

      {/* STATUS INDICATORS */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <AnimatePresence>
            {isBanned && (
                <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Ban className="w-16 h-16 text-red-600/60 rotate-12 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                </motion.div>
            )}
            {(isPicked || isDecider) && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    {isPicked ? (
                        <CheckCircle className="w-16 h-16 text-emerald-500/60 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    ) : (
                        <Target className="w-16 h-16 text-fuchsia-500/60 drop-shadow-[0_0_15px_rgba(192,38,211,0.5)]" />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* TACTICAL LABEL */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-20">
        <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", isBanned ? "bg-red-500" : isPicked ? "bg-emerald-500" : "bg-zinc-500")} />
            <p className="text-white font-display font-black uppercase tracking-[0.3em] text-[10px] italic">
              {map.name}
            </p>
        </div>
      </div>
    </motion.button>
  );
});

export const VetoPanel = ({ match, myTeamId }) => {
  const { vetoes, isMyTurn, action, submitVeto, loading } = useCaptainVeto(match, myTeamId);
  const [selectedMap, setSelectedMap] = useState(null);

  const handleAction = useCallback(async () => {
    if (!selectedMap || !isMyTurn || loading) return;
    
    // Log the strategic intent before execution
    Telemetry.log(EVENTS.ACTION, { action: `VETO_${action}`, map: selectedMap, team: myTeamId });
    
    await submitVeto(selectedMap);
    setSelectedMap(null); 
    try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
  }, [selectedMap, isMyTurn, loading, submitVeto, action, myTeamId]);

  useEffect(() => { setSelectedMap(null); }, [vetoes.length]);

  const getMapStatus = useCallback((mapId) => {
    const entry = vetoes.find(v => v.map_name === mapId); 
    return entry?.type || 'AVAILABLE';
  }, [vetoes]);

  const theme = useMemo(() => {
    const config = {
      BAN: { color: 'text-red-500', bg: 'bg-red-600', glow: 'shadow-red-600/20', label: 'Veto Authorized' },
      PICK: { color: 'text-emerald-500', bg: 'bg-emerald-600', glow: 'shadow-emerald-600/20', label: 'Selection Required' },
      DECIDER: { color: 'text-fuchsia-500', bg: 'bg-fuchsia-600', glow: 'shadow-fuchsia-600/20', label: 'Decider Sequence' }
    };
    return config[action] || config['PICK'];
  }, [action]);

  // 🏁 MISSION CONCLUDED
  if (match.status === 'live' || match.status === 'completed') {
    const finalMapId = vetoes.find(v => v.type === 'PICK')?.map_name 
      || vetoes.find(v => v.type === 'DECIDER')?.map_name 
      || MAP_POOL.find(m => !vetoes.some(v => v.map_name === m.id))?.id;

    const mapData = MAP_POOL.find(m => m.id === finalMapId);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-16 bg-[#09090b] rounded-sm border border-white/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-fuchsia-500/[0.02] pointer-events-none" />
        <Trophy className="w-20 h-20 text-fuchsia-500 mb-8 drop-shadow-[0_0_20px_rgba(192,38,211,0.4)]" />
        <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">Mission Logic Sealed</h2>
        <div className="mt-6 flex items-center gap-4 bg-black px-8 py-4 border border-fuchsia-500/20 rounded-sm">
            <Zap size={14} className="text-fuchsia-500 animate-pulse" />
            <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-[0.5em]">
              Combat Zone: <span className="text-white font-black">{mapData?.name || "REDACTED"}</span>
            </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 relative">
      
      {/* 📡 STATUS UPLINK HUD */}
      <div className={cn(
        "relative rounded-sm border p-8 flex flex-col md:flex-row items-center justify-between transition-all duration-700",
        isMyTurn ? "bg-fuchsia-600/5 border-fuchsia-500/40 shadow-2xl" : "bg-zinc-900/20 border-white/5"
      )}>
        <div className="flex items-center gap-16 relative z-10 w-full md:w-auto justify-between">
          <div className="space-y-1">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em]">Unit_Alpha</p>
            <h4 className={cn("text-2xl font-display font-black uppercase italic tracking-tight", match.team1_id === myTeamId ? "text-fuchsia-500" : "text-white")}>
                {match.team1?.name}
            </h4>
          </div>
          <div className="text-4xl font-display font-black italic text-zinc-900 select-none opacity-20">VS</div>
          <div className="space-y-1 text-right">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em]">Unit_Bravo</p>
            <h4 className={cn("text-2xl font-display font-black uppercase italic tracking-tight", match.team2_id === myTeamId ? "text-fuchsia-500" : "text-white")}>
                {match.team2?.name}
            </h4>
          </div>
        </div>

        <div className={cn(
          "mt-6 md:mt-0 px-8 py-4 rounded-sm font-black text-[10px] uppercase flex items-center gap-4 transition-all tracking-[0.4em] border",
          isMyTurn ? "bg-fuchsia-600 border-fuchsia-400 text-white shadow-fuchsia-600/20 animate-pulse" : "bg-black border-zinc-800 text-zinc-700 opacity-50"
        )}>
          {isMyTurn ? <Target className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {isMyTurn ? `Command: ${action}` : `Intercepting Opponent...`}
        </div>
      </div>

      {/* 🗺️ THE MAP GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
            {MAP_POOL.map((map, index) => (
                <motion.div
                    key={map.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                >
                    <MapCard 
                        map={map} 
                        status={getMapStatus(map.id)}
                        isSelected={selectedMap === map.id}
                        isDisabled={!isMyTurn || loading || getMapStatus(map.id) !== 'AVAILABLE'}
                        onSelect={setSelectedMap}
                    />
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* 🚀 TACTICAL EXECUTION BAR */}
      <AnimatePresence>
        {selectedMap && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-0 right-0 z-50 flex justify-center px-6"
          >
            <div className="bg-[#09090b] border border-fuchsia-500/40 rounded-sm p-4 pl-10 shadow-[0_0_100px_rgba(0,0,0,1)] flex items-center gap-12 backdrop-blur-3xl">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-fuchsia-500 font-black uppercase tracking-[0.5em]">Confirm Strategic Order</span>
                <span className="text-2xl font-display font-black uppercase italic text-white tracking-tighter">
                  {action} // {MAP_POOL.find(m => m.id === selectedMap)?.name}
                </span>
              </div>
              
              <button
                onClick={handleAction}
                disabled={loading}
                className={cn(
                  "px-12 py-4 rounded-sm font-black uppercase tracking-[0.4em] text-[10px] text-white transition-all active:scale-95 shadow-2xl flex items-center gap-3",
                  theme.bg
                )}
              >
                {loading ? <Clock className="animate-spin w-4 h-4" /> : "Authorize Execution"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VetoPanel;
