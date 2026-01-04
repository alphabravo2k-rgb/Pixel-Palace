import React from 'react';
import { Tv, Shield, Lock, ChevronRight, AlertCircle, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';

// 🎨 DYNAMIC THEME ENGINE
const getStatusStyles = (status) => {
  const themes = {
    live: { 
        label: 'LIVE', 
        border: 'border-emerald-500', 
        bg: 'bg-emerald-950/40', 
        text: 'text-emerald-400', 
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
    },
    veto: { 
        label: 'VETO', 
        border: 'border-fuchsia-500', 
        bg: 'bg-fuchsia-950/30', 
        text: 'text-fuchsia-400', 
        glow: 'shadow-[0_0_15px_rgba(192,38,211,0.2)]' 
    },
    completed: { 
        label: 'DONE', 
        border: 'border-zinc-800', 
        bg: 'bg-[#0a0a0c]', 
        text: 'text-zinc-500', 
        glow: '' 
    },
    scheduled: { 
        label: 'PENDING', 
        border: 'border-zinc-700', 
        bg: 'bg-[#0b0c0f]', 
        text: 'text-zinc-400', 
        glow: '' 
    },
    disputed: {
        label: 'DISPUTE',
        border: 'border-red-500',
        bg: 'bg-red-950/40',
        text: 'text-red-500',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
    }
  };
  return themes[status] || themes.scheduled;
};

// 🛡️ SUB-COMPONENT: TEAM ROW
const TeamSlot = ({ team, score, isWinner, seed }) => (
  <div className={cn(
      "flex items-center justify-between px-3 py-2.5 transition-colors relative overflow-hidden",
      isWinner ? "bg-white/5" : ""
  )}>
    {/* Winner Highlight Bar */}
    {isWinner && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}

    <div className="flex items-center gap-3 overflow-hidden pl-2">
      {/* Logo */}
      <div className={cn(
          "w-6 h-6 rounded bg-zinc-900 flex-shrink-0 flex items-center justify-center border",
          isWinner ? "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "border-zinc-800"
      )}>
        {team?.logo_url ? (
            <img src={team.logo_url} className="w-full h-full object-contain p-0.5" alt={team.name} />
        ) : (
            <Shield size={10} className="text-zinc-700" />
        )}
      </div>
      
      {/* Name & Seed */}
      <div className="flex flex-col leading-none">
          <span className={cn(
              "text-[11px] font-bold uppercase truncate font-display tracking-wide",
              isWinner ? "text-white" : "text-zinc-400"
          )}>
            {team?.name || 'TBD'}
          </span>
          {team?.seed_number && (
              <span className="text-[8px] font-mono text-zinc-600">SEED #{team.seed_number}</span>
          )}
      </div>
    </div>

    {/* Score */}
    <div className={cn(
        "font-mono font-bold text-xs w-6 text-center",
        isWinner ? "text-emerald-400" : "text-zinc-600"
    )}>
      {score ?? '-'}
    </div>
  </div>
);

// 🟦 MAIN COMPONENT
export const MatchNode = ({ match, onClick }) => {
  const theme = getStatusStyles(match.status);
  
  // LOGIC: Parse Scores
  let s1 = match.score_team1;
  let s2 = match.score_team2;

  // Fallback: Legacy String Format "16-14"
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
    <div className={cn(
        "relative w-full h-full flex flex-col rounded border backdrop-blur-md transition-all duration-300 group",
        theme.border, theme.bg, theme.glow,
        canOpen ? "hover:scale-[1.02] hover:brightness-110 cursor-pointer" : "opacity-80"
    )}
    onClick={() => canOpen && onClick(match)}
    >
      
      {/* 1. HEADER */}
      <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
           {match.status === 'live' && <span className="animate-ping w-1.5 h-1.5 rounded-full bg-emerald-500" />}
           <span className={`text-[9px] font-black tracking-widest ${theme.text}`}>{theme.label}</span>
        </div>
        <span className="text-[9px] font-mono text-zinc-600">#{match.match_no}</span>
      </div>

      {/* 2. TEAMS */}
      <div className="flex-1 flex flex-col justify-center divide-y divide-white/5">
        <TeamSlot 
            team={match.team1} 
            score={s1} 
            isWinner={match.winner_id === match.team1_id} 
            seed={match.team1?.seed_number}
        />
        <TeamSlot 
            team={match.team2} 
            score={s2} 
            isWinner={match.winner_id === match.team2_id} 
            seed={match.team2?.seed_number}
        />
      </div>

      {/* 3. FOOTER */}
      <div className={cn(
          "px-3 py-1.5 border-t border-white/5 flex items-center justify-between w-full text-[9px] font-bold tracking-wider uppercase transition-colors",
          canOpen ? "bg-white/0 group-hover:bg-white/5 text-zinc-500 group-hover:text-white" : "text-zinc-700"
      )}>
        <span className="flex items-center gap-2">
            {isLocked && <Lock size={10} className="text-red-500" />}
            {match.status === 'disputed' && <AlertCircle size={10} className="text-red-500" />}
            {match.stream_url && <Tv size={10} className="text-purple-500" />}
            
            {!hasTeams ? 'WAITING FOR OPPONENTS' : isLocked ? 'LOCKED' : match.status === 'completed' ? 'DETAILS' : 'MANAGE'}
        </span>
        
        {/* Hover Arrow  */}
        {canOpen && <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
    </div>
  );
};
