import React, { useMemo } from 'react';
import { MatchNode } from './bracket/MatchNode'; // ✅ Ensure this path is correct
import { ZoomableBracket } from './bracket/ZoomableBracket'; // ✅ Ensure this path is correct
import { Zap } from 'lucide-react';

const CARD_WIDTH = 220;
const CARD_HEIGHT = 100;
const GAP_X = 80;
const BASE_GAP_Y = 40;

const Bracket = ({ matches = [], onMatchClick }) => {
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
          } else if (feeders.length === 1) {
             y = positions.get(feeders[0].id)?.y || 0;
          } else {
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
      const cp2x = endX - (endX - startX) * 0.5;

      calculatedPaths.push({
        id: `${match.id}->${match.next_match_id}`,
        d: `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`,
        status: match.status
      });
    });

    const totalWidth = roundKeys.length * (CARD_WIDTH + GAP_X);
    const maxY = Math.max(...Array.from(positions.values()).map(p => p.y)) + CARD_HEIGHT;

    return { nodes: calculatedNodes, paths: calculatedPaths, totalWidth, totalHeight: maxY };

  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center border border-zinc-800 border-dashed rounded-xl m-8">
         <span className="text-zinc-600 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Tactical Grid...</span>
      </div>
    );
  }

  // 👇 THIS IS THE KEY CHANGE: WRAPPING IN ZOOMABLEBRACKET
  return (
    <div className="w-full h-full flex flex-col">
       <div className="absolute top-4 right-6 z-10 text-[9px] text-zinc-600 font-mono pointer-events-none">
          Use CTRL + Scroll to Zoom
       </div>

       <ZoomableBracket>
          <div style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
              {paths.map(path => (
                <path
                  key={path.id}
                  d={path.d}
                  fill="none"
                  strokeWidth="2"
                  className={`transition-all duration-700 ${path.status === 'live' ? 'stroke-emerald-500 animate-pulse' : 'stroke-zinc-800'}`}
                />
              ))}
            </svg>

            {nodes.map(({ match, style }) => (
              <div key={match.id} style={style} className="z-10">
                <MatchNode match={match} onClick={onMatchClick} />
              </div>
            ))}
          </div>
       </ZoomableBracket>
    </div>
  );
};

export default Bracket;
