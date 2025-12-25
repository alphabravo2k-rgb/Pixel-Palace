import React, { useState } from 'react';
import { useCaptainVeto } from '../hooks/useCaptainVeto';
import { ShieldAlert, Ban, CheckCircle, Map, Clock, Lock } from 'lucide-react';

// ✅ STATIC ASSETS (Keep the visuals high-quality)
const MAP_POOL = [
  { id: 'MIRAGE', name: 'Mirage', image: 'https://img.youtube.com/vi/F91V3V6Qh6U/maxresdefault.jpg' },
  { id: 'INFERNO', name: 'Inferno', image: 'https://blob.faceit.com/static/img/maps/cs2/inferno_bg.jpg' },
  { id: 'NUKE', name: 'Nuke', image: 'https://blob.faceit.com/static/img/maps/cs2/nuke_bg.jpg' },
  { id: 'OVERPASS', name: 'Overpass', image: 'https://blob.faceit.com/static/img/maps/cs2/overpass_bg.jpg' },
  { id: 'VERTIGO', name: 'Vertigo', image: 'https://blob.faceit.com/static/img/maps/cs2/vertigo_bg.jpg' },
  { id: 'ANCIENT', name: 'Ancient', image: 'https://blob.faceit.com/static/img/maps/cs2/ancient_bg.jpg' },
  { id: 'ANUBIS', name: 'Anubis', image: 'https://blob.faceit.com/static/img/maps/cs2/anubis_bg.jpg' },
  { id: 'DUST2', name: 'Dust 2', image: 'https://blob.faceit.com/static/img/maps/cs2/dust2_bg.jpg' }
];

/**
 * VetoPanel Component
 * Now strictly powered by the Block 4 Backend State Machine.
 * Expects a full `match` object (with team IDs and best_of status).
 */
export const VetoPanel = ({ match }) => {
  // 1. CONNECT TO REALTIME LOGIC
  const { vetoes, isMyTurn, currentAction, submitVeto, loading } = useCaptainVeto(match);
  const [selectedMap, setSelectedMap] = useState(null);

  // 2. HELPER: Derive Map Status from Realtime Data
  const getMapStatus = (mapName) => {
    const entry = vetoes.find(v => v.map_name === mapName);
    if (entry) return entry.type; // Returns 'BAN' or 'PICK'
    return 'AVAILABLE';
  };

  const handleAction = async () => {
    if (!selectedMap || !isMyTurn) return;
    await submitVeto(selectedMap);
    setSelectedMap(null); // Reset local selection after submit
  };

  // 3. UI STATE COLORS (Dynamic based on Action)
  const isBanPhase = currentAction === 'BAN';
  const actionColor = isBanPhase ? 'text-red-500' : 'text-emerald-500';
  const actionBg = isBanPhase ? 'bg-red-500' : 'bg-emerald-500';
  const actionBorder = isBanPhase ? 'border-red-500' : 'border-emerald-500';

  if (!match) return <div className="p-12 text-center text-zinc-500">Initializing Veto Protocol...</div>;

  // 4. CHECK FOR COMPLETION
  // If BO1 (1 map needed) or BO3 (3 maps needed), check if we are done.
  // The Hook usually handles this via match status, but we add a UI guard here.
  const isComplete = match.status === 'completed' || match.status === 'live' || (match.best_of === 1 && vetoes.length >= 6); 
  // (Note: Precise completion logic is handled by the backend switching match status)

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-950 border border-zinc-800 rounded">
        <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-['Teko']">Veto Sequence Complete</h2>
        <p className="text-zinc-500 font-mono text-sm mt-2">The battlefield has been chosen.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER: TURN INDICATOR */}
      <div className={`
        relative overflow-hidden rounded border p-6 flex flex-col md:flex-row items-center justify-between transition-colors duration-500
        ${isMyTurn ? 'bg-zinc-900 border-white/10' : 'bg-black border-zinc-900'}
      `}>
        {/* Teams Display */}
        <div className="flex items-center gap-6 z-10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Team A</span>
            <span className={`text-xl font-bold font-['Teko'] uppercase ${match.team1_id === match.winner_id ? 'text-emerald-400' : 'text-white'}`}>
              {match.team1?.name || 'TBD'}
            </span>
          </div>
          <span className="text-zinc-700 font-black text-2xl">VS</span>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Team B</span>
            <span className={`text-xl font-bold font-['Teko'] uppercase ${match.team2_id === match.winner_id ? 'text-emerald-400' : 'text-white'}`}>
              {match.team2?.name || 'TBD'}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-center md:items-end z-10 mt-4 md:mt-0">
           <div className={`
             px-4 py-1.5 rounded text-sm font-bold uppercase flex items-center gap-2 shadow-lg transition-all
             ${isMyTurn 
               ? `${actionBg} text-white animate-pulse shadow-[0_0_15px_rgba(var(--tw-shadow-color),0.5)]` 
               : 'bg-zinc-800 text-zinc-500'}
           `}>
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

        {/* Ambient Glow */}
        {isMyTurn && (
          <div className={`absolute inset-0 opacity-10 ${actionBg} blur-3xl`} />
        )}
      </div>

      {/* MAP GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MAP_POOL.map((map) => {
          const status = getMapStatus(map.id); // 'BAN', 'PICK', or 'AVAILABLE'
          const isSelected = selectedMap === map.id;
          
          // Disable interaction if: Map taken, Not my turn, or processing
          const isDisabled = status !== 'AVAILABLE' || !isMyTurn || loading;

          return (
            <button
              key={map.id}
              onClick={() => setSelectedMap(map.id)}
              disabled={isDisabled}
              className={`
                relative group overflow-hidden rounded border-2 transition-all duration-300 h-32 md:h-40
                ${status === 'BAN' ? 'border-red-900 opacity-40 grayscale' : ''}
                ${status === 'PICK' ? 'border-emerald-500 opacity-100 ring-2 ring-emerald-500/20' : ''}
                ${status === 'AVAILABLE' && isSelected 
                    ? `${actionBorder} scale-[1.02] shadow-xl z-10` 
                    : 'border-zinc-800'}
                ${status === 'AVAILABLE' && !isDisabled ? 'hover:border-zinc-600 cursor-pointer' : 'cursor-not-allowed'}
              `}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${map.image})` }}
              />
              <div className={`absolute inset-0 transition-colors ${status === 'AVAILABLE' ? 'bg-black/60 group-hover:bg-black/40' : 'bg-black/80'}`} />

              {/* Label */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black to-transparent flex justify-between items-end">
                <span className="text-white font-bold uppercase tracking-widest text-sm font-['Teko']">{map.name}</span>
                {status === 'AVAILABLE' && isSelected && (
                  <span className={`text-[10px] font-bold px-1.5 rounded ${actionBg} text-white`}>
                    SELECT
                  </span>
                )}
              </div>

              {/* Status Overlays */}
              {status === 'BAN' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Ban className="w-12 h-12 text-red-600 rotate-12 drop-shadow-lg" />
                </div>
              )}
              {status === 'PICK' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 drop-shadow-lg" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* CONFIRMATION FOOTER */}
      <div className={`
        fixed bottom-0 inset-x-0 p-4 bg-zinc-900/90 backdrop-blur border-t border-white/10 flex justify-center items-center transition-transform duration-300 z-50
        ${selectedMap ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="max-w-4xl w-full flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-zinc-500 font-bold">Selected Action</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black font-['Teko'] uppercase ${actionColor}`}>
                {currentAction} {MAP_POOL.find(m => m.id === selectedMap)?.name}
              </span>
            </div>
          </div>

          <button
            onClick={handleAction}
            disabled={loading}
            className={`
              px-8 py-3 rounded font-bold uppercase tracking-widest text-sm transition-all shadow-lg hover:scale-105 active:scale-95
              ${actionBg} text-white hover:brightness-110
            `}
          >
            {loading ? 'PROCESSING...' : `CONFIRM ${currentAction}`}
          </button>
        </div>
      </div>

    </div>
  );
};

export default VetoPanel;
