import React, { memo } from 'react';
import { Trophy, Clock, MapPin, MonitorPlay, AlertTriangle } from 'lucide-react'; 
import { useTournament } from '../tournament/useTournament';

const BracketMatch = memo(({ match, onMatchClick, style }) => {
  if (!match) return null;

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  
  const statusColor = isLive ? 'border-[#ff5500] shadow-[0_0_10px_rgba(255,85,0,0.3)]' : 
                     isCompleted ? 'border-emerald-900/50 opacity-70' : 
                     'border-zinc-800 hover:border-zinc-600';

  return (
    <div 
      style={style}
      onClick={() => onMatchClick(match)}
      className={`absolute w-64 bg-[#0b0c0f] border ${statusColor} p-3 cursor-pointer transition-all hover:scale-[1.02] group`}
    >
      <div className="flex justify-between items-center mb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        <span className="flex items-center gap-1">
          {match.id.slice(0, 4)} <span className="text-zinc-700">|</span> {match.map || 'VETO'}
        </span>
        {isLive && (
          <span className="flex items-center gap-1 text-[#ff5500] animate-pulse font-bold">
            <MonitorPlay size={10} /> LIVE
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center bg-zinc-900/50 px-2 py-1 rounded-sm border-l-2 border-transparent hover:border-[#ff5500] transition-colors">
          <span className={`font-bold text-xs ${match.winner === match.team1_id ? 'text-[#ff5500]' : 'text-zinc-300'}`}>
            {match.team1_name || 'TBD'}
          </span>
          <span className="font-mono text-[#ff5500]">{match.score1 ?? '-'}</span>
        </div>
        <div className="flex justify-between items-center bg-zinc-900/50 px-2 py-1 rounded-sm border-l-2 border-transparent hover:border-[#ff5500] transition-colors">
          <span className={`font-bold text-xs ${match.winner === match.team2_id ? 'text-[#ff5500]' : 'text-zinc-300'}`}>
            {match.team2_name || 'TBD'}
          </span>
          <span className="font-mono text-[#ff5500]">{match.score2 ?? '-'}</span>
        </div>
      </div>
    </div>
  );
});

BracketMatch.displayName = 'BracketMatch';

const Bracket = ({ onMatchClick }) => {
  const { matches, loading } = useTournament();

  if (loading) {
     return <div className="w-full h-[600px] flex items-center justify-center text-zinc-600 font-mono animate-pulse">Initializing Uplink...</div>;
  }

  if (!matches || matches.length === 0) {
    return (
        <div className="w-full h-[600px] bg-tactical-grid rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-zinc-500">
            <AlertTriangle className="mb-4 text-[#ff5500]" />
            <p className="font-mono text-xs uppercase tracking-widest">No Matches Scheduled</p>
            {/* FIX: Escaped quotes below */}
            <p className="text-[10px] mt-2">Add rows to &apos;matches&apos; table in Supabase</p>
        </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative overflow-hidden bg-tactical-grid rounded-lg border border-zinc-800">
      <div className="absolute top-4 right-4 flex gap-4 text-[10px] font-mono text-zinc-600 uppercase">
        <span className="flex items-center gap-1"><Trophy size={12} /> Upper Bracket</span>
        <span className="flex items-center gap-1"><MapPin size={12} /> LAN Main Stage</span>
        <span className="flex items-center gap-1"><Clock size={12} /> UTC+0</span>
      </div>

      {matches[0] && <BracketMatch match={matches[0]} style={{ top: 50, left: 50 }} onMatchClick={onMatchClick} />}
      {matches[1] && <BracketMatch match={matches[1]} style={{ top: 200, left: 50 }} onMatchClick={onMatchClick} />}
      
      <svg className="absolute inset-0 pointer-events-none stroke-zinc-800" fill="none">
        <path d="M 310 95 L 350 95 L 350 170 L 390 170" strokeWidth="2" />
        <path d="M 310 245 L 350 245 L 350 170" strokeWidth="2" />
      </svg>

      {matches[2] && <BracketMatch match={matches[2]} style={{ top: 125, left: 400 }} onMatchClick={onMatchClick} />}
    </div>
  );
};

export default Bracket;
