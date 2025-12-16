import React from 'react';
import { useTournament } from '../tournament/useTournament';

const TeamRoster = () => {
  const { teams, loading } = useTournament();

  if (loading) {
    return <div className="text-zinc-500 text-sm">Loading teams…</div>;
  }

  if (!teams || teams.length === 0) {
    return <div className="text-zinc-500 text-sm">No teams registered</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map(team => (
        <div key={team.id} className="bg-[#15191f] border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            {team.logo_url && (
              <img src={team.logo_url} alt="" className="w-8 h-8 object-contain" />
            )}
            <div>
              <h3 className="text-sm font-bold text-zinc-200">{team.name}</h3>
              <p className="text-[10px] text-zinc-500">Seed #{team.seed_number}</p>
            </div>
          </div>

          <ul className="space-y-1">
            {team.players && team.players.length > 0 ? (
                team.players.map(p => (
                  <li key={p.uid} className="text-xs text-zinc-400 flex justify-between">
                    <span>
                      {p.role === 'CAPTAIN' && '⭐ '}
                      {p.name}
                    </span>
                    <span className="text-zinc-600">{p.role}</span>
                  </li>
                ))
            ) : (
                <li className="text-xs text-zinc-600 italic">Roster pending...</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TeamRoster;
