import React, { useMemo } from 'react';
import { MatchNode } from './bracket/MatchNode';
import { ZoomableBracket } from './bracket/ZoomableBracket';
import { Wifi, Trophy } from 'lucide-react';

const CARD_WIDTH = 240;
const CARD_HEIGHT = 110;
const GAP_X = 100;
const BASE_GAP_Y = 50;

const Bracket = ({ matches = [], onMatchClick }) => {
  
  const { nodes, paths, totalWidth, totalHeight } = useMemo(() => {
    if (!matches.length) return { nodes: [], paths: [], totalWidth: 0, totalHeight: 0 };

    // 1. Group by Round
    const rounds = {};
    matches.forEach(m => {
      const r = m.round_number || 1;
      if (!rounds[r]) rounds[r] = [];
      rounds[r].push(m);
    });

    // 2. Sort Matches by Position (Critical for Tree Layout)
    Object.keys(rounds).forEach(r => {
      rounds[r].sort((a, b) => (a.match_position || 0) - (b.match_position || 0));
    });

    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
    const calculatedNodes = [];
    const calculatedPaths = [];
    const positions = new Map(); // Store (x,y) by Match ID

    // 3. Calculate XY Positions (Recursive Tree Layout)
    roundKeys.forEach((rKey, rIndex) => {
      const roundMatches = rounds[rKey];
      const x = rIndex * (CARD_WIDTH + GAP_X);

      roundMatches.forEach((match, mIndex) => {
        let y;
        
        if (rIndex === 0) {
          // Round 1: Simple linear stacking
          y = mIndex * (CARD_HEIGHT + BASE_GAP_Y);
        } else {
          // Subsequent Rounds: Center between feeders
          // Logic: Match 1 in Round 2 is fed by Match 1 & 2 in Round 1
          const expectedFeederPos1 = (match.match_position * 2) - 1;
          const expectedFeederPos2 = (match.match_position * 2);

          const feeder1 = matches.find(m => m.round_number === match.round_number - 1 && m.match_position === expectedFeederPos1);
          const feeder2 = matches.find(m => m.round_number === match.round_number - 1 && m.match_position === expectedFeederPos2);
          
          if (feeder1 && feeder2) {
             const y1 = positions.get(feeder1.id)?.y || 0;
             const y2 = positions.get(feeder2.id)?.y || 0;
             y = (y1 + y2) / 2;
          } else {
             // Fallback if bracket is sparse (e.g. Byes)
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

    // 4. Generate Connector Paths
    matches.forEach(match => {
      // Logic: Match 1 in Round 1 feeds into Match 1 in Round 2
      const nextRound = match.round_number + 1;
      const nextPos = Math.ceil(match.match_position / 2);

      const nextMatch = matches.find(m => m.round_number === nextRound && m.match_position === nextPos);

      if (!nextMatch) return;
      
      const start = positions.get(match.id);
      const end = positions.get(nextMatch.id);
      
      if (!start || !end) return;

      const startX = start.x + CARD_WIDTH;
      const startY = start.y + (CARD_HEIGHT / 2);
      const endX = end.x;
      const endY = end.y + (CARD_HEIGHT / 2);

      // Bezier Curve Logic
      const cp1x = startX + (endX - startX) * 0.5;
      const cp2x = endX - (endX - startX) * 0.5;

      calculatedPaths.push({
        id: `${match.id}->${nextMatch.id}`,
        d: `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`,
        startX, startY, endX, endY,
        status: match.status,
        // Path is "active" if match is live or completed
        isActive: ['live', 'completed'].includes(match.status)
      });
    });

    const totalW = roundKeys.length * (CARD_WIDTH + GAP_X);
    const maxY = Math.max(...Array.from(positions.values()).map(p => p.y), 0) + CARD_HEIGHT;

    return { nodes: calculatedNodes, paths: calculatedPaths, totalWidth: totalW, totalHeight: maxY };

  }, [matches]);

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
       <ZoomableBracket>
          <div style={{ width: totalWidth + 400, height: totalHeight + 400, position: 'relative', padding: '100px' }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
              <defs>
                 <linearGradient id="gradient-live" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                 </linearGradient>
              </defs>

              {paths.map(path => {
                const isLive = path.status === 'live';
                const isDone = path.status === 'completed';
                const strokeColor = isLive ? 'url(#gradient-live)' : isDone ? '#52525b' : '#27272a';
                
                return (
                  <g key={path.id}>
                    <path
                      d={path.d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isLive ? 3 : 2}
                      className={`transition-all duration-700 ${isLive ? 'opacity-100' : 'opacity-40'}`}
                      strokeDasharray={isLive ? "5,5" : "0"}
                    >
                        {isLive && <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />}
                    </path>
                    <circle cx={path.startX} cy={path.startY} r="3" fill={isLive ? "#10b981" : "#27272a"} />
                    <circle cx={path.endX} cy={path.endY} r="3" fill={isLive ? "#10b981" : "#27272a"} />
                  </g>
                );
              })}
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
