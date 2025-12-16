import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useTournament } from '../tournament/useTournament';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Tv, Lock, Trophy, AlertTriangle, Map as MapIcon, Shield, AlertOctagon, Calendar, Loader2 } from 'lucide-react';

// --- CONFIGURATION ---
const BRACKET_ORDER = ['R32', 'R16', 'QF', 'SF', 'GF'];
const ROUND_MAP = { 1: 'R32', 2: 'R16', 3: 'QF', 4: 'SF', 5: 'GF' };
const ROUND_STRUCTURE = { 'R32': 16, 'R16': 8, 'QF': 4, 'SF': 2, 'GF': 1 };

// --- PURE LOGIC HELPERS ---

const parseScore = (score) => {
  if (!score || typeof score !== 'string' || score.includes('Decision')) return ['-', '-'];
  const parts = score.match(/\d+/g) || []; 
  return [(parts[0] || '-'), (parts[1] || '-')];
};

const formatSchedule = (match) => {
  const timeStr = match.start_time || match.metadata?.start_time;
  if (!timeStr) return "TBD"; 

  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return "TBD";

  const now = new Date();
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

// Data Normalizer: Assigns matchIndex if missing to prevent dropped matches
const normalizeMatches = (matches) => {
  const counters = {};

  return matches.map(match => {
    const roundLabel = ROUND_MAP[match.round];
    
    // If round is unknown, we can't place it, so return as is (will be dropped later)
    if (!roundLabel) return match;

    // If matchIndex is missing or invalid, assign the next available slot for this round
    if (match.matchIndex == null) {
      counters[roundLabel] = (counters[roundLabel] || 0);
      const newIndex = counters[roundLabel]++;
      return {
        ...match,
        matchIndex: newIndex
      };
    }

    // If matchIndex exists, respect it but track count to avoid collisions if mixed data
    counters[roundLabel] = Math.max((counters[roundLabel] || 0), match.matchIndex + 1);
    return match;
  });
};

// Bracket Engine: Deterministic Slot Filling with Guards
const buildBracketStructure = (matches) => {
  const groups = {};
  
  // Initialize rounds with empty slots based on structure
  BRACKET_ORDER.forEach(round => {
    const totalSlots = ROUND_STRUCTURE[round];
    groups[round] = Array(totalSlots).fill(null).map((_, index) => ({
      id: `slot-${round}-${index}`, // Stable ID for React keys
      round,
      matchIndex: index,
      isDummy: true,
      status: 'scheduled',
      display_id: `M${index + 1}`
    }));
  });

  // Hydrate with real matches safely
  matches.forEach(match => {
    const roundLabel = ROUND_MAP[match.round];
    
    // Safety Guard: Check if round exists and index is valid
    if (
        groups[roundLabel] && 
        match.matchIndex != null && 
        match.matchIndex >= 0 && 
        match.matchIndex < groups[roundLabel].length
    ) {
      // Replace dummy with real match
      groups[roundLabel][match.matchIndex] = {
        ...match,
        isDummy: false
      };
    } else {
        console.warn('Invalid match placement detected:', match);
    }
  });

  return groups;
};

// Domain Logic: Derive Status Flags
const getMatchStatus = (match) => {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const hasDispute = match.metadata?.dispute;
  const needsAdmin = match.metadata?.needs_admin;
  const isVetoing = isLive && match.vetoState?.phase !== 'complete';

  let borderColor = 'border-zinc-800';
  let shadow = '';
  let statusStrip = 'bg-zinc-800';
  let Icon = null;
  let label = null;
  let textClass = 'text-zinc-600';

  if (needsAdmin) {
      borderColor = 'border-red-500';
      shadow = 'shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      statusStrip = 'bg-red-500 animate-pulse';
      Icon = AlertOctagon;
      label = 'SOS';
      textClass = 'text-red-500 animate-pulse';
  } else if (hasDispute) {
      borderColor = 'border-yellow-500';
      shadow = 'shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      statusStrip = 'bg-yellow-500 animate-pulse';
      Icon = AlertTriangle;
      label = 'DISPUTE';
      textClass = 'text-yellow-500 animate-pulse';
  } else if (isLive) {
      borderColor = 'border-green-500';
      shadow = 'shadow-[0_0_15px_rgba(34,197,94,0.15)]';
      statusStrip = 'bg-green-500 animate-pulse';
      // Icon handled in JSX for live state
  } else if (isCompleted) {
      borderColor = 'border-zinc-700';
      statusStrip = 'bg-zinc-700';
  }

  return { isLive, isCompleted, isVetoing, borderColor, shadow, statusStrip, Icon, label, textClass };
};

// --- SUB-COMPONENTS ---

const BracketMatch = ({ match, team1, team2, onClick, setRef, isFocus }) => {
  const [scoreA, scoreB] = parseScore(match.score);
  const scheduleText = formatSchedule(match);
  const { isLive, isCompleted, isVetoing, borderColor, shadow, statusStrip, Icon, label, textClass } = getMatchStatus(match);
  const winnerId = match.winnerId;

  // Safe Click Handler
  const handleClick = () => {
    if (!match.isDummy && onClick) onClick(match);
  };

  // CAPTAIN LOCK: If not my match, dim it significantly
  const opacityClass = isFocus ? 'opacity-100' : 'opacity-20 grayscale cursor-not-allowed';

  return (
    <div 
      ref={setRef}
      onClick={isFocus ? handleClick : undefined}
      className={`
        w-full relative bg-[#15191f] border rounded-lg transition-all duration-300 group z-10
        ${borderColor} ${shadow} ${opacityClass}
        ${match.isDummy ? 'opacity-30 cursor-default border-dashed' : isFocus ? 'cursor-pointer hover:border-zinc-600 hover:scale-[1.02]' : ''}
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
        <div className={`px-3 py-1.5 flex justify-between items-center border-t ${label ? 'border-zinc-800/50 bg-black/20' : 'border-zinc-800/50 bg-[#0b0c0f]/50'} rounded-b-lg`}>
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
            {Icon && (
                <div className={`flex items-center gap-1 ${textClass}`}>
                    <Icon className="w-3 h-3" />
                    <span className="text-[9px] font-bold tracking-wider">{label}</span>
                </div>
            )}
            
            {isVetoing && (
                <div className="flex items-center gap-1 text-blue-400">
                    <MapIcon className="w-3 h-3" />
                    <span className="text-[9px] font-bold tracking-wider">VETO</span>
                </div>
            )}

            {isLive && (
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    <span className="text-[9px] font-bold text-green-500 tracking-wider">LIVE</span>
                </div>
            )}

            {match.status === 'scheduled' && !Icon && (
                <Lock className="w-3 h-3 text-zinc-600" />
            )}

            {match.stream_url && <Tv className="w-3 h-3 text-purple-500" />}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

const Bracket = ({ onMatchClick }) => {
  const { matches, teams, loading } = useTournament();
  const { session } = useSession(); // Access session for Role Logic
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const svgRef = useRef(null);
  const matchRefs = useRef(new Map());
  const [connections, setConnections] = useState([]); // Store path data, not full SVG logic

  // 1. O(1) Team Lookup
  const teamMap = useMemo(() => {
    const map = new Map();
    teams.forEach(t => map.set(t.id, t));
    return map;
  }, [teams]);

  const getTeam = (teamId) => teamMap.get(teamId) || { name: 'TBD', logo_url: null };

  // 2. Compute Bracket Structure (Memoized with Normalization)
  const bracketData = useMemo(() => {
      // Step A: Normalize matches to ensure every match has a valid index
      const safeMatches = normalizeMatches(matches || []);
      // Step B: Build the structure using safe data
      return buildBracketStructure(safeMatches);
  }, [matches]);

  // CAPTAIN LOCK MODE LOGIC
  const isCaptain = session.role === ROLES.CAPTAIN;
  const myTeamId = session.teamId;

  // 3. Declarative Line Drawing (Phase 4 Fix)
  useLayoutEffect(() => {
    if (!contentRef.current || !containerRef.current) return;

    let animationFrameId;

    const updateLines = () => {
      // If component unmounted or hidden, skip
      if (!contentRef.current) return;

      const newConnections = [];
      const parentRect = contentRef.current.getBoundingClientRect();
      
      for (let i = 0; i < BRACKET_ORDER.length - 1; i++) {
        const roundA = BRACKET_ORDER[i];
        const roundB = BRACKET_ORDER[i+1];
        
        const matchesA = bracketData[roundA];
        const matchesB = bracketData[roundB];

        matchesB.forEach((matchB, idxB) => {
          // Logic: Match B connects to Match A1 (2*idx) and Match A2 (2*idx + 1)
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

            // Calculate coordinates relative to the content wrapper.
            // Using Element.getBoundingClientRect delta ensures we are scroll-independent relative to the wrapper.
            const startX = rectA1.right - parentRect.left;
            const endX = rectB.left - parentRect.left;
            
            const yA1 = (rectA1.top + rectA1.height / 2) - parentRect.top;
            const yA2 = (rectA2.top + rectA2.height / 2) - parentRect.top;
            const yB = (rectB.top + rectB.height / 2) - parentRect.top;

            const midX = startX + (endX - startX) / 2;

            // Create Path String
            const d = `M ${startX} ${yA1} H ${midX} V ${yA2} H ${startX} M ${midX} ${yB} H ${endX}`;
            newConnections.push({ key: `${roundA}-${idxB}`, d });
          }
        });
      }
      setConnections(newConnections);
    };

    // Throttled Update Loop
    const handleResize = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateLines);
    };

    // Initial calculation
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(contentRef.current);
    
    // We also observe the container just in case resizing the window changes layout
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [bracketData]); 

  // Loading State
  if (loading && (!matches || matches.length === 0)) {
      return (
          <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-zinc-600" />
              <p className="text-xs uppercase tracking-widest font-bold">Syncing Tournament Data...</p>
          </div>
      );
  }

  if (!loading && (!matches || matches.length === 0)) {
      return (
        <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 gap-4">
            <Trophy className="w-12 h-12 opacity-20" />
            <p className="text-sm tracking-widest uppercase font-bold">No matches found</p>
        </div>
      );
  }

  return (
    <div className="w-full h-full overflow-auto bg-[#0b0c0f] p-8" ref={containerRef}>
      {/* Content Wrapper scales with content */}
      <div className="relative min-w-max" ref={contentRef}>
        
        {/* Declarative SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map(conn => (
            <path 
                key={conn.key} 
                d={conn.d} 
                stroke="#52525b" 
                strokeWidth="1.5" 
                fill="none" 
            />
          ))}
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
                {bracketData[round].map((match) => {
                    // Logic: If Captain, is this MY match?
                    // Captain sees all matches but non-relevant ones are dimmed (opacityClass logic inside BracketMatch)
                    // Or strict lock mode: only clickable if my match
                    const isMyMatch = isCaptain ? (match.team1Id === myTeamId || match.team2Id === myTeamId) : true;
                    
                    // Admin or Spectator sees everything active
                    // Captain sees everything but focus is on theirs
                    
                    return (
                      <BracketMatch 
                        key={match.id} 
                        match={match}
                        team1={getTeam(match.team1Id)}
                        team2={getTeam(match.team2Id)}
                        isFocus={isMyMatch || !isCaptain} // Only dim if I am a captain AND it's not my match
                        onClick={() => onMatchClick(match)}
                        setRef={(el) => {
                          if (el) matchRefs.current.set(match.id, el);
                          else matchRefs.current.delete(match.id);
                        }}
                      />
                    );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bracket;
