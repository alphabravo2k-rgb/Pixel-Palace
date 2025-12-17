import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useTournament } from '../tournament/useTournament';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Tv, Lock, Trophy, AlertTriangle, Map as MapIcon, Shield, AlertOctagon, Calendar, Loader2 } from 'lucide-react';

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
  if (isNaN(date.getTime())) return "TBD";
  const now = new Date();
  const diffMs = date - now;
  const diffHrs = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffHrs > 0 && diffHrs < 24 && date.getDate() === now.getDate()) return `Today ${timeString}`;
  if (diffDays === 1) return `Tmrw ${timeString}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeString}`;
};

const normalizeMatches = (matches) => {
  const counters = {};
  return matches.map(match => {
    const roundLabel = ROUND_MAP[match.round];
    if (!roundLabel) return match;
    if (match.matchIndex == null) {
      counters[roundLabel] = (counters[roundLabel] || 0);
      const newIndex = counters[roundLabel]++;
      return { ...match, matchIndex: newIndex };
    }
    counters[roundLabel] = Math.max((counters[roundLabel] || 0), match.matchIndex + 1);
    return match;
  });
};

const buildBracketStructure = (matches) => {
  const groups = {};
  BRACKET_ORDER.forEach(round => {
    const totalSlots = ROUND_STRUCTURE[round];
    groups[round] = Array(totalSlots).fill(null).map((_, index) => ({
      id: `slot-${round}-${index}`,
      round,
      matchIndex: index,
      isDummy: true,
      status: 'scheduled',
      display_id: `M${index + 1}`
    }));
  });

  matches.forEach(match => {
    const roundLabel = ROUND_MAP[match.round];
    if (groups[roundLabel] && match.matchIndex != null && match.matchIndex >= 0 && match.matchIndex < groups[roundLabel].length) {
      groups[roundLabel][match.matchIndex] = { ...match, isDummy: false };
    }
  });
  return groups;
};

const getMatchStatus = (match) => {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const hasDispute = match.metadata?.dispute;
  const needsAdmin = match.metadata?.sos_triggered;
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
  } else if (isCompleted) {
      borderColor = 'border-zinc-700';
      statusStrip = 'bg-zinc-700';
  }

  return { isLive, isCompleted, isVetoing, borderColor, shadow, statusStrip, Icon, label, textClass };
};

// --- BRACKET MATCH COMPONENT ---
const BracketMatch = ({ match, onClick, setRef, isFocus }) => {
  const [scoreA, scoreB] = parseScore(match.score);
  const scheduleText = formatSchedule(match);
  const { isLive, isCompleted, isVetoing, borderColor, shadow, statusStrip, Icon, label, textClass } = getMatchStatus(match);
  const winnerId = match.winnerId;

  const handleClick = () => { if (!match.isDummy && onClick) onClick(match); };
  const opacityClass = isFocus ? 'opacity-100' : 'opacity-20 grayscale cursor-not-allowed';

  // SAFETY: Ensure names exist to prevent crashes
  const t1Name = match.team1Name || 'TBD';
  const t2Name = match.team2Name || 'TBD';
  const t1Logo = match.team1Logo;
  const t2Logo = match.team2Logo;

  return (
    <div ref={setRef} onClick={isFocus ? handleClick : undefined}
      className={`w-full relative bg-[#15191f] border rounded-lg transition-all duration-300 group z-10 ${borderColor} ${shadow} ${opacityClass} ${match.isDummy ? 'opacity-30 cursor-default border-dashed' : isFocus ? 'cursor-pointer hover:border-zinc-600 hover:scale-[1.02]' : ''}`}>
      <div className={`h-0.5 w-full ${statusStrip}`}></div>
      <div className="p-3 flex items-center justify-between gap-4">
        <div className={`flex items-center gap-2 flex-1 min-w-0 overflow-hidden ${isCompleted && winnerId === match.team1Id ? 'text-green-400 font-bold' : isCompleted ? 'text-zinc-500 opacity-50' : 'text-zinc-300'}`}>
            {t1Logo && <img src={t1Logo} className="w-5 h-5 object-contain rounded-sm bg-black/40 flex-shrink-0" alt=""/>}
            <span className="truncate text-xs">{t1Name}</span>
            {isCompleted && winnerId === match.team1Id && <span className="text-[10px] text-zinc-500 ml-1 font-mono">{scoreA}</span>}
        </div>
        <div className="text-[10px] text-zinc-600 font-bold px-1">VS</div>
        <div className={`flex items-center gap-2 flex-1 min-w-0 overflow-hidden justify-end ${isCompleted && winnerId === match.team2Id ? 'text-green-400 font-bold' : isCompleted ? 'text-zinc-500 opacity-50' : 'text-zinc-300'}`}>
            {isCompleted && winnerId === match.team2Id && <span className="text-[10px] text-zinc-500 mr-1 font-mono">{scoreB}</span>}
            <span className="truncate text-xs text-right">{t2Name}</span>
            {t2Logo && <img src={t2Logo} className="w-5 h-5 object-contain rounded-sm bg-black/40 flex-shrink-0" alt=""/>}
        </div>
      </div>
      {!match.isDummy && (
        <div className={`px-3 py-1.5 flex justify-between items-center border-t ${label ? 'border-zinc-800/50 bg-black/20' : 'border-zinc-800/50 bg-[#0b0c0f]/50'} rounded-b-lg`}>
          <div className="flex items-center gap-1.5">
              {match.status === 'scheduled' ? (
                  <>
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span className={`text-[9px] font-bold tracking-wide ${scheduleText === 'TBD' ? 'text-zinc-600' : 'text-zinc-400'}`}>{scheduleText}</span>
                  </>
              ) : (
                  <span className="text-[9px] text-zinc-600 font-mono tracking-wider">{match.display_id || `M${match.matchIndex+1}`}</span>
              )}
          </div>
          <div className="flex gap-2 items-center">
            {Icon && <div className={`flex items-center gap-1 ${textClass}`}><Icon className="w-3 h-3" /><span className="text-[9px] font-bold tracking-wider">{label}</span></div>}
            {isVetoing && <div className="flex items-center gap-1 text-blue-400"><MapIcon className="w-3 h-3" /><span className="text-[9px] font-bold tracking-wider">VETO</span></div>}
            {isLive && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span><span className="text-[9px] font-bold text-green-500 tracking-wider">LIVE</span></div>}
            {match.status === 'scheduled' && !Icon && <Lock className="w-3 h-3 text-zinc-600" />}
            {match.stream_url && <Tv className="w-3 h-3 text-purple-500" />}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
const Bracket = ({ onMatchClick }) => {
  const { matches, teams, loading, error } = useTournament(); 
  const { session } = useSession(); 
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const svgRef = useRef(null);
  const matchRefs = useRef(new Map());
  
  const bracketData = useMemo(() => {
      const safeMatches = normalizeMatches(matches || []);
      return buildBracketStructure(safeMatches);
  }, [matches]);

  const hasTeamContext = !!session.teamId;
  const myTeamId = session.teamId;

  useLayoutEffect(() => {
    if (!contentRef.current || !containerRef.current || !svgRef.current) return;
    let animationFrameId;
    const updateLines = () => {
      if (!contentRef.current) return;
      let paths = '';
      const parentRect = contentRef.current.getBoundingClientRect();
      for (let i = 0; i < BRACKET_ORDER.length - 1; i++) {
        const roundA = BRACKET_ORDER[i];
        const roundB = BRACKET_ORDER[i+1];
        const matchesA = bracketData[roundA];
        const matchesB = bracketData[roundB];
        matchesB.forEach((matchB, idxB) => {
          const idxA1 = idxB * 2;
          const idxA2 = idxB * 2 + 1;
          const elB = matchRefs.current.get(matchB.id);
          const elA1 = matchesA[idxA1] ? matchRefs.current.get(matchesA[idxA1].id) : null;
          const elA2 = matchesA[idxA2] ? matchRefs.current.get(matchesA[idxA2].id) : null;
          if (elB && elA1 && elA2) {
            const startX = elA1.getBoundingClientRect().right - parentRect.left;
            const endX = elB.getBoundingClientRect().left - parentRect.left;
            const yA1 = (elA1.getBoundingClientRect().top + elA1.offsetHeight / 2) - parentRect.top;
            const yA2 = (elA2.getBoundingClientRect().top + elA2.offsetHeight / 2) - parentRect.top;
            const yB = (elB.getBoundingClientRect().top + elB.offsetHeight / 2) - parentRect.top;
            const midX = startX + (endX - startX) / 2;
            paths += `<path d="M ${startX} ${yA1} H ${midX} V ${yA2} H ${startX} M ${midX} ${yB} H ${endX}" stroke="#52525b" stroke-width="1.5" fill="none" />`;
          }
        });
      }
      if (svgRef.current) svgRef.current.innerHTML = paths;
    };
    const handleResize = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateLines);
    };
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(contentRef.current);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [bracketData]); 

  // --- CRITICAL ERROR DISPLAY ---
  // If useTournament returned an error (e.g. 401, RLS violation), show it here.
  if (error) {
      return (
          <div className="flex flex-col items-center justify-center h-[500px] text-red-500 gap-4">
              <AlertTriangle className="w-12 h-12" />
              <div className="text-center">
                  <p className="text-sm font-bold tracking-widest uppercase">BRACKET SYNC ERROR</p>
                  <p className="text-xs font-mono mt-2 bg-red-900/20 p-2 rounded max-w-md">{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</p>
              </div>
          </div>
      );
  }

  if (loading && (!matches || matches.length === 0)) return <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 gap-4"><Loader2 className="w-10 h-10 animate-spin" /><p className="text-xs font-bold tracking-widest">LOADING BRACKET...</p></div>;
  if (!loading && (!matches || matches.length === 0)) return <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 gap-4"><Trophy className="w-12 h-12 opacity-20" /><p className="text-sm font-bold tracking-widest">NO MATCHES FOUND</p></div>;

  return (
    <div className="w-full h-full overflow-auto bg-[#0b0c0f] p-8" ref={containerRef}>
      <div className="relative min-w-max" ref={contentRef}>
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
        <div className="flex gap-20 relative z-10 pb-20">
          {BRACKET_ORDER.map((round) => (
            <div key={round} className="w-64 shrink-0 flex flex-col justify-around">
              <div className="text-center mb-8">
                <span className="bg-[#1c222b] px-3 py-1 rounded text-[10px] font-bold text-zinc-400 border border-zinc-800 tracking-widest uppercase shadow-sm">{round}</span>
              </div>
              <div className="flex flex-col justify-around gap-8 h-full">
                {bracketData[round].map((match) => {
                    const isMyMatch = hasTeamContext ? (match.team1Id === myTeamId || match.team2Id === myTeamId) : true;
                    return (
                      <BracketMatch 
                        key={match.id} 
                        match={match}
                        team1={null} 
                        team2={null}
                        isFocus={isMyMatch || !hasTeamContext} 
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
