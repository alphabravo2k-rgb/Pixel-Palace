import React, { useState, useRef, useMemo, useEffect } from 'react'; // ✅ Added useEffect
import { cn } from '../lib/utils';
import { Trophy, Shield, Edit3, Save, GripHorizontal, Plus, Minus, Maximize } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const CARD_HEIGHT = 82;
const COL_SPACING = 300; // Gap between rounds
const ROW_SPACING = 110; // Vertical gap between matches

// --- 1. LAYOUT ALGORITHM (The Brain) ---
// Calculates X/Y for every match to create a perfect tree structure
const calculateDefaultLayout = (matches) => {
    if (!matches || matches.length === 0) return {};

    const positions = {};
    
    // Group by Round
    const rounds = {};
    matches.forEach(m => {
        const r = m.is_third_place ? 99 : m.round_number;
        if (!rounds[r]) rounds[r] = [];
        rounds[r].push(m);
    });

    // Sort rounds (1, 2, 3... 99)
    const roundKeys = Object.keys(rounds).sort((a,b) => Number(a) - Number(b));

    // --- STEP 1: POSITION ROUND 1 (The Anchors) ---
    // We place Round 1 matches in a simple vertical stack
    const round1 = rounds[1] || [];
    round1.sort((a,b) => a.match_position - b.match_position);
    
    round1.forEach((m) => {
        // We use 'match_position' to determine Y. 
        // Note: For a 32-team bracket, slots are 1..16.
        // We multiply by ROW_SPACING to stack them.
        positions[m.id] = {
            x: 0,
            y: (m.match_position - 1) * ROW_SPACING
        };
    });

    // --- STEP 2: POSITION FUTURE ROUNDS (Recursive Averaging) ---
    // Round 2 matches are centered relative to their Round 1 feeders
    roundKeys.forEach(rKey => {
        const r = Number(rKey);
        if (r === 1) return; // Skip R1
        if (r === 99) return; // Skip 3rd place for now

        const currentRoundMatches = rounds[r] || [];
        currentRoundMatches.sort((a,b) => a.match_position - b.match_position);

        currentRoundMatches.forEach(m => {
            const x = (r - 1) * COL_SPACING;
            
            // Expected Logic: Match N in Round R is fed by (2N-1) and (2N) from Round R-1
            // Formula for center of slot N in Round R:
            const power = Math.pow(2, r - 1);
            const offset = (power / 2) - 0.5;
            const step = power;
            
            // Visual Y calculation
            const yGrid = ((m.match_position - 1) * step) + offset;
            const y = yGrid * ROW_SPACING;

            positions[m.id] = { x, y };
        });
    });

    // --- STEP 3: POSITION 3RD PLACE ---
    const thirdPlace = rounds[99]?.[0];
    if (thirdPlace) {
        // Place it deep to the right and bottom
        const lastRound = roundKeys[roundKeys.length - 2] || 1; // Exclude 99
        positions[thirdPlace.id] = {
            x: (Number(lastRound)) * COL_SPACING, 
            y: (round1.length * ROW_SPACING) + 100
        };
    }

    return positions;
};

// --- SUB-COMPONENT: NODE DOTS ---
const NodePoint = ({ type, active }) => (
    <div className={cn(
        "w-3 h-3 rounded-full border-2 absolute top-1/2 -translate-y-1/2 z-20 bg-[#09090b] transition-all",
        type === 'input' ? "-left-1.5" : "-right-1.5",
        active ? "border-cyan-400 shadow-[0_0_8px_#22d3ee] bg-cyan-900" : "border-zinc-700"
    )} />
);

// --- SUB-COMPONENT: MATCH CARD ---
const MatchCard = ({ match, x, y, onDragStart, isEditing, onClick }) => {
    const isLive = match.status === 'live';
    const isWinner = (id) => match.winner_id === id && match.status === 'completed';

    return (
        <div 
            style={{ 
                transform: `translate(${x}px, ${y}px)`, 
                width: CARD_WIDTH, 
                height: CARD_HEIGHT,
                position: 'absolute',
                // Smooth movement when NOT dragging, instant when dragging
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
            {/* Input Node (Not for Round 1) */}
            {match.round_number > 1 && <NodePoint type="input" active={match.status !== 'scheduled'} />}
            
            {/* Header */}
            <div className="flex justify-between items-center px-3 py-1 bg-zinc-900/80 border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 select-none">
                <span className="flex items-center gap-2">
                    {isEditing && <GripHorizontal size={10} className="text-yellow-500"/>}
                    {match.is_third_place ? "3RD PLACE" : `M${match.match_position} • R${match.round_number}`}
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

            {/* Output Node (Not for Finals/3rd) */}
            {!match.is_third_place && <NodePoint type="output" active={match.status === 'completed'} />}
        </div>
    );
};

// --- MAIN COMPONENT ---
const Bracket = ({ matches = [], onMatchClick }) => {
    // Initialize State with Default Layout immediately
    const [positions, setPositions] = useState(() => calculateDefaultLayout(matches));
    const [isEditing, setIsEditing] = useState(false);
    
    // Zoom/Pan State
    const [scale, setScale] = useState(1);
    const [viewPos, setViewPos] = useState({ x: 100, y: 100 }); 
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Node Dragging Refs
    const draggingNodeRef = useRef(null);
    const nodeOffsetRef = useRef({ x: 0, y: 0 });

    // Update positions if matches change dramatically (e.g. regen bracket)
    useEffect(() => {
        if (!matches.length) return;
        const currentIds = Object.keys(positions);
        const newIds = matches.map(m => m.id);
        
        // Simple check: If count differs or first ID differs, re-calculate
        if (currentIds.length !== newIds.length || currentIds[0] !== newIds[0]) {
            setPositions(calculateDefaultLayout(matches));
        }
    }, [matches]);

    // --- HANDLERS ---

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
        // 1. Node Dragging
        if (draggingNodeRef.current && isEditing) {
            const id = draggingNodeRef.current;
            const rawX = (e.clientX - viewPos.x) / scale - nodeOffsetRef.current.x;
            const rawY = (e.clientY - viewPos.y) / scale - nodeOffsetRef.current.y;
            
            // Snap to 20px Grid
            const x = Math.round(rawX / 20) * 20;
            const y = Math.round(rawY / 20) * 20;

            setPositions(prev => ({ ...prev, [id]: { x, y } }));
            return;
        }

        // 2. Canvas Panning
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
        return matches.map(match => {
            let nextMatchId = match.next_match_id;
            
            // Heuristic Linker if DB is missing next_match_id
            if (!nextMatchId && !match.is_third_place) {
                const nextRound = match.round_number + 1;
                const nextPos = Math.ceil(match.match_position / 2);
                const next = matches.find(m => m.round_number === nextRound && m.match_position === nextPos);
                if (next) nextMatchId = next.id;
            }

            // Also check for Loser's Bracket (3rd place) link
            if (!nextMatchId && match.loser_next_match_id) {
                nextMatchId = match.loser_next_match_id;
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
                    {/* Glow Effect */}
                    <path 
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={isCompleted ? "#22d3ee" : "transparent"}
                        strokeWidth="6"
                        className="opacity-10 blur-[4px]"
                    />
                    {/* Wire */}
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

    if (!matches || matches.length === 0) return (
        <div className="h-full flex items-center justify-center text-zinc-500 font-mono flex-col gap-4">
            <Trophy className="w-16 h-16 opacity-20"/>
            <span>Initializing Battle Grid...</span>
        </div>
    );

    // Calculate dynamic canvas bounds
    const allX = Object.values(positions).map(p => p.x);
    const allY = Object.values(positions).map(p => p.y);
    const maxX = Math.max(...allX, 0) + CARD_WIDTH + 500;
    const maxY = Math.max(...allY, 0) + CARD_HEIGHT + 500;

    return (
        <div 
            className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative cursor-grab active:cursor-grabbing selection:bg-transparent"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleGlobalMouseMove}
            onMouseUp={handleGlobalMouseUp}
            onMouseLeave={handleGlobalMouseUp}
            onWheel={handleWheel}
        >
            {/* --- CONTROLS --- */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                {isEditing ? (
                    <button 
                        onClick={() => { setIsEditing(false); console.log("Positions Saved:", positions); }} 
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase text-xs rounded shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse"
                    >
                        <Save size={14} /> Save Layout
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 rounded text-xs font-bold uppercase transition-all backdrop-blur-md"
                    >
                        <Edit3 size={14} /> Edit Layout
                    </button>
                )}
            </div>

            <div className="absolute bottom-8 left-8 z-50 flex gap-2 bg-black/50 p-1 rounded-lg backdrop-blur-md border border-white/5">
                <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Plus size={16}/></button>
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.2))} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Minus size={16}/></button>
                <button onClick={() => { setScale(1); setViewPos({x:100,y:100}); }} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Maximize size={16}/></button>
            </div>

            {/* --- INFINITE CANVAS --- */}
            <div 
                style={{ 
                    transform: `translate(${viewPos.x}px, ${viewPos.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    width: Math.max(maxX, 2000), 
                    height: Math.max(maxY, 1500),
                    position: 'absolute',
                    top: 0, 
                    left: 0
                }}
            >
                {/* 1. Grid Background Layer */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{ 
                        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* 2. Wires Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    {renderWires()}
                </svg>

                {/* 3. Nodes Layer */}
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
    );
};

export default Bracket;
