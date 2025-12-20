import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCaptainVeto } from '../hooks/useCaptainVeto';
import { MAP_POOL } from '../lib/constants';
import { ShieldAlert, Check, Ban } from 'lucide-react';

const VetoPanel = ({ match }) => { // Optional 'match' prop for Modal usage
  const location = useLocation();
  const navigate = useNavigate();
  
  // -- MODE DETECTION --
  // If 'match' prop exists, we are in the Modal (Spectator/Admin View)
  // If not, we are in the Standalone Captain View
  const isEmbedded = !!match; 
  const activePin = location.state?.pin;

  // -- CAPTAIN MODE LOGIC --
  const captainHook = useCaptainVeto(activePin);
  
  // Redirect if trying to access standalone without PIN
  useEffect(() => {
    if (!isEmbedded && !activePin) navigate('/');
  }, [isEmbedded, activePin, navigate]);

  // -- DATA NORMALIZATION --
  // We normalize the data so the UI code below is identical for both modes
  let displayState = null;
  let actionHandler = null;
  let loading = false;
  let error = null;

  if (isEmbedded) {
    // MODAL VIEW (Read Only / Admin Override)
    displayState = {
      team_name: match.team1Name,
      opponent_name: match.team2Name,
      banned_maps: match.vetoState?.bannedMaps || [],
      picked_map: match.vetoState?.pickedMap,
      is_my_turn: false, // Admins don't "take turns", they override
      status_text: match.vetoState?.phase === 'complete' ? 'LOCKED' : 'IN PROGRESS'
    };
  } else {
    // CAPTAIN VIEW (Interactive)
    if (captainHook.loading) return <div className="p-12 text-center text-fuchsia-500 font-mono animate-pulse tracking-widest">ESTABLISHING SECURE UPLINK...</div>;
    if (!captainHook.gameState) return <div className="p-12 text-center text-red-500 font-mono tracking-widest">UPLINK TERMINATED</div>;
    
    displayState = {
      team_name: captainHook.gameState.team_name,
      opponent_name: captainHook.gameState.opponent_name || "OPPONENT",
      banned_maps: captainHook.gameState.banned_maps,
      picked_map: null, // Captain hook might not return pick yet?
      is_my_turn: captainHook.gameState.is_my_turn,
      status_text: captainHook.gameState.is_my_turn ? "YOUR COMMAND" : "ENEMY TURN"
    };
    actionHandler = captainHook.submitVeto;
    loading = captainHook.loading;
    error = captainHook.error;
  }

  // -- RENDER --
  return (
    <div className={`w-full ${isEmbedded ? '' : 'max-w-6xl mx-auto my-8 bg-[#0b0c0f] border border-zinc-800 p-6 rounded-xl shadow-2xl'}`}>
      
      {/* Header (Only for Standalone) */}
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 mb-8">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] mb-1">Veto Protocol</h2>
            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              {displayState.team_name} <span className="text-fuchsia-600 px-2">VS</span> {displayState.opponent_name}
            </h1>
          </div>
          <div className={`mt-4 md:mt-0 px-6 py-3 rounded text-xs font-black uppercase tracking-widest shadow-lg transition-all ${displayState.is_my_turn ? 'bg-emerald-600 text-white animate-pulse shadow-emerald-900/20' : 'bg-zinc-800 text-zinc-500'}`}>
             {displayState.status_text}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 mb-6 rounded flex items-center gap-3">
           <ShieldAlert className="w-5 h-5" />
           <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MAP_POOL.map(map => {
          const isBanned = displayState.banned_maps.includes(map.name) || displayState.banned_maps.includes(map.id); // Handle both formats
          const isPicked = displayState.picked_map === map.id;
          const canInteract = !isEmbedded && displayState.is_my_turn && !isBanned;

          return (
            <button
              key={map.id}
              onClick={() => canInteract && actionHandler(map.id)}
              disabled={!canInteract || loading}
              className={`
                relative h-32 md:h-40 rounded-lg overflow-hidden border-2 transition-all duration-300 group
                ${isBanned ? 'border-red-900/30 opacity-40 grayscale cursor-not-allowed' : 'border-zinc-800'}
                ${isPicked ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-[1.02] z-10 opacity-100' : ''}
                ${canInteract ? 'hover:border-fuchsia-500 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(192,38,211,0.3)] cursor-pointer' : ''}
              `}
            >
              <img src={map.image} alt={map.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end justify-center pb-3">
                <span className="text-white font-black uppercase text-sm tracking-widest drop-shadow-md">{map.name}</span>
              </div>

              {/* OVERLAYS */}
              {isBanned && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-[2px]">
                  <div className="border-2 border-red-500 text-red-500 px-3 py-1 transform -rotate-12 font-black text-sm uppercase tracking-widest rounded flex items-center gap-2">
                    <Ban className="w-4 h-4" /> BANNED
                  </div>
                </div>
              )}
              
              {isPicked && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/40 backdrop-blur-[1px]">
                   <div className="flex flex-col items-center">
                      <Check className="w-10 h-10 text-emerald-400 drop-shadow-lg mb-1" />
                      <span className="text-white font-black text-xs uppercase tracking-widest drop-shadow-md">CONFIRMED</span>
                   </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {!isEmbedded && (
         <div className="mt-8 pt-4 border-t border-white/5 flex justify-between text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
            <span>Secure Connection Established</span>
            <span>ID: {location.state?.pin?.slice(0,4)}...</span>
         </div>
      )}
    </div>
  );
};

export default VetoPanel;
