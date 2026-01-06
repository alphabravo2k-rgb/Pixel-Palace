import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield, Edit3, Save, RotateCcw, GripHorizontal } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const CARD_HEIGHT = 82;
const X_SPACING = 300; // Horizontal distance between rounds
const Y_SPACING = 120; // Vertical distance between matches

// --- SUB-COMPONENT: CONNECTION NODE (The "Dots") ---
const NodePoint = ({ type, active }) => (
    <div className={cn(
        "w-3 h-3 rounded-full border-2 absolute top-1/2 -translate-y-1/2 z-20 transition-all",
        type === 'input' ? "-left-1.5" : "-right-1.5",
        active ? "bg-cyan-500 border-cyan-300 shadow-[0_0_10px_#06b6d4]" : "bg-zinc-900 border-zinc-600"
    )} />
);

// --- SUB-COMPONENT: MATCH CARD (Draggable) ---
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
                transition: isEditing ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' 
            }}
            className={cn(
                "group absolute z-10 flex flex-col bg-[#09090b] border rounded-lg shadow-xl overflow-visible",
                isEditing ? "cursor-grab active:cursor-grabbing border-yellow-500/50 hover:border-yellow-500" : "cursor-pointer border-zinc-800 hover:border-cyan-500/50",
                isLive && !isEditing && "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
            )}
            onMouseDown={(e) => isEditing && onDragStart(e, match.id)}
            onClick={() => !isEditing && onClick(match)}
        >
            {/* Input Node (Left) - Only for Non-Round 1 */}
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
            <div className="flex-1 flex flex-col justify-center">
                {/* Team 1 */}
                <div className={cn("flex justify-between items-center px-3 h-6", isWinner(match.team1_id) ? "text-cyan-400" : "text-zinc-400")}>
                    <span className="text-xs font-bold truncate w-32">{match.team1?.name || 'TBD'}</span>
                    <span className="text-xs font-mono">{match.team1_score}</span>
                </div>
                {/* Team 2 */}
                <div className={cn("flex justify-between items-center px-3 h-6", isWinner(match.team2_id) ? "text-cyan-400" : "text-zinc-400")}>
                    <span className="text-xs font-bold truncate w-32">{match.team2?.name || 'TBD'}</span>
                    <span className="text-xs font-mono">{match.team2_score}</span>
                </div>
            </div>

            {/* Output Node (Right) - Only if not finals/3rd */}
            {!match.is_third_place && <NodePoint type="output" active={match.status === 'completed'} />}
        </div>
    );
};

// --- MAIN COMPONENT ---
const Bracket = ({ matches = [], onMatchClick }) => {
    const [positions, setPositions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    
    // Dragging State
    const draggingRef = useRef(null);
    const offsetRef = useRef({ x: 0, y: 0 });

    // 1. Initial "Circuit" Layout Generation
    useEffect(() => {
        if (!matches.length) return;
        
        // Only generate if we don't have positions yet (or want to reset)
        const initialPos = {};
        
        // Group by Round
        const rounds = {};
        matches.forEach(m => {
            const r = m.is_third_place ? 99 : m.round_number; // 3rd place is magic round 99
            if(!rounds[r]) rounds[r] = [];
            rounds[r].push(m);
        });

        // 9 - 8 - 4 - 2 - 1 Logic
        // We iterate rounds and stack them vertically, centered relative to the previous round
        
        const roundKeys = Object.keys(rounds).sort((a,b) => Number(a) - Number(b));
        
        roundKeys.forEach((r, rIndex) => {
            const roundMatches = rounds[r].sort((a,b) => a.match_position - b.match_position);
            const x = r === '99' ? 1200 : (rIndex * X_SPACING) + 50; // 3rd place goes far right
            
            roundMatches.forEach((m, idx) => {
                let y;
                if (r === '1') {
                    // Round 1 (9 Matches): Stacked
                    y = (idx * Y_SPACING) + 50;
                } else if (r === '99') {
                    // 3rd Place: Bottom right
                    y = 800; 
                } else {
                    // Circuit Logic: Place exactly between the two matches feeding into it
                    // Find matches in previous round that map to this one
                    // Standard logic: (Match Pos * 2) - 1 and (Match Pos * 2)
                    const prevRoundMatches = rounds[Number(r)-1] || [];
                    
                    // Simple centering fallback if "Next Match ID" linking isn't perfect
                    // We calculate the available height and distribute evenly
                    // Total height of previous round
                    const totalPrevHeight = (rounds[Number(r)-1]?.length || 1) * Y_SPACING;
                    const step = totalPrevHeight / (roundMatches.length + 1);
                    
                    // Center vertically based on Round 1 height
                    const centerY = (9 * Y_SPACING) / 2;
                    const spread = (idx - (roundMatches.length - 1) / 2) * (Y_SPACING * Math.pow(1.8, rIndex));
                    
                    y = centerY + spread;
                }
                initialPos[m.id] = { x, y };
            });
        });

        setPositions(initialPos);
    }, [matches.length]); // Run once on load

    // 2. Drag Handlers
    const handleMouseDown = (e, id) => {
        if (!isEditing) return;
        e.preventDefault();
        const pos = positions[id] || { x: 0, y: 0 };
        draggingRef.current = id;
        offsetRef.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        };
    };

    const handleMouseMove = (e) => {
        if (!draggingRef.current || !isEditing) return;
        const id = draggingRef.current;
        const newX = e.clientX - offsetRef.current.x;
        const newY = e.clientY - offsetRef.current.y;
        
        // Snap to Grid (Optional, makes it cleaner)
        const snappedX = Math.round(newX / 10) * 10;
        const snappedY = Math.round(newY / 10) * 10;

        setPositions(prev => ({
            ...prev,
            [id]: { x: snappedX, y: snappedY }
        }));
    };

    const handleMouseUp = () => {
        draggingRef.current = null;
    };

    // 3. Generate "Curly Wires" (Bezier Curves)
    const renderWires = () => {
        return matches.map(match => {
            // Find where this match goes next
            // We use the DB relation 'next_match_id' OR assume standard bracket logic
            let nextMatchId = match.next_match_id;
            
            // Fallback logic if DB link is missing:
            if (!nextMatchId && !match.is_third_place) {
                const nextRound = match.round_number + 1;
                const nextPos = Math.ceil(match.match_position / 2);
                const next = matches.find(m => m.round_number === nextRound && m.match_position === nextPos);
                if (next) nextMatchId = next.id;
            }

            if (!nextMatchId) return null;

            const start = positions[match.id];
            const end = positions[nextMatchId];

            if (!start || !end) return null;

            // Connection Points
            const x1 = start.x + CARD_WIDTH; // Right side of source
            const y1 = start.y + (CARD_HEIGHT / 2); // Center of source
            const x2 = end.x; // Left side of target
            const y2 = end.y + (CARD_HEIGHT / 2); // Center of target

            // Circuit Style Bezier
            // "C" control points creates the S-curve
            const cp1x = x1 + ((x2 - x1) / 2);
            const cp2x = x2 - ((x2 - x1) / 2);

            const isCompleted = match.status === 'completed';

            return (
                <g key={`${match.id}-${nextMatchId}`}>
                    {/* Shadow Line (Glow) */}
                    <path 
                        d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={isCompleted ? "#06b6d4" : "transparent"}
                        strokeWidth="4"
                        className="opacity-20 blur-[2px]"
                    />
                    {/* Main Wire */}
                    <path 
                        d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={isCompleted ? "#06b6d4" : "#3f3f46"}
                        strokeWidth="2"
                        className="transition-colors duration-500"
                        strokeDasharray={isCompleted ? "0" : "4 4"} // Dashed if pending
                    />
                </g>
            );
        });
    };

    if (!matches.length) return null;

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden">
            
            {/* TOOLBAR */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                {isEditing ? (
                    <button 
                        onClick={() => { setIsEditing(false); /* Logic to save to DB here */ }} 
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

            {/* CANVAS */}
            <div 
                className="flex-1 relative overflow-auto cursor-grab active:cursor-grabbing"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ backgroundImage: 'radial-gradient(#1f1f22 1px, transparent 1px)', backgroundSize: '20px 20px' }} // Grid Pattern
            >
                <div style={{ width: 2000, height: 1500, position: 'relative' }}> {/* Large Canvas Area */}
                    
                    {/* SVG Layer (Wires) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {renderWires()}
                    </svg>

                    {/* Nodes Layer */}
                    {matches.map(match => positions[match.id] && (
                        <MatchCard 
                            key={match.id}
                            match={match}
                            x={positions[match.id].x}
                            y={positions[match.id].y}
                            onDragStart={handleMouseDown}
                            isEditing={isEditing}
                            onClick={onMatchClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Bracket;
