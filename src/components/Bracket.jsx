import React, { useMemo } from 'react';
import { MatchNode } from './MatchNode'; // ✅ Dependency
import { Zap } from 'lucide-react'; // ✅ Dependency

// 🎨 LAYOUT CONSTANTS (Fixed "Undefined" Error)
const CARD_WIDTH = 220;
const CARD_HEIGHT = 100;
const GAP_X = 80;
const BASE_GAP_Y = 40;

export const Bracket = ({ matches = [], onMatchClick }) => {
  const { nodes, paths, totalWidth, totalHeight } = useMemo(() => {
    if (!matches.length) return { nodes: [], paths: [], totalWidth: 0, totalHeight: 0 };

    const rounds = {};
    matches.forEach(m => {
      const r = m.round || 1;
      if (!rounds[r]) rounds[r] = [];
      rounds[r].push(m);
    });

    Object.keys(rounds).forEach(r => {
      rounds[r].sort((a, b) => (a.match_no || 0) - (b.match_no || 0));
    });

    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
    const calculatedNodes = [];
    const calculatedPaths = [];
    const positions = new Map();

    roundKeys.forEach((rKey, rIndex) => {
      const roundMatches = rounds[rKey];
      const x = rIndex * (CARD_WIDTH + GAP_X);

      roundMatches.forEach((match, mIndex) => {
        let y;
        if (rIndex === 0) {
          y = mIndex * (CARD_HEIGHT + BASE_GAP_Y);
        } else {
          const feeders = matches.filter(m => m.next_match_id === match.id);
          if (feeders.length === 2) {
             const y1 = positions.get(feeders[0].id)?.y || 0;
             const y2 = positions.get(feeders[1].id)?.y || 0;
             y = (y1 + y2) / 2;
          } else {
             // Fallback if bracket data is partial
             y = mIndex * (CARD_HEIGHT + BASE_GAP_Y) * Math.pow(2, rIndex); 
          }
        }

        positions.set(match.id, { x, y });

        calculatedNodes.push({
          match,
          style: {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`
          }
        });
      });
    });

    matches.forEach(match => {
      if (!match.next_match_id) return;
      const start = positions.get(match.id);
      const end = positions.get(match.next_match_id);
      if (!start || !end) return;

      const startX = start.x + CARD_WIDTH;
      const startY = start.y + (CARD_HEIGHT / 2);
      const endX = end.x;
      const endY = end.y + (CARD_HEIGHT / 2);

      const cp1x = startX + (endX - startX) * 0.5;
      const cp1y = startY;
      const cp2x = startX + (endX - startX) * 0.5;
      const cp2y = endY;

      calculatedPaths.push({
        id: `${match.id}->${match.next_match_id}`,
        d: `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`,
        status: match.status
      });
    });

    const totalWidth = roundKeys.length * (CARD_WIDTH + GAP_X);
    const maxY = Math.max(...Array.from(positions.values()).map(p => p.y)) + CARD_HEIGHT;

    return { nodes: calculatedNodes, paths: calculatedPaths, totalWidth, totalHeight: maxY };

  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-600 border border-zinc-800 border-dashed uppercase text-xs tracking-widest font-mono">
         Waiting for Bracket Generation...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] border-b border-zinc-800 pb-4 px-8">
         <Zap className="w-3.5 h-3.5 text-fuchsia-500" /> {matches.length} Combat Nodes Active
       </div>

       <div className="relative w-full overflow-auto bg-[#0a0a0a] min-h-[80vh] cursor-grab active:cursor-grabbing custom-scrollbar">
         <div style={{ width: totalWidth + 100, height: totalHeight + 100, position: 'relative', padding: '50px' }}>
           <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
             {paths.map(path => (
               <path
                 key={path.id}
                 d={path.d}
                 fill="none"
                 strokeWidth="2"
                 strokeLinecap="round"
                 className={`transition-all duration-700 ${path.status === 'live' ? 'stroke-emerald-500 animate-pulse' : path.status === 'completed' ? 'stroke-zinc-700' : 'stroke-zinc-800'}`}
               />
             ))}
           </svg>

           {nodes.map(({ match, style }) => (
             <div key={match.id} style={style} className="z-10">
               <MatchNode match={match} onClick={onMatchClick} />
             </div>
           ))}
         </div>
       </div>
    </div>
  );
};
