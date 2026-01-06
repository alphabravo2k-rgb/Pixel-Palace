import React, { useRef, useState, useMemo, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield, Minus, Plus, Maximize } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 240;
const CARD_HEIGHT = 80;
const GAP_X = 120; // Horizontal space between rounds
const GAP_Y = 20;  // Vertical space between matches in Round 1

// --- 1. ZOOM & PAN CONTAINER ---
const ZoomContainer = ({ children, width, height }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Wheel Zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newScale = Math.min(Math.max(.2, scale + delta), 2);
      setScale(newScale);
    } else {
        // Optional: Pan on scroll if not zooming
        // setPosition(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  // Drag / Pan Logic
  const handleMouseDown = (e) => {
    setPanning(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!panning) return;
    e.preventDefault();
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => {
    setPanning(false);
    if(containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  return (
    <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-[#050505] relative cursor-grab select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
    >
        {/* Controls */}
        <div className="absolute bottom-8 left-8 z-50 flex gap-2">
            <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white"><Plus size={16}/></button>
            <button onClick={() => setScale(s => Math.max(s - 0.2, 0.2))} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white"><Minus size={16}/></button>
            <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white"><Maximize size={16}/></button>
        </div>

        <div 
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                width: width,
                height: height,
                transition: panning ? 'none' : 'transform 0.1s ease-out'
            }}
            className="absolute top-10 left-10" // Initial padding
        >
            {children}
        </div>
    </div>
  );
};

// --- 2. MATCH NODE CARD ---
const MatchCard = ({ match, x, y, onClick }) => {
    if (!match) return null; // Should not happen with ghost logic

    // Check if Bye (Completed in Round 1 with NO opponent)
    const isBye = match.round_number === 1 && match.status === 'completed' && !match.team2_id;
    
    // Ghost Mode: If it's a bye, we hide the card but keep the space
    if (isBye) return null;

    const isWinner = (id) => match.winner_id === id && match.status === 'completed';
    const isLoser = (id) => match.winner_id && match.winner_id !== id && match.status === 'completed';

    const TeamRow = ({ team, score, teamId, isTop }) => (
        <div className={cn(
            "flex justify-between items-center px-3 py-1.5 h-10 transition-colors",
            isTop ? "border-b border-zinc-800/50" : "",
            isWinner(teamId) ? "bg-emerald-950/30 text-emerald-400" : "",
            isLoser(teamId) ? "opacity-50" : ""
        )}>
            <div className="flex items-center gap-2 overflow-hidden w-full">
                {team?.logo_url ? <img src={team.logo_url} className="w-4 h-4 object-contain"/> : <Shield size={12} className={cn(isWinner(teamId) ? "text-emerald-500" : "text-zinc-700")}/>}
                <span className={cn("text-xs font-bold truncate", isLoser(teamId) && "line-through decoration-zinc-700")}>
                    {team?.name || 'TBD'}
                </span>
            </div>
            <span className={cn("text-xs font-mono ml-2", isWinner(teamId) ? "text-emerald-500" : "text-zinc-500")}>{score ?? '-'}</span>
        </div>
    );

    return (
        <div 
            onClick={() => onClick(match)}
            style={{ left: x, top: y, width: CARD_WIDTH, height: CARD_HEIGHT }}
            className={cn(
                "absolute border rounded flex flex-col overflow-hidden transition-all bg-[#09090b] shadow-xl z-10 group hover:scale-105",
                match.status === 'live' ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "border-zinc-800 hover:border-zinc-500"
            )}
        >
            <div className="flex justify-between px-2 py-0.5 bg-zinc-900/80 border-b border-zinc-800 text-[8px] font-mono uppercase tracking-wider text-zinc-500">
                <span>M{match.match_position} • R{match.round_number}</span>
                {match.status === 'live' && <span className="text-red-500 animate-pulse">● LIVE</span>}
            </div>
            <TeamRow team={match.team1} score={match.team1_score} teamId={match.team1_id} isTop={true} />
            <TeamRow team={match.team2} score={match.team2_score} teamId={match.team2_id} isTop={false} />
        </div>
    );
};

// --- 3. LAYOUT ENGINE ---
const Bracket = ({ matches = [], onMatchClick }) => {
  const { nodes, paths, bounds } = useMemo(() => {
    if (!matches.length) return { nodes: [], paths: [], bounds: { w: 0, h: 0 } };

    // A. Group by Round
    const rounds = {};
    let maxRound = 0;
    
    matches.forEach(m => {
        if(m.is_third_place) return; // Handle separately
        if(!rounds[m.round_number]) rounds[m.round_number] = [];
        rounds[m.round_number].push(m);
        maxRound = Math.max(maxRound, m.round_number);
    });

    // B. Calculate Positions (The "Tree Math")
    const posMap = new Map(); // Store {x, y} by match ID
    const nodes = [];
    
    // We assume the bracket is a perfect binary tree based on Round 1 size
    // We calculate Y positions for Round 1 first
    const round1Matches = rounds[1].sort((a,b) => a.match_position - b.match_position);
    
    // Calculate Y for every Round 1 match (even if it doesn't exist in DB, conceptually)
    round1Matches.forEach((m, idx) => {
        const x = 0;
        const y = idx * (CARD_HEIGHT + GAP_Y);
        posMap.set(m.id, { x, y });
        nodes.push({ match: m, x, y });
    });

    // Calculate Subsequent Rounds (Iterative Average)
    for (let r = 2; r <= maxRound; r++) {
        const roundMatches = rounds[r].sort((a,b) => a.match_position - b.match_position);
        
        roundMatches.forEach(m => {
            const x = (r - 1) * (CARD_WIDTH + GAP_X);
            
            // Find parents (Round r-1)
            // Logic: Match P in Round R is fed by Matches (2P-1) and (2P) in Round R-1
            const parentPos1 = (m.match_position * 2) - 1;
            const parentPos2 = (m.match_position * 2);
            
            const p1 = matches.find(pm => pm.round_number === r - 1 && pm.match_position === parentPos1);
            const p2 = matches.find(pm => pm.round_number === r - 1 && pm.match_position === parentPos2);

            let y = 0;
            if (p1 && p2 && posMap.has(p1.id) && posMap.has(p2.id)) {
                // Perfect alignment: Average of parents
                y = (posMap.get(p1.id).y + posMap.get(p2.id).y) / 2;
            } else if (p1 && posMap.has(p1.id)) {
                // Only one parent found (weird edge case, maybe bye transition)
                y = posMap.get(p1.id).y; 
            } else {
                // Fallback (shouldn't happen in perfect tree)
                y = (m.match_position - 1) * (CARD_HEIGHT + GAP_Y) * Math.pow(2, r-1);
            }

            posMap.set(m.id, { x, y });
            nodes.push({ match: m, x, y });
        });
    }

    // C. Generate Connections (SVG Paths)
    const paths = [];
    matches.forEach(m => {
        if(m.is_third_place) return;
        const nextRound = m.round_number + 1;
        const nextPos = Math.ceil(m.match_position / 2);
        const nextMatch = matches.find(nm => nm.round_number === nextRound && nm.match_position === nextPos);

        if (nextMatch && posMap.has(m.id) && posMap.has(nextMatch.id)) {
            const start = posMap.get(m.id);
            const end = posMap.get(nextMatch.id);

            // Coords
            const x1 = start.x + CARD_WIDTH;
            const y1 = start.y + CARD_HEIGHT / 2;
            const x2 = end.x;
            const y2 = end.y + CARD_HEIGHT / 2;

            // Control Points for Bezier
            const c1x = x1 + (x2 - x1) / 2;
            const c2x = x2 - (x2 - x1) / 2;

            paths.push({
                id: `${m.id}-${nextMatch.id}`,
                d: `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`,
                active: m.status === 'completed' || m.status === 'live'
            });
        }
    });

    const maxY = Math.max(...nodes.map(n => n.y)) + CARD_HEIGHT;
    const maxX = maxRound * (CARD_WIDTH + GAP_X);

    return { nodes, paths, bounds: { w: maxX, h: maxY } };
  }, [matches]);

  return (
    <ZoomContainer width={nodes.length > 0 ? nodes[nodes.length-1].x + 500 : '100%'} height={nodes.length > 0 ? nodes[0].y + 1000 : '100%'}>
        <div style={{ width: bounds.w + 200, height: bounds.h + 200, position: 'relative' }}>
            
            {/* SVG Layer for Lines */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#27272a" />
                        <stop offset="100%" stopColor="#52525b" />
                    </linearGradient>
                    <linearGradient id="gradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
                {paths.map(p => (
                    <path 
                        key={p.id} 
                        d={p.d} 
                        stroke={p.active ? "url(#gradActive)" : "#27272a"} 
                        strokeWidth={2} 
                        fill="none" 
                        className="transition-all duration-500"
                    />
                ))}
            </svg>

            {/* Match Nodes */}
            {nodes.map(node => (
                <MatchCard 
                    key={node.match.id} 
                    match={node.match} 
                    x={node.x} 
                    y={node.y} 
                    onClick={onMatchClick} 
                />
            ))}
        </div>
    </ZoomContainer>
  );
};

export default Bracket;
