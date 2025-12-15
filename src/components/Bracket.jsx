import React, { useMemo } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Tv, Lock, Shield, Trophy } from 'lucide-react';

// Configuration matches your "Command Center" logic
const BRACKET_ORDER = ['R32', 'R16', 'QF', 'SF', 'GF'];
// Maps SQL round numbers (1, 2, 3...) to Display Labels
const ROUND_MAP = { 1: 'R32', 2: 'R16', 3: 'QF', 4: 'SF', 5: 'GF' };

const Bracket = ({ onMatchClick }) => {
  const { matches, teams } = useTournament();

  // Group flat matches into rounds for the column view
  const bracketData = useMemo(() => {
    const groups = BRACKET_ORDER.reduce((acc, round) => ({ ...acc, [round]: [] }), {});
    
    matches.forEach(match => {
      const roundLabel = ROUND_MAP[match.round];
      if (groups[roundLabel]) {
        groups[roundLabel].push(match);
      }
    });
    
    return groups;
  }, [matches]);

  // Helper to get team data safely
  const getTeam = (teamId) => {
    return teams.find(t => t.id === teamId) || { name: 'TBD', logo_url: null };
  };

  // Helper to parse score "13-10" -> ["13", "10"]
  const parseScore = (score) => {
    if (!score || typeof score !== 'string' || score.includes('Decision')) return ['-', '-'];
    const parts = score.match(/\d+/g) || []; 
    return [(parts[0] || '-'), (parts[1] || '-')];
  };

  if (matches.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
            <Trophy className="w-12 h-12 opacity-20" />
            <p className="text-sm tracking-widest uppercase font-bold">No matches scheduled yet</p>
        </div>
    );
  }

  // --- SVG CONNECTOR COMPONENT ---
  const Connector = ({ type }) => {
      // Basic SVG paths to draw lines between columns
      // Type 'straight' for simple connections, 'fork' for converging
      if (type === 'fork') {
          return (
            <svg className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-6 h-full pointer-events-none overflow-visible z-0" style={{ height: 'calc(100% + 2rem)' }}>
                <path d="M0,50 L12,50 L12,50" stroke="#3f3f46" strokeWidth="2" fill="none" /> 
            </svg>
          );
      }
      return null;
  };

  return (
    <div className="flex-grow overflow-x-auto overflow-y-hidden p-8 flex gap-16 items-center min-w-full">
      {BRACKET_ORDER.map((round, roundIdx) => (
        <div key={round} className="w-80 shrink-0 flex flex-col justify-center gap-8 relative">
          
          {/* Round Header */}
          <div className="text-center mb-6 absolute top-0 w-full -mt-12">
            <span className="bg-[#1c222b] px-4 py-1.5 rounded-full text-[10px] font-bold text-zinc-400 border border-zinc-800 tracking-widest uppercase shadow-sm">
              {round}
            </span>
          </div>

          {/* Matches List */}
          <div className={`flex flex-col ${round === 'GF' ? 'justify-center' : 'justify-around'} gap-12 h-full py-10`}>
            {bracketData[round] && bracketData[round].length > 0 ? (
              bracketData[round].map((match, matchIdx) => {
                const [scoreA, scoreB] = parseScore(match.score);
                const isLive = match.status === 'live';
                const isCompleted = match.status === 'completed';
                const isWinner1 = isCompleted && match.winnerId === match.team1Id;
                const isWinner2 = isCompleted && match.winnerId === match.team2Id;
                
                const team1 = getTeam(match.team1Id);
                const team2 = getTeam(match.team2Id);

                return (
                  <div key={match.id} className="relative flex items-center">
                    
                    {/* The Match Card */}
                    <div 
                        onClick={() => onMatchClick(match)}
                        className={`
                        w-full relative bg-[#15191f] border rounded-xl cursor-pointer transition-all duration-300 group hover:scale-[1.02] z-10
                        ${isLive ? 'border-l-4 border-l-green-500 border-y-zinc-800 border-r-zinc-800 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-zinc-800 hover:border-zinc-600'}
                        ${match.status === 'scheduled' ? 'opacity-75 hover:opacity-100' : ''}
                        `}
                    >
                        <div className="p-4 space-y-3">
                        {/* Team 1 */}
                        <div className="flex justify-between items-center group/team">
                            <div className="flex items-center gap-3">
                                {team1.logo_url ? (
                                    <img src={team1.logo_url} alt={team1.name} className="w-6 h-6 object-contain rounded-sm bg-black/20" />
                                ) : (
                                    <div className={`w-1 h-4 rounded-full ${isWinner1 ? 'bg-green-500' : 'bg-zinc-700'}`}></div> 
                                )}
                                <span className={`font-bold text-sm truncate max-w-[140px] ${isWinner1 ? "text-green-400" : "text-zinc-200"}`}>
                                    {team1.name}
                                </span>
                            </div>
                            <span className={`font-mono text-sm font-bold ${isLive ? 'text-white' : 'text-zinc-500'} ${isWinner1 ? 'text-green-400' : ''}`}>{scoreA}</span>
                        </div>

                        <div className="w-full h-px bg-zinc-800/50"></div>

                        {/* Team 2 */}
                        <div className="flex justify-between items-center group/team">
                            <div className="flex items-center gap-3">
                                {team2.logo_url ? (
                                    <img src={team2.logo_url} alt={team2.name} className="w-6 h-6 object-contain rounded-sm bg-black/20" />
                                ) : (
                                    <div className={`w-1 h-4 rounded-full ${isWinner2 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                                )}
                                <span className={`font-bold text-sm truncate max-w-[140px] ${isWinner2 ? "text-green-400" : "text-zinc-200"}`}>
                                    {team2.name}
                                </span>
                            </div>
                            <span className={`font-mono text-sm font-bold ${isLive ? 'text-white' : 'text-zinc-500'} ${isWinner2 ? 'text-green-400' : ''}`}>{scoreB}</span>
                        </div>
                        </div>

                        {/* Footer / Info Bar */}
                        <div className="bg-[#0b0c0f]/50 px-3 py-2 flex justify-between items-center border-t border-zinc-800 rounded-b-xl">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                            {match.display_id || `M${match.matchIndex + 1}`}
                        </span>
                        <div className="flex items-center gap-2">
                            {match.stream_url && <Tv className="w-3 h-3 text-purple-500 animate-pulse"/>}
                            {isLive && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                                <span className="text-[9px] font-bold text-green-500 tracking-wider">LIVE</span>
                            </div>
                            )}
                            {match.status === 'scheduled' && <Lock className="w-3 h-3 text-zinc-600"/>}
                        </div>
                        </div>
                    </div>

                    {/* Connecting Lines Logic */}
                    {round !== 'GF' && (
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-zinc-800 z-0"></div>
                    )}
                    {round !== 'R32' && (
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-zinc-800 z-0"></div>
                    )}
                    {/* Vertical connectors for pairs would go here if we calculated exact heights, 
                        but for dynamic scrolling flex lists, simple horizontal stubs are safer visually. */}
                  </div>
                );
              })
            ) : (
              // Empty Slot / TBD Placeholder
              <div className="h-32 border border-dashed border-zinc-800/50 rounded-xl flex flex-col items-center justify-center gap-2 opacity-30">
                <Shield className="w-6 h-6 text-zinc-600"/>
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Waiting for Teams</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Bracket;
