import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Tv, Lock, Trophy } from 'lucide-react';

// Configuration matches your "Command Center" logic
const BRACKET_ORDER = ['R32', 'R16', 'QF', 'SF', 'GF'];
// Maps SQL round numbers (1, 2, 3...) to Display Labels
const ROUND_MAP = { 1: 'R32', 2: 'R16', 3: 'QF', 4: 'SF', 5: 'GF' };

// Target number of matches per round for a full 32-team bracket
const ROUND_STRUCTURE = {
  'R32': 16,
  'R16': 8,
  'QF': 4,
  'SF': 2,
  'GF': 1
};

const Bracket = ({ onMatchClick }) => {
  const { matches, teams } = useTournament();
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

  // Helper to parse score "13-10" -> ["13", "10"]
  const parseScore = (score) => {
    if (!score || typeof score !== 'string' || score.includes('Decision')) return ['-', '-'];
    const parts = score.match(/\d+/g) || []; 
    return [(parts[0] || '-'), (parts[1] || '-')];
  };

  // Group flat matches into rounds
  const bracketData = useMemo(() => {
    const groups = BRACKET_ORDER.reduce((acc, round) => ({ ...acc, [round]: [] }), {});
    
    // 1. Place real matches
    matches.forEach(match => {
      const roundLabel = ROUND_MAP[match.round];
      if (groups[roundLabel]) {
        groups[roundLabel].push(match);
      }
    });

    // 2. Fill gaps with Dummies
    BRACKET_ORDER.forEach(round => {
      const targetCount = ROUND_STRUCTURE[round];
      const currentCount = groups[round].length;
      
      if (currentCount < targetCount) {
        const needed = targetCount - currentCount;
        const dummies = Array(needed).fill(null).map((_, i) => ({
          id: `dummy-${round}-${currentCount + i}`,
          round: round,
          matchIndex: currentCount + i,
          team1Id: null,
          team2Id: null,
          score: null,
          status: 'scheduled',
          isDummy: true,
          display_id: `M${currentCount + i + 1}`
        }));
        groups[round] = [...groups[round], ...dummies];
      }
      // Sort by matchIndex for consistent ordering
      groups[round].sort((a, b) => a.matchIndex - b.matchIndex);
    });
    
    return groups;
  }, [matches]);

  // Helper to get team data safely
  const getTeam = (teamId) => {
    if (!teamId) return { name: 'TBD', logo_url: null };
    return teams.find(t => t.id === teamId) || { name: 'TBD', logo_url: null };
  };

  // --- LINE CALCULATION LOGIC ---
  useEffect(() => {
    if (!containerRef.current) return;

    // We need to wait for render to get positions
    const calcLines = () => {
      const newLines = [];
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Iterate through rounds to connect R[i] -> R[i+1]
      for (let i = 0; i < BRACKET_ORDER.length - 1; i++) {
        const roundA = BRACKET_ORDER[i];
        const roundB = BRACKET_ORDER[i+1];
        
        const matchesA = bracketData[roundA];
        const matchesB = bracketData[roundB];

        matchesB.forEach((matchB, idxB) => {
          // Logic: Match B (in next round) connects to Match A1 (2*idx) and Match A2 (2*idx + 1)
          const idxA1 = idxB * 2;
          const idxA2 = idxB * 2 + 1;

          const elB = document.getElementById(`match-${matchB.id}`);
          const elA1 = matchesA[idxA1] ? document.getElementById(`match-${matchesA[idxA1].id}`) : null;
          const elA2 = matchesA[idxA2] ? document.getElementById(`match-${matchesA[idxA2].id}`) : null;

          if (elB && elA1 && elA2) {
            const rectB = elB.getBoundingClientRect();
            const rectA1 = elA1.getBoundingClientRect();
            const rectA2 = elA2.getBoundingClientRect();

            // Coordinates relative to container
            const startX = rectA1.right - containerRect.left;
            const endX = rectB.left - containerRect.left;
            
            const yA1 = (rectA1.top + rectA1.bottom) / 2 - containerRect.top;
            const yA2 = (rectA2.top + rectA2.bottom) / 2 - containerRect.top;
            const yB = (rectB.top + rectB.bottom) / 2 - containerRect.top;

            // Draw a fork shape
            // Path 1: From A1 to mid-point
            // Path 2: From A2 to mid-point
            // Path 3: From mid-point to B
            
            const midX = startX + (endX - startX) / 2;

            newLines.push(
              <path 
                key={`${roundA}-${idxB}`}
                d={`
                  M ${startX} ${yA1} 
                  H ${midX} 
                  V ${yA2} 
                  H ${startX} 
                  M ${midX} ${yB} 
                  H ${endX}
                `}
                stroke="#3f3f46" 
                strokeWidth="1.5" 
                fill="none" 
              />
            );
          }
        });
      }
      setLines(newLines);
    };

    // Calculate after a slight delay to allow layout to settle, and on resize
    const timer = setTimeout(calcLines, 100);
    window.addEventListener('resize', calcLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calcLines);
    };
  }, [bracketData]);


  return (
    <div className="relative w-full overflow-x-auto p-8" ref={containerRef}>
      
      {/* SVG Layer for Lines */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {lines}
      </svg>

      <div className="flex gap-16 min-w-max relative z-10">
      {BRACKET_ORDER.map((round) => (
        <div key={round} className="w-60 shrink-0 flex flex-col justify-around">
          
          {/* Round Header */}
          <div className="text-center mb-6 -mt-8">
            <span className="bg-[#1c222b] px-3 py-1 rounded text-[10px] font-bold text-zinc-400 border border-zinc-800 tracking-widest uppercase">
              {round}
            </span>
          </div>

          {/* Matches Column */}
          <div className="flex flex-col gap-6 h-full justify-around py-4">
            {bracketData[round].map((match) => {
              const [scoreA, scoreB] = parseScore(match.score);
              const isLive = match.status === 'live';
              const isCompleted = match.status === 'completed';
              const team1 = getTeam(match.team1Id);
              const team2 = getTeam(match.team2Id);
              const winnerId = match.winnerId;

              return (
                <div 
                  key={match.id} 
                  id={`match-${match.id}`}
                  onClick={() => !match.isDummy && onMatchClick(match)}
                  className={`
                    w-full bg-[#15191f] border rounded cursor-pointer transition-all duration-300 group relative
                    ${isLive ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-zinc-800 hover:border-zinc-600'}
                    ${match.isDummy ? 'opacity-40 cursor-default border-dashed' : 'hover:scale-[1.02]'}
                  `}
                >
                  {/* Status Strip */}
                  <div className={`h-0.5 w-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-transparent'}`}></div>

                  <div className="p-2 flex flex-col gap-1.5">
                    {/* Team 1 Row */}
                    <div className="flex justify-between items-center h-5">
                      <div className="flex items-center gap-2 overflow-hidden w-full">
                        <div className={`w-1 h-full absolute left-0 top-0 bottom-1/2 ${isCompleted && winnerId === match.team1Id ? 'bg-green-500' : 'bg-transparent'}`}></div>
                        
                        {/* Logo or Placeholder */}
                        <div className="w-4 h-4 flex-shrink-0 bg-black/30 rounded-sm flex items-center justify-center">
                           {team1.logo_url ? <img src={team1.logo_url} className="w-full h-full object-cover" alt=""/> : <span className="text-[8px] text-zinc-600 font-bold">T1</span>}
                        </div>
                        
                        <span className={`text-xs font-bold truncate ${isCompleted && winnerId === match.team1Id ? 'text-green-400' : 'text-zinc-300'}`}>
                          {team1.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-zinc-500 bg-black/20 px-1 rounded min-w-[1.5rem] text-center">{scoreA}</span>
                    </div>

                    {/* Team 2 Row */}
                    <div className="flex justify-between items-center h-5">
                      <div className="flex items-center gap-2 overflow-hidden w-full">
                        <div className={`w-1 h-full absolute left-0 top-1/2 bottom-0 ${isCompleted && winnerId === match.team2Id ? 'bg-green-500' : 'bg-transparent'}`}></div>
                        
                        <div className="w-4 h-4 flex-shrink-0 bg-black/30 rounded-sm flex items-center justify-center">
                           {team2.logo_url ? <img src={team2.logo_url} className="w-full h-full object-cover" alt=""/> : <span className="text-[8px] text-zinc-600 font-bold">T2</span>}
                        </div>

                        <span className={`text-xs font-bold truncate ${isCompleted && winnerId === match.team2Id ? 'text-green-400' : 'text-zinc-300'}`}>
                          {team2.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-zinc-500 bg-black/20 px-1 rounded min-w-[1.5rem] text-center">{scoreB}</span>
                    </div>
                  </div>

                  {/* Metadata Footer (Only for real matches) */}
                  {!match.isDummy && (
                    <div className="px-2 pb-1 flex justify-between items-center border-t border-zinc-800/50 pt-1 mt-0.5">
                      <span className="text-[9px] text-zinc-600 font-mono tracking-wider">{match.display_id || `M${match.matchIndex+1}`}</span>
                      <div className="flex gap-2">
                        {match.stream_url && <Tv className="w-3 h-3 text-purple-500" />}
                        {match.status === 'scheduled' && <Lock className="w-3 h-3 text-zinc-600" />}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default Bracket;
