import React, { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield, Plus, Minus, Maximize } from 'lucide-react';

// --- CONFIGURATION ---
const CARD_WIDTH = 220;
const MATCH_HEIGHT = 80;

// --- 1. ZOOM CONTAINER (Pan & Zoom Logic) ---
const ZoomContainer = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleWheel = (e) => {
      // Pinch to zoom (or Ctrl+Scroll)
      if (e.ctrlKey) {
          e.preventDefault();
          const delta = e.deltaY * -0.001;
          const newScale = Math.min(Math.max(0.5, scale + delta), 2);
          setScale(newScale);
      }
  };

  return (
    <div 
        className="w-full h-full overflow-hidden bg-[#050505] relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onWheel={handleWheel}
    >
        {/* Zoom Controls */}
        <div className="absolute bottom-8 left-8 z-50 flex gap-2">
            <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 bg-zinc-800 rounded text-white hover:bg-zinc-700 transition-colors"><Plus size={16}/></button>
            <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="p-2 bg-zinc-800 rounded text-white hover:bg-zinc-700 transition-colors"><Minus size={16}/></button>
            <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="p-2 bg-zinc-800 rounded text-white hover:bg-zinc-700 transition-colors"><Maximize size={16}/></button>
        </div>

        {/* Canvas */}
        <div 
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                display: 'inline-flex',
                padding: '100px', // Padding ensures nothing is cut off at edges
                minWidth: '100%',
                minHeight: '100%',
                alignItems: 'center', // Center bracket vertically
                justifyContent: 'center'
            }}
        >
            {children}
        </div>
    </div>
  );
};

// --- 2. MATCH CARD COMPONENT ---
const MatchCard = ({ match, onClick }) => {
    // Safety check
    if (!match) return <div style={{ width: CARD_WIDTH, height: MATCH_HEIGHT }} className="border border-red-900/30 bg-red-900/10 rounded" />;

    // Ghost Logic: If it's a "Bye" (Round 1, Completed, No Opponent), render invisible spacer
    const isBye = match.status === 'completed' && !match.team2_id && match.round_number === 1;
    if (isBye) {
        return <div style={{ width: CARD_WIDTH, height: MATCH_HEIGHT }} className="invisible" />;
    }

    const isWinner = (id) => match.winner_id === id && match.status === 'completed';
    const isLive = match.status === 'live';

    return (
        <div 
            onClick={() => onClick(match)}
            style={{ width: CARD_WIDTH, height: MATCH_HEIGHT }}
            className={cn(
                "border rounded flex flex-col overflow-hidden transition-all cursor-pointer bg-[#09090b] relative z-10 hover:scale-105 shadow-xl group",
                isLive ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-zinc-800 hover:border-zinc-500"
            )}
        >
            <div className="flex justify-between px-3 py-1 bg-zinc-900/50 border-b border-zinc-800 text-[9px] font-mono uppercase tracking-wider">
                <span className="text-zinc-500">M{match.match_position} • R{match.round_number}</span>
                {isLive && <span className="text-red-500 font-bold animate-pulse">LIVE</span>}
            </div>

            {/* Team 1 */}
            <div className={cn("flex justify-between items-center px-3 h-7", isWinner(match.team1_id) ? "bg-emerald-950/20 text-emerald-400" : "text-zinc-300")}>
                <div className="flex items-center gap-2 overflow-hidden w-full">
                    {match.team1?.logo_url ? <img src={match.team1.logo_url} className="w-3 h-3 object-contain"/> : <Shield size={10} className={cn(isWinner(match.team1_id) ? "text-emerald-500" : "text-zinc-700")} />}
                    <span className="text-xs font-bold truncate max-w-[130px]">{match.team1?.name || 'TBD'}</span>
                </div>
                <span className="text-xs font-mono">{match.team1_score}</span>
            </div>
            
            {/* Divider */}
            <div className="h-px bg-zinc-800/50 mx-2" />

            {/* Team 2 */}
            <div className={cn("flex justify-between items-center px-3 h-7", isWinner(match.team2_id) ? "bg-emerald-950/20 text-emerald-400" : "text-zinc-300")}>
                <div className="flex items-center gap-2 overflow-hidden w-full">
                    {match.team2?.logo_url ? <img src={match.team2.logo_url} className="w-3 h-3 object-contain"/> : <Shield size={10} className={cn(isWinner(match.team2_id) ? "text-emerald-500" : "text-zinc-700")} />}
                    <span className="text-xs font-bold truncate max-w-[130px]">{match.team2?.name || 'TBD'}</span>
                </div>
                <span className="text-xs font-mono">{match.team2_score}</span>
            </div>
        </div>
    );
};

// --- 3. MAIN BRACKET COMPONENT (Flex Column Layout) ---
const Bracket = ({ matches = [], onMatchClick }) => {
    if (!matches.length) return <div className="p-12 text-center text-zinc-600 font-mono">No Data</div>;

    // A. Group by Round
    const rounds = {};
    matches.forEach(m => {
        if(m.is_third_place) return; // Filter out 3rd place (handled by parent view)
        if(!rounds[m.round_number]) rounds[m.round_number] = [];
        rounds[m.round_number].push(m);
    });

    const roundKeys = Object.keys(rounds).sort((a,b) => Number(a) - Number(b));

    return (
        <ZoomContainer>
            <div className="flex gap-16 items-stretch">
                {roundKeys.map((rKey, i) => {
                    const roundMatches = rounds[rKey].sort((a,b) => a.match_position - b.match_position);
                    const isFinals = i === roundKeys.length - 1;
                    
                    return (
                        <div key={rKey} className="flex flex-col justify-around relative">
                            {/* Round Title */}
                            <div className="absolute -top-10 left-0 w-full text-center text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
                                {isFinals ? "Grand Finals" : `Round ${rKey}`}
                            </div>

                            {roundMatches.map(match => (
                                <div key={match.id} className="relative flex items-center my-4">
                                    
                                    {/* Left Connector (Input) */}
                                    {/* Only show if NOT Round 1 */}
                                    {i > 0 && (
                                        <div className="absolute -left-8 w-8 h-px bg-zinc-800/50" />
                                    )}
                                    
                                    <MatchCard match={match} onClick={onMatchClick} />
                                    
                                    {/* Right Connector (Output) */}
                                    {/* Only show if NOT Finals */}
                                    {!isFinals && (
                                        <>
                                            <div className="absolute -right-8 w-8 h-px bg-zinc-800/50" />
                                            
                                            {/* Vertical Connectors (The Tree Structure) */}
                                            {/* We only draw vertical lines for ODD matches (Top of the pair) */}
                                            {/* Logic: Match N connects to Match N+1 via a bracket */}
                                            {match.match_position % 2 !== 0 && (
                                                <div 
                                                    className="absolute -right-8 w-px border-r border-zinc-800/50" 
                                                    // This height calculation is an approximation for visual connection
                                                    // In a true flex layout, finding the exact sibling distance is hard without JS
                                                    // But for visual alignment, a fixed height often works if cards are uniform
                                                    style={{ 
                                                        height: 'calc(100% + 100% + 2rem)', // Span to next sibling roughly
                                                        top: '50%',
                                                        zIndex: 0
                                                    }}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </ZoomContainer>
    );
};

export default Bracket;
