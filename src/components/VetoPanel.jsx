import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { MAP_POOL } from '../lib/constants';
import { isTeamCaptain, isAdmin } from '../tournament/permissions';
import { useSession } from '../auth/useSession'; 
import { Check, Ban, AlertCircle } from 'lucide-react';

const VetoPanel = ({ match }) => {
  const { submitVeto, teams } = useTournament();
  const { session } = useSession(); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  if (!match || !match.vetoState) return null;

  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);
  const { vetoState } = match;

  const currentTeamId = vetoState.turn;
  const currentTeam = currentTeamId === match.team1Id ? team1 : team2;
  
  // Authorization
  const userIsCaptain = isTeamCaptain(session, currentTeamId);
  const userIsAdmin = isAdmin(session);
  const canVeto = (userIsCaptain || userIsAdmin) && match.status === 'live';

  const handleVeto = async (mapId, actionType) => {
    if (!canVeto) {
        setError("Waiting for active team or match is not live.");
        return;
    }
    setError(null);
    setLoading(true);

    try {
        await submitVeto(match.id, { action: actionType, mapId: mapId });
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const nextAction = "BAN"; // Ideally dynamic from backend

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#0b0c0f] p-4 rounded-xl border border-zinc-800">
        <div className={`text-lg font-bold flex items-center gap-3 ${vetoState.turn === match.team1Id ? 'text-yellow-400' : 'text-zinc-600'}`}>
          {vetoState.turn === match.team1Id && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>}
          {team1?.name || 'Team 1'}
        </div>
        
        <div className="flex flex-col items-center">
            <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Current Phase</span>
            <span className="text-white font-bold text-sm tracking-wide">
                {vetoState.phase === 'complete' ? 'VETO COMPLETE' : `${nextAction} PHASE`}
            </span>
        </div>

        <div className={`text-lg font-bold flex items-center gap-3 ${vetoState.turn === match.team2Id ? 'text-yellow-400' : 'text-zinc-600'}`}>
          {team2?.name || 'Team 2'}
          {vetoState.turn === match.team2Id && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>}
        </div>
      </div>

      <div className="text-center mb-4">
        {vetoState.pickedMap ? (
          <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="text-green-400 font-bold text-xs uppercase tracking-widest mb-1">
                Decider Map Selected
            </div>
            <div className="text-3xl font-black text-white uppercase italic tracking-tighter">
                {MAP_POOL.find(m => m.id === vetoState.pickedMap)?.name || vetoState.pickedMap}
            </div>
          </div>
        ) : (
           <div className="p-3 rounded-lg border border-dashed border-zinc-800 text-center">
               <span className="text-zinc-500 text-xs">Waiting for {currentTeam?.name} to {nextAction}...</span>
           </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {MAP_POOL.map(map => {
          const isBanned = vetoState.bannedMaps.includes(map.id);
          const isPicked = vetoState.pickedMap === map.id;
          const isDisabled = isBanned || isPicked || !canVeto || vetoState.phase === 'complete' || loading;

          return (
            <button
              key={map.id}
              disabled={isDisabled}
              onClick={() => handleVeto(map.id, nextAction)}
              className={`
                relative h-28 rounded-xl overflow-hidden border-2 transition-all duration-300 group
                ${isBanned ? 'border-red-900/30 opacity-40 grayscale' : 'border-zinc-800 hover:border-zinc-500'}
                ${isPicked ? 'border-green-500 ring-4 ring-green-500/20 opacity-100 scale-[1.02] z-10' : ''}
                ${!isDisabled ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed'}
              `}
            >
              <img src={map.image} alt={map.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end justify-center pb-3">
                <span className="font-bold text-white shadow-black drop-shadow-md text-sm tracking-wider uppercase">{map.name}</span>
              </div>
              
              {isBanned && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-[1px]">
                  <div className="transform -rotate-12 border-2 border-red-500 text-red-500 px-3 py-1 font-black text-sm uppercase tracking-widest rounded">
                    BANNED
                  </div>
                </div>
              )}
              
              {isPicked && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-900/40 backdrop-blur-[1px]">
                   <div className="flex flex-col items-center">
                       <Check className="w-8 h-8 text-white drop-shadow-lg mb-1" />
                       <span className="text-white font-bold text-xs uppercase tracking-widest drop-shadow-md">PICKED</span>
                   </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VetoPanel;
