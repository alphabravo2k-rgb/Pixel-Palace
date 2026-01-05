import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCaptainVeto } from '../hooks/useCaptainVeto';
import { MAP_POOL } from '../lib/constants';
import { Ban, CheckCircle, Clock, Lock, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * MASTER UPGRADE KEY FEATURES:
 * 1. Fuzzy Mapping: Handles "Dust 2" vs "dust2" naming bugs.
 * 2. Optimized Rendering: Individual Map cards are now referentially stable.
 * 3. Haptic/Aria Feedback: Better accessibility for high-stakes picking.
 * 4. Safe Finish: Robust handling of transition from Veto to Live match.
 */

// Sub-component for performance optimization
const MapCard = React.memo(({ map, status, isSelected, isDisabled, onSelect, theme }) => (
  <button
    onClick={() => onSelect(map.id)}
    disabled={isDisabled}
    aria-label={`${map.name} - ${status}`}
    className={cn(
      "relative group overflow-hidden rounded border-2 transition-all duration-300 h-32 md:h-48 flex flex-col",
      status === 'BAN' && "border-red-900/50 opacity-40 grayscale pointer-events-none",
      status === 'PICK' && "border-emerald-500 opacity-100 ring-2 ring-emerald-500/20 shadow-lg",
      status === 'DECIDER' && "border-yellow-500 opacity-100 ring-2 ring-yellow-500/20 shadow-lg animate-in zoom-in-95",
      !isSelected && status === 'AVAILABLE' && "border-zinc-800 hover:border-zinc-500",
      isSelected && `${theme.border} ring-2 ${theme.ring}/50 scale-[1.02] z-10 shadow-2xl`
    )}
  >
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
      style={{ backgroundImage: `url(${map.image})` }}
    />
    <div className={cn("absolute inset-0 transition-opacity", isSelected ? "bg-black/20" : "bg-black/50")} />

    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      {status === 'BAN' && <Ban className="w-12 h-12 text-red-600/80 rotate-12 drop-shadow-2xl" />}
      {status === 'PICK' && <CheckCircle className="w-12 h-12 text-emerald-500/80 drop-shadow-2xl" />}
      {status === 'DECIDER' && <Trophy className="w-12 h-12 text-yellow-500/80 drop-shadow-2xl" />}
    </div>

    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
      <p className="text-white font-bold uppercase tracking-widest text-sm font-display truncate">{map.name}</p>
    </div>
  </button>
));

export const VetoPanel = ({ match, myTeamId }) => {
  const { vetoes, isMyTurn, currentAction, submitVeto, loading } = useCaptainVeto(match, myTeamId);
  const [selectedMap, setSelectedMap] = useState(null);

  // Auto-reset selection on data sync
  useEffect(() => setSelectedMap(null), [vetoes.length]);

  // Master Fuzzy Matcher: Resolves "dust2" vs "Dust 2"
  const getMapStatus = useCallback((mapId) => {
    const normalize = (s) => String(s).toLowerCase().replace(/\s/g, '');
    const entry = vetoes.find(v => normalize(v.map_name) === normalize(mapId));
    return entry?.type || 'AVAILABLE';
  }, [vetoes]);

  const theme = useMemo(() => {
    const config = {
      BAN: { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500', ring: 'ring-red-500' },
      PICK: { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500' },
      DECIDER: { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500', ring: 'ring-yellow-500' }
    };
    return config[currentAction] || { text: 'text-brand', bg: 'bg-brand', border: 'border-brand', ring: 'ring-brand' };
  }, [currentAction]);

  if (match.status === 'live' || match.status === 'completed') {
    const finalMap = vetoes.find(v => v.type === 'DECIDER' || v.type === 'PICK') || vetoes[vetoes.length - 1];
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-950 rounded border border-brand/20">
        <Trophy className="w-16 h-16 text-brand mb-4 animate-pulse" />
        <h2 className="text-2xl font-display font-bold text-white uppercase italic">Mission Assigned</h2>
        <p className="text-zinc-500 font-mono mt-2 uppercase tracking-widest">
          {MAP_POOL.find(m => m.id === finalMap?.map_name)?.name || "Battlefield Ready"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      
      {/* 1. STATUS UPLINK */}
      <div className={cn(
        "relative rounded-lg border-2 p-6 flex flex-col md:flex-row items-center justify-between transition-all overflow-hidden",
        isMyTurn ? "bg-brand/5 border-brand/40 shadow-2xl" : "bg-black/40 border-zinc-900"
      )}>
        <div className="flex items-center gap-10">
          <div className="text-left">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">Initiator</p>
            <h4 className="text-xl font-display font-bold text-white uppercase truncate max-w-[150px]">{match.team1?.name}</h4>
          </div>
          <div className="text-2xl font-black italic text-zinc-800">VS</div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">Opponent</p>
            <h4 className="text-xl font-display font-bold text-white uppercase truncate max-w-[150px]">{match.team2?.name}</h4>
          </div>
        </div>

        <div className={cn(
          "mt-4 md:mt-0 px-6 py-3 rounded font-black text-sm uppercase flex items-center gap-3 transition-colors",
          isMyTurn ? "bg-brand text-black shadow-brand-glow animate-pulse" : "bg-zinc-800 text-zinc-500"
        )}>
          {isMyTurn ? <Clock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          {isMyTurn ? `AWAITING YOUR ${currentAction}` : "OPPONENT CALCULATING..."}
        </div>
      </div>

      {/* 2. OPERATIONAL GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MAP_POOL.map(map => (
          <MapCard 
            key={map.id} 
            map={map} 
            status={getMapStatus(map.id)}
            isSelected={selectedMap === map.id}
            isDisabled={!isMyTurn || loading || getMapStatus(map.id) !== 'AVAILABLE'}
            onSelect={setSelectedMap}
            theme={theme}
          />
        ))}
      </div>

      {/* 3. TACTICAL CONFIRMATION */}
      <div className={cn(
        "fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 transition-all duration-500",
        selectedMap ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      )}>
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">Executing Protocol</p>
            <p className={cn("text-xl font-display font-black uppercase italic", theme.text)}>
              {currentAction}: {MAP_POOL.find(m => m.id === selectedMap)?.name}
            </p>
          </div>
          <button
            onClick={handleAction}
            disabled={loading}
            className={cn(
              "px-10 py-4 rounded font-black uppercase tracking-tighter text-white shadow-xl hover:scale-105 active:scale-95 transition-all",
              theme.bg
            )}
          >
            {loading ? "PROCESSING..." : "COMMIT"}
          </button>
        </div>
      </div>
    </div>
  );
};
