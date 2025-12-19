import React, { useState, useEffect } from 'react';
import { useTournament } from '../tournament/useTournament';
import { MAP_POOL, VETO_FLOW } from '../lib/constants';
import { isAdmin } from '../tournament/permissions';
import { useSession } from '../auth/useSession';
import { Clock, History, Loader2 } from 'lucide-react';

const VetoPanel = ({ match }) => {
  const { submitVeto, teams } = useTournament();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // 1. CALCULATE CURRENT STEP
  const format = match?.format || "BO1";
  const vetoState = match?.vetoState || { bannedMaps: [], pickedMaps: [] };
  const currentStepIndex = (vetoState.bannedMaps?.length || 0) + (vetoState.pickedMaps?.length || 0);
  const currentStep = VETO_FLOW[format]?.[currentStepIndex] || { team: "NONE", action: "COMPLETE" };

  // 2. HOOKS MUST BE CALLED BEFORE EARLY RETURNS
  useEffect(() => {
    if (!match || currentStep.action === "COMPLETE") return;
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [currentStepIndex, currentStep.action, match]);

  if (!match || !match.vetoState) return null;

  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);

  // 3. AUTHORIZATION
  const actingTeamId = currentStep.team === "A" ? match.team1Id : match.team2Id;
  const isMyTurn = session.teamId === actingTeamId || isAdmin(session);
  const canAct = isMyTurn && match.status === 'live' && currentStep.action !== "COMPLETE";

  const handleAction = async (mapId, actionType, side = null) => {
    if (!canAct) return;
    setLoading(true);
    try {
      await submitVeto(match.id, { action: actionType, mapId, side });
      setTimeLeft(60);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[#0b0c0f] p-4 rounded-sm border border-zinc-800 relative overflow-hidden">
        <div className={`flex flex-col ${currentStep.team === "A" ? "text-[#ff5500]" : "text-zinc-500"}`}>
          <span className="text-[10px] font-mono uppercase tracking-widest">Home Team</span>
          <span className="text-lg font-black italic tracking-tighter uppercase">{team1?.name}</span>
        </div>

        <div className="flex flex-col items-center z-10">
          <div className={`flex items-center gap-2 font-mono text-xl font-black ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white"}`}>
            <Clock size={18} /> 00:{timeLeft.toString().padStart(2, '0')}
          </div>
          <span className="text-[9px] text-[#ff5500] font-bold uppercase tracking-[0.3em] mt-1">
            {currentStep.action} PHASE
          </span>
        </div>

        <div className={`flex flex-col items-end ${currentStep.team === "B" ? "text-[#ff5500]" : "text-zinc-500"}`}>
          <span className="text-[10px] font-mono uppercase tracking-widest">Away Team</span>
          <span className="text-lg font-black italic tracking-tighter uppercase">{team2?.name}</span>
        </div>
      </div>

      <div className="relative">
        {!isMyTurn && currentStep.action !== "COMPLETE" && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center border border-zinc-800/50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#ff5500] animate-spin mx-auto mb-2" />
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em]">Waiting for Opponent</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {MAP_POOL.filter(m => m.active).map(map => {
            const isBanned = vetoState.bannedMaps?.includes(map.id);
            const isPicked = vetoState.pickedMaps?.includes(map.id) || vetoState.pickedMap === map.id;
            
            return (
              <button
                key={map.id}
                disabled={isBanned || isPicked || !canAct || loading}
                onClick={() => handleAction(map.id, currentStep.action)}
                className={`relative group h-32 border-2 transition-all duration-500 overflow-hidden
                  ${isBanned ? "border-red-900/20 opacity-30 grayscale" : "border-zinc-800 hover:border-[#ff5500]"}
                  ${isPicked ? "border-emerald-500 opacity-100 scale-105 z-10 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : ""}
                `}
              >
                <img src={map.image} alt={map.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-2 left-0 w-full text-center text-[10px] font-black uppercase tracking-tighter text-white drop-shadow-md">
                  {map.name}
                </span>
                {isBanned && <div className="absolute inset-0 flex items-center justify-center bg-red-950/40"><span className="text-[10px] font-black text-red-500 border border-red-500 px-2 rotate-12">BANNED</span></div>}
                {isPicked && <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/20"><span className="text-[10px] font-black text-emerald-400 border border-emerald-400 px-2 -rotate-12">PICKED</span></div>}
              </button>
            );
          })}
        </div>
      </div>

      {currentStep.action === "SIDE" && isMyTurn && (
        <div className="bg-[#ff5500]/10 border border-[#ff5500]/30 p-6 flex flex-col items-center gap-4 animate-in zoom-in">
          <h4 className="text-sm font-black text-white uppercase italic tracking-widest">Select Starting Side</h4>
          <div className="flex gap-4">
            <button onClick={() => handleAction(null, "SIDE", "CT")} className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all">Counter-Terrorists</button>
            <button onClick={() => handleAction(null, "SIDE", "T")} className="px-10 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest transition-all">Terrorists</button>
          </div>
        </div>
      )}

      <div className="border-t border-zinc-900 pt-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-3">
          <History size={14} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Tactical Audit Log</span>
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
          {vetoState.log?.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-mono border-l border-zinc-800 pl-3 py-1">
              <span className="text-zinc-600">[{entry.time}]</span>
              <span className="text-white font-bold uppercase">{entry.teamName}</span>
              <span className={entry.action === 'BAN' ? "text-red-500" : "text-emerald-500"}>{entry.action}NED</span>
              <span className="text-zinc-400 uppercase italic">{entry.mapName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VetoPanel;
