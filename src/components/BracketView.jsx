import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client'; // Ensure you have this configured

export const BracketView = ({ tournamentId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the "Full Tree" from Supabase
  useEffect(() => {
    const fetchBracket = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id, round, slot, display_id, state, 
          team1:team1_id(name, seed_number), 
          team2:team2_id(name, seed_number),
          winner_id
        `)
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('slot', { ascending: true });

      if (error) console.error('Error fetching bracket:', error);
      else setMatches(data);
      setLoading(false);
    };

    fetchBracket();
  }, [tournamentId]);

  if (loading) return <div className="text-white">Loading Bracket...</div>;

  // 2. Group Matches by Round
  const rounds = matches.reduce((acc, match) => {
    const r = match.round;
    if (!acc[r]) acc[r] = [];
    acc[r].push(match);
    return acc;
  }, {});

  return (
    <div className="flex gap-10 overflow-x-auto p-10 bg-[#0a0a0c] min-h-screen">
      {Object.keys(rounds).map((roundNum) => (
        <div key={roundNum} className="flex flex-col justify-center gap-8 min-w-[250px]">
          <h3 className="text-zinc-500 font-bold text-center uppercase tracking-widest mb-4">
            Round {roundNum}
          </h3>
          
          {rounds[roundNum].map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      ))}
    </div>
  );
};

// 3. The Match Card Component
const MatchCard = ({ match }) => {
  const isPlaceholder = !match.team1 || !match.team2;
  
  return (
    <div className={`relative w-64 border rounded-md p-3 flex flex-col gap-2 
      ${match.state === 'live' ? 'border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'border-white/10 bg-zinc-900/50'}
    `}>
      {/* Header */}
      <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-mono">
        <span>{match.display_id}</span>
        <span className={match.state === 'live' ? 'text-red-500 animate-pulse' : ''}>
          {match.state}
        </span>
      </div>

      {/* Team 1 */}
      <TeamRow team={match.team1} isWinner={match.winner_id === match.team1?.id} />
      
      {/* VS Divider */}
      <div className="h-px w-full bg-white/5" />

      {/* Team 2 */}
      <TeamRow team={match.team2} isWinner={match.winner_id === match.team2?.id} />
    </div>
  );
};

const TeamRow = ({ team, isWinner }) => (
  <div className={`flex justify-between items-center ${isWinner ? 'text-green-400 font-bold' : 'text-zinc-300'}`}>
    <span className="truncate text-sm">
      {team ? team.name : <span className="text-zinc-600 italic">Waiting...</span>}
    </span>
    {team && <span className="text-[10px] bg-zinc-800 px-1 rounded text-zinc-500">#{team.seed_number}</span>}
  </div>
);
