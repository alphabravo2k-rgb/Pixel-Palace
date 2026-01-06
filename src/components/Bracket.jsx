import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield, Edit3, Save, GripHorizontal, Plus, Minus, Maximize, AlertCircle } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const CARD_HEIGHT = 82;
const COL_SPACING = 320; 
const ROW_SPACING = 120; 

// --- 1. ROBUST LAYOUT ALGORITHM ---
const calculateDefaultLayout = (matches) => {
    if (!matches || matches.length === 0) return {};

    const positions = {};
    
    // Group matches by Round (Force numbers)
    const rounds = {};
    matches.forEach(m => {
        const r = m.is_third_place ? 99 : Number(m.round_number);
        if (!rounds[r]) rounds[r] = [];
        rounds[r].push(m);
    });

    const roundKeys = Object.keys(rounds).sort((a,b) => Number(a) - Number(b));

    // --- POSITION ROUND 1 ---
    const round1 = rounds[1] || [];
    round1.sort((a,b) => Number(a.match_position) - Number(b.match_position));
    
    round1.forEach((m) => {
        const pos = Number(m.match_position);
        positions[m.id] = {
            x: 0,
            y: (pos - 1) * ROW_SPACING
        };
    });

    // --- POSITION LATER ROUNDS ---
    roundKeys.forEach(rKey => {
        const r = Number(rKey);
        if (r === 1 || r === 99) return; 

        const currentRoundMatches = rounds[r] || [];
        currentRoundMatches.sort((a,b) => Number(a.match_position) - Number(b.match_position));

        currentRoundMatches.forEach(m => {
            const x = (r - 1) * COL_SPACING;
            const pos = Number(m.match_position);
            
            // Binary Tree Math: Center relative to previous round
            const power = Math.pow(2, r - 1);
            const gridY = ((pos - 1) * power) + (power / 2) - 0.5;
            const y = gridY * ROW_SPACING;

            positions[m.id] = { x, y };
        });
    });

    // --- POSITION 3RD PLACE ---
    const thirdPlace = rounds[99]?.[0];
    if (thirdPlace) {
        const lastRoundNum = roundKeys.length > 1 ? Number(roundKeys[roundKeys.length - 2]) : 1;
        positions[thirdPlace.id] = {
            x: lastRoundNum * COL_SPACING, 
            y: (round1.length * ROW_SPACING) + 150
        };
    }

    return positions;
};

// --- NODE DOT ---
const NodePoint = ({ type, active }) => (
    <div className={cn(
        "w-3 h-3 rounded-full border-2 absolute top-1/2 -translate-y-1/2 z-20 bg-[#09090b] transition-all",
        type === 'input' ? "-left-1.5" : "-right-1.5",
        active ? "border-cyan-400 shadow-[0_0_8px_#22d3ee] bg-cyan-900" : "border-zinc-700"
    )} />
);

// --- MATCH CARD ---
const MatchCard = ({ match, x, y, onDragStart, isEditing, onClick }) => {
    // Safety Fallback: If X/Y are NaN, default to 0 to ensure visibility
    const safeX = isNaN(x) ? 0 : x;
    const safeY = isNaN(y) ? 0 : y;

    const isLive = match.status === 'live';
    const isWinner = (id) => match.winner_id === id && match.status === 'completed';

    return (
        <div 
            style={{ 
                transform: `translate(${safeX}px, ${safeY}px)`, 
                width: CARD_WIDTH, 
                height: CARD_HEIGHT,
                position: 'absolute',
                transition: isEditing ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
            }}
            className={cn(
                "group absolute z-10 flex flex-col bg-[#09090b] border rounded-lg shadow-xl overflow-visible",
                isEditing ? "cursor-grab active:cursor-grabbing border-yellow-500/50 hover:border-yellow-500 z-50" : "cursor-pointer border-zinc-800 hover:border-cyan-500/50 hover:z-20",
                isLive && !isEditing && "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            )}
            onMouseDown={(e) => isEditing && onDragStart(e, match.id)}
            onClick={() => !isEditing && onClick(match)}
        >
            {Number(match.round_number) > 1 && <NodePoint type="input" active={match.status !== 'scheduled'} />}
            
            <div className="flex justify-between items-center px-3 py-1 bg-zinc-900/80 border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 select-none">
                <span className="flex items-center gap-2">
                    {isEditing && <GripHorizontal size={10} className="text-yellow-500"/>}
                    {match.is_third_place ? "3RD PLACE" : `M${match.match_position} • R${match.round_number}`}
                </span>
                {isLive && <span className="text-red-500 font-bold animate-pulse">● LIVE</span>}
            </div>

            <div className="flex-1 flex flex-col justify-center relative">
                <div className={cn("flex justify-between items-center px-3 h-6 transition-colors", isWinner(match.team1_id) ? "text-cyan-400" : "text-zinc-400")}>
                    <span className="text-xs font-bold truncate w-32">{match.team1?.name || 'TBD'}</span>
                    <span className="text-xs font-mono">{match.team1_score}</span>
                </div>
                <div className={cn("flex justify-between items-center px-3 h-6 transition-colors", isWinner(match.team2_id) ? "text-cyan-400" : "text-zinc-400")}>
                    <span className="text-xs font-bold truncate w-32">{match.team2?.name || 'TBD'}</span>
                    <span className="text-xs font-mono">{match.team2_score}</span>
                </div>
            </div>

            {!match.is_third_place && <NodePoint type="output" active={match.status === 'completed'} />}
        </div>
    );
};

// --- MAIN BRACKET COMPONENT ---
const Bracket = ({ matches = [], onMatchClick }) => {
    // Initialize State (with safety check)
    const [positions, setPositions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    
    // Zoom/Pan
    const [scale, setScale] = useState(1);
    const [viewPos, setViewPos] = useState({ x: 50, y: 50 }); 
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const draggingNodeRef = useRef(null);
    const nodeOffsetRef = useRef({ x: 0, y: 0 });

    // RECALCULATE ON LOAD
    useEffect(() => {
        if (!matches || matches.length === 0) return;
        
        // Force calculation on mount or change
        const newPositions = calculateDefaultLayout(matches);
        setPositions(newPositions);
    }, [matches]); // Dependency on matches ensures update when data arrives

    // --- INTERACTION HANDLERS ---
    const handleNodeMouseDown = (e, id) => {
        if (!isEditing) return;
        e.stopPropagation(); 
        const pos = positions[id] || { x: 0, y: 0 };
        draggingNodeRef.current = id;
        nodeOffsetRef.current = {
            x: (e.clientX - viewPos.x) / scale - pos.x,
            y: (e.clientY - viewPos.y) / scale - pos.y
        };
    };

    const handleCanvasMouseDown = (e) => {
        if (isEditing) return; 
        setIsPanning(true);
        setDragStart({ x: e.clientX - viewPos.x, y: e.clientY - viewPos.y });
    };

    const handleGlobalMouseMove = (e) => {
        if (draggingNodeRef.current && isEditing) {
            const id = draggingNodeRef.current;
            const rawX = (e.clientX - viewPos.x) / scale - nodeOffsetRef.current.x;
            const rawY = (e.clientY - viewPos.y) / scale - nodeOffsetRef.current.y;
            const x = Math.round(rawX / 20) * 20;
            const y = Math.round(rawY / 20) * 20;
            setPositions(prev => ({ ...prev, [id]: { x, y } }));
            return;
        }
        if (isPanning) {
            setViewPos({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleGlobalMouseUp = () => {
        draggingNodeRef.current = null;
        setIsPanning(false);
    };

    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.001;
            const newScale = Math.min(Math.max(0.2, scale + delta), 2);
            setScale(newScale);
        }
    };

    // --- RENDER WIRES ---
    const renderWires = () => {
        if(!positions || Object.keys(positions).length === 0) return null;

        return matches.map(match => {
            let nextMatchId = match.next_match_id;
            
            // Auto Link Logic (Safe Number Parsing)
            if (!nextMatchId && !match.is_third_place) {
                const r = Number(match.round_number);
                const pos = Number(match.match_position);
                const nextRound = r + 1;
                const nextPos = Math.ceil(pos / 2);
                
                const next = matches.find(m => Number(m.round_number) === nextRound && Number(m.match_position) === nextPos);
                if (next) nextMatchId = next.id;
            }

            if (!nextMatchId && match.loser_next_match_id) {
                nextMatchId = match.loser_next_match_id;
            }

            // Ensure both start and end positions exist
            const start = positions[match.id];
            const end = positions[nextMatchId];

            if (!start || !end) return null;

            const x1 = start.x + CARD_WIDTH; 
            const y1 = start.y + (CARD_HEIGHT / 2); 
            const x2 = end.x; 
            const y2 = end.y + (CARD_HEIGHT / 2); 
            const midX = (x1 + x2) / 2;

            const isCompleted = match.status === 'completed';

            return (
                <g key={`${match.id}-${nextMatchId}`}>
                    <path 
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={isCompleted ? "#22d3ee" : "transparent"}
                        strokeWidth="6"
                        className="opacity-10 blur-[4px]"
                    />
                    <path 
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={isCompleted ? "#22d3ee" : "#3f3f46"} 
                        strokeWidth="2"
                        strokeDasharray={isCompleted ? "0" : "5,5"} 
                        className="transition-colors duration-500"
                    />
                </g>
            );
        });
    };

    // --- RENDER ---
    // Calculate canvas size to ensure scrolling works
    const allX = Object.values(positions).map(p => p.x);
    const allY = Object.values(positions).map(p => p.y);
    const maxX = allX.length ? Math.max(...allX) + CARD_WIDTH + 500 : 2000;
    const maxY = allY.length ? Math.max(...allY) + CARD_HEIGHT + 500 : 1500;

    if (!matches || matches.length === 0) return (
        <div className="h-full flex items-center justify-center text-zinc-500 font-mono flex-col gap-4">
            <Trophy className="w-16 h-16 opacity-20"/>
            <span>Initializing...</span>
        </div>
    );

    return (
        <div 
            className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative cursor-grab active:cursor-grabbing selection:bg-transparent"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleGlobalMouseMove}
            onMouseUp={handleGlobalMouseUp}
            onMouseLeave={handleGlobalMouseUp}
            onWheel={handleWheel}
        >
            {/* TOOLBAR */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                {isEditing ? (
                    <button 
                        onClick={() => { setIsEditing(false); console.log("Positions:", positions); }} 
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase text-xs rounded shadow-lg animate-pulse"
                    >
                        <Save size={14} /> Save Layout
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 rounded text-xs font-bold uppercase transition-all"
                    >
                        <Edit3 size={14} /> Edit Layout
                    </button>
                )}
            </div>

            {/* ZOOM */}
            <div className="absolute bottom-8 left-8 z-50 flex gap-2 bg-black/50 p-1 rounded-lg backdrop-blur-md border border-white/5">
                <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 hover:bg-white/10 rounded text-white"><Plus size={16}/></button>
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.2))} className="p-2 hover:bg-white/10 rounded text-white"><Minus size={16}/></button>
                <button onClick={() => { setScale(1); setViewPos({x:50,y:50}); }} className="p-2 hover:bg-white/10 rounded text-white"><Maximize size={16}/></button>
            </div>

            {/* CANVAS */}
            <div 
                style={{ 
                    transform: `translate(${viewPos.x}px, ${viewPos.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    width: maxX, 
                    height: maxY,
                    position: 'absolute',
                    top: 0, left: 0
                }}
            >
                <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    {renderWires()}
                </svg>

                {matches.map(match => (
                    <MatchCard 
                        key={match.id}
                        match={match}
                        x={positions[match.id]?.x}
                        y={positions[match.id]?.y}
                        onDragStart={handleNodeMouseDown}
                        isEditing={isEditing}
                        onClick={onMatchClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default Bracket;
