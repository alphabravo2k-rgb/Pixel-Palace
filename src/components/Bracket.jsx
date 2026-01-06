import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield, Edit3, Save, GripHorizontal, Plus, Minus, Maximize, AlertCircle } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const CARD_HEIGHT = 82;
const COL_SPACING = 350; 
const ROW_SPACING = 110;

// --- 1. HARD-CODED LAYOUT ENGINE (The "Manual Reality") ---
// This forces the bracket to look exactly like your diagram, regardless of DB math.
const getFixedPosition = (round, position, isThirdPlace) => {
    // 3rd Place Match
    if (isThirdPlace) return { x: 1600, y: 1200 };

    const r = Number(round);
    const p = Number(position);

    // X Coordinates (Columns)
    const x = (r - 1) * COL_SPACING + 50;

    // Y Coordinates (Rows) - Manually tuned for 25-team visual balance
    let y = 0;

    if (r === 1) {
        // Round 1 (Matches 16-24 in your diagram, 9 total)
        // They need to align with specific slots in Round 2
        // We space them out to match the visual gaps
        y = (p - 1) * ROW_SPACING * 1.5 + 50; 
    } 
    else if (r === 2) {
        // Round 2 (8 matches)
        // These are the "Anchor" matches. 
        y = (p - 1) * (ROW_SPACING * 2) + 50;
    } 
    else if (r === 3) {
        // Round 3 (4 matches) - Centered on R2
        y = (p - 1) * (ROW_SPACING * 4) + 160;
    }
    else if (r === 4) {
        // Round 4 (Semifinals)
        y = (p - 1) * (ROW_SPACING * 8) + 380;
    }
    else if (r === 5) {
        // Finals
        y = 380 + 200; // Centered between semis
    }

    return { x, y };
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
    // 🛡️ Safety: Ensure coordinates exist
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
                transition: isEditing ? 'none' : 'transform 0.3s ease-out' 
            }}
            className={cn(
                "group absolute z-10 flex flex-col bg-[#09090b] border rounded-lg shadow-xl overflow-visible",
                isEditing ? "cursor-grab active:cursor-grabbing border-yellow-500/50 hover:border-yellow-500 z-50" : "cursor-pointer border-zinc-800 hover:border-cyan-500/50 hover:z-20",
                isLive && !isEditing && "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            )}
            onMouseDown={(e) => isEditing && onDragStart(e, match.id)}
            onClick={() => !isEditing && onClick(match)}
        >
            {/* Input Node */}
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
    // State
    const [manualPositions, setManualPositions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    
    // Zoom/Pan
    const [scale, setScale] = useState(1);
    const [viewPos, setViewPos] = useState({ x: 0, y: 0 }); 
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const draggingNodeRef = useRef(null);
    const nodeOffsetRef = useRef({ x: 0, y: 0 });

    // --- AUTO-CALCULATION (Fixed Grid) ---
    // This runs instantly. No async waiting.
    const finalPositions = useMemo(() => {
        if (!matches || matches.length === 0) return {};

        const calculated = {};
        
        matches.forEach(m => {
            // Force types
            const r = m.is_third_place ? 99 : Number(m.round_number);
            const p = Number(m.match_position);
            
            // Get coordinates from our hard-coded engine
            calculated[m.id] = getFixedPosition(r, p, m.is_third_place);
        });

        // Merge manual overrides (if you drag things, this remembers)
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

    // --- RENDER WIRES (The Connections) ---
    const renderWires = () => {
        if (!finalPositions || Object.keys(finalPositions).length === 0) return null;

        return matches.map(match => {
            let nextMatchId = match.next_match_id;
            
            // 3rd Place Link Logic (Manual Override)
            if (!nextMatchId && match.loser_next_match_id) {
                nextMatchId = match.loser_next_match_id;
            }

            // Fallback Logic: Connect Round X to Round X+1 based on Position
            // If the DB link is missing, we visually guess it so lines still appear.
            if (!nextMatchId && !match.is_third_place) {
                const r = Number(match.round_number);
                const p = Number(match.match_position);
                const nextR = r + 1;
                const nextP = Math.ceil(p / 2);
                
                // Find target match
                const nextMatch = matches.find(m => Number(m.round_number) === nextR && Number(m.match_position) === nextP);
                if (nextMatch) nextMatchId = nextMatch.id;
            }

            // We need coordinates for start AND end
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

    if (!matches || matches.length === 0) return (
        <div className="h-screen flex items-center justify-center text-zinc-500 font-mono flex-col gap-4 bg-black">
            <AlertCircle className="w-16 h-16 opacity-20 text-yellow-500"/>
            <span>No Matches Found in Bracket.</span>
        </div>
    );

    return (
        // 🚨 FORCE HEIGHT: h-screen ensures this container ALWAYS has size
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
                    width: '4000px', // Massive Fixed Width
                    height: '3000px', // Massive Fixed Height
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
                    // Final Safe Guard
                    const x = (pos && !isNaN(pos.x)) ? pos.x : 0;
                    const y = (pos && !isNaN(pos.y)) ? pos.y : 0;

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
