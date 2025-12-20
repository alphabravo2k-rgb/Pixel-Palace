import React, { useState } from 'react';
import { useCaptainVeto } from '../hooks/useCaptainVeto';

// Note: Ensure PinLogin component handles the initial PIN entry, 
// OR use this integrated view if VetoPanel is a standalone page.
export default function VetoPanel({ activePin }) {
  const { gameState, loading, error, submitVeto } = useCaptainVeto(activePin);

  if (loading) return <div className="p-10 text-center text-white">Connecting to Satellite...</div>;
  
  // If no gameState, the PIN was likely invalid or not passed yet
  if (!gameState) return <div className="p-10 text-center text-red-500">Waiting for valid session...</div>;

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-700 font-mono w-full max-w-5xl mx-auto shadow-2xl">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 mb-8">
        <div>
          <h2 className="text-slate-400 text-xs tracking-widest mb-1 uppercase">Match Protocol</h2>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">
            {gameState.team_name} <span className="text-red-600 px-2">VS</span> {gameState.opponent_name || "TBD"}
          </h1>
        </div>
        <div className="mt-4 md:mt-0">
           <div className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wider shadow-lg ${gameState.is_my_turn ? 'bg-green-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
              {gameState.is_my_turn ? "YOUR TURN TO BAN" : "OPPONENT'S TURN"}
           </div>
        </div>
      </div>

      {/* ERROR BOX */}
      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-100 p-4 mb-8 rounded-r">
          <p className="font-bold">🛑 COMMAND REJECTED</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* MAP GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gameState.map_pool.map(mapName => {
          const isBanned = gameState.banned_maps.includes(mapName);
          const canInteract = gameState.is_my_turn && !isBanned;

          return (
            <button
              key={mapName}
              onClick={() => submitVeto(mapName)}
              disabled={!canInteract}
              className={`
                relative h-32 md:h-48 rounded-lg border-2 transition-all duration-200 flex items-center justify-center overflow-hidden group
                ${isBanned 
                  ? 'border-slate-800 bg-slate-950 opacity-40 grayscale cursor-not-allowed' 
                  : canInteract
                    ? 'border-slate-600 bg-slate-800 hover:border-red-500 hover:scale-[1.02] hover:shadow-red-900/20 shadow-xl cursor-pointer'
                    : 'border-slate-700 bg-slate-800 opacity-60 cursor-wait'
                }
              `}
            >
              <span className="z-10 text-lg md:text-xl font-bold tracking-widest uppercase text-slate-200 group-hover:text-white">
                {mapName.replace("de_", "")}
              </span>

              {/* Banned Overlay */}
              {isBanned && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-red-600 font-black text-2xl md:text-4xl -rotate-12 border-4 border-red-600 px-4 py-1 rounded opacity-80">BANNED</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500 uppercase tracking-widest">
        <span>Bans Remaining: {gameState.actions_remaining}</span>
        <span>ID: {gameState.match_id.split('-')[0]}</span>
      </div>
    </div>
  );
}
