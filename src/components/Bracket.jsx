import React, { useRef, useEffect } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Swords, Tv, Shield, AlertTriangle, ChevronRight, Crosshair, Zap, Loader2, Trophy } from 'lucide-react';

const getStatusStyles = (status) => {
  const themes = {
    live: { label: 'OPERATIONAL', color: 'text-emerald-400', border: 'border-emerald-500/40', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.1)]', accent: 'bg-emerald-500', line: '#10b981' },
    veto: { label: 'VETO_SEQUENCE', color: 'text-orange-400', border: 'border-orange-500/40', glow: 'shadow-[0_0_15px_rgba(251,146,60,0.1)]', accent: 'bg-orange-500', line: '#f97316' },
    completed: { label: 'ARCHIVED', color: 'text-zinc-500', border: 'border-zinc-800', glow: '', accent: 'bg-zinc-700', line: '#27272a' },
    scheduled: { label: 'STANDBY', color: 'text-blue-400', border: 'border-blue-500/20', glow: '', accent: 'bg-blue-500', line: '#3f3f46' }
  };
  return themes[status] || themes.scheduled;
};

const TeamSlot = ({ name, logo, score, isWinner, isTBD }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 transition-all duration-300 ${isWinner ? 'bg-white/[0.04]' : ''}`}>
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-7 h-7 rounded-sm bg-zinc-900 flex-shrink-0 flex items-center justify-center overflow-hidden border ${isWinner ? 'border-[#ff5500]/50' : 'border-zinc-800'}`}>
        {logo ? <img src={logo} alt="" className="w-full h-full object-contain" /> : <Shield className={`w-3.5 h-3.5 ${isTBD ? 'text-zinc-800' : 'text-zinc-600'}`} />}
      </div>
      <span className={`text-[11px] font-medium uppercase tracking-tight truncate ${isTBD ? 'text-zinc-700 italic' : isWinner ? 'text-white' : 'text-zinc-500'}`}>{name || 'PENDING'}</span>
    </div>
    <div className={`font-mono font-bold text-xs w-8 text-center py-1 rounded-sm ${isWinner ? 'text-[#ff5500] bg-[#ff5500]/10' : 'text-zinc-800 bg-black/20'}`}>{score ?? '—'}</div>
  </div>
);

const MatchCard = ({ match, onMatchClick, setRef }) => {
  const theme = getStatusStyles(match.status);
  const isActionable = !!(match.team1Id && match.team2Id);
  const matchIdShort = (match.id || '').toString().split('-')[0] || 'ERR';
  const scoreParts = (match.score || '0-0').toString().split('-');

  return (
    <div 
      ref={setRef}
      className={`relative group w-64 bg-[#0b0c0f] border ${theme.border} transition-all duration-500 ${theme.glow} flex flex-col overflow-hidden shadow-2xl`}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 94% 100%, 0 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
      <div className={`px-3 py-1.5 border-b flex items-center justify-between relative z-10 bg-[#15191f]/80 backdrop-blur-sm ${theme.border}`}>
        <div className="flex items-center gap-2">
          {match.status === 'live' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          <span className={`text-[9px] font-black uppercase tracking-widest ${theme.color}`}>{theme.label}</span>
        </div>
        <span className="text-[9px] font-mono text-zinc-600 uppercase">MOD_{matchIdShort.toUpperCase()}</span>
      </div>
      <div className="flex flex-col divide-y divide-zinc-800/30 relative z-10">
        <TeamSlot name={match.team1Name} logo={match.team1Logo} score={scoreParts[0]} isWinner={match.winnerId === match.team1Id && match.status === 'completed'} isTBD={!match.team1Id} />
        <TeamSlot name={match.team2Name} logo={match.team2Logo} score={scoreParts[1]} isWinner={match.winnerId === match.team2Id && match.status === 'completed'} isTBD={!match.team2Id} />
      </div>
      <div className="mt-auto px-3 py-2 bg-black/40 border-t border-zinc-800/50 flex items-center justify-between relative z-10">
        <Tv className={`w-3.5 h-3.5 ${match.stream_url ? 'text-zinc-400' : 'text-zinc-800'}`} />
        <button 
          onClick={() => isActionable && onMatchClick(match)}
          disabled={!isActionable}
          className={`group/btn flex items-center gap-1.5 px-3 py-1 rounded-sm text-[9px] font-black tracking-tighter uppercase transition-all
            ${isActionable ? 'bg-zinc-800 text-zinc-300 hover:bg-[#ff5500]/20 hover:text-[#ff5500] cursor-pointer' : 'bg-zinc-900/50 text-zinc-700 grayscale cursor-not-allowed opacity-50'}`}
        >
          {isActionable ? 'ACCESS_INTEL' : 'LOCKED'}
          <ChevronRight className={`w-2.5 h-2.5 transition-transform ${isActionable ? 'group-hover/btn:translate-x-0.5' : ''}`} />
        </button>
      </div>
      <div className={`absolute left-0 top-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${theme.accent}`} />
    </div>
  );
};

const Bracket = ({ onMatchClick }) => {
  const { rounds, loading, error, matches } = useTournament();
  const contentRef = useRef(null);
  const svgRef = useRef(null);
  const matchRefs = useRef(new Map());

  // Dynamic SVG Line Engine
  useEffect(() => {
    if (loading || !contentRef.current || !svgRef.current || !matches) return;
    const updateLines = () => {
      if (!contentRef.current || !svgRef.current) return;
      const parentRect = contentRef.current.getBoundingClientRect();
      let paths = "";
      matches.forEach((match) => {
        const currentEl = matchRefs.current.get(match.id);
        const nextEl = matchRefs.current.get(match.next_match_id);
        if (currentEl && nextEl) {
          const rectA = currentEl.getBoundingClientRect();
          const rectB = nextEl.getBoundingClientRect();
          const startX = rectA.right - parentRect.left;
          const endX = rectB.left - parentRect.left;
          const yA = (rectA.top + rectA.height / 2) - parentRect.top;
          const yB = (rectB.top + rectB.height / 2) - parentRect.top;
          const midX = startX + (endX - startX) / 2;
          const theme = getStatusStyles(match.status);
          paths += `<path d="M ${startX} ${yA} H ${midX} V ${yB} H ${endX}" stroke="${theme.line}" stroke-width="1.5" fill="none" stroke-opacity="0.4" />`;
        }
      });
      if (svgRef.current) svgRef.current.innerHTML = paths;
    };
    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateLines));
    resizeObserver.observe(contentRef.current);
    updateLines();
    return () => resizeObserver.disconnect();
  }, [loading, matches, rounds]);

  if (loading && (!matches || matches.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-600" />
        <p className="text-xs font-bold uppercase tracking-[0.5em]">Syncing Tactical Grid...</p>
      </div>
    );
  }

  if (error) return <div className="p-12 text-center text-red-500"><AlertTriangle className="w-8 h-8 mx-auto" /><span>Error: {error}</span></div>;
  if (!loading && (!matches || matches.length === 0)) return <div className="p-12 text-center text-zinc-500"><Trophy className="w-12 h-12 mx-auto" /> No Operations Found</div>;

  const sortedRounds = Object.entries(rounds || {}).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] border-b border-zinc-800 pb-4">
         <Zap className="w-3.5 h-3.5 text-[#ff5500]" /> {sortedRounds.length} Deployment Sectors Active
      </div>
      <div className="relative min-w-max" ref={contentRef}>
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
        <div className="relative z-10 flex gap-24 pb-20 select-none">
          {sortedRounds.map(([roundNum, roundMatches]) => (
            <div key={roundNum} className="flex flex-col gap-12 min-w-max">
              <span className="text-[10px] font-mono text-[#ff5500] uppercase tracking-[0.4em] font-black border-l-2 border-[#ff5500] pl-3">PHASE_{roundNum.padStart(2, '0')}</span>
              <div className="flex flex-col justify-around flex-grow gap-16 relative">
                {roundMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onMatchClick={onMatchClick} 
                    setRef={(el) => el ? matchRefs.current.set(match.id, el) : matchRefs.current.delete(match.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bracket;
