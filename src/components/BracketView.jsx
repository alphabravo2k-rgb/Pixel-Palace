import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { Trophy, Clock, Monitor, Shield, AlertTriangle } from 'lucide-react';
import { MatchModal } from './MatchModal';

/**
 * BracketView Component
 * Renders the tournament bracket tree.
 */
export const BracketView = () => {
  const { matches, teams, loading, error, refresh } = useTournament();
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    const roundKey = match.round;
    if (!acc[roundKey]) acc[roundKey] = [];
    acc[roundKey].push(match);
    return acc;
  }, {});

  const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));

  if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading Bracket Structure...</div>;
  if (error) return <div className="p-12 text-center text-red-500 border border-red-900 bg-red-900/10 rounded">Bracket Error: {error}</div>;
  if (matches.length === 0) return <div className="p-12 text-center text-zinc-500 border border-zinc-800 border-dashed rounded">No matches scheduled. Waiting for Generation.</div>;

  return (
    <div className="w-full overflow-x-auto pb-12 custom-scrollbar">
      <div className="flex gap-16 min-w-max px-8 pt-8">
        {roundKeys.map((round) => (
          <div key={round} className="flex flex-col justify-around gap-8 min-w-[280px]">
            
            {/* ROUND HEADER */}
            <div className="text-center pb-4 border-b border-zinc-800 mb-4">
              <h3 className="text-zinc-400 font-black uppercase tracking-widest text-sm font-['Teko']">
                Round {round}
              </h3>
            </div>

            {/* MATCH CARDS */}
            {rounds[round].map((match) => {
              const team1 = teams.find(t => t.id === match.team1_id);
              const team2 = teams.find(t => t.id === match.team2_id);
              
              const isLive = match.state === 'live';
              const isCompleted = match.state === 'completed';

              return (
                <div 
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`
                    relative flex flex-col bg-zinc-900/80 border transition-all cursor-pointer group
                    ${isLive ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-zinc-800 hover:border-zinc-600'}
                    rounded w-full
                  `}
                >
                  {/* STATUS BADGE */}
                  <div className="absolute -top-3 right-2 flex gap-2">
                    {isLive && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                        <Monitor className="w-3 h-3" /> LIVE
                      </span>
                    )}
                    {match.best_of > 1 && (
                      <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-700">
                        BO{match.best_of}
                      </span>
                    )}
                  </div>

                  {/* TEAM 1 */}
                  <div className={`p-3 flex justify-between items-center border-b border-zinc-800/50 ${match.winner_id === match.team1_id ? 'bg-green-900/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      {team1?.logo_url ? (
                        <img src={team1.logo_url} className="w-6 h-6 object-contain" alt="" />
                      ) : (
                        <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] text-zinc-500">?</div>
                      )}
                      <span className={`font-bold text-sm ${match.winner_id === match.team1_id ? 'text-green-400' : 'text-zinc-300'}`}>
                        {team1?.name || 'TBD'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white">{match.team1_score}</span>
                  </div>

                  {/* TEAM 2 */}
                  <div className={`p-3 flex justify-between items-center ${match.winner_id === match.team2_id ? 'bg-green-900/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      {team2?.logo_url ? (
                        <img src={team2.logo_url} className="w-6 h-6 object-contain" alt="" />
                      ) : (
                        <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] text-zinc-500">?</div>
                      )}
                      <span className={`font-bold text-sm ${match.winner_id === match.team2_id ? 'text-green-400' : 'text-zinc-300'}`}>
                        {team2?.name || 'TBD'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white">{match.team2_score}</span>
                  </div>

                  {/* HOVER HINT */}
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <span className="text-xs font-bold text-white uppercase tracking-widest border border-white/20 px-3 py-1 rounded">Manage Match</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* MATCH MODAL (Admin Controls) */}
      {selectedMatch && (
        <MatchModal 
          match={selectedMatch} 
          teams={teams}
          onClose={() => { setSelectedMatch(null); refresh(); }} 
        />
      )}
    </div>
  );
};

// ✅ CRITICAL FIX: Default Export for Router Compatibility
export default BracketView;
