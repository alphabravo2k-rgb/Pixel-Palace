import React, { useRef, useEffect, useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { MatchNode } from './MatchNode';

// --- HELPER: Styles for Lines ---
const getStatusLineColor = (status) => {
  if (status === 'live') return '#10b981';
  if (status === 'veto') return '#d946ef';
  if (status === 'completed') return '#3f3f46';
  return '#27272a';
};

export const Bracket = ({ matches, onMatchClick }) => {
  const contentRef = useRef(null);
  const svgRef = useRef(null);
  const matchRefs = useRef(new Map());
  const [lines, setLines] = useState("");

  // 1. Group Matches by Round (The Visual Columns)
  const rounds = matches.reduce((acc, match) => {
    const r = match.round || 1;
    if (!acc[r]) acc[r] = [];
    acc[r].push(match);
    return acc;
  }, {});
  
  const sortedRounds = Object.entries(rounds).sort(([a], [b]) => Number(a) - Number(b));

  // 2. Draw Connector Lines (The Advanced UI)
  useEffect(() => {
    if (!contentRef.current || !matches.length) return;

    const draw = () => {
      const parentRect = contentRef.current.getBoundingClientRect();
      let newPaths = "";
      
      matches.forEach((match) => {
        if (!match.next_match_id) return;

        const currentEl = matchRefs.current.get(match.id);
        const nextEl = matchRefs.current.get(match.next_match_id);
        
        if (currentEl && nextEl) {
          const rectA = currentEl.getBoundingClientRect();
          const rectB = nextEl.getBoundingClientRect();
          
          // Coords relative to container
          const startX = rectA.right - parentRect.left;
          const endX = rectB.left - parentRect.left;
          const startY = (rectA.top + rectA.height / 2) - parentRect.top;
          const endY = (rectB.top + rectB.height / 2) - parentRect.top;
          const midX = startX + (endX - startX) / 2;
          
          const color = getStatusLineColor(match.status);
          
          newPaths += `<path d="M ${startX} ${startY} H ${midX} V ${endY} H ${endX}" stroke="${color}" stroke-width="1.5" fill="none" stroke-opacity="0.4" />`;
        }
      });
      setLines(newPaths);
    };

    draw();
    // Re-draw on resize
    const observer = new ResizeObserver(draw);
    observer.observe(contentRef.current);
    // Re-draw when fonts load (layout shift fix)
    document.fonts.ready.then(draw);

    return () => observer.disconnect();
  }, [matches, sortedRounds.length]); // Re-run if matches change

  if (matches.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-600 border border-zinc-800 border-dashed uppercase text-xs tracking-widest font-mono">
         Awaiting Seeding Protocol...
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header Info */}
      <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] border-b border-zinc-800 pb-4 px-8">
         <Zap className="w-3.5 h-3.5 text-fuchsia-500" /> {sortedRounds.length} Deployment Sectors Active
      </div>

      {/* Bracket Scroll Container */}
      <div className="relative min-w-max pb-20 pl-8 pr-8" ref={contentRef}>
        
        {/* SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }} dangerouslySetInnerHTML={{ __html: lines }} />
        
        {/* Columns */}
        <div className="relative z-10 flex gap-24">
          {sortedRounds.map(([roundNum, roundMatches]) => {
            const isFinal = Number(roundNum) === sortedRounds.length;
            return (
              <div key={roundNum} className="flex flex-col gap-12 min-w-[300px]">
                
                {/* Round Header */}
                <div className={`pl-3 border-l-2 ${isFinal ? 'border-emerald-500' : 'border-fuchsia-500'}`}>
                   <span className={`text-[10px] font-mono uppercase tracking-[0.4em] font-black ${isFinal ? 'text-emerald-500' : 'text-fuchsia-500'}`}>
                      {isFinal ? 'CHAMPIONSHIP' : `PHASE_${roundNum.padStart(2, '0')}`}
                   </span>
                </div>

                {/* Match Column */}
                <div className="flex flex-col justify-around gap-16 flex-grow">
                  {roundMatches.sort((a,b) => (a.match_no || 0) - (b.match_no || 0)).map((match) => (
                    <MatchNode 
                      key={match.id} 
                      match={match} 
                      onClick={onMatchClick} 
                      setRef={(el) => {
                        if (el) matchRefs.current.set(match.id, el);
                        else matchRefs.current.delete(match.id);
                      }}
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
