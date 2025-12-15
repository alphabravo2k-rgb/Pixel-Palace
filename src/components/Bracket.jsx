import React from 'react';
import { useTournament } from '../tournament/useTournament';

const Bracket = ({ onMatchClick }) => {
  const { matches, teams } = useTournament();

  // Simple render of matches list for this broken-down version
  // A real bracket library (like react-tournament-bracket) would be used here
  
  const getTeamName = (id) => teams.find(t => t.id === id)?.name || 'TBD';

  if (matches.length === 0) {
    return (
        <div className="text-center text-slate-500 py-12">
            No matches scheduled yet. Waiting for admin to seed.
        </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-8 justify-center p-8 overflow-x-auto">
      {matches.map(match => (
        <div 
          key={match.id} 
          onClick={() => onMatchClick(match)}
          className="w-64 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="bg-slate-900 p-2 text-center text-xs text-slate-400 uppercase tracking-wider border-b border-slate-700">
              {match.round === 1 ? 'Quarter Final' : match.round === 2 ? 'Semi Final' : 'Grand Final'}
            </div>
            <div className="p-4 space-y-3">
              <div className={`flex justify-between items-center ${match.winnerId === match.team1Id ? 'text-green-400' : 'text-white'}`}>
                <span className="font-bold truncate">{getTeamName(match.team1Id)}</span>
                {match.winnerId === match.team1Id && <span>👑</span>}
              </div>
              <div className="h-px bg-slate-700 w-full" />
              <div className={`flex justify-between items-center ${match.winnerId === match.team2Id ? 'text-green-400' : 'text-white'}`}>
                <span className="font-bold truncate">{getTeamName(match.team2Id)}</span>
                {match.winnerId === match.team2Id && <span>👑</span>}
              </div>
            </div>
            <div className="bg-slate-900/50 p-2 text-center">
              <span className={`text-xs px-2 py-1 rounded-full ${
                match.status === 'live' ? 'bg-red-900 text-red-200 animate-pulse' : 
                match.status === 'completed' ? 'bg-slate-700 text-slate-300' : 
                'bg-blue-900 text-blue-200'
              }`}>
                {match.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Bracket;
