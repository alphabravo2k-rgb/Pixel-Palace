import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Tv, Lock, Trophy, AlertTriangle, Map as MapIcon, Shield, Radio, AlertOctagon, Calendar } from 'lucide-react';

// --- CONFIGURATION ---
const BRACKET_ORDER = ['R32', 'R16', 'QF', 'SF', 'GF'];
const ROUND_MAP = { 1: 'R32', 2: 'R16', 3: 'QF', 4: 'SF', 5: 'GF' };
const ROUND_STRUCTURE = { 'R32': 16, 'R16': 8, 'QF': 4, 'SF': 2, 'GF': 1 };

// --- HELPERS ---
const parseScore = (score) => {
  if (!score || typeof score !== 'string' || score.includes('Decision')) return ['-', '-'];
  const parts = score.match(/\d+/g) || []; 
  return [(parts[0] || '-'), (parts[1] || '-')];
};

const formatSchedule = (match) => {
  const timeStr = match.start_time || match.metadata?.start_time;
  if (!timeStr) return "TBD"; 

  const date = new Date(timeStr);
  const now = new Date();
  
  if (isNaN(date.getTime())) return "TBD";

  const diffMs = date - now;
  const diffHrs = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffHrs > 0 && diffHrs < 24 && date.getDate() === now.getDate()) {
      return `Today ${timeString}`;
  } else if (diffDays === 1) {
      return `Tmrw ${timeString}`;
  } else {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeString}`;
  }
};

const buildBracketStructure = (matches) => {
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
};

// --- SUB-COMPONENTS ---

const BracketMatch = ({ match, team1, team2, onClick, setRef }) => {
  const [scoreA, scoreB] = parseScore(match.score);
  const scheduleText = formatSchedule(match);
  
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const hasDispute = match.metadata?.dispute; 
  const needsAdmin = match.metadata?.needs_admin;
  const isVetoing = isLive && match.vetoState?.phase !== 'complete';
  const winnerId = match.winnerId;

  let borderColor = 'border-zinc-800';
  let shadow = '';
  let statusStrip = 'bg-zinc-800';

  if (needsAdmin) {
      borderColor = 'border-red-500';
      shadow = 'shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      statusStrip = 'bg-red-500 animate-pulse';
  } else if (hasDispute) {
      borderColor = 'border-yellow-500';
      shadow = 'shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      statusStrip = 'bg-yellow-500 animate-pulse';
  } else if (isLive) {
      borderColor = 'border-green-500';
      shadow = 'shadow-[0_0_15px_rgba(34,197,94,0.15)]';
      statusStrip = 'bg-green-500 animate-pulse';
  } else if (match.status === 'completed') {
      borderColor = 'border-zinc-700';
      statusStrip = 'bg-zinc-700';
  }

  return (
    <div 
      ref={setRef}
      onClick={!match.isDummy ? onClick : undefined}
      className={`
        w-full relative bg-[#15191f] border rounded-lg cursor-pointer transition-all duration-300 group z-10
        ${borderColor} ${shadow} hover:border-zinc-600
        ${match.isDummy ? 'opacity-30 cursor-default border-dashed' : 'hover:scale-[1.02]'}
      `}
    >
      <div className={`h-0.5 w-full ${statusStrip}`}></div>

      <div className="p-3 flex items-center justify-between gap-4">
        {/* Team 1 Block */}
        <div className={`flex items-center gap-2 flex-1 min-w-0 overflow-hidden ${isCompleted && winnerId === match.team1Id ? 'text-green-400 font-bold' : isCompleted ? 'text-zinc-500 opacity-50' : 'text-zinc-300'}`}>
            {team1.logo_url && <img src={team1.logo_url} className="w-5 h-5 object-contain rounded-sm bg-black/40 flex-shrink-0" alt=""/>}
            <span className="truncate text-xs">{team1.name}</span>
            {isCompleted && winnerId === match.team1Id && <span className="text-[10px] text-zinc-500 ml-1 font-mono">{scoreA}</span>}
        </div>

        <div className="text-[10px] text-zinc-600 font-bold px-1">VS</div>

        {/* Team 2 Block */}
        <div className={`flex items-center gap-2 flex-1 min-w-0 overflow-hidden justify-end ${isCompleted && winnerId === match.team2Id ? 'text-green-400 font-bold' : isCompleted ? 'text-zinc-500 opacity-50' : 'text-zinc-300'}`}>
            {isCompleted && winnerId === match.team2Id && <span className="text-[10px] text-zinc-500 mr-1 font-mono">{scoreB}</span>}
            <span className="truncate text-xs text-right">{team2.name}</span>
            {team2.logo_url && <img src={team2.logo_url} className="w-5 h-5 object-contain rounded-sm bg-black/40 flex-shrink-0" alt=""/>}
        </div>
      </div>

      {!match.isDummy && (
        <div className={`px-3 py-1.5 flex justify-between items-center border-t ${needsAdmin ? 'border-red-900/30 bg-red-900/10' : hasDispute ? 'border-yellow-900/30 bg-yellow-900/10' : 'border-zinc-800/50 bg-[#0b0c0f]/50'} rounded-b-lg`}>
          <div className="flex items-center gap-1.5">
              {match.status === 'scheduled' ? (
                  <>
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span className={`text-[9px] font-bold tracking-wide ${scheduleText === 'TBD' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {scheduleText}
                    </span>
                  </>
              ) : (
                  <span className="text-[9px] text-zinc-600 font-mono tracking-wider">
                      {match.display_id || `M${match.matchIndex+1}`}
                  </span>
              )}
          </div>
          
          <div className="flex gap-2 items-center">
            {needsAdmin ? (
                <div className="flex items-center gap-1 text-red-500 animate-pulse">
                    <AlertOctagon className="w-3 h-3" />
                    <span className="text-[9px] font-bold tracking-wider">SOS</span>
                </div>
            ) : hasDispute ? (
                <div className="flex items-center gap-1 text-yellow-500 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-[9px] font-bold tracking-wider">DISPUTE</span>
                </div>
            ) : isVetoing ? (
                <div className="flex items-center gap-1 text-blue-400">
                    <MapIcon className="w-3 h-3" />
                    <span className="text-[9px] font-bold tracking-wider">VETO</span>
                </div>
            ) : isLive ? (
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    <span className="text-[9px] font-bold text-green-500 tracking-wider">LIVE</span>
                </div>
            ) : match.status === 'scheduled' ? (
                <Lock className="w-3 h-3 text-zinc-600" />
            ) : null}

            {match.stream_url && <Tv className="w-3 h-3 text-purple-500" />}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

const Bracket = ({ onMatchClick }) => {
  const { matches, teams } = useTournament();
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const matchRefs = useRef(new Map());
  const [lines, setLines] = useState([]);

  // 1. Performance Optimization: O(1) Team Lookup
  const teamMap = useMemo(() => {
    const map = new Map();
    teams.forEach(t => map.set(t.id, t));
    return map;
  }, [teams]);

  const getTeam = (teamId) => teamMap.get(teamId) || { name: 'TBD', logo_url: null };

  // 2. Bracket Computation
  const bracketData = useMemo(() => buildBracketStructure(matches), [matches]);

  // 3. Line Logic using Refs
  useEffect(() => {
    if (!contentRef.current) return;

    const calcLines = () => {
      const newLines = [];
      const parentRect = contentRef.current.getBoundingClientRect();
      
      for (let i = 0; i < BRACKET_ORDER.length - 1; i++) {
        const roundA = BRACKET_ORDER[i];
        const roundB = BRACKET_ORDER[i+1];
        
        const matchesA = bracketData[roundA];
        const matchesB = bracketData[roundB];

        matchesB.forEach((matchB, idxB) => {
          const idxA1 = idxB * 2;
          const idxA2 = idxB * 2 + 1;

          // Retrieve elements from Ref Map
          const elB = matchRefs.current.get(matchB.id);
          const elA1 = matchesA[idxA1] ? matchRefs.current.get(matchesA[idxA1].id) : null;
          const elA2 = matchesA[idxA2] ? matchRefs.current.get(matchesA[idxA2].id) : null;

          if (elB && elA1 && elA2) {
            const rectB = elB.getBoundingClientRect();
            const rectA1 = elA1.getBoundingClientRect();
            const rectA2 = elA2.getBoundingClientRect();

            const startX = rectA1.right - parentRect.left;
            const endX = rectB.left - parentRect.left;
            
            const yA1 = (rectA1.top + rectA1.height / 2) - parentRect.top;
            const yA2 = (rectA2.top + rectA2.height / 2) - parentRect.top;
            const yB = (rectB.top + rectB.height / 2) - parentRect.top;

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
                stroke="#52525b" 
                strokeWidth="1.5" 
                fill="none" 
              />
            );
          }
        });
      }
      setLines(newLines);
    };

    // Calculate lines after render & layout
    const timer = setTimeout(calcLines, 300);
    window.addEventListener('resize', calcLines);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calcLines);
    };
  }, [bracketData]); // Re-run when bracket structure changes

  return (
    <div className="w-full h-full overflow-auto bg-[#0b0c0f] p-8" ref={containerRef}>
      <div className="relative min-w-max" ref={contentRef}>
        
        {/* SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {lines}
        </svg>

        <div className="flex gap-20 relative z-10 pb-20">
          {BRACKET_ORDER.map((round) => (
            <div key={round} className="w-64 shrink-0 flex flex-col justify-around">
              <div className="text-center mb-8">
                <span className="bg-[#1c222b] px-3 py-1 rounded text-[10px] font-bold text-zinc-400 border border-zinc-800 tracking-widest uppercase shadow-sm">
                  {round}
                </span>
              </div>

              <div className="flex flex-col justify-around gap-8 h-full">
                {bracketData[round].map((match) => (
                  <BracketMatch 
                    key={match.id}
                    match={match}
                    team1={getTeam(match.team1Id)}
                    team2={getTeam(match.team2Id)}
                    onClick={() => onMatchClick(match)}
                    setRef={(el) => {
                      if (el) matchRefs.current.set(match.id, el);
                      else matchRefs.current.delete(match.id);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bracket;
