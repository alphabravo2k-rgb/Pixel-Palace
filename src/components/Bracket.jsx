import React, { useMemo } from 'react';
import { MatchNode } from './bracket/MatchNode';
import { ZoomableBracket } from './bracket/ZoomableBracket';
import { Loader2, Wifi, Zap } from 'lucide-react';

const CARD_WIDTH = 240;
const CARD_HEIGHT = 110;
const GAP_X = 100;
const BASE_GAP_Y = 50;

const Bracket = ({ matches = [], onMatchClick }) => {
  
  // 🧠 LAYOUT ENGINE (Memoized for Performance)
  const { nodes, paths, totalWidth, totalHeight } = useMemo(() => {
    if (!matches.length) return { nodes: [], paths: [], totalWidth: 0, totalHeight: 0 };

    // 1. Group by Round
    const rounds = {};
    matches.forEach(m => {
      const r = m.round || 1;
      if (!rounds[r]) rounds[r] = [];
      rounds[r].push(m);
    });

    // 2. Sort Matches within Rounds (Critical for Vertical Alignment)
    Object.keys(rounds).forEach(r => {
      rounds[r].sort((a, b) => (a.match_no || 0) - (b.match_no || 0));
    });

    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
    const calculatedNodes = [];
    const calculatedPaths = [];
    const positions = new Map();

    // 3. Calculate XY Positions
    roundKeys.forEach((rKey, rIndex) => {
      const roundMatches = rounds[rKey];
      const x = rIndex * (CARD_WIDTH + GAP_X);

      roundMatches.forEach((match, mIndex) => {
        let y;
        
        // Round 1: Stack vertically
        if (rIndex === 0) {
          y = mIndex * (CARD_HEIGHT + BASE_GAP_Y);
        } else {
          // Later Rounds: Center relative to "Feeders" (Previous matches)
          const feeders = matches.filter(m => m.next_match_id === match.id);
          
          if (feeders.length === 2) {
             const y1 = positions.get(feeders[0].id)?.y || 0;
             const y2 = positions.get(feeders[1].id)?.y || 0;
             y = (y1 + y2) / 2;
          } else if (feeders.length === 1) {
             y = positions.get(feeders[0].id)?.y || 0;
          } else {
             // Fallback if structure is broken
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

    // 4. Generate Connector Paths (Bezier Curves)
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
        startX, startY, endX, endY, // Store coords for "Dots"
        status: match.status,
        isCompleted: match.status === 'completed'
      });
    });

    const totalWidth = roundKeys.length * (CARD_WIDTH + GAP_X);
    const maxY = Math.max(...Array.from(positions.values()).map(p => p.y)) + CARD_HEIGHT;

    return { nodes: calculatedNodes, paths: calculatedPaths, totalWidth, totalHeight: maxY };

  }, [matches]);

  // --- RENDER ---

  if (matches.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
         <Wifi className="w-12 h-12 opacity-20 animate-pulse" />
         <span className="font-mono text-xs uppercase tracking-widest">Awaiting Bracket Data...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#050505]">
       
       {/* 🔍 ZOOM CONTROLLER */}
       <ZoomableBracket>
          <div style={{ width: totalWidth + 100, height: totalHeight + 100, position: 'relative', padding: '50px' }}>
            
            {/* 🕸️ CONNECTORS LAYER */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
              <defs>
                 <linearGradient id="gradient-live" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                 </linearGradient>
              </defs>

              {paths.map(path => {
                const isLive = path.status === 'live';
                const isDone = path.isCompleted;
                const strokeColor = isLive ? 'url(#gradient-live)' : isDone ? '#3f3f46' : '#27272a'; // Zinc-700 vs Zinc-800
                
                return (
                  <g key={path.id}>
                    {/* The Wire */}
                    <path
                      d={path.d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isLive ? 3 : 2}
                      className={`transition-all duration-700 ${isLive ? 'opacity-100' : 'opacity-60'}`}
                      strokeDasharray={isLive ? "5,5" : "0"}
                    >
                        {isLive && <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />}
                    </path>

                    {/* Circuit Dots (Start/End) */}
                    <circle cx={path.startX} cy={path.startY} r="3" fill={isLive ? "#10b981" : "#27272a"} />
                    <circle cx={path.endX} cy={path.endY} r="3" fill={isLive ? "#10b981" : "#27272a"} />
                  </g>
                );
              })}
            </svg>

            {/* 🟦 NODES LAYER */}
            {nodes.map(({ match, style }) => (
              <div key={match.id} style={style} className="z-10">
                <MatchNode match={match} onClick={onMatchClick} />
              </div>
            ))}
          </div>
       </ZoomableBracket>

       {/* Overlay Controls / Info */}
       <div className="absolute bottom-6 right-6 pointer-events-none z-20 flex gap-4">
          <div className="bg-black/80 backdrop-blur px-3 py-1 rounded border border-white/5 text-[10px] text-zinc-500 font-mono uppercase">
             CTRL + SCROLL TO ZOOM
          </div>
       </div>
    </div>
  );
};

export default Bracket;
