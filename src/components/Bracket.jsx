import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Wifi, Zap, Trophy, Users, AlertCircle, Plus, Minus, Maximize } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * ⚔️ PIXEL PALACE: BRACKET ENGINE (HYBRID MASTER)
 * -----------------------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * FEATURES:
 * 1. AUTO-LAYOUT: Recursively centers matches based on children.
 * 2. GPU ACCELERATION: Hardware-accelerated SVG paths.
 * 3. ZOOM/PAN: Integrated viewport control.
 */

// --- 🧱 SUB-COMPONENT: Match Node (The Card) ---
const MatchNode = ({ match, onClick }) => {
  const hasTeams = match.team1 || match.team2;
  const isLive = match.status === 'live';
  const isWinner = (id) => match.winner_id === id && match.status === 'completed';

  return (
    <div 
      onClick={() => onClick(match)}
      className={cn(
        "relative w-full h-full flex flex-col rounded-sm border transition-all duration-300 group cursor-pointer overflow-hidden",
        isLive ? "bg-zinc-900 border-red-500/50 shadow-[0_0_25px_rgba(220,38,38,0.3)]" : "bg-[#09090b] border-white/10 hover:border-brand/60 hover:shadow-neon",
        match.status === 'completed' && "opacity-80 hover:opacity-100 grayscale hover:grayscale-0"
      )}
    >
      {/* Live Status Bar */}
      {isLive && <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 animate-scan" />}

      {/* Header */}
      <div className="flex justify-between items-center px-3 py-1.5 border-b border-white/5 bg-black/40 text-[9px] font-mono uppercase text-zinc-500 tracking-widest">
        <span>M{match.match_position} • R{match.round_number}</span>
        {isLive && <span className="text-red-500 font-bold animate-pulse">● LIVE</span>}
      </div>

      {/* Teams */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Team 1 */}
        <div className={cn(
          "flex justify-between items-center px-3 py-1.5 transition-colors border-l-2",
          isWinner(match.team1_id) ? "bg-brand/5 border-brand text-white" : "border-transparent text-zinc-400"
        )}>
          <div className="flex items-center gap-2 overflow-hidden">
             {match.team1?.logo ? (
                <img src={match.team1.logo} alt="" className="w-4 h-4 object-contain" />
             ) : (
                <div className="w-4 h-4 rounded-sm bg-zinc-800 flex items-center justify-center"><Users size={8}/></div>
             )}
             <span className={cn("text-xs font-bold truncate w-24", !match.team1 && "text-zinc-700 italic")}>
               {match.team1?.name || 'TBD'}
             </span>
          </div>
          <span className="font-mono text-xs font-bold opacity-80">{match.team1_score ?? '-'}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-2" />

        {/* Team 2 */}
        <div className={cn(
          "flex justify-between items-center px-3 py-1.5 transition-colors border-l-2",
          isWinner(match.team2_id) ? "bg-brand/5 border-brand text-white" : "border-transparent text-zinc-400"
        )}>
          <div className="flex items-center gap-2 overflow-hidden">
             {match.team2?.logo ? (
                <img src={match.team2.logo} alt="" className="w-4 h-4 object-contain" />
             ) : (
                <div className="w-4 h-4 rounded-sm bg-zinc-800 flex items-center justify-center"><Users size={8}/></div>
             )}
             <span className={cn("text-xs font-bold truncate w-24", !match.team2 && "text-zinc-700 italic")}>
               {match.team2?.name || 'TBD'}
             </span>
          </div>
          <span className="font-mono text-xs font-bold opacity-80">{match.team2_score ?? '-'}</span>
        </div>
      </div>
    </div>
  );
};

// --- 🔍 SUB-COMPONENT: Zoomable Container ---
const ZoomableBracket = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      setScale(s => Math.min(Math.max(0.2, s + delta), 2));
    }
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setPos({ x: e.clientX - start.x, y: e.clientY - start.y });
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[#050505] cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px', transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }} 
      />

      {/* Content Layer */}
      <div 
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transformOrigin: '0 0', willChange: 'transform' }}
        className="absolute top-0 left-0 transition-transform duration-75 ease-out"
      >
        {children}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-8 flex gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-2xl z-50">
         <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white"><Plus size={16}/></button>
         <button onClick={() => setScale(s => Math.max(s - 0.2, 0.2))} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white"><Minus size={16}/></button>
         <button onClick={() => { setScale(1); setPos({x:50,y:50}); }} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white"><Maximize size={16}/></button>
      </div>
    </div>
  );
};

// --- 🌲 MAIN ENGINE ---
const CARD_WIDTH = 240;
const CARD_HEIGHT = 100;
const GAP_X = 100;
const BASE_GAP_Y = 40;

const Bracket = ({ matches = [], onMatchClick }) => {
  
  const { nodes, paths, totalWidth, totalHeight } = useMemo(() => {
    if (!matches.length) return { nodes: [], paths: [], totalWidth: 0, totalHeight: 0 };

    // 1. DATA AGGREGATION
    const rounds = {};
    matches.forEach(m => {
      const r = m.round_number || 1;
      if (!rounds[r]) rounds[r] = [];
      rounds[r].push(m);
    });

    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
    const calculatedNodes = [];
    const calculatedPaths = [];
    const positions = new Map();

    // 2. RECURSIVE POSITIONING MATH (Dubai Standard)
    roundKeys.forEach((rKey, rIndex) => {
      const roundMatches = rounds[rKey].sort((a, b) => (a.match_position || 0) - (b.match_position || 0));
      const x = rIndex * (CARD_WIDTH + GAP_X) + 100; // +100 Padding

      roundMatches.forEach((match, mIndex) => {
        let y;
        
        if (rIndex === 0) {
          // Round 1 is the baseline
          y = mIndex * (CARD_HEIGHT + BASE_GAP_Y) + 100;
        } else {
          // Centering logic based on parent nodes
          // Find the two matches from the previous round that feed into this one
          const feederIds = matches
            .filter(m => m.round_number === match.round_number - 1)
            // Logic: Match 1 & 2 -> Feed Match 1. Match 3 & 4 -> Feed Match 2.
            .sort((a, b) => a.match_position - b.match_position)
            .slice(mIndex * 2, (mIndex * 2) + 2) 
            .map(m => m.id);
          
          if (feederIds.length > 0) {
             const y1 = positions.get(feederIds[0])?.y || 0;
             const y2 = positions.get(feederIds[feederIds.length - 1])?.y || y1;
             y = (y1 + y2) / 2;
          } else {
             // Fallback for weird BYE structures
             y = (mIndex * (CARD_HEIGHT + BASE_GAP_Y) * Math.pow(2, rIndex)) + 100;
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
            height: `${CARD_HEIGHT}px`,
            willChange: 'transform'
          }
        });
      });
    });

    // 3. PATH CONNECTIVITY (SVG CONTEXT)
    matches.forEach(match => {
      // Find where this match goes next
      const nextMatch = matches.find(m => 
        m.round_number === match.round_number + 1 && 
        Math.ceil(match.match_position / 2) === m.match_position
      );

      if (!nextMatch) return;
      
      const start = positions.get(match.id);
      const end = positions.get(nextMatch.id);
      if (!start || !end) return;

      const startX = start.x + CARD_WIDTH;
      const startY = start.y + (CARD_HEIGHT / 2);
      const endX = end.x;
      const endY = end.y + (CARD_HEIGHT / 2);

      // Bezier Curvature Calculation
      const cp1x = startX + (endX - startX) * 0.5;
      const cp2x = endX - (endX - startX) * 0.5;

      calculatedPaths.push({
        id: `${match.id}_uplink`,
        d: `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`,
        isLive: match.status === 'live',
        isDone: match.status === 'completed'
      });
    });

    const totalWidth = roundKeys.length * (CARD_WIDTH + GAP_X);
    const maxY = Math.max(...Array.from(positions.values()).map(p => p.y), 0) + CARD_HEIGHT;

    return { nodes: calculatedNodes, paths: calculatedPaths, totalWidth, totalHeight: maxY };

  }, [matches]);

  // RENDER: EMPTY STATE
  if (matches.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center bg-black">
        <Zap className="w-12 h-12 text-zinc-800 mb-4" />
        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em]">Nexus Sync Active // Awaiting Bracket</span>
    </div>
  );

  return (
    <ZoomableBracket>
      <div style={{ 
        width: Math.max(totalWidth + 400, 2000), 
        height: Math.max(totalHeight + 400, 1500), 
        position: 'relative'
      }}>
        {/* SVG LINKAGE LAYER */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {paths.map(path => (
            <g key={path.id} className="transition-opacity duration-1000">
              {/* Background Path (Shadow) */}
              <path d={path.d} fill="none" stroke="#000" strokeWidth={4} opacity={0.5} />
              
              {/* Main Path */}
              <path
                d={path.d}
                fill="none"
                stroke={path.isLive ? "#c026d3" : path.isDone ? "#3f3f46" : "#27272a"}
                strokeWidth={path.isLive ? 3 : 2}
                filter={path.isLive ? "url(#glow)" : ""}
                className={cn(
                  "transition-all duration-700",
                  path.isLive ? "opacity-100" : "opacity-40"
                )}
                strokeDasharray={path.isLive ? "8, 4" : "0"}
              >
                {path.isLive && (
                  <animate 
                    attributeName="stroke-dashoffset" 
                    from="24" to="0" 
                    dur="1s" 
                    repeatCount="indefinite" 
                  />
                )}
              </path>
            </g>
          ))}
        </svg>

        {/* INTERACTIVE NODES LAYER */}
        {nodes.map(({ match, style }) => (
          <div key={match.id} style={style} className="z-10">
            <MatchNode match={match} onClick={onMatchClick} />
          </div>
        ))}
      </div>
    </ZoomableBracket>
  );
};

export default Bracket;
