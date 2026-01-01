import React from 'react';
import { Tv, Shield, Lock, ChevronRight, AlertCircle } from 'lucide-react';

const getStatusStyles = (status) => {
  const themes = {
    live: { label: 'LIVE', border: 'border-emerald-500', bg: 'bg-emerald-950/40', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' },
    veto: { label: 'VETO', border: 'border-fuchsia-500', bg: 'bg-fuchsia-950/30', text: 'text-fuchsia-400', glow: 'shadow-[0_0_15px_rgba(192,38,211,0.2)]' },
    completed: { label: 'DONE', border: 'border-zinc-800', bg: 'bg-[#0a0a0c]', text: 'text-zinc-500', glow: '' },
    scheduled: { label: 'PENDING', border: 'border-zinc-700', bg: 'bg-[#0b0c0f]', text: 'text-zinc-400', glow: '' }
  };
  return themes[status] || themes.scheduled;
};

const TeamSlot = ({ team, score, isWinner }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 transition-colors ${isWinner ? 'bg-white/5' : ''}`}>
    <div className="flex items-center gap-3 overflow-hidden">
      <div className={`w-6 h-6 rounded bg-zinc-900 flex-shrink-0 flex items-center justify-center border ${isWinner ? 'border-emerald-500/50' : 'border-zinc-800'}`}>
        {team?.logo_url ? (
            <img src={team.logo_url} className="w-full h-full object-contain p-0.5" alt={team.name} />
        ) : (
            <Shield size={10} className="text-zinc-700" />
        )}
      </div>
      <span className={`text-[11px] font-bold uppercase truncate font-['Rajdhani'] ${isWinner ? 'text-white' : 'text-zinc-400'}`}>
        {team?.name || 'TBD'}
      </span>
    </div>
    <div className={`font-mono font-bold text-xs w-6 text-center ${isWinner ? 'text-emerald-400' : 'text-zinc-600'}`}>
      {score ?? '-'}
    </div>
  </div>
);

export const MatchNode = ({ match, onClick }) => {
  const theme = getStatusStyles(match.status);
  
  // LOGIC UPDATE: Handle Combined Scores ("13-5") vs Individual Columns
  let s1 = match.team1_score;
  let s2 = match.team2_score;

  // Fallback: Parse string score if individual columns are null
  if ((s1 == null || s2 == null) && typeof match.score === 'string') {
      const parts = match.score.split('-');
      if (parts.length === 2) {
          s1 = parts[0];
          s2 = parts[1];
      }
  }

  const hasTeams = match.team1 || match.team2; 
  const isLocked = match.is_locked;
  const canOpen = hasTeams; 
  const isActionable = hasTeams && !isLocked && match.status !== 'completed';

  return (
    <div className={`relative w-full h-full flex flex-col rounded border backdrop-blur-md transition-all duration-300 ${theme.border} ${theme.bg} ${theme.glow}`}>
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
           {match.status === 'live' && <span className="animate-ping w-1.5 h-1.5 rounded-full bg-emerald-500" />}
           <span className={`text-[9px] font-black tracking-widest ${theme.text}`}>{theme.label}</span>
        </div>
        <span className="text-[9px] font-mono text-zinc-600">#{match.match_no}</span>
      </div>

      {/* Teams */}
      <div className="flex-1 flex flex-col justify-center divide-y divide-white/5">
        <TeamSlot team={match.team1} score={s1} isWinner={match.winner_id === match.team1_id} />
        <TeamSlot team={match.team2} score={s2} isWinner={match.winner_id === match.team2_id} />
      </div>

      {/* Action Footer */}
      <button 
        onClick={() => canOpen && onClick(match)}
        disabled={!canOpen}
        className={`
          px-3 py-1.5 border-t border-white/5 flex items-center justify-between w-full
          text-[9px] font-bold tracking-wider uppercase transition-colors
          ${canOpen ? 'hover:bg-white/5 text-zinc-400 hover:text-white' : 'cursor-not-allowed text-zinc-700'}
        `}
      >
        <span className="flex items-center gap-2">
           {isLocked && <Lock size={10} className="text-red-500" />}
           {match.stream_url && <Tv size={10} className="text-purple-500" />}
           {!hasTeams ? 'WAITING...' : isLocked ? 'LOCKED' : 'DETAILS'}
        </span>
        {isActionable && <ChevronRight size={12} />}
      </button>
    </div>
  );
};
