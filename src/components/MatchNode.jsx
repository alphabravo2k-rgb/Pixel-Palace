import React from 'react';
import { Tv, Shield, ChevronRight } from 'lucide-react';

// --- THEME ENGINE ---
const getStatusStyles = (status) => {
  const themes = {
    live: { 
      label: 'LIVE_COMBAT', 
      border: 'border-emerald-500', 
      bg: 'bg-emerald-950/40', 
      text: 'text-emerald-400', 
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]', 
      accent: 'bg-emerald-500'
    },
    veto: { 
      label: 'VETO_PROTOCOL', 
      border: 'border-fuchsia-500', 
      bg: 'bg-fuchsia-950/30', 
      text: 'text-fuchsia-400', 
      glow: 'shadow-[0_0_15px_rgba(192,38,211,0.15)]', 
      accent: 'bg-fuchsia-500'
    },
    completed: { 
      label: 'ARCHIVED', 
      border: 'border-zinc-800', 
      bg: 'bg-[#0a0a0c]', 
      text: 'text-zinc-500', 
      glow: '', 
      accent: 'bg-zinc-800'
    },
    scheduled: { 
      label: 'STANDBY', 
      border: 'border-zinc-800', 
      bg: 'bg-[#0b0c0f]', 
      text: 'text-zinc-600', 
      glow: '', 
      accent: 'bg-zinc-800'
    }
  };
  return themes[status] || themes.scheduled;
};

const TeamSlot = ({ team, score, isWinner }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 transition-all duration-300 ${isWinner ? 'bg-white/[0.04]' : ''}`}>
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-7 h-7 rounded-sm bg-zinc-900 flex-shrink-0 flex items-center justify-center overflow-hidden border ${isWinner ? 'border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-zinc-800'}`}>
        {team?.logo_url ? (
          <img src={team.logo_url} alt="" className="w-full h-full object-contain" />
        ) : (
          <Shield className="w-3.5 h-3.5 text-zinc-700" />
        )}
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-tight truncate font-['Rajdhani'] ${isWinner ? 'text-white' : 'text-zinc-400'}`}>
        {team?.name || 'TBD'}
      </span>
    </div>
    <div className={`font-mono font-black text-xs w-8 text-center py-1 rounded-sm ${isWinner ? 'text-emerald-400 bg-emerald-900/20' : 'text-zinc-700 bg-black/30'}`}>
      {score ?? '-'}
    </div>
  </div>
);

export const MatchNode = ({ match, onClick }) => {
  const theme = getStatusStyles(match.status);
  
  // 🛡️ LOGIC FIX: Actionable only if teams exist AND status is valid
  // 'completed' matches are view-only, but 'scheduled/live/veto' might be actionable.
  // This depends on your app rules. Usually Admin wants to click ANY match.
  // But for players, maybe only scheduled. 
  // Assuming this is the bracket view where clicking opens the details/admin modal:
  const isActionable = !!(match.team1 || match.team2); 

  return (
    <div className={`
        relative group w-72 flex flex-col overflow-hidden rounded-lg border backdrop-blur-md transition-all duration-500
        ${theme.border} ${theme.bg} ${theme.glow}
      `}
    >
      {/* Tactical Header */}
      <div className={`px-4 py-2 border-b flex items-center justify-between relative z-10 bg-black/40 ${theme.border} border-opacity-30`}>
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${theme.text}`}>
            {theme.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {match.best_of > 1 && <span className="text-[9px] font-mono text-zinc-500 bg-zinc-800 px-1 rounded">BO{match.best_of}</span>}
          <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">#{match.match_no}</span>
        </div>
      </div>

      {/* Roster Slots */}
      <div className="flex flex-col divide-y divide-white/5 relative z-10">
        <TeamSlot 
          team={match.team1} 
          score={match.team1_score} 
          isWinner={match.winner_id && match.winner_id === match.team1_id} 
        />
        <TeamSlot 
          team={match.team2} 
          score={match.team2_score} 
          isWinner={match.winner_id && match.winner_id === match.team2_id} 
        />
      </div>

      {/* Footer Action */}
      <div className="mt-auto px-3 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
           {match.stream_url ? <Tv className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> : <Tv className="w-3.5 h-3.5 text-zinc-800" />}
        </div>
        
        <button 
          onClick={() => isActionable && onClick(match)}
          disabled={!isActionable}
          className={`
            flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-[9px] font-black tracking-[0.15em] uppercase transition-all
            ${isActionable 
              ? 'bg-white/5 hover:bg-fuchsia-600 text-zinc-400 hover:text-white cursor-pointer hover:shadow-[0_0_10px_rgba(192,38,211,0.4)]' 
              : 'text-zinc-800 cursor-not-allowed'}
          `}
        >
          {isActionable ? 'INTEL' : 'LOCKED'}
          <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Vertical Accent Line */}
      <div className={`absolute left-0 top-0 h-full w-[2px] ${theme.accent} opacity-50`} />
    </div>
  );
};
