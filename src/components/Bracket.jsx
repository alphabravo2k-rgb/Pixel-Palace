import React, { useEffect, useState, useRef } from 'react';
import { Zap } from 'lucide-react';
import { MatchNode } from './MatchNode';

export const Bracket = ({ matches = [], onMatchClick }) => {
  const containerRef = useRef(null);
  const matchRefs = useRef(new Map());
  const [connectors, setConnectors] = useState([]);
  const [groupedRounds, setGroupedRounds] = useState({});

  // 1. DATA NORMALIZATION (Safe Round Grouping)
  useEffect(() => {
    if (!matches.length) return;

    const rounds = matches.reduce((acc, match) => {
      // 🛡️ Safety: Ensure round is a valid number, default to 1. Handle 0 or nulls.
      const r = (Number.isInteger(match.round) && match.round > 0) ? match.round : 1;
      if (!acc[r]) acc[r] = [];
      acc[r].push(match);
      return acc;
    }, {});

    // Sort matches within rounds by match_no to ensure visual consistency
    Object.keys(rounds).forEach(key => {
        rounds[key].sort((a, b) => (a.match_no || a.id) - (b.match_no || b.id));
    });

    setGroupedRounds(rounds);
  }, [matches]);

  // 2. GEOMETRY ENGINE (Calculates Bezier Curves)
  const calculatePaths = () => {
    if (!containerRef.current) return;
    
    const newPaths = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    matches.forEach(match => {
      if (!match.next_match_id) return; // Final match has no outgoing line

      const sourceEl = matchRefs.current.get(match.id);
      const targetEl = matchRefs.current.get(match.next_match_id);

      if (!sourceEl || !targetEl) return;

      // Get relative coordinates
      const srcRect = sourceEl.getBoundingClientRect();
      const tgtRect = targetEl.getBoundingClientRect();

      const startX = srcRect.right - containerRect.left;
      const startY = srcRect.top + (srcRect.height / 2) - containerRect.top;
      const endX = tgtRect.left - containerRect.left;
      const endY = tgtRect.top + (tgtRect.height / 2) - containerRect.top;

      // 🎨 BEZIER LOGIC: Smooth S-Curve
      const curvature = 0.5; 
      const cp1x = startX + (endX - startX) * curvature;
      const cp1y = startY;
      const cp2x = startX + (endX - startX) * curvature;
      const cp2y = endY;

      newPaths.push({
        id: `${match.id}->${match.next_match_id}`,
        d: `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`,
        status: match.status // 'scheduled', 'live', 'completed'
      });
    });

    setConnectors(newPaths);
  };

  // 3. OBSERVER: Recalculate lines when window resizes or data changes
  useEffect(() => {
    // Debounce slightly to wait for DOM paint
    const timeout = setTimeout(calculatePaths, 50); 
    const observer = new ResizeObserver(() => requestAnimationFrame(calculatePaths));

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
        clearTimeout(timeout);
        observer.disconnect();
    };
  }, [groupedRounds]); 

  // 🛡️ REF HYGIENE: Explicitly set and delete refs
  const setRef = (id, el) => {
    if (el) matchRefs.current.set(id, el);
    else matchRefs.current.delete(id);
  };

  const sortedRoundKeys = Object.keys(groupedRounds).sort((a, b) => Number(a) - Number(b));

  if (matches.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-600 border border-zinc-800 border-dashed uppercase text-xs tracking-widest font-mono">
         Awaiting Seeding Protocol...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        
      {/* Header Stat */}
      <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] border-b border-zinc-800 pb-4 px-8">
         <Zap className="w-3.5 h-3.5 text-fuchsia-500" /> {matches.length} Combat Nodes Active
      </div>

      {/* Bracket Container */}
      <div className="relative w-full overflow-x-auto bg-[#0a0a0a] min-h-[80vh] cursor-grab active:cursor-grabbing">
        <div 
            ref={containerRef} 
            className="relative flex gap-24 p-12 min-w-max items-center justify-start"
        >
            
            {/* LAYER 1: SVG CONNECTIONS (Z-Index 0) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {connectors.map(path => (
                <path
                key={path.id}
                d={path.d}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                className={`transition-all duration-700 ease-in-out ${
                    path.status === 'live' ? 'stroke-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                    path.status === 'completed' ? 'stroke-zinc-600 opacity-60' :
                    'stroke-zinc-800'
                }`}
                />
            ))}
            </svg>

            {/* LAYER 2: MATCH NODES (Z-Index 10) */}
            {sortedRoundKeys.map((roundKey) => {
                const isFinal = Number(roundKey) === sortedRoundKeys.length;
                return (
                    <div key={roundKey} className="flex flex-col justify-around gap-16 z-10 min-w-[280px]">
                        
                        {/* Round Header */}
                        <div className={`pl-3 border-l-2 mb-4 ${isFinal ? 'border-emerald-500' : 'border-fuchsia-500'}`}>
                            <span className={`text-[10px] font-mono uppercase tracking-[0.4em] font-black ${isFinal ? 'text-emerald-500' : 'text-fuchsia-500'}`}>
                                {isFinal ? 'CHAMPIONSHIP' : `PHASE_${String(roundKey).padStart(2, '0')}`}
                            </span>
                        </div>

                        {groupedRounds[roundKey].map(match => (
                            <div 
                                key={match.id} 
                                ref={(el) => setRef(match.id, el)}
                                className="relative transition-transform hover:scale-[1.02] duration-200"
                            >
                                <MatchNode 
                                    match={match} 
                                    onClick={onMatchClick}
                                />
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
