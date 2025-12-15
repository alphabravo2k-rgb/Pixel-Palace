import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Tv, Lock, Shield, Trophy } from 'lucide-react';

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

  // Group flat matches into rounds for the column view
  const bracketData = useMemo(() => {
    const groups = BRACKET_ORDER.reduce((acc, round) => ({ ...acc, [round]: [] }), {});
    
    // 1. Place real matches into their rounds
    matches.forEach(match => {
      const roundLabel = ROUND_MAP[match.round];
      if (groups[roundLabel]) {
        groups[roundLabel].push(match);
      }
    });

    // 2. Fill gaps with "Dummy/TBD" matches to ensure visual completeness
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
        // Append dummies to the round
        groups[round] = [...groups[round], ...dummies];
      }
      
      // Sort by matchIndex to keep order consistent for drawing lines
      groups[round].sort((a, b) => a.matchIndex - b.matchIndex);
    });
    
    return groups;
  }, [matches]);

  // Helper to get team data safely
  const getTeam = (teamId) => {
    if (!teamId) return { name: 'TBD', logo_url: null };
    return teams.find(t => t.id === teamId) || { name: 'TBD', logo_url: null };
  };

  // Effect to calculate connector lines positions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const newLines = [];
    const roundWidth = 280; // Approximate width of a match card column + gap
    const cardHeight = 80; // Approximate height of a card

    // Loop through rounds to connect them (R32->R16, R16->QF, etc.)
    for (let i = 0; i < BRACKET_ORDER.length - 1; i++) {
        const currentRound = BRACKET_ORDER[i];
        const nextRound = BRACKET_ORDER[i+1];
        const currentMatches = bracketData[currentRound];
        const nextMatches = bracketData[nextRound];

        // We connect pairs of matches in the current round to one match in the next round
        // Logic: Match 0 and Match 1 in R32 -> Match 0 in R16
        nextMatches.forEach((nextMatch, nextIdx) => {
            const sourceIdx1 = nextIdx * 2;
            const sourceIdx2 = nextIdx * 2 + 1;

            if (currentMatches[sourceIdx1] && currentMatches[sourceIdx2]) {
                newLines.push({
                    roundIdx: i,
                    startX: 0, // Relative to the gap
                    startY1: sourceIdx1, // Logic index, visual calc below
                    startY2: sourceIdx2,
                    endY: nextIdx
                });
            }
        });
    }
    // Set lines state (simplified for this conceptual rendering, 
    // real SVG lines need exact pixel refs which is complex in React without layout effect/refs for every card.
    // Instead, we will use CSS pseudo-elements or simplified SVG overlay for the 'tree' look in the render loop)
  }, [bracketData]);


  return (
    <div className="flex-grow overflow-x-auto overflow-y-hidden p-8 min-w-full" ref={containerRef}>
      <div className="flex gap-16">
      {BRACKET_ORDER.map((round, roundIdx) => (
        <div key={round} className="w-64 shrink-0 flex flex-col justify-around relative">
          
          {/* Round Header */}
          <div className="text-center mb-6 absolute top-0 w-full -mt-12">
            <span className="bg-[#1c222b] px-3 py-1 rounded text-[10px] font-bold text-zinc-400 border border-zinc-800 tracking-widest uppercase">
              {round}
            </span>
          </div>

          {/* Matches List */}
          <div className={`flex flex-col justify-around h-full py-4 gap-4`}>
            {bracketData[round].map((match, matchIdx) => {
              const [scoreA, scoreB] = parseScore(match.score);
              const isLive = match.status === 'live';
              const team1 = getTeam(match.team1Id);
              const team2 = getTeam(match.team2Id);
              
              // Winner Logic
              const isCompleted = match.status === 'completed';
              const winnerId = match.winnerId;

              // Handle Click
              const handleClick = () => {
                if (!match.isDummy) onMatchClick(match);
              };

              return (
                <div key={match.id} className="relative flex items-center h-full">
                  
                  {/* COMPACT MATCH CARD */}
                  <div 
                      onClick={handleClick}
                      className={`
                      w-full relative bg-[#15191f] border rounded-md cursor-pointer transition-all duration-300 group z-10 overflow-hidden
                      ${isLive ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.15)]' : 'border-zinc-800 hover:border-zinc-600'}
                      ${match.status === 'scheduled' ? 'opacity-75 hover:opacity-100' : ''}
                      ${match.isDummy ? 'opacity-40 cursor-default' : 'cursor-pointer'}
                      `}
                  >
                      {/* Status Bar */}
                      <div className={`h-1 w-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-800'}`}></div>

                      <div className="p-2 flex flex-col gap-1">
                          {/* Team A Row */}
                          <div className="flex justify-between items-center h-6">
                              <div className="flex items-center gap-2 overflow-hidden">
                                  <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${isCompleted && winnerId === match.team1Id ? 'bg-green-500' : 'bg-zinc-700'}`}>
                                      {team1.logo_url && <img src={team1.logo_url} className="w-full h-full object-cover" alt="" />}
                                  </div>
                                  <span className={`text-xs font-bold truncate ${isCompleted && winnerId === match.team1Id ? 'text-green-400' : 'text-zinc-300'}`}>
                                      {team1.name}
                                  </span>
                              </div>
                              <span className="text-xs font-mono text-zinc-500">{scoreA}</span>
                          </div>

                          {/* Team B Row */}
                          <div className="flex justify-between items-center h-6">
                              <div className="flex items-center gap-2 overflow-hidden">
                                  <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${isCompleted && winnerId === match.team2Id ? 'bg-green-500' : 'bg-zinc-700'}`}>
                                      {team2.logo_url && <img src={team2.logo_url} className="w-full h-full object-cover" alt="" />}
                                  </div>
                                  <span className={`text-xs font-bold truncate ${isCompleted && winnerId === match.team2Id ? 'text-green-400' : 'text-zinc-300'}`}>
                                      {team2.name}
                                  </span>
                              </div>
                              <span className="text-xs font-mono text-zinc-500">{scoreB}</span>
                          </div>
                      </div>
                      
                      {/* Footer Info */}
                      <div className="px-2 pb-1 flex justify-between items-center text-[9px] text-zinc-600 uppercase tracking-wider">
                          <span>{match.isDummy ? 'TBD' : `M${match.matchIndex + 1}`}</span>
                          {isLive && <span className="text-green-500 font-bold animate-pulse">LIVE</span>}
                      </div>
                  </div>

                  {/* CONNECTING LINES (CSS-based Tree) */}
                  {/* Draw line to the right for winners advancing */}
                  {round !== 'GF' && (
                      <div className={`absolute -right-8 h-px bg-zinc-700 w-8 top-1/2 z-0`}></div>
                  )}
                  
                  {/* Vertical Brackets for the Previous Round */}
                  {/* Logic: If I am an EVEN index in R16+, I connect to 2 matches on the left */}
                  {/* Actually, it's easier to draw from Left to Right. 
                      Every match in R32 draws a line to the right.
                      In R16, every match has a "fork" on its left connecting the two R32 matches. */}
                  
                  {round !== 'R32' && (
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 flex items-center">
                          {/* Horizontal Stub coming into this card */}
                          <div className="w-4 h-px bg-zinc-700"></div>
                          {/* Vertical Bar connecting the pair from previous round */}
                          <div className="w-px h-[calc(100%+2rem)] bg-zinc-700 absolute left-0" style={{ height: 'calc(100% + 40px)', top: '-20px' }}></div> 
                          {/* Note: Precise height calc requires fixed row heights or JS ref. 
                              For this CSS-only version, we use a fixed approximation that looks okay if cards are evenly spaced.
                              Ideally, the parent flex container 'justify-around' handles the spacing.
                           */}
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
