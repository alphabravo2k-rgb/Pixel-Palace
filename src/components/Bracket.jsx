import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Swords, Tv, Shield, AlertTriangle, ChevronRight, Map, Zap, X, Activity, Target, Info } from 'lucide-react';

// --- TACTICAL THEMES ---

const getStatusStyles = (status) => {
  const themes = {
    live: {
      label: 'OPERATIONAL',
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.1)]',
      accent: 'bg-emerald-500',
      line: '#10b981'
    },
    veto: {
      label: 'VETO_SEQUENCE',
      color: 'text-orange-400',
      border: 'border-orange-500/40',
      glow: 'shadow-[0_0_15px_rgba(251,146,60,0.1)]',
      accent: 'bg-orange-500',
      line: '#f97316'
    },
    completed: {
      label: 'ARCHIVED',
      color: 'text-zinc-500',
      border: 'border-zinc-800',
      glow: '',
      accent: 'bg-zinc-700',
      line: '#27272a'
    },
    scheduled: {
      label: 'STANDBY',
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      glow: '',
      accent: 'bg-blue-500',
      line: '#3f3f46'
    }
  };
  return themes[status] || themes.scheduled;
};

// --- SUB-COMPONENTS ---

const IntelModal = ({ match, onClose }) => {
  if (!match) return null;
  const theme = getStatusStyles(match.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-2xl bg-[#0b0c0f] border border-zinc-800 shadow-2xl overflow-hidden"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#15191f]/50">
          <div className="flex items-center gap-4">
            <Activity className={`w-5 h-5 ${theme.color}`} />
            <div>
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">
                TACTICAL_INTEL // {match.id?.split('-')[0] || 'ERR_ID'}
              </h3>
              <p className={`text-[10px] font-mono uppercase tracking-widest ${theme.color}`}>{theme.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 text-center space-y-4">
               <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-sm shadow-inner">
                 {match.team1Logo ? <img src={match.team1Logo} className="w-16 h-16 object-contain" /> : <Shield className="w-10 h-10 text-zinc-800" />}
               </div>
               <p className="text-sm font-black text-white uppercase tracking-widest">{match.team1Name || 'PENDING'}</p>
            </div>

            <div className="flex flex-col items-center gap-4">
               <span className="text-5xl font-mono font-black text-[#ff5500] italic tracking-tighter">
                 {match.score || '0 - 0'}
               </span>
               <div className="px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">VS</div>
            </div>

            <div className="flex-1 text-center space-y-4">
               <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-sm shadow-inner">
                 {match.team2Logo ? <img src={match.team2Logo} className="w-16 h-16 object-contain" /> : <Shield className="w-10 h-10 text-zinc-800" />}
               </div>
               <p className="text-sm font-black text-white uppercase tracking-widest">{match.team2Name || 'PENDING'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#15191f] p-4 border border-zinc-800 rounded-sm">
                <p className="text-[9px] font-mono text-zinc-500 uppercase mb-2 tracking-[0.2em]">Operational Field</p>
                <div className="flex items-center gap-3 text-white">
                   <Map className="w-4 h-4 text-[#ff5500]" />
                   <span className="text-xs font-bold uppercase">{match.vetoState?.pickedMap || 'Awaiting Veto'}</span>
                </div>
             </div>
             <div className="bg-[#15191f] p-4 border border-zinc-800 rounded-sm">
                <p className="text-[9px] font-mono text-zinc-500 uppercase mb-2 tracking-[0.2em]">Live Data</p>
                <div className="flex items-center gap-3 text-white">
                   <Tv className="w-4 h-4 text-blue-400" />
                   <span className="text-xs font-bold uppercase">{match.stream_url ? 'LINK_ACTIVE' : 'SIGNAL_LOST'}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex justify-end">
           <button onClick={onClose} className="px-8 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all">
             TERMINATE_LINK
           </button>
        </div>
      </div>
    </div>
  );
};

const TeamSlot = ({ name, logo, score, isWinner, isTBD }) => (
  <div className={`flex items-center justify-between px-3 py-2 transition-all duration-300 ${isWinner ? 'bg-white/[0.04]' : ''}`}>
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-7 h-7 rounded-sm bg-zinc-900 flex-shrink-0 flex items-center justify-center overflow-hidden border ${isWinner ? 'border-[#ff5500]/50 shadow-[0_0_10px_rgba(255,85,0,0.1)]' : 'border-zinc-800'}`}>
        {logo ? <img src={logo} className="w-full h-full object-contain" /> : <Shield className={`w-3.5 h-3.5 ${isTBD ? 'text-zinc-800' : 'text-zinc-600'}`} />}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-tight truncate ${isTBD ? 'text-zinc-700 italic' : isWinner ? 'text-white' : 'text-zinc-500'}`}>
        {name || 'PENDING'}
      </span>
    </div>
    <div className={`font-mono font-black text-xs w-7 text-center ${isWinner ? 'text-[#ff5500]' : 'text-zinc-800'}`}>
      {score ?? '—'}
    </div>
  </div>
);

const MatchCard = ({ match, onOpenIntel, setRef }) => {
  const theme = getStatusStyles(match.status);
  const isActionable = !!(match.team1Id && match.team2Id);

  return (
    <div 
      ref={setRef}
      className={`relative group w-64 bg-[#0b0c0f] border ${theme.border} transition-all duration-500 ${theme.glow} flex flex-col overflow-hidden shadow-2xl`}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 94% 100%, 0 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

      <div className={`px-3 py-1.5 border-b flex items-center justify-between bg-[#15191f]/80 ${theme.border}`}>
        <div className="flex items-center gap-2">
          {match.status === 'live' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          <span className={`text-[8px] font-black uppercase tracking-widest ${theme.color}`}>{theme.label}</span>
        </div>
        <span className="text-[8px] font-mono text-zinc-600">ID_{match.id?.split('-')[0].toUpperCase()}</span>
      </div>

      <div className="flex flex-col divide-y divide-zinc-800/30">
        <TeamSlot name={match.team1Name} logo={match.team1Logo} score={match.score?.split('-')[0]} isWinner={match.winnerId === match.team1Id && match.status === 'completed'} isTBD={!match.team1Id} />
        <TeamSlot name={match.team2Name} logo={match.team2Logo} score={match.score?.split('-')[1]} isWinner={match.winnerId === match.team2Id && match.status === 'completed'} isTBD={!match.team2Id} />
      </div>

      <div className="mt-auto px-3 py-2 bg-black/40 border-t border-zinc-800/50 flex items-center justify-between">
        <Tv className={`w-3.5 h-3.5 ${match.stream_url ? 'text-zinc-400' : 'text-zinc-800'}`} />
        <button 
          onClick={() => isActionable && onOpenIntel(match)}
          disabled={!isActionable}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-[8px] font-black tracking-tighter uppercase transition-all
            ${isActionable ? 'bg-zinc-800 text-zinc-300 hover:bg-[#ff5500]/20 hover:text-[#ff5500] cursor-pointer' : 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed grayscale'}`}
        >
          {isActionable ? 'ACCESS_INTEL' : 'LOCKED'}
          <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>
      <div className={`absolute left-0 top-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${theme.accent}`} />
    </div>
  );
};

// --- MAIN PAGE ---

const Brackets = () => {
  const { rounds, loading, error, matches } = useTournament();
  const [activeIntel, setActiveIntel] = useState(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const svgRef = useRef(null);
  const matchRefs = useRef(new Map());

  // --- DYNAMIC LINE CALCULATION ---
  useEffect(() => {
    if (loading || !contentRef.current || !svgRef.current) return;

    const updateLines = () => {
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
          
          paths += `
            <path 
              d="M ${startX} ${yA} H ${midX} V ${yB} H ${endX}" 
              stroke="${theme.line}" 
              stroke-width="1.5" 
              fill="none" 
              stroke-opacity="0.4"
            />
          `;
        }
      });

      if (svgRef.current) svgRef.current.innerHTML = paths;
    };

    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateLines));
    resizeObserver.observe(contentRef.current);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    updateLines();
    return () => resizeObserver.disconnect();
  }, [loading, matches, rounds]);

  if (loading) return <div className="h-96 flex items-center justify-center text-zinc-500 font-mono text-xs uppercase animate-pulse">Syncing Tactical Grid...</div>;
  if (error) return <div className="p-12 text-center text-red-500 font-mono text-xs uppercase flex flex-col items-center gap-3 border border-red-900/20"><AlertTriangle className="w-8 h-8" /><span>Encryption_Error: {error}</span></div>;

  const sortedRounds = Object.entries(rounds || {}).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-12 p-4 md:p-10 animate-in fade-in duration-1000 bg-[#0b0c0f]" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-800 pb-8 relative z-10">
          <div className="space-y-2">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">TACTICAL <span className="text-[#ff5500]">BRACKETS</span></h2>
              <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
                <Target className="w-3.5 h-3.5 text-[#ff5500]" /> {sortedRounds.length} Phase Operations Active
              </div>
          </div>
          <div className="px-4 py-2 bg-zinc-900/40 border border-zinc-800 rounded-sm flex items-center gap-3 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Link: Online</span>
          </div>
      </div>

      {/* Bracket Tree Wrapper */}
      <div className="relative min-w-max" ref={contentRef}>
        {/* Dynamic SVG Layer */}
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        <div className="relative z-10 flex gap-24 pb-20 no-scrollbar select-none">
          {sortedRounds.map(([roundNum, roundMatches], roundIdx) => (
            <div key={roundNum} className="flex flex-col gap-12 min-w-max">
              <div className="relative flex flex-col gap-1 pl-4 border-l-2 border-[#ff5500]/50">
                <span className="text-[10px] font-mono text-[#ff5500] uppercase tracking-[0.4em] font-black">PHASE_{roundNum.padStart(2, '0')}</span>
                <span className="text-sm font-black text-white uppercase italic tracking-tighter opacity-80">
                  {Number(roundNum) === sortedRounds.length ? 'Final Conflict' : `Elimination Tier`}
                </span>
              </div>

              <div className="flex flex-col justify-around flex-grow gap-16">
                {roundMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onOpenIntel={(m) => setActiveIntel(m)} 
                    setRef={(el) => {
                      if (el) matchRefs.current.set(match.id, el);
                      else matchRefs.current.delete(match.id);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="flex flex-wrap gap-10 border-t border-zinc-800 pt-10 opacity-50 relative z-10">
        <div className="flex items-center gap-3"><div className="w-3.5 h-3.5 bg-[#ff5500]" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }} /><span className="text-[10px] font-mono text-white uppercase tracking-widest font-black">Active Front</span></div>
        <div className="flex items-center gap-3"><div className="w-3.5 h-3.5 bg-blue-500" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }} /><span className="text-[10px] font-mono text-white uppercase tracking-widest font-black">Reserve Support</span></div>
        <div className="ml-auto flex items-center gap-2 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]"><Info className="w-3 h-3" /> Build_Alpha_v2.5.2 // Tactical_Environment</div>
      </div>

      {activeIntel && <IntelModal match={activeIntel} onClose={() => setActiveIntel(null)} />}
    </div>
  );
};

export default Brackets;
