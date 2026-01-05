import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCaptainVeto } from '../hooks/useCaptainVeto';
import { MAP_POOL } from '../lib/constants';
import { Ban, CheckCircle, Clock, Lock, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * MASTER UPGRADE FEATURES:
 * 1. Reference Integrity: Defined handleAction within component scope.
 * 2. Fuzzy Normalization: Solves naming mismatches (Dust 2 vs dust2).
 * 3. Haptic UI States: Status Uplink dynamically reflects turn urgency.
 * 4. Referential Stability: MapCard prevents unnecessary re-renders during countdowns.
 */

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
      <p className="text-white font-bold uppercase tracking-widest text-xs font-display truncate italic">{map.name}</p>
    </div>
  </button>
));

export const VetoPanel = ({ match, myTeamId }) => {
  // 1. Hook Integration
  const { vetoes, isMyTurn, currentAction, submitVeto, loading } = useCaptainVeto(match, myTeamId);
  const [selectedMap, setSelectedMap] = useState(null);

  // 2. Action Handlers (Fixed ReferenceError)
  const handleAction = useCallback(async () => {
    if (!selectedMap || !isMyTurn || loading) return;
    await submitVeto(selectedMap);
    setSelectedMap(null); // Clear selection after submission
  }, [selectedMap, isMyTurn, loading, submitVeto]);

  // Auto-reset selection on data sync
  useEffect(() => {
    setSelectedMap(null);
  }, [vetoes.length]);

  // 3. Fuzzy Status Matcher
  const getMapStatus = useCallback((mapId) => {
    const normalize = (s) => String(s).toLowerCase().replace(/\s/g, '');
    const entry = vetoes.find(v => normalize(v.map_name) === normalize(mapId));
    return entry?.type || 'AVAILABLE';
  }, [vetoes]);

  // 4. Dynamic Theme Calculation
  const theme = useMemo(() => {
    const config = {
      BAN: { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500', ring: 'ring-red-500' },
      PICK: { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500' },
      DECIDER: { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500', ring: 'ring-yellow-500' }
    };
    return config[currentAction] || { text: 'text-brand', bg: 'bg-brand', border: 'border-brand', ring: 'ring-brand' };
  }, [currentAction]);

  // 5. Completion View
  if (match.status === 'live' || match.status === 'completed') {
    const finalMap = vetoes.find(v => v.type === 'DECIDER' || v.type === 'PICK') || vetoes[vetoes.length - 1];
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-950 rounded border border-brand/20 animate-in fade-in zoom-in-95">
        <Trophy className="w-16 h-16 text-brand mb-4 animate-bounce" />
        <h2 className="text-2xl font-display font-bold text-white uppercase italic tracking-tighter">Mission Assigned</h2>
        <p className="text-zinc-500 font-mono mt-2 uppercase tracking-[0.3em] text-xs">
          Battlefield: <span className="text-white">{MAP_POOL.find(m => m.id === finalMap?.map_name)?.name || "Ready"}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      
      {/* STATUS UPLINK */}
      <div className={cn(
        "relative rounded-lg border-2 p-6 flex flex-col md:flex-row items-center justify-between transition-all overflow-hidden",
        isMyTurn ? "bg-brand/5 border-brand/40 shadow-[0_0_30px_rgba(var(--brand-rgb),0.1)]" : "bg-black/40 border-zinc-900"
      )}>
        <div className="flex items-center gap-10">
          <div className="text-left">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Team Alpha</p>
            <h4 className="text-xl font-display font-bold text-white uppercase truncate max-w-[150px] italic">{match.team1?.name}</h4>
          </div>
          <div className="text-2xl font-black italic text-zinc-800 select-none">VS</div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Team Bravo</p>
            <h4 className="text-xl font-display font-bold text-white uppercase truncate max-w-[150px] italic">{match.team2?.name}</h4>
          </div>
        </div>

        <div className={cn(
          "mt-4 md:mt-0 px-6 py-3 rounded font-black text-xs uppercase flex items-center gap-3 transition-all tracking-[0.1em]",
          isMyTurn ? "bg-brand text-black shadow-[0_0_15px_rgba(var(--brand-rgb),0.5)] animate-pulse" : "bg-zinc-800 text-zinc-500"
        )}>
          {isMyTurn ? <Clock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {isMyTurn ? `COMMAND REQUIRED: ${currentAction}` : "WAITING FOR OPPONENT..."}
        </div>
      </div>

      {/* OPERATIONAL GRID */}
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

      {/* TACTICAL CONFIRMATION (FAB) */}
      <div className={cn(
        "fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 transition-all duration-500 z-50",
        selectedMap ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      )}>
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl flex items-center justify-between ring-1 ring-white/5">
          <div className="overflow-hidden">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Awaiting Confirmation</p>
            <p className={cn("text-xl font-display font-black uppercase italic truncate", theme.text)}>
              {currentAction}: {MAP_POOL.find(m => m.id === selectedMap)?.name}
            </p>
          </div>
          <button
            onClick={handleAction}
            disabled={loading}
            className={cn(
              "px-8 py-4 rounded font-black uppercase tracking-tighter text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2",
              theme.bg
            )}
          >
            {loading ? <Clock className="animate-spin w-4 h-4" /> : "COMMIT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VetoPanel;
