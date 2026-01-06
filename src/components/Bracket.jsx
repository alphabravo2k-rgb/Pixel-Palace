import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield, Edit3, Save, RotateCcw, GripHorizontal, Plus, Minus, Maximize } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const CARD_HEIGHT = 82;
const GRID_SIZE = 20;

// --- SUB-COMPONENT: CONNECTION NODE ---
const NodePoint = ({ type, active }) => (
    <div className={cn(
        "w-3 h-3 rounded-full border-2 absolute top-1/2 -translate-y-1/2 z-20 transition-all bg-[#09090b]",
        type === 'input' ? "-left-1.5" : "-right-1.5",
        active ? "border-cyan-400 shadow-[0_0_8px_#22d3ee]" : "border-zinc-700"
    )} />
);

// --- SUB-COMPONENT: MATCH CARD ---
const MatchCard = ({ match, x, y, onDragStart, isEditing, onClick }) => {
    if (!match) return null;
    
    // Default safe coordinates if undefined
    const safeX = typeof x === 'number' ? x : 0;
    const safeY = typeof y === 'number' ? y : 0;

    const isLive = match.status === 'live';
    const isWinner = (id) => match.winner_id === id && match.status === 'completed';

    return (
        <div 
            style={{ 
                transform: `translate(${safeX}px, ${safeY}px)`, 
                width: CARD_WIDTH, 
                height: CARD_HEIGHT,
                position: 'absolute',
                transition: isEditing ? 'none' : 'transform 0.3s ease-out' 
            }}
            className={cn(
                "group absolute z-10 flex flex-col bg-[#09090b] border rounded-lg shadow-xl overflow-visible",
                isEditing ? "cursor-grab active:cursor-grabbing border-yellow-500/50 hover:border-yellow-500 hover:z-50" : "cursor-pointer border-zinc-800 hover:border-cyan-500/50",
                isLive && !isEditing && "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
            )}
            onMouseDown={(e) => isEditing && onDragStart(e, match.id)}
            onClick={() => !isEditing && onClick(match)}
        >
            {/* Input Node (Left) - Only if NOT Round 1 */}
            {match.round_number > 1 && <NodePoint type="input" active={match.status !== 'scheduled'} />}
            
            {/* Header */}
            <div className="flex justify-between items-center px-3 py-1 bg-zinc-900/80 border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 select-none">
                <span className="flex items-center gap-2">
                    {isEditing && <GripHorizontal size={10} />}
                    M{match.match_position} • R{match.round_number}
                </span>
                {isLive && <span className="text-red-500 font-bold animate-pulse">● LIVE</span>}
            </div>

            {/* Teams */}
            <div className="flex-1 flex flex-col justify-center relative">
                {/* Team 1 */}
                <div className={cn("flex justify-between items-center px-3 h-6 transition-colors", isWinner(match.team1_id) ? "text-cyan-400" : "text-zinc-400")}>
                    <span className="text-xs font-bold truncate w-32">{match.team1?.name || 'Waiting...'}</span>
                    <span className="text-xs font-mono">{match.team1_score}</span>
                </div>
                {/* Team 2 */}
                <div className={cn("flex justify-between items-center px-3 h-6 transition-colors", isWinner(match.team2_id) ? "text-cyan-400" : "text-zinc-400")}>
                    <span className="text-xs font-bold truncate w-32">{match.team2?.name || 'Waiting...'}</span>
                    <span className="text-xs font-mono">{match.team2_score}</span>
                </div>
            </div>

            {/* Output Node (Right) - Only if not finals/3rd place */}
            {!match.is_third_place && <NodePoint type="output" active={match.status === 'completed'} />}
        </div>
    );
};

// --- MAIN COMPONENT ---
const Bracket = ({ matches = [], onMatchClick }) => {
    const [positions, setPositions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    
    // Zoom/Pan State
    const [scale, setScale] = useState(1);
    const [viewPos, setViewPos] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Node Dragging State
    const draggingNodeRef = useRef(null);
    const nodeOffsetRef = useRef({ x: 0, y: 0 });

    // 1. Initialize Layout (CRITICAL FIX: Ensure this runs)
    useEffect(() => {
        if (!matches || matches.length === 0) return;
        
        // If we already have positions for these matches, don't reset
        if (Object.keys(positions).length === matches.length) return;

        const newPos = {};
        
        // Group by Round to calculate Y offsets
        const rounds = {};
        matches.forEach(m => {
            const r = m.is_third_place ? 99 : m.round_number;
            if(!rounds[r]) rounds[r] = [];
            rounds[r].push(m);
        });

        // Generate coordinates
        matches.forEach(m => {
            const r = m.is_third_place ? 5 : m.round_number; 
            
            // X: Round 1 starts at 100, spaced by 350px
            const x = (r * 350) - 250; 
            
            // Y: Calculate based on position in round to center it
            // Logic: Round 1 matches are tight (100px gap). Round 2 are spread (200px gap), etc.
            const spread = Math.pow(2, r-1) * 100;
            const yOffset = (m.match_position - 1) * spread + (r * 50);
            
            // Special handling for 3rd place
            if (m.is_third_place) {
                newPos[m.id] = { x: 1200, y: 800 };
            } else {
                newPos[m.id] = { x, y: yOffset };
            }
        });
        
        setPositions(newPos);
    }, [matches]);

    // 2. Drag Logic
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
            const x = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
            const y = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
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

    // 3. Render Wires
    const renderWires = () => {
        return matches.map(match => {
            let nextMatchId = match.next_match_id;
            
            // Fallback Logic
            if (!nextMatchId && !match.is_third_place) {
                const nextRound = match.round_number + 1;
                const nextPos = Math.ceil(match.match_position / 2);
                const next = matches.find(m => m.round_number === nextRound && m.match_position === nextPos);
                if (next) nextMatchId = next.id;
            }

            if (!nextMatchId || !positions[match.id] || !positions[nextMatchId]) return null;

            const start = positions[match.id];
            const end = positions[nextMatchId];

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
                        strokeWidth="4"
                        className="opacity-20 blur-[2px]"
                    />
                    <path 
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={isCompleted ? "#22d3ee" : "#3f3f46"} 
                        strokeWidth="2"
                        className="transition-colors duration-500"
                        strokeDasharray={isCompleted ? "0" : "5,5"} 
                    />
                </g>
            );
        });
    };

    if (!matches || matches.length === 0) return <div className="p-20 text-center text-zinc-600">Loading Bracket Data...</div>;

    // Calculate Dynamic Canvas Size based on node positions
    const maxX = Math.max(...Object.values(positions).map(p => p.x), 0) + CARD_WIDTH + 500;
    const maxY = Math.max(...Object.values(positions).map(p => p.y), 0) + CARD_HEIGHT + 500;

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative">
            
            {/* TOOLBAR */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                {isEditing ? (
                    <button 
                        onClick={() => { setIsEditing(false); console.log("Saving Positions:", positions); }} 
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase text-xs rounded shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse"
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

            {/* ZOOM CONTROLS */}
            <div className="absolute bottom-8 left-8 z-50 flex gap-2">
                <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white"><Plus size={16}/></button>
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.4))} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white"><Minus size={16}/></button>
                <button onClick={() => { setScale(1); setViewPos({x:0,y:0}); }} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white"><Maximize size={16}/></button>
            </div>

            {/* INFINITE CANVAS */}
            <div 
                className={cn("flex-1 overflow-hidden relative", isEditing ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleGlobalMouseMove}
                onMouseUp={handleGlobalMouseUp}
                onMouseLeave={handleGlobalMouseUp}
                style={{ 
                    backgroundImage: 'radial-gradient(#1f1f22 1px, transparent 1px)', 
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${viewPos.x}px ${viewPos.y}px`
                }} 
            >
                <div 
                    style={{ 
                        transform: `translate(${viewPos.x}px, ${viewPos.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        width: Math.max(maxX, 2000), 
                        height: Math.max(maxY, 1500),
                        position: 'absolute',
                        top: 0, left: 0
                    }}
                >
                    {/* Wires Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                        {renderWires()}
                    </svg>

                    {/* Nodes Layer */}
                    {matches.map(match => {
                        const pos = positions[match.id];
                        if (!pos) return null;
                        return (
                            <MatchCard 
                                key={match.id}
                                match={match}
                                x={pos.x}
                                y={pos.y}
                                onDragStart={handleNodeMouseDown}
                                isEditing={isEditing}
                                onClick={onMatchClick}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Bracket;
