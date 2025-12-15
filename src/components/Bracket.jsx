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

  // Helper to get team name safely
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'TBD';
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

  return (
    <div className="flex-grow overflow-x-auto overflow-y-hidden p-8 flex gap-12 items-start min-w-full">
      {BRACKET_ORDER.map(round => (
        <div key={round} className="w-72 shrink-0 flex flex-col gap-4 relative">
          
          {/* Round Header */}
          <div className="text-center mb-4 sticky top-0 z-10">
            <span className="bg-[#1c222b] px-4 py-1.5 rounded-full text-[10px] font-bold text-zinc-400 border border-zinc-800 tracking-widest uppercase shadow-sm">
              {round}
            </span>
          </div>

          {/* Matches List */}
          <div className="flex flex-col gap-4">
            {bracketData[round] && bracketData[round].length > 0 ? (
              bracketData[round].map(match => {
                const [scoreA, scoreB] = parseScore(match.score);
                const isLive = match.status === 'live';
                const isCompleted = match.status === 'completed';
                const isWinner1 = isCompleted && match.winnerId === match.team1Id;
                const isWinner2 = isCompleted && match.winnerId === match.team2Id;

                return (
                  <div 
                    key={match.id} 
                    onClick={() => onMatchClick(match)}
                    className={`
                      relative bg-[#15191f] border rounded-lg cursor-pointer transition-all duration-300 group hover:scale-[1.02] 
                      ${isLive ? 'border-l-4 border-l-green-500 border-y-zinc-800 border-r-zinc-800 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-zinc-800 hover:border-zinc-600'}
                      ${match.status === 'scheduled' ? 'opacity-75 hover:opacity-100' : ''}
                    `}
                  >
                    <div className="p-4 space-y-3">
                      {/* Team 1 */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-4 rounded-full ${isWinner1 ? 'bg-green-500' : 'bg-zinc-700'}`}></div> 
                          <span className={`font-bold text-sm truncate max-w-[120px] ${isWinner1 ? "text-green-400" : "text-zinc-200"}`}>
                            {getTeamName(match.team1Id)}
                          </span>
                        </div>
                        <span className={`font-mono text-sm ${isLive ? 'text-white' : 'text-zinc-500'}`}>{scoreA}</span>
                      </div>

                      <div className="w-full h-px bg-zinc-800/50"></div>

                      {/* Team 2 */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-4 rounded-full ${isWinner2 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                          <span className={`font-bold text-sm truncate max-w-[120px] ${isWinner2 ? "text-green-400" : "text-zinc-200"}`}>
                            {getTeamName(match.team2Id)}
                          </span>
                        </div>
                        <span className={`font-mono text-sm ${isLive ? 'text-white' : 'text-zinc-500'}`}>{scoreB}</span>
                      </div>
                    </div>

                    {/* Footer / Info Bar */}
                    <div className="bg-[#0b0c0f]/50 px-3 py-2 flex justify-between items-center border-t border-zinc-800 rounded-b-lg">
                      <span className="text-[9px] font-mono text-zinc-600">
                        {match.display_id || `MATCH #${match.matchIndex + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {match.stream_url && <Tv className="w-3 h-3 text-purple-500 animate-pulse"/>}
                        {isLive && (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                            <span className="text-[9px] font-bold text-green-500">LIVE</span>
                          </div>
                        )}
                        {match.status === 'scheduled' && <Lock className="w-3 h-3 text-zinc-600"/>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty Slot / TBD Placeholder
              <div className="h-24 border border-dashed border-zinc-800/50 rounded-lg flex flex-col items-center justify-center gap-2 opacity-30">
                <Shield className="w-5 h-5 text-zinc-600"/>
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">TBD</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Bracket;
