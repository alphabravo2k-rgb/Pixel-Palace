import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, CheckCircle, Clock, Lock, Trophy, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

// MASTER INTEGRATION
import { useCaptainVeto } from '../hooks/useCaptainVeto';
import { MAP_POOL } from '../lib/constants';
import { SoundNexus, CUES } from '../lib/soundNexus';

/**
 * 🗳️ VETO PANEL: THE WAR ROOM CONSOLE
 * ------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * UPGRADES:
 * 1. LOGIC SYNC: Fixed 'currentAction' vs 'action' mismatch.
 * 2. HAPTIC CARDS: 8D Audio triggers on map hover/select.
 * 3. PHYSICS ENGINE: Staggered entrance animations for map cards.
 */

// 🧩 SUB-COMPONENT: MAP CARD
const MapCard = React.memo(({ map, status, isSelected, isDisabled, onSelect, theme }) => {
  const isBanned = status === 'BAN';
  const isPicked = status === 'PICK';

  return (
    <motion.button
      layout
      whileHover={!isDisabled && !isBanned ? { scale: 1.05, zIndex: 10 } : {}}
      whileTap={!isDisabled && !isBanned ? { scale: 0.95 } : {}}
      onMouseEnter={() => !isDisabled && !isBanned && SoundNexus.play(CUES.UI_HOVER)}
      onClick={() => { SoundNexus.play(CUES.UI_CLICK); onSelect(map.id); }}
      disabled={isDisabled || isBanned}
      className={cn(
        "relative group overflow-hidden rounded-sm border-2 transition-all duration-300 h-32 md:h-48 flex flex-col w-full text-left",
        isBanned ? "border-red-900/30 opacity-40 grayscale pointer-events-none" : "border-zinc-800 hover:border-zinc-500",
        isPicked && "border-emerald-500 opacity-100 ring-2 ring-emerald-500/20 shadow-lg",
        status === 'DECIDER' && "border-yellow-500 opacity-100 ring-2 ring-yellow-500/20 shadow-lg",
        isSelected && `${theme.border} ring-2 ${theme.ring}/50 z-20 shadow-[0_0_30px_rgba(0,0,0,0.5)]`
      )}
    >
      {/* BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${map.image})` }}
      />
      
      {/* OVERLAY */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300", 
        isSelected ? "bg-black/40" : "bg-black/60 group-hover:bg-black/20"
      )} />

      {/* STATUS ICONS */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        {status === 'BAN' && <Ban className="w-12 h-12 text-red-600/80 rotate-12 drop-shadow-2xl" />}
        {status === 'PICK' && <CheckCircle className="w-12 h-12 text-emerald-500/80 drop-shadow-2xl" />}
        {status === 'DECIDER' && <Trophy className="w-12 h-12 text-yellow-500/80 drop-shadow-2xl" />}
      </div>

      {/* LABEL */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
        <p className="text-white font-black uppercase tracking-[0.2em] text-xs font-display italic drop-shadow-md">
          {map.name}
        </p>
      </div>
    </motion.button>
  );
});
MapCard.displayName = 'MapCard';

// 🎮 MAIN CONTROLLER
export const VetoPanel = ({ match, myTeamId }) => {
  // 1. Hook Integration (Fixed 'action' naming)
  const { vetoes, isMyTurn, action, submitVeto, loading } = useCaptainVeto(match, myTeamId);
  const [selectedMap, setSelectedMap] = useState(null);

  // 2. Action Handlers
  const handleAction = useCallback(async () => {
    if (!selectedMap || !isMyTurn || loading) return;
    await submitVeto(selectedMap);
    setSelectedMap(null); 
  }, [selectedMap, isMyTurn, loading, submitVeto]);

  // Reset selection when turn changes
  useEffect(() => {
    setSelectedMap(null);
  }, [vetoes.length]);

  // 3. Status Matcher
  const getMapStatus = useCallback((mapId) => {
    // Normalize logic matches 'useCaptainVeto'
    const entry = vetoes.find(v => v.map_name === mapId); 
    return entry?.type || 'AVAILABLE';
  }, [vetoes]);

  // 4. Dynamic Theme Engine
  const theme = useMemo(() => {
    const config = {
      BAN: { text: 'text-red-500', bg: 'bg-red-600', border: 'border-red-500', ring: 'ring-red-500', icon: Ban },
      PICK: { text: 'text-emerald-500', bg: 'bg-emerald-600', border: 'border-emerald-500', ring: 'ring-emerald-500', icon: CheckCircle },
      DECIDER: { text: 'text-yellow-500', bg: 'bg-yellow-600', border: 'border-yellow-500', ring: 'ring-yellow-500', icon: Trophy }
    };
    return config[action] || config['PICK'];
  }, [action]);

  // 5. Completion View (Mission Assigned)
  if (match.status === 'live' || match.status === 'completed') {
    // Find the map that was picked or is the last one left
    const finalMapId = vetoes.find(v => v.type === 'PICK')?.map_name 
      || vetoes.find(v => v.type === 'DECIDER')?.map_name 
      || MAP_POOL.find(m => !vetoes.some(v => v.map_name === m.id))?.id;

    const mapName = MAP_POOL.find(m => m.id === finalMapId)?.name || "Unknown Territory";

    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-950/50 rounded-sm border border-brand/20 backdrop-blur-sm animate-in fade-in zoom-in-95">
        <Trophy className="w-16 h-16 text-brand mb-4 animate-bounce" />
        <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Mission Assigned</h2>
        <p className="text-zinc-500 font-mono mt-2 uppercase tracking-[0.3em] text-xs">
          Battlefield: <span className="text-white font-bold">{mapName}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-32 relative">
      
      {/* 📡 STATUS UPLINK */}
      <div className={cn(
        "relative rounded-sm border-2 p-6 flex flex-col md:flex-row items-center justify-between transition-all overflow-hidden",
        isMyTurn ? "bg-brand/5 border-brand/40 shadow-[0_0_30px_rgba(192,38,211,0.15)]" : "bg-black/40 border-zinc-900"
      )}>
        {/* Background Scanline */}
        {isMyTurn && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 animate-pulse" />}

        <div className="flex items-center gap-4 md:gap-12 relative z-10 w-full md:w-auto justify-between md:justify-start">
          <div className="text-left">
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Team Alpha</p>
            <h4 className={cn("text-xl font-display font-bold uppercase italic", match.team1_id === myTeamId ? "text-brand" : "text-white")}>
                {match.team1?.name || 'TBD'}
            </h4>
          </div>
          <div className="text-2xl font-black italic text-zinc-800 select-none">VS</div>
          <div className="text-right">
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Team Bravo</p>
            <h4 className={cn("text-xl font-display font-bold uppercase italic", match.team2_id === myTeamId ? "text-brand" : "text-white")}>
                {match.team2?.name || 'TBD'}
            </h4>
          </div>
        </div>

        <div className={cn(
          "mt-4 md:mt-0 px-6 py-3 rounded-sm font-black text-xs uppercase flex items-center gap-3 transition-all tracking-[0.1em] w-full md:w-auto justify-center",
          isMyTurn ? "bg-brand text-white shadow-neon animate-pulse" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
        )}>
          {isMyTurn ? <Clock className="w-4 h-4 animate-spin-slow" /> : <Lock className="w-4 h-4" />}
          {isMyTurn ? `COMMAND REQUIRED: ${action}` : `OPPONENT IS ${action}ING...`}
        </div>
      </div>

      {/* 🗺️ OPERATIONAL GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence>
            {MAP_POOL.map((map, index) => (
            <motion.div
                key={map.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <MapCard 
                    map={map} 
                    status={getMapStatus(map.id)}
                    isSelected={selectedMap === map.id}
                    isDisabled={!isMyTurn || loading || getMapStatus(map.id) !== 'AVAILABLE'}
                    onSelect={setSelectedMap}
                    theme={theme}
                />
            </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* 🚀 TACTICAL CONFIRMATION (Floating Action Bar) */}
      <AnimatePresence>
        {selectedMap && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-[#09090b] border border-brand/30 rounded-sm p-2 pr-2 pl-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center gap-8 ring-1 ring-brand/20">
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Confirm Order</span>
                <span className={cn("text-lg font-display font-black uppercase italic", theme.text)}>
                  {action} :: {MAP_POOL.find(m => m.id === selectedMap)?.name}
                </span>
              </div>
              
              <button
                onClick={handleAction}
                disabled={loading}
                className={cn(
                  "px-8 py-3 rounded-sm font-black uppercase tracking-widest text-xs text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2",
                  theme.bg
                )}
              >
                {loading ? <Clock className="animate-spin w-4 h-4" /> : "EXECUTE"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VetoPanel;
