import React, { useState, useRef, useMemo, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield, Edit3, Save, GripHorizontal, Plus, Minus, Maximize, AlertCircle } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const CARD_HEIGHT = 82;
const COL_SPACING = 350; 
const ROW_SPACING = 130;

// --- 1. LAYOUT ENGINE (Iterative & Robust) ---
const calculateLayout = (matches) => {
    if (!matches || matches.length === 0) return {};

    const positions = {};
    const rounds = {};

    // A. Group by Round (Sanitize inputs)
    matches.forEach(m => {
        const r = m.is_third_place ? 99 : Number(m.round_number);
        if (!rounds[r]) rounds[r] = [];
        rounds[r].push(m);
    });

    const roundKeys = Object.keys(rounds).map(Number).sort((a,b) => a - b);

    // B. Position Round 1 (The Anchors)
    // We simply stack them. No complex math.
    const round1 = rounds[1] || [];
    round1.sort((a,b) => (Number(a.match_position) || 0) - (Number(b.match_position) || 0));
    
    round1.forEach((m, idx) => {
        positions[m.id] = {
            x: 50,
            y: idx * ROW_SPACING + 50
        };
    });

    // C. Position Future Rounds (Iterative Centering)
    // For every subsequent round, we find the matches in the PREVIOUS round
    // that "feed" this one, and center this match Y-axis relative to them.
    for (let i = 0; i < roundKeys.length; i++) {
        const r = roundKeys[i];
        if (r === 1 || r === 99) continue; // Skip R1 (done) and 3rd place (special)

        const prevRoundNum = roundKeys[i-1]; 
        const currentMatches = rounds[r] || [];
        const prevMatches = rounds[prevRoundNum] || [];

        currentMatches.sort((a,b) => Number(a.match_position) - Number(b.match_position));
        prevMatches.sort((a,b) => Number(a.match_position) - Number(b.match_position));

        currentMatches.forEach((m, idx) => {
            const x = 50 + (i * COL_SPACING);
            
            // Logic: Match 1 in this round is fed by Match 1 & 2 in previous round.
            // Match 2 is fed by Match 3 & 4...
            const p1 = prevMatches[idx * 2];
            const p2 = prevMatches[(idx * 2) + 1];

            let y;
            
            if (p1 && p2 && positions[p1.id] && positions[p2.id]) {
                // Perfect alignment: Center between parents
                y = (positions[p1.id].y + positions[p2.id].y) / 2;
            } else if (p1 && positions[p1.id]) {
                // Odd number / Bye: Align with single parent
                y = positions[p1.id].y;
            } else {
                // Fallback: Just stack it based on grid
                y = (idx * ROW_SPACING * Math.pow(1.5, i)) + 50; 
            }

            positions[m.id] = { x, y };
        });
    }

    // D. Position 3rd Place
    const thirdPlace = rounds[99]?.[0];
    if (thirdPlace) {
        // Place it deep to the right and bottom
        const lastRoundIndex = roundKeys.length - (roundKeys.includes(99) ? 2 : 1);
        positions[thirdPlace.id] = {
            x: 50 + (lastRoundIndex * COL_SPACING),
            y: (round1.length * ROW_SPACING) + 200
        };
    }

    return positions;
};

// --- 2. SUB-COMPONENTS ---

const NodePoint = ({ type, active }) => (
    <div className={cn(
        "w-3 h-3 rounded-full border-2 absolute top-1/2 -translate-y-1/2 z-20 bg-[#09090b] transition-all",
        type === 'input' ? "-left-1.5" : "-right-1.5",
        active ? "border-cyan-400 shadow-[0_0_8px_#22d3ee] bg-cyan-900" : "border-zinc-700"
    )} />
);

const MatchCard = ({ match, x, y, onDragStart, isEditing, onClick }) => {
    // 🛡️ CRITICAL FALLBACK: If calculations fail, snap to 0,0 so it's visible
    const safeX = (typeof x === 'number' && !isNaN(x)) ? x : 0;
    const safeY = (typeof y === 'number' && !isNaN(y)) ? y : 0;

    const isLive = match.status === 'live';
    const isWinner = (id) => match.winner_id === id && match.status === 'completed';

    return (
        <div 
            style={{ 
                transform: `translate(${safeX}px, ${safeY}px)`, 
                width: CARD_WIDTH, 
                height: CARD_HEIGHT,
                position: 'absolute',
                // Instant snap when editing, smooth glide when auto-layout updates
                transition: isEditing ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' 
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
            {(Number(match.round_number) || 1) > 1 && <NodePoint type="input" active={match.status !== 'scheduled'} />}
            
            {/* Header */}
            <div className="flex justify-between items-center px-3 py-1 bg-zinc-900/80 border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 select-none">
                <span className="flex items-center gap-2">
                    {isEditing && <GripHorizontal size={10} className="text-yellow-500"/>}
                    {match.is_third_place ? "3RD PLACE" : `M${match.match_position || '?'} • R${match.round_number || '?'}`}
                </span>
                {isLive && <span className="text-red-500 font-bold animate-pulse">● LIVE</span>}
            </div>

            {/* Teams */}
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

            {/* Output Node */}
            {!match.is_third_place && <NodePoint type="output" active={match.status === 'completed'} />}
        </div>
    );
};

// --- 3. MAIN COMPONENT ---
const Bracket = ({ matches = [], onMatchClick }) => {
    // 1. STATE & REFS
    const [manualPositions, setManualPositions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    
    // Zoom/Pan State
    const [scale, setScale] = useState(1);
    const [viewPos, setViewPos] = useState({ x: 0, y: 0 }); 
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const draggingNodeRef = useRef(null);
    const nodeOffsetRef = useRef({ x: 0, y: 0 });

    // 2. AUTO-CALCULATION (Memoized - Runs Instantly)
    // This prevents the blank screen by having coordinates ready on first paint
    const finalPositions = useMemo(() => {
        const calculated = calculateLayout(matches);
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
            
            // Snap to 10px Grid
            const x = Math.round(rawX / 10) * 10;
            const y = Math.round(rawY / 10) * 10;

            // Save to manual positions
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
        if (!finalPositions || Object.keys(finalPositions).length === 0) return null;

        return matches.map(match => {
            let nextMatchId = match.next_match_id;
            
            // Auto Linker: If DB link missing, assume standard flow
            if (!nextMatchId && !match.is_third_place) {
                const r = Number(match.round_number) || 1;
                const pos = Number(match.match_position) || 1;
                const nextR = r + 1;
                const nextPos = Math.ceil(pos / 2);
                
                const next = matches.find(m => (Number(m.round_number) || 0) === nextR && (Number(m.match_position) || 0) === nextPos);
                if (next) nextMatchId = next.id;
            }

            if (!nextMatchId && match.loser_next_match_id) nextMatchId = match.loser_next_match_id;

            const start = finalPositions[match.id];
            const end = finalPositions[nextMatchId];

            if (!start || !end) return null;

            const x1 = (start.x || 0) + CARD_WIDTH; 
            const y1 = (start.y || 0) + (CARD_HEIGHT / 2); 
            const x2 = (end.x || 0); 
            const y2 = (end.y || 0) + (CARD_HEIGHT / 2); 
            const midX = (x1 + x2) / 2;

            const isCompleted = match.status === 'completed';

            return (
                <g key={`${match.id}-${nextMatchId}`}>
                    {/* Wire Glow */}
                    <path 
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={isCompleted ? "#22d3ee" : "transparent"}
                        strokeWidth="6"
                        className="opacity-10 blur-[4px]"
                    />
                    {/* Wire Core */}
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
        <div className="h-full flex items-center justify-center text-zinc-500 font-mono flex-col gap-4 bg-black">
            <Trophy className="w-16 h-16 opacity-20 text-yellow-500"/>
            <span>No Matches Found in Bracket.</span>
        </div>
    );

    return (
        // 🚨 CRITICAL FIX: Use h-screen to force height if parent is 0 height
        <div 
            className="w-full h-screen flex flex-col bg-[#050505] overflow-hidden relative cursor-grab active:cursor-grabbing selection:bg-transparent"
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

            {/* ZOOM */}
            <div className="absolute bottom-8 left-8 z-50 flex gap-2 bg-black/50 p-1 rounded-lg backdrop-blur-md border border-white/5">
                <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Plus size={16}/></button>
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.2))} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Minus size={16}/></button>
                <button onClick={() => { setScale(1); setViewPos({x:0,y:0}); }} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Maximize size={16}/></button>
            </div>

            {/* CANVAS */}
            <div 
                style={{ 
                    transform: `translate(${viewPos.x}px, ${viewPos.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    width: '4000px', // Fixed massive width to prevent cut-off
                    height: '3000px',
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
