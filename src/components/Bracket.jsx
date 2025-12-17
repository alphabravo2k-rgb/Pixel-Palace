import React, { useRef } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Swords, Tv, Shield, Activity, Lock, AlertTriangle, ChevronRight, Map } from 'lucide-react';

// --- HELPERS ---

const getStatusStyles = (status) => {
  switch (status) {
    case 'live':
      return {
        label: 'LIVE NOW',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]'
      };
    case 'veto':
      return {
        label: 'VETO PHASE',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        glow: 'shadow-[0_0_15px_rgba(251,146,60,0.15)]'
      };
    case 'completed':
      return {
        label: 'FINALIZED',
        color: 'text-zinc-500',
        bg: 'bg-zinc-800/20',
        border: 'border-zinc-800',
        glow: ''
      };
    default:
      return {
        label: 'SCHEDULED',
        color: 'text-blue-400',
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/20',
        glow: ''
      };
  }
};

// --- SUB-COMPONENTS ---

const TeamSlot = ({ name, logo, score, isWinner, isTBD, isLive }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 transition-colors ${isWinner ? 'bg-white/[0.02]' : ''}`}>
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-7 h-7 rounded bg-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden border ${isWinner ? 'border-zinc-600' : 'border-zinc-800'}`}>
        {logo ? (
          <img src={logo} alt="" className="w-full h-full object-contain" />
        ) : (
          <Shield className={`w-3.5 h-3.5 ${isTBD ? 'text-zinc-700' : 'text-zinc-500'}`} />
        )}
      </div>
      <span className={`text-xs font-medium uppercase tracking-tight truncate ${isTBD ? 'text-zinc-600 italic' : isWinner ? 'text-white' : 'text-zinc-400'}`}>
        {name || 'TBD'}
      </span>
    </div>
    
    <div className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${isWinner ? 'text-[#ff5500] bg-[#ff5500]/10' : isTBD ? 'text-zinc-800' : 'text-zinc-500'}`}>
      {score ?? '—'}
    </div>
  </div>
);

const MatchCard = ({ match }) => {
  const status = getStatusStyles(match.status);
  const isLive = match.status === 'live' || match.status === 'veto';

  return (
    <div className={`relative group w-64 bg-[#0b0c0f] border ${isLive ? status.border : 'border-zinc-800'} transition-all duration-300 ${status.glow} flex flex-col overflow-hidden`}
         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 94% 100%, 0 100%)' }}>
      
      {/* Tactical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

      {/* Header Info */}
      <div className={`px-3 py-1.5 border-b flex items-center justify-between relative z-10 ${isLive ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-zinc-800 bg-[#15191f]'}`}>
        <div className="flex items-center gap-2">
          {isLive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          <span className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>
            {status.label}
          </span>
        </div>
        <span className="text-[9px] font-mono text-zinc-600 uppercase">ID: {match.id.split('-')[0]}</span>
      </div>

      {/* Teams Container */}
      <div className="flex flex-col divide-y divide-zinc-800/50 relative z-10">
        <TeamSlot 
          name={match.team1Name} 
          logo={match.team1Logo} 
          score={match.score?.split('-')[0]} 
          isWinner={match.winnerId === match.team1Id && match.status === 'completed'}
          isTBD={!match.team1Id}
          isLive={isLive}
        />
        <TeamSlot 
          name={match.team2Name} 
          logo={match.team2Logo} 
          score={match.score?.split('-')[1]} 
          isWinner={match.winnerId === match.team2Id && match.status === 'completed'}
          isTBD={!match.team2Id}
          isLive={isLive}
        />
      </div>

      {/* Match Actions / Footer */}
      <div className="mt-auto px-3 py-2 bg-black/40 border-t border-zinc-800/50 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {match.stream_url ? (
              <a href={match.stream_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <Tv className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Tv className="w-3.5 h-3.5 text-zinc-800" />
            )}
            {match.vetoState?.pickedMap && (
              <div className="flex items-center gap-1 text-zinc-600" title={`Map: ${match.vetoState.pickedMap}`}>
                <Map className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase truncate max-w-[60px]">{match.vetoState.pickedMap}</span>
              </div>
            )}
          </div>

          <button className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black tracking-tighter uppercase transition-all
            ${isLive ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>
            Intel
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Side Accent Line */}
      <div className={`absolute left-0 top-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${isLive ? 'bg-emerald-400' : 'bg-[#ff5500]'}`} />
    </div>
  );
};

// --- MAIN BRACKET LAYOUT ---

const Brackets = () => {
  const { rounds, loading, error } = useTournament();
  const containerRef = useRef(null);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center text-zinc-500 gap-4 font-mono text-xs uppercase animate-pulse tracking-[0.5em]">
      Deploying Grid...
    </div>
  );

  if (error) return (
    <div className="p-12 text-center text-red-500 font-mono text-xs uppercase flex flex-col items-center gap-3">
      <AlertTriangle className="w-8 h-8" />
      <span>Encryption Error: {error}</span>
    </div>
  );

  // Convert rounds object to array and sort by round key
  const sortedRounds = Object.entries(rounds)
    .sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                TACTICAL <span className="text-[#ff5500]">BRACKETS</span>
              </h2>
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
                Conflict Map: {sortedRounds.length} Phases Identified
              </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/5 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Operations</span>
            </div>
          </div>
      </div>

      {/* Bracket Container with Horizontal Scroll */}
      <div 
        ref={containerRef}
        className="relative flex gap-12 overflow-x-auto pb-12 pt-4 scrollbar-hide select-none no-scrollbar"
      >
        {sortedRounds.map(([roundNum, roundMatches], roundIdx) => (
          <div key={roundNum} className="flex flex-col gap-8 min-w-max">
            {/* Round Title */}
            <div className="flex flex-col gap-1 border-l-2 border-[#ff5500] pl-4 mb-4">
              <span className="text-[10px] font-mono text-[#ff5500] uppercase tracking-[0.3em] font-black">
                Phase {roundNum}
              </span>
              <span className="text-sm font-black text-white uppercase italic">
                {Number(roundNum) === sortedRounds.length ? 'Grand Final' : `Elimination R${roundNum}`}
              </span>
            </div>

            {/* Matches in Round */}
            <div className="flex flex-col justify-around flex-grow gap-8 relative">
              {roundMatches.map((match, mIdx) => (
                <div key={match.id} className="relative flex items-center">
                  <MatchCard match={match} />
                  
                  {/* Connector Lines (Tactical Visual Style) */}
                  {roundIdx < sortedRounds.length - 1 && (
                    <div className="absolute left-full top-1/2 w-12 h-px bg-zinc-800 group-hover:bg-zinc-600 transition-colors">
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-zinc-800 rounded-full border border-zinc-900" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {sortedRounds.length === 0 && (
          <div className="w-full py-20 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl">
             <Swords className="w-12 h-12 text-zinc-800 mb-4" />
             <p className="text-xs font-mono text-zinc-600 uppercase tracking-[0.3em]">No Engagements Logged</p>
          </div>
        )}
      </div>

      {/* Layout Legend */}
      <div className="flex gap-8 border-t border-zinc-800 pt-6 opacity-30">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-[#ff5500] shadow-[0_0_8px_#ff5500]" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }} />
           <span className="text-[9px] font-mono text-white uppercase tracking-widest">Offensive Unit</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-blue-500 shadow-[0_0_8px_#3b82f6]" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }} />
           <span className="text-[9px] font-mono text-white uppercase tracking-widest">Strategic Support</span>
        </div>
      </div>
    </div>
  );
};

export default Brackets;
