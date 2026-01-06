import React, { useState, useRef, useMemo, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { cn } from '../lib/utils';
import { Trophy, Shield, Edit3, Save, GripHorizontal, Plus, Minus, Maximize, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const CARD_HEIGHT = 82;
const COL_SPACING = 350; 
const ROW_SPACING = 110;

// --- 1. FALLBACK LAYOUT ENGINE (The "Safe Mode") ---
// Used ONLY when a match has no saved ui_x/ui_y in the DB.
// This hardcodes the look of a 25-team bracket (9 -> 8 -> 4 -> 2 -> 1).
const getFixedPosition = (round, position, isThirdPlace) => {
    // 3rd Place Match: Bottom Right
    if (isThirdPlace) return { x: 1600, y: 1200 };

    const r = Number(round) || 1;
    const p = Number(position) || 1;

    // X Coordinates (Columns)
    const x = (r - 1) * COL_SPACING + 50;

    let y = 0;
    // Y Coordinates (Rows) - Manually tuned for 25-team visual balance
    if (r === 1)      y = (p - 1) * (ROW_SPACING * 1.5) + 50; 
    else if (r === 2) y = (p - 1) * (ROW_SPACING * 2) + 50;
    else if (r === 3) y = (p - 1) * (ROW_SPACING * 4) + 160;
    else if (r === 4) y = (p - 1) * (ROW_SPACING * 8) + 380;
    else if (r === 5) y = 380 + 200; // Finals

    return { x, y };
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
    // 🛡️ CRITICAL FALLBACK: If coordinates are NaN, snap to 0,0 to prevent crash
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

            {/* Output Node (Not for Finals/3rd) */}
            {!match.is_third_place && <NodePoint type="output" active={match.status === 'completed'} />}
        </div>
    );
};

// --- 3. MAIN COMPONENT ---
const Bracket = ({ matches = [], onMatchClick }) => {
    // Manual Edits (Delta State)
    const [manualPositions, setManualPositions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Zoom/Pan State
    const [scale, setScale] = useState(1);
    const [viewPos, setViewPos] = useState({ x: 0, y: 0 }); 
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const draggingNodeRef = useRef(null);
    const nodeOffsetRef = useRef({ x: 0, y: 0 });

    // --- HYBRID POSITION ENGINE ---
    // Combines: Saved DB Positions + Manual Dragging + Fallback Logic
    const finalPositions = useMemo(() => {
        const positions = {};
        if (!matches || matches.length === 0) return {};

        matches.forEach(m => {
            // 1. Check for Saved DB Position (Highest Priority)
            if (m.ui_x !== null && m.ui_y !== null && m.ui_x !== undefined) {
                positions[m.id] = { x: Number(m.ui_x), y: Number(m.ui_y) };
            } 
            // 2. Fallback to Hard-Coded Layout (If no save exists)
            else {
                const r = m.is_third_place ? 99 : Number(m.round_number);
                const p = Number(m.match_position);
                positions[m.id] = getFixedPosition(r, p, m.is_third_place);
            }
        });

        // 3. Apply manual overrides (for live dragging)
        return { ...positions, ...manualPositions };
    }, [matches, manualPositions]);

    // --- SAVE HANDLER (Correct JSONB) ---
    const handleSaveLayout = async () => {
        setIsSaving(true);
        try {
            // 1. Construct valid JSON object array (Supabase handles serialization)
            const payload = Object.keys(finalPositions).map(id => ({
                id,
                x: Math.round(finalPositions[id].x), // Ensure integer
                y: Math.round(finalPositions[id].y)
            }));

            // 2. Call the RPC (Ensure this function exists in Postgres)
            const { error } = await supabase.rpc('admin_update_bracket_layout', { p_positions: payload });
            
            if (error) throw error;
            
            toast.success("Bracket Layout Saved");
            setIsEditing(false);
            setManualPositions({}); // Clear local state, DB state takes over
        } catch (err) {
            console.error(err);
            toast.error("Save Failed: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

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

    // --- RENDER WIRES (Strict Mode) ---
    const renderWires = () => {
        if (!finalPositions || Object.keys(finalPositions).length === 0) return null;

        return matches.map(match => {
            // STRICT LINKING: Only draw if DB says so
            const nextId = match.next_match_id || match.loser_next_match_id;
            
            if (!nextId) return null; // No magic guessing!

            const start = finalPositions[match.id];
            const end = finalPositions[nextId];

            if (!start || !end) return null;

            const x1 = (start.x || 0) + CARD_WIDTH; 
            const y1 = (start.y || 0) + (CARD_HEIGHT / 2); 
            const x2 = (end.x || 0); 
            const y2 = (end.y || 0) + (CARD_HEIGHT / 2); 
            const midX = (x1 + x2) / 2;

            const isCompleted = match.status === 'completed';

            return (
                <path 
                    key={`${match.id}-${nextId}`}
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isCompleted ? "#22d3ee" : "#3f3f46"} 
                    strokeWidth="2"
                    strokeDasharray={isCompleted ? "0" : "5,5"} 
                    className="transition-colors duration-500"
                />
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
                        onClick={handleSaveLayout} 
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase text-xs rounded shadow-lg animate-pulse disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={14} />}
                        Save Layout
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

            {/* ZOOM CONTROLS */}
            <div className="absolute bottom-8 left-8 z-50 flex gap-2 bg-black/50 p-1 rounded-lg backdrop-blur-md border border-white/5">
                <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Plus size={16}/></button>
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.2))} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Minus size={16}/></button>
                <button onClick={() => { setScale(1); setViewPos({x:0,y:0}); }} className="p-2 hover:bg-white/10 rounded text-white transition-colors"><Maximize size={16}/></button>
            </div>

            {/* CANVAS - Massive fixed size to ensure everything renders */}
            <div 
                style={{ 
                    transform: `translate(${viewPos.x}px, ${viewPos.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    width: '4000px', 
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
