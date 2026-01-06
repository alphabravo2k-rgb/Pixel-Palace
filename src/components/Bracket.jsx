import React, { useState, useRef, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield, Edit3, Save, GripHorizontal, Plus, Minus, Maximize } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const CARD_HEIGHT = 82;
const COL_SPACING = 300; 
const ROW_SPACING = 120;

// --- SUB-COMPONENT: CONNECTION NODE ---
const NodePoint = ({ type, active }) => (
    <div className={cn(
        "w-3 h-3 rounded-full border-2 absolute top-1/2 -translate-y-1/2 z-20 bg-[#09090b] transition-all",
        type === 'input' ? "-left-1.5" : "-right-1.5",
        active ? "border-cyan-400 shadow-[0_0_8px_#22d3ee] bg-cyan-900" : "border-zinc-700"
    )} />
);

// --- SUB-COMPONENT: MATCH CARD ---
const MatchCard = ({ match, x, y, onDragStart, isEditing, onClick }) => {
    // FORCE RENDER: Even if x/y are weird, default to 0,0 so we see it exists
    const finalX = isNaN(x) ? 0 : x;
    const finalY = isNaN(y) ? 0 : y;

    const isLive = match.status === 'live';
    const isWinner = (id) => match.winner_id === id && match.status === 'completed';

    return (
        <div 
            style={{ 
                transform: `translate(${finalX}px, ${finalY}px)`, 
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
            {/* Input Node (Not for Round 1) */}
            {Number(match.round_number) > 1 && <NodePoint type="input" active={match.status !== 'scheduled'} />}
            
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
                    <span className="text-xs font-bold truncate w-32">{match.team1?.name || 'TBD'}</span>
                    <span className="text-xs font-mono">{match.team1_score}</span>
                </div>
                {/* Team 2 */}
                <div className={cn("flex justify-between items-center px-3 h-6 transition-colors", isWinner(match.team2_id) ? "text-cyan-400" : "text-zinc-400")}>
                    <span className="text-xs font-bold truncate w-32">{match.team2?.name || 'TBD'}</span>
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
    // 1. EDIT STATE (Manual Overrides)
    const [manualPositions, setManualPositions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    
    // Zoom/Pan
    const [scale, setScale] = useState(1);
    const [viewPos, setViewPos] = useState({ x: 50, y: 50 }); 
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const draggingNodeRef = useRef(null);
    const nodeOffsetRef = useRef({ x: 0, y: 0 });

    // 2. AUTO-CALCULATE LAYOUT (Memoized - Runs Instantly)
    const finalPositions = useMemo(() => {
        if (!matches || matches.length === 0) return {};

        const calculated = {};
        const rounds = {};

        // A. Group by Round
        matches.forEach(m => {
            const r = m.is_third_place ? 99 : Number(m.round_number);
            if (!rounds[r]) rounds[r] = [];
            rounds[r].push(m);
        });

        const roundKeys = Object.keys(rounds).sort((a,b) => Number(a) - Number(b));

        // B. Position Round 1
        const round1 = rounds[1] || [];
        round1.sort((a,b) => Number(a.match_position) - Number(b.match_position));
        
        round1.forEach((m) => {
            const pos = Number(m.match_position);
            calculated[m.id] = {
                x: 0,
                y: (pos - 1) * ROW_SPACING
            };
        });

        // C. Position Later Rounds
        roundKeys.forEach(rKey => {
            const r = Number(rKey);
            if (r === 1 || r === 99) return;

            const currentMatches = rounds[r] || [];
            currentMatches.sort((a,b) => Number(a.match_position) - Number(b.match_position));

            currentMatches.forEach(m => {
                const x = (r - 1) * COL_SPACING;
                
                // Math: Calculate Y based on tree structure to center it
                const power = Math.pow(2, r - 1);
                const pos = Number(m.match_position);
                const gridY = ((pos - 1) * power) + (power / 2) - 0.5;
                const y = gridY * ROW_SPACING;

                calculated[m.id] = { x, y };
            });
        });

        // D. Position 3rd Place
        const thirdPlace = rounds[99]?.[0];
        if (thirdPlace) {
            const lastRound = roundKeys.length > 1 ? Number(roundKeys[roundKeys.length - 2]) : 1;
            calculated[thirdPlace.id] = {
                x: lastRound * COL_SPACING, 
                y: (round1.length * ROW_SPACING) + 150
            };
        }

        // E. MERGE: Override calculated positions with any manual drags
        return { ...calculated, ...manualPositions };

    }, [matches, manualPositions]);

    // --- INTERACTION HANDLERS ---
    const handleNodeMouseDown = (e, id) => {
        if (!isEditing) return;
        e.stopPropagation(); 
        const pos = finalPositions[id] || { x: 0, y: 0 };
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
            
            // Snap to 20px Grid
            const x = Math.round(rawX / 20) * 20;
            const y = Math.round(rawY / 20) * 20;

            // Update MANUAL positions only
            setManualPositions(prev => ({ ...prev, [id]: { x, y } }));
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
        // If we have no positions, we can't draw wires
        if (Object.keys(finalPositions).length === 0) return null;

        return matches.map(match => {
            let nextMatchId = match.next_match_id;
            
            // Auto Linker
            if (!nextMatchId && !match.is_third_place) {
                const r = Number(match.round_number);
                const pos = Number(match.match_position);
                const next = matches.find(m => Number(m.round_number) === r + 1 && Number(m.match_position) === Math.ceil(pos / 2));
                if (next) nextMatchId = next.id;
            }

            if (!nextMatchId && match.loser_next_match_id) nextMatchId = match.loser_next_match_id;

            // Need start AND end positions
            const start = finalPositions[match.id];
            const end = finalPositions[nextMatchId];

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

    // --- RENDER SCREEN ---
    
    // Bounds Calculation
    const allX = Object.values(finalPositions).map(p => p.x);
    const allY = Object.values(finalPositions).map(p => p.y);
    const maxX = allX.length ? Math.max(...allX) + CARD_WIDTH + 500 : 2000;
    const maxY = allY.length ? Math.max(...allY) + CARD_HEIGHT + 500 : 1500;

    if (!matches || matches.length === 0) return (
        <div className="h-full flex items-center justify-center text-zinc-500 font-mono flex-col gap-4">
            <Trophy className="w-16 h-16 opacity-20"/>
            <span>No Matches Found in Bracket.</span>
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
            {/* CONTROLS */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                {isEditing ? (
                    <button 
                        onClick={() => { setIsEditing(false); console.log("Saved Layout:", manualPositions); }} 
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase text-xs rounded shadow-lg animate-pulse"
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
                <button onClick={() => { setScale(1); setViewPos({x:50,y:50}); }} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Maximize size={16}/></button>
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
                {/* 1. Grid Background */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* 2. Circuit Wires */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    {renderWires()}
                </svg>

                {/* 3. Match Nodes */}
                {matches.map(match => {
                    const pos = finalPositions[match.id];
                    // IMPORTANT: If pos is somehow undefined (shouldn't be), render at 0,0
                    const x = pos ? pos.x : 0;
                    const y = pos ? pos.y : 0;

                    return (
                        <MatchCard 
                            key={match.id}
                            match={match}
                            x={x}
                            y={y}
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
