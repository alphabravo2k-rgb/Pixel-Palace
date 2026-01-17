/**
 * ⚔️ PIXEL PALACE: BRACKET ENGINE (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // GPU-ACCELERATED
 */

import React, { useMemo, useState } from 'react';
import { Wifi, Zap, Trophy, Users, AlertCircle, Plus, Minus, Maximize, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

// --- 🧱 SUB-COMPONENT: Match Node (The Card) ---
const MatchNode = ({ match, onClick }) => {
  const isLive = match.status === 'live';
  const isWinner = (id) => match.winner_id === id && match.status === 'completed';

  return (
    <motion.div 
      layout
      onClick={() => onClick(match)}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full h-full flex flex-col rounded-sm border transition-all duration-300 group cursor-pointer overflow-hidden",
        isLive ? "bg-zinc-900 border-fuchsia-500 shadow-[0_0_30px_rgba(192,38,211,0.2)]" : "bg-[#09090b] border-white/10 hover:border-fuchsia-500/60 shadow-2xl",
        match.status === 'completed' && "opacity-80 grayscale-[0.5] hover:grayscale-0"
      )}
    >
      {/* Live Status Animation */}
      {isLive && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-fuchsia-500 overflow-hidden">
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
          />
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-white/5 bg-black/40 text-[8px] font-mono uppercase text-zinc-500 tracking-[0.2em]">
        <span className="flex items-center gap-1.5">
          <Target size={10} className={cn(isLive ? "text-fuchsia-500 animate-pulse" : "text-zinc-800")} />
          NODE_{match.match_position}
        </span>
        {isLive ? <span className="text-fuchsia-500 font-black animate-pulse">STATUS: ENGAGED</span> : <span>R{match.round_number}</span>}
      </div>

      {/* Team Engagement Area */}
      <div className="flex-1 flex flex-col justify-center divide-y divide-white/5">
        {[
          { id: match.team1_id, data: match.team1, score: match.team1_score },
          { id: match.team2_id, data: match.team2, score: match.team2_score }
        ].map((team, idx) => (
          <div key={idx} className={cn(
            "flex justify-between items-center px-3 py-2.5 transition-colors border-l-2",
            isWinner(team.id) ? "bg-fuchsia-500/5 border-fuchsia-500" : "border-transparent"
          )}>
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-6 h-6 rounded-sm bg-black border border-white/5 flex items-center justify-center p-1">
                  {team.data?.logo ? <img src={team.data.logo} alt="" className="w-full h-full object-contain" /> : <Users size={10} className="text-zinc-800" />}
               </div>
               <span className={cn(
                 "text-[10px] font-black uppercase italic tracking-tighter truncate w-28 transition-colors",
                 isWinner(team.id) ? "text-white" : team.data ? "text-zinc-400" : "text-zinc-800"
               )}>
                 {team.data?.name || 'Awaiting Unit'}
               </span>
            </div>
            <span className={cn("font-mono text-xs font-bold", isWinner(team.id) ? "text-fuchsia-500" : "text-zinc-600")}>
              {team.score ?? '--'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// --- 🔍 SUB-COMPONENT: Zoomable Container ---
const ZoomableBracket = ({ children }) => {
  const [scale, setScale] = useState(0.85);
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[#050505] cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* GRID CALIBRATION */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
          backgroundSize: '100px 100px', 
          transform: `translate(${pos.x % 100}px, ${pos.y % 100}px)` 
        }} 
      />

      <motion.div 
        animate={{ x: pos.x, y: pos.y, scale }}
        transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.5 }}
        style={{ transformOrigin: '0 0' }}
        className="absolute top-0 left-0"
      >
        {children}
      </motion.div>

      {/* COMMAND INTERFACE */}
      <div className="absolute bottom-10 left-10 flex gap-3 bg-zinc-900/80 backdrop-blur-xl p-2 rounded-sm border border-white/5 shadow-2xl z-50">
          <button onClick={() => setScale(s => Math.min(s + 0.15, 2))} className="p-2.5 hover:bg-white/5 rounded-sm text-zinc-500 hover:text-fuchsia-500 transition-all"><Plus size={18}/></button>
          <button onClick={() => setScale(s => Math.max(s - 0.15, 0.3))} className="p-2.5 hover:bg-white/5 rounded-sm text-zinc-500 hover:text-fuchsia-500 transition-all"><Minus size={18}/></button>
          <div className="w-px bg-white/5 my-1" />
          <button onClick={() => { setScale(0.85); setPos({x:100,y:100}); }} className="p-2.5 hover:bg-white/5 rounded-sm text-zinc-500 hover:text-white transition-all"><Maximize size={18}/></button>
      </div>
    </div>
  );
};

// --- 🌲 MAIN ENGINE ---
const CARD_WIDTH = 260;
const CARD_HEIGHT = 110;
const GAP_X = 140;
const BASE_GAP_Y = 50;

export const Bracket = ({ matches = [], onMatchClick }) => {
  const { nodes, paths, totalWidth, totalHeight } = useMemo(() => {
    if (!matches.length) return { nodes: [], paths: [], totalWidth: 0, totalHeight: 0 };

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

    // 1. RECURSIVE POSITIONING
    roundKeys.forEach((rKey, rIndex) => {
      const roundMatches = rounds[rKey].sort((a, b) => (a.match_position || 0) - (b.match_position || 0));
      const x = rIndex * (CARD_WIDTH + GAP_X);

      roundMatches.forEach((match, mIndex) => {
        let y;
        if (rIndex === 0) {
          y = mIndex * (CARD_HEIGHT + BASE_GAP_Y);
        } else {
          // Find parents in previous round
          const prevRound = rounds[roundKeys[rIndex - 1]];
          const parent1 = prevRound.find(p => p.match_position === (match.match_position * 2) - 1);
          const parent2 = prevRound.find(p => p.match_position === (match.match_position * 2));
          
          const y1 = positions.get(parent1?.id)?.y || 0;
          const y2 = positions.get(parent2?.id)?.y || y1 + (CARD_HEIGHT + BASE_GAP_Y);
          y = (y1 + y2) / 2;
        }

        positions.set(match.id, { x, y });
        calculatedNodes.push({ match, x, y });
      });
    });

    // 2. PATH CONNECTIVITY
    matches.forEach(match => {
      const nextMatch = matches.find(m => 
        m.round_number === match.round_number + 1 && 
        Math.ceil(match.match_position / 2) === m.match_position
      );

      if (!nextMatch) return;
      const start = positions.get(match.id);
      const end = positions.get(nextMatch.id);

      const startX = start.x + CARD_WIDTH;
      const startY = start.y + (CARD_HEIGHT / 2);
      const endX = end.x;
      const endY = end.y + (CARD_HEIGHT / 2);

      calculatedPaths.push({
        id: `${match.id}_uplink`,
        d: `M ${startX} ${startY} C ${startX + (GAP_X/2)} ${startY}, ${endX - (GAP_X/2)} ${endY}, ${endX} ${endY}`,
        isLive: match.status === 'live'
      });
    });

    return { 
      nodes: calculatedNodes, 
      paths: calculatedPaths, 
      totalWidth: roundKeys.length * (CARD_WIDTH + GAP_X),
      totalHeight: Math.max(...Array.from(positions.values()).map(p => p.y)) + CARD_HEIGHT
    };
  }, [matches]);

  if (!matches.length) return (
    <div className="h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
        <Zap className="w-16 h-16 text-zinc-900 mb-6" />
        <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[1em] animate-pulse">Protocol Offline // Standby</span>
    </div>
  );

  return (
    <ZoomableBracket>
      <div style={{ width: totalWidth + 400, height: totalHeight + 400, position: 'relative' }}>
        
        {/* SVG LINKAGE LAYER */}
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <filter id="bracketGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {paths.map(path => (
            <g key={path.id}>
              <path d={path.d} fill="none" stroke="#ffffff03" strokeWidth={6} />
              <path
                d={path.d}
                fill="none"
                stroke={path.isLive ? "#c026d3" : "#ffffff08"}
                strokeWidth={path.isLive ? 2.5 : 1.5}
                filter={path.isLive ? "url(#bracketGlow)" : ""}
                className="transition-all duration-1000"
                strokeDasharray={path.isLive ? "10, 5" : "0"}
              >
                {path.isLive && (
                  <animate attributeName="stroke-dashoffset" from="30" to="0" dur="2s" repeatCount="indefinite" />
                )}
              </path>
            </g>
          ))}
        </svg>

        {nodes.map(({ match, x, y }) => (
          <div key={match.id} style={{ position: 'absolute', left: x, top: y, width: CARD_WIDTH, height: CARD_HEIGHT }}>
            <MatchNode match={match} onClick={onMatchClick} />
          </div>
        ))}
      </div>
    </ZoomableBracket>
  );
};

export default Bracket;
