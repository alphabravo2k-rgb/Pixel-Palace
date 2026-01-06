import React from 'react';
import { cn } from '../lib/utils';
import { Trophy, Shield } from 'lucide-react';

// --- SUB-COMPONENT: MATCH NODE ---
const MatchNode = ({ match, onClick, isBye }) => {
  // 👻 GHOST NODE: If it's a Bye, render invisible spacer to maintain tree structure
  if (isBye) {
      return (
          <div className="flex items-center h-full">
             <div className="w-64 h-20 opacity-0" /> 
             {/* The line extending to the next round must still be visible? 
                 Actually, for a Bye, we usually just show the team in Round 2.
                 But to keep alignment, we need the space. */}
             <div className="w-8 h-px bg-transparent" /> 
          </div>
      );
  }

  // Determine Styling based on state
  const isWinner = (id) => match.winner_id === id && match.status === 'completed';
  const isLoser = (id) => match.winner_id && match.winner_id !== id && match.status === 'completed';

  const TeamRow = ({ teamId, team, score, isTop }) => {
      const won = isWinner(teamId);
      const lost = isLoser(teamId);
      
      return (
        <div className={cn(
            "flex justify-between items-center px-3 py-2 h-8 transition-colors",
            isTop ? "border-b border-zinc-800/50" : "",
            won ? "bg-gradient-to-r from-emerald-950/30 to-transparent text-emerald-400" : "",
            lost ? "text-zinc-600" : "text-zinc-300"
        )}>
            <div className="flex items-center gap-2 overflow-hidden">
                {team?.logo_url ? (
                    <img src={team.logo_url} className="w-4 h-4 object-contain" alt="" />
                ) : (
                    <Shield size={12} className={cn(won ? "text-emerald-500" : "text-zinc-700")} />
                )}
                <span className={cn(
                    "text-xs font-bold truncate max-w-[140px]",
                    lost && "line-through decoration-zinc-700"
                )}>
                    {team?.name || 'TBD'}
                </span>
            </div>
            <span className={cn("text-xs font-mono", won ? "text-emerald-500" : "text-zinc-500")}>
                {score ?? '-'}
            </span>
        </div>
      );
  };

  return (
    <div className="flex items-center group relative z-10">
        <div 
            onClick={() => onClick(match)}
            className={cn(
                "w-64 border rounded flex flex-col overflow-hidden transition-all cursor-pointer bg-[#09090b] shadow-lg",
                match.status === 'live' ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]" : "border-zinc-800 hover:border-zinc-500"
            )}
        >
            {/* Header */}
            <div className="flex justify-between px-3 py-1 bg-zinc-900/50 border-b border-zinc-800 text-[9px] font-mono uppercase tracking-wider">
                <span className="text-zinc-500">M{match.match_position}</span>
                {match.status === 'live' ? (
                    <span className="text-red-500 font-bold animate-pulse">● LIVE</span>
                ) : (
                    <span className="text-zinc-600">
                        {match.scheduled_at ? new Date(match.scheduled_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'SCHEDULED'}
                    </span>
                )}
            </div>

            <TeamRow teamId={match.team1_id} team={match.team1} score={match.team1_score} isTop={true} />
            <TeamRow teamId={match.team2_id} team={match.team2} score={match.team2_score} isTop={false} />
        </div>
        
        {/* Output Line (Right side) */}
        <div className="w-8 h-px bg-zinc-800 group-hover:bg-zinc-600 transition-colors" />
    </div>
  );
};

// --- MAIN COMPONENT ---
const Bracket = ({ matches, onMatchClick }) => {
  // 1. Organize Matches into Rounds
  const rounds = matches.reduce((acc, m) => {
      if (m.is_third_place) return acc; // Filter out 3rd place (handled by parent)
      if (!acc[m.round_number]) acc[m.round_number] = [];
      acc[m.round_number].push(m);
      return acc;
  }, {});

  const roundNumbers = Object.keys(rounds).sort((a,b) => Number(a) - Number(b));

  return (
    <div className="flex h-full p-12 overflow-auto items-center"> {/* Center vertically */}
       <div className="flex flex-row">
           {roundNumbers.map((roundNum, rIndex) => {
               // Sort matches by position (Top to Bottom)
               const roundMatches = rounds[roundNum].sort((a,b) => a.match_position - b.match_position);
               const isFinals = rIndex === roundNumbers.length - 1;
               
               // Dynamic Spacing Calculation
               // As rounds progress, the vertical gap grows exponentially to center nodes
               const gapMultiplier = Math.pow(2, rIndex); 
               const gapSize = gapMultiplier * 20; 

               return (
                   <div key={roundNum} className="flex flex-row">
                       {/* --- COLUMN: MATCH NODES --- */}
                       <div className="flex flex-col justify-around" style={{ gap: `${gapSize}px` }}>
                           
                           {/* Round Header */}
                           <div className="text-center pb-2 text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] border-b border-zinc-800 mb-2 opacity-30 select-none">
                               {isFinals ? "Grand Finals" : `Round ${roundNum}`}
                           </div>

                           {/* Matches */}
                           <div className="flex flex-col justify-center h-full" style={{ gap: `${gapSize}px` }}>
                               {roundMatches.map((match) => {
                                   // Logic: If a match is 'completed' in Round 1 but has NO opponent, it was a Bye.
                                   // We render it as a "Ghost" so it takes up space but isn't visible.
                                   const isBye = roundNum === '1' && match.status === 'completed' && !match.team2_id;
                                   
                                   return (
                                       <MatchNode 
                                          key={match.id} 
                                          match={match} 
                                          onClick={onMatchClick} 
                                          isBye={isBye} 
                                       />
                                   );
                               })}
                           </div>
                       </div>

                       {/* --- COLUMN: CONNECTORS (Lines) --- */}
                       {!isFinals && (
                           <div className="flex flex-col justify-center mx-2 pt-8" style={{ gap: `${gapSize}px` }}>
                               {/* Generate Pairs of connectors for the NEXT round */}
                               {/* E.g. Round 1 has 16 matches -> 8 connectors */}
                               {Array.from({ length: Math.ceil(roundMatches.length / 2) }).map((_, i) => (
                                   <div key={i} className="flex flex-col h-full w-8" style={{ height: roundMatches.length === 2 ? '50%' : `${gapSize + 110}px` }}>
                                       {/* Upper Branch (┐) */}
                                       <div className="flex-1 border-b border-r border-zinc-800 rounded-br-xl"></div>
                                       {/* Lower Branch (┘) */}
                                       <div className="flex-1 border-t border-r border-zinc-800 rounded-tr-xl"></div>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
               );
           })}
       </div>
    </div>
  );
};

export default Bracket;
