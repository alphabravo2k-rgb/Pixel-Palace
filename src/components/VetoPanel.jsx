import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { MAP_POOL } from '../lib/constants';
import { isTeamCaptain } from '../tournament/permissions';
import { useAuth } from '../auth/useAuth';

const VetoPanel = ({ match }) => {
  const { updateMatch, teams } = useTournament();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  
  if (!match || !match.vetoState) return null;

  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);
  const { vetoState } = match;

  const currentTeamId = vetoState.turn;
  const currentTeam = currentTeamId === match.team1Id ? team1 : team2;
  
  // SECURED: Only the Captain of the active team can interact
  const canVeto = isTeamCaptain(user, currentTeam);

  const handleVeto = async (mapId) => {
    if (!canVeto) {
        setError("Only the Team Captain can veto maps.");
        return;
    }
    setError(null);

    const newBanned = [...vetoState.bannedMaps, mapId];
    const remainingMaps = MAP_POOL.filter(m => !newBanned.includes(m.id));
    
    let updates = {};

    try {
        if (remainingMaps.length === 1) {
          // Veto complete, last map is picked
          updates = {
            'vetoState.bannedMaps': newBanned,
            'vetoState.pickedMap': remainingMaps[0].id,
            'vetoState.phase': 'complete',
            'status': 'live'
          };
        } else {
          // Switch turn
          updates = {
            'vetoState.bannedMaps': newBanned,
            'vetoState.turn': currentTeamId === match.team1Id ? match.team2Id : match.team1Id
          };
        }
    
        await updateMatch(match.id, updates);
    } catch (err) {
        setError("Failed to submit veto. Please try again.");
        console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Veto Header */}
      <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
        <div className={`text-lg font-bold flex items-center gap-2 ${vetoState.turn === match.team1Id ? 'text-yellow-400' : 'text-slate-500'}`}>
          {vetoState.turn === match.team1Id && <span className="animate-pulse">▶</span>}
          {team1?.name || 'Team 1'}
        </div>
        <div className="text-slate-500 font-mono text-xs uppercase">Map Veto Phase</div>
        <div className={`text-lg font-bold flex items-center gap-2 ${vetoState.turn === match.team2Id ? 'text-yellow-400' : 'text-slate-500'}`}>
          {team2?.name || 'Team 2'}
          {vetoState.turn === match.team2Id && <span className="animate-pulse">◀</span>}
        </div>
      </div>

      <div className="text-center mb-4">
        {vetoState.pickedMap ? (
          <div className="p-4 bg-green-900/30 border border-green-500 rounded-lg">
            <div className="text-green-400 font-bold text-xl uppercase tracking-widest">
                Decider Map
            </div>
            <div className="text-3xl font-black text-white mt-2">
                {MAP_POOL.find(m => m.id === vetoState.pickedMap)?.name}
            </div>
          </div>
        ) : (
          <div className="text-blue-300 bg-blue-900/20 py-2 rounded border border-blue-900/50">
            Waiting for <span className="font-bold text-white">{currentTeam?.name}</span> to BAN a map
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded animate-bounce">
            ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {MAP_POOL.map(map => {
          const isBanned = vetoState.bannedMaps.includes(map.id);
          const isPicked = vetoState.pickedMap === map.id;

          return (
            <button
              key={map.id}
              disabled={isBanned || isPicked || !canVeto || vetoState.phase === 'complete'}
              onClick={() => handleVeto(map.id)}
              className={`
                relative h-24 rounded-lg overflow-hidden border-2 transition-all group
                ${isBanned ? 'border-red-900/50 opacity-40 grayscale' : 'border-slate-600 hover:border-blue-500'}
                ${isPicked ? 'border-green-500 ring-2 ring-green-500 opacity-100 scale-105 z-10' : ''}
                ${!canVeto && !isBanned && !isPicked ? 'cursor-not-allowed opacity-75' : ''}
              `}
            >
              <img src={map.image} alt={map.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-center pb-2">
                <span className="font-bold text-white shadow-black drop-shadow-md">{map.name}</span>
              </div>
              {isBanned && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                  <span className="text-red-500 font-bold border-2 border-red-500 px-2 py-1 rotate-12 uppercase text-xs">Banned</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {!vetoState.pickedMap && (
        <div className="text-center text-xs text-slate-500 mt-2">
            {canVeto ? "It is your turn to ban." : "Waiting for opponent captain..."}
        </div>
      )}
    </div>
  );
};

export default VetoPanel;
