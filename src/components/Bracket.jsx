import React, { useRef, useEffect } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Tv, Shield, ChevronRight, Zap, Loader2 } from 'lucide-react';

// --- THEME ENGINE ---
const getStatusStyles = (status) => {
  const themes = {
    live: { 
      label: 'LIVE_COMBAT', 
      border: 'border-emerald-500', 
      bg: 'bg-emerald-950/20', 
      text: 'text-emerald-400', 
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]', 
      line: '#10b981',
      accent: 'bg-emerald-500'
    },
    veto: { 
      label: 'VETO_PROTOCOL', 
      border: 'border-fuchsia-500', 
      bg: 'bg-fuchsia-950/20', 
      text: 'text-fuchsia-400', 
      glow: 'shadow-[0_0_20px_rgba(192,38,211,0.25)]', 
      line: '#d946ef',
      accent: 'bg-fuchsia-500'
    },
    completed: { 
      label: 'ARCHIVED', 
      border: 'border-zinc-700', 
      bg: 'bg-[#0a0a0c]', 
      text: 'text-zinc-500', 
      glow: '', 
      line: '#3f3f46',
      accent: 'bg-zinc-700'
    },
    scheduled: { 
      label: 'STANDBY', 
      border: 'border-zinc-800', 
      bg: 'bg-[#0b0c0f]', 
      text: 'text-zinc-600', 
      glow: '', 
      line: '#27272a',
      accent: 'bg-zinc-800'
    }
  };
  return themes[status] || themes.scheduled;
};

// --- SUB-COMPONENTS ---
const TeamSlot = ({ name, logo, score, isWinner, isTBD }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 transition-all duration-300 ${isWinner ? 'bg-white/[0.04]' : ''}`}>
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-7 h-7 rounded-sm bg-zinc-900 flex-shrink-0 flex items-center justify-center overflow-hidden border ${isWinner ? 'border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-zinc-800'}`}>
        {logo ? <img src={logo} alt="" className="w-full h-full object-contain" /> : <Shield className={`w-3.5 h-3.5 ${isTBD ? 'text-zinc-800' : 'text-zinc-700'}`} />}
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-tight truncate font-['Rajdhani'] ${isTBD ? 'text-zinc-700 italic' : isWinner ? 'text-white' : 'text-zinc-400'}`}>
        {name}
      </span>
    </div>
    <div className={`font-mono font-black text-xs w-8 text-center py-1 rounded-sm ${isWinner ? 'text-emerald-400 bg-emerald-900/20' : 'text-zinc-700 bg-black/30'}`}>
      {score ?? '-'}
    </div>
  </div>
);

const MatchCard = ({ match, onMatchClick, setRef }) => {
  const theme = getStatusStyles(match.status);
  const isActionable = !!(match.team1_id && match.team2_id);
  const matchIdShort = (match.id || '').toString().split('-')[0] || 'ERR';
  const scoreParts = (match.score || '0-0').toString().split('-');

  return (
    <div 
      ref={setRef}
      className={`
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
        <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">MOD_{matchIdShort.slice(0,4)}</span>
      </div>

      {/* Roster Slots */}
      <div className="flex flex-col divide-y divide-white/5 relative z-10">
        <TeamSlot 
          name={match.team1Name} 
          logo={match.team1Logo} 
          score={scoreParts[0]} 
          isWinner={match.winner_id === match.team1_id && match.status === 'completed'} 
          isTBD={match.team1Name === 'OPEN SLOT' || match.team1Name === 'TBD'} 
        />
        <TeamSlot 
          name={match.team2Name} 
          logo={match.team2Logo} 
          score={scoreParts[1]} 
          isWinner={match.winner_id === match.team2_id && match.status === 'completed'} 
          isTBD={match.team2Name === 'OPEN SLOT' || match.team2Name === 'TBD'} 
        />
      </div>

      {/* Footer Action */}
      <div className="mt-auto px-3 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
           {match.stream_url ? <Tv className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> : <Tv className="w-3.5 h-3.5 text-zinc-800" />}
        </div>
        
        <button 
          onClick={() => isActionable && onMatchClick(match)}
          disabled={!isActionable}
          className={`
            flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-[9px] font-black tracking-[0.15em] uppercase transition-all
            ${isActionable 
              ? 'bg-white/5 hover:bg-fuchsia-600 text-zinc-400 hover:text-white cursor-pointer hover:shadow-[0_0_10px_rgba(192,38,211,0.4)]' 
              : 'text-zinc-800 cursor-not-allowed'}
          `}
        >
          {isActionable ? 'ACCESS_INTEL' : 'LOCKED'}
          <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Vertical Accent Line */}
      <div className={`absolute left-0 top-0 h-full w-[2px] ${theme.accent} opacity-50`} />
    </div>
  );
};

// --- MAIN BRACKET COMPONENT ---
const Bracket = ({ onMatchClick }) => {
  const { rounds, loading, matches } = useTournament();
  const contentRef = useRef(null);
  const svgRef = useRef(null);
  const matchRefs = useRef(new Map());

  // --- DYNAMIC CONNECTOR LINES ---
  useEffect(() => {
    // 🛡️ Safety: Check if references exist before running
    if (loading || !contentRef.current || !svgRef.current || !matches?.length) return;

    const updateLines = () => {
      // 🛡️ Double Check: Element might have unmounted during resize
      if (!contentRef.current) return;

      const parentRect = contentRef.current.getBoundingClientRect();
      let paths = "";
      
      matches.forEach((match) => {
        const currentEl = matchRefs.current.get(match.id);
        const nextEl = matchRefs.current.get(match.next_match_id);
        
        if (currentEl && nextEl) {
          const rectA = currentEl.getBoundingClientRect();
          const rectB = nextEl.getBoundingClientRect();
          
          // Calculate connector points relative to parent
          const startX = rectA.right - parentRect.left;
          const endX = rectB.left - parentRect.left;
          const startY = (rectA.top + rectA.height / 2) - parentRect.top;
          const endY = (rectB.top + rectB.height / 2) - parentRect.top;
          const midX = startX + (endX - startX) / 2;
          
          const theme = getStatusStyles(match.status);
          
          // Draw Orthogonal Path
          paths += `<path d="M ${startX} ${startY} H ${midX} V ${endY} H ${endX}" stroke="${theme.line}" stroke-width="1.5" fill="none" stroke-opacity="0.3" />`;
        }
      });
      
      if (svgRef.current) svgRef.current.innerHTML = paths;
    };

    updateLines();
    const observer = new ResizeObserver(updateLines);
    observer.observe(contentRef.current);
    
    document.fonts.ready.then(updateLines);

    return () => observer.disconnect();
  }, [loading, matches, rounds]);

  // Loading State
  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center text-fuchsia-500 gap-4 font-mono text-xs uppercase animate-pulse tracking-[0.5em]">
       <Loader2 className="w-8 h-8 animate-spin" /> Syncing Grid...
    </div>
  );

  const sortedRounds = Object.entries(rounds || {}).sort(([a], [b]) => Number(a) - Number(b));

  if (!sortedRounds.length) return (
    <div className="p-12 text-center text-zinc-600 border border-zinc-800 border-dashed uppercase text-xs tracking-widest font-mono">
       Awaiting Seeding Protocol...
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header Info */}
      <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] border-b border-zinc-800 pb-4">
         <Zap className="w-3.5 h-3.5 text-fuchsia-500" /> {sortedRounds.length} Deployment Sectors Active
      </div>

      {/* Bracket Scroll Container */}
      <div className="relative min-w-max pb-20" ref={contentRef}>
        
        {/* SVG Layer */}
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }} />
        
        {/* Columns */}
        <div className="relative z-10 flex gap-24">
          {sortedRounds.map(([roundNum, roundMatches]) => {
            const isFinal = Number(roundNum) === sortedRounds.length;
            return (
              <div key={roundNum} className="flex flex-col gap-12">
                
                {/* Round Header */}
                <div className={`pl-3 border-l-2 ${isFinal ? 'border-emerald-500' : 'border-fuchsia-500'}`}>
                   <span className={`text-[10px] font-mono uppercase tracking-[0.4em] font-black ${isFinal ? 'text-emerald-500' : 'text-fuchsia-500'}`}>
                      {isFinal ? 'CHAMPIONSHIP' : `PHASE_${roundNum.padStart(2, '0')}`}
                   </span>
                </div>

                {/* Match Column */}
                <div className="flex flex-col justify-around gap-16 flex-grow">
                  {roundMatches.sort((a,b) => (a.slot || 0) - (b.slot || 0)).map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      onMatchClick={onMatchClick} 
                      setRef={(el) => el ? matchRefs.current.set(match.id, el) : matchRefs.current.delete(match.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Bracket;
