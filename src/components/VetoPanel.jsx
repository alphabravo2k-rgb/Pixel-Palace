import React, { useState, useEffect } from 'react';
import { useCaptainVeto } from '../hooks/useCaptainVeto';
import { MAP_POOL } from '../lib/constants';
import { Ban, CheckCircle, Clock, Lock, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

export const VetoPanel = ({ match }) => {
  const { vetoes, isMyTurn, currentAction, submitVeto, loading } = useCaptainVeto(match);
  const [selectedMap, setSelectedMap] = useState(null);

  // Reset selection when turn changes to prevent accidental wrong picks
  useEffect(() => {
    setSelectedMap(null);
  }, [vetoes.length]);

  // Determine the state of a specific map card
  const getMapStatus = (mapId) => {
    const entry = vetoes.find(v => v.map_name === mapId);
    if (entry) return entry.type; // 'BAN', 'PICK', 'DECIDER'
    return 'AVAILABLE';
  };

  const handleAction = async () => {
    if (!selectedMap || !isMyTurn) return;
    await submitVeto(selectedMap);
  };

  // UI Helpers: Dynamic Colors based on what needs to happen
  const theme = {
    BAN: { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500', ring: 'ring-red-500' },
    PICK: { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500' },
    DECIDER: { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500', ring: 'ring-yellow-500' },
    WAIT: { text: 'text-zinc-500', bg: 'bg-zinc-800', border: 'border-zinc-700', ring: 'ring-zinc-700' }
  }[currentAction] || { text: 'text-brand', bg: 'bg-brand', border: 'border-brand', ring: 'ring-brand' };

  // Loading State
  if (!match) return <div className="p-12 text-center text-zinc-500 animate-pulse font-mono">INITIALIZING VETO UPLINK...</div>;

  // Completion State (Match is ready or live)
  const isComplete = match.status === 'completed' || match.status === 'live' || (match.best_of === 1 && vetoes.length >= 6); 

  if (isComplete) {
    // Determine the map that was played/will be played
    const finalMap = vetoes.find(v => v.type === 'DECIDER' || v.type === 'PICK') || vetoes[vetoes.length - 1];
    
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-bg-panel border border-tactical rounded-lg shadow-glass relative overflow-hidden group">
        <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/10 transition-colors" />
        <Trophy className="w-16 h-16 text-brand-glow mb-4 animate-bounce" />
        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-widest">Veto Sequence Complete</h2>
        <p className="text-zinc-400 font-mono text-sm mt-2 flex items-center gap-2">
           <span className="text-brand-glow">BATTLEFIELD:</span> 
           {MAP_POOL.find(m => m.id === finalMap?.map_name)?.name || "DETERMINED"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* 1. STATUS HEADER */}
      <div className={cn(
        "relative overflow-hidden rounded-md border p-6 flex flex-col md:flex-row items-center justify-between transition-all duration-500",
        isMyTurn ? "bg-bg-panel border-brand/30 shadow-[0_0_20px_rgba(var(--color-brand)/0.1)]" : "bg-black border-zinc-900 opacity-80"
      )}>
        {/* Background Scanline Effect */}
        {isMyTurn && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />}

        {/* Team Names */}
        <div className="flex items-center gap-8 z-10 w-full md:w-auto justify-between md:justify-start">
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Team A</span>
            <span className={cn("text-2xl font-display font-bold uppercase", match.team1_id === match.winner_id ? 'text-brand-glow' : 'text-white')}>
                {match.team1?.name || 'TBD'}
            </span>
          </div>
          
          <span className="text-zinc-800 font-black text-3xl font-display italic">VS</span>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Team B</span>
            <span className={cn("text-2xl font-display font-bold uppercase", match.team2_id === match.winner_id ? 'text-brand-glow' : 'text-white')}>
                {match.team2?.name || 'TBD'}
            </span>
          </div>
        </div>

        {/* Action Indicator */}
        <div className="flex flex-col items-center md:items-end z-10 mt-6 md:mt-0">
          <div className={cn(
            "px-6 py-2 rounded-sm text-sm font-bold uppercase flex items-center gap-3 shadow-lg transition-all border",
            isMyTurn ? `${theme.bg} ${theme.border} text-white animate-pulse` : "bg-zinc-900 border-zinc-800 text-zinc-500"
          )}>
            {isMyTurn ? (
              <>
                <Clock className="w-4 h-4" /> 
                <span>YOUR TURN TO {currentAction}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> 
                <span>OPPONENT IS THINKING...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAP GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {MAP_POOL.map((map) => {
          const status = getMapStatus(map.id);
          const isSelected = selectedMap === map.id;
          const isAvailable = status === 'AVAILABLE';
          
          // Disable if: Not my turn, map taken, or processing
          const isDisabled = !isAvailable || !isMyTurn || loading;

          return (
            <button
              key={map.id}
              onClick={() => isAvailable && setSelectedMap(map.id)}
              disabled={isDisabled}
              className={cn(
                "relative group overflow-hidden rounded border-2 transition-all duration-300 h-32 md:h-48 flex flex-col",
                // Status Styles
                status === 'BAN' && "border-red-900/50 opacity-40 grayscale",
                status === 'PICK' && "border-emerald-500 opacity-100 ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
                status === 'DECIDER' && "border-yellow-500 opacity-100 ring-2 ring-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
                
                // Available & Interaction Styles
                isAvailable && isSelected ? `${theme.border} ring-2 ${theme.ring}/50 scale-[1.02] z-10 shadow-xl` : "border-zinc-800",
                isAvailable && !isDisabled ? "hover:border-zinc-500 cursor-pointer hover:shadow-lg" : "cursor-not-allowed"
              )}
            >
              {/* Map Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${map.image})` }}
              />
              
              {/* Dark Overlays */}
              <div className={cn(
                  "absolute inset-0 transition-colors duration-300",
                  isAvailable ? "bg-black/40 group-hover:bg-black/20" : "bg-black/80"
              )} />

              {/* Status Icons */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                {status === 'BAN' && <Ban className="w-16 h-16 text-red-600/80 rotate-12 drop-shadow-md" />}
                {status === 'PICK' && <CheckCircle className="w-16 h-16 text-emerald-500/80 drop-shadow-md" />}
                {status === 'DECIDER' && <Trophy className="w-16 h-16 text-yellow-500/80 drop-shadow-md animate-pulse" />}
              </div>

              {/* Label Bar */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-between items-end z-20">
                <span className="text-white font-bold uppercase tracking-widest text-lg font-display shadow-black drop-shadow-md">{map.name}</span>
                
                {isAvailable && isSelected && (
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-white", theme.bg)}>
                    {currentAction}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. CONFIRMATION FLOATING BUTTON (Sticky) */}
      <div className={cn(
          "fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md p-4 transition-all duration-300 z-50",
          selectedMap ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <div className="bg-bg-elevated/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-4 flex items-center justify-between gap-4 ring-1 ring-white/5">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Confirm Action</span>
                <span className={cn("text-xl font-display font-bold uppercase leading-none", theme.text)}>
                    {currentAction} {MAP_POOL.find(m => m.id === selectedMap)?.name}
                </span>
            </div>
            
            <button
                onClick={handleAction}
                disabled={loading}
                className={cn(
                    "px-6 py-2 rounded-sm font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:scale-105 active:scale-95 text-white flex items-center gap-2",
                    theme.bg,
                    loading && "opacity-50 cursor-wait"
                )}
            >
                {loading ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? 'PROCESSING' : 'CONFIRM'}
            </button>
        </div>
      </div>

    </div>
  );
};

export default VetoPanel;
