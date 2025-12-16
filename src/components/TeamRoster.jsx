import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Users, Shield, Crown, Globe } from 'lucide-react';

const TeamCard = ({ team }) => {
    return (
        <div className="bg-[#15191f] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all group relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-fuchsia-600 transition-colors"></div>
            
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden">
                            {team.logo_url ? (
                                <img src={team.logo_url} className="w-full h-full object-cover" alt={team.name} />
                            ) : (
                                <Shield className="w-5 h-5 text-zinc-600" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">{team.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-zinc-500 font-mono uppercase bg-black/30 px-1.5 rounded">Seed #{team.seed_number || '?'}</span>
                                {team.region && (
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase bg-black/30 px-1.5 rounded flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> {team.region}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    {team.players && team.players.length > 0 ? (
                        team.players.map((p) => (
                            <div key={p.uid} className="flex items-center justify-between text-xs bg-[#0b0c0f]/50 p-2 rounded border border-white/5">
                                <div className="flex items-center gap-2 text-zinc-300">
                                    {p.role === 'CAPTAIN' && <Crown className="w-3 h-3 text-yellow-500" />}
                                    {p.role === 'SUBSTITUTE' && <span className="text-[9px] bg-zinc-700 px-1 rounded text-zinc-400">SUB</span>}
                                    <span>{p.name}</span>
                                </div>
                                {p.rank && <span className="text-zinc-600 font-mono text-[9px]">LVL {p.rank}</span>}
                            </div>
                        ))
                    ) : (
                        <p className="text-zinc-600 text-xs italic p-2">Roster pending...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const TeamRoster = () => {
  const { teams } = useTournament();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
        <div>
            <h2 className="text-3xl font-brand font-black text-white tracking-wide">
                REGISTERED <span className="text-fuchsia-500">TEAMS</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-1 max-w-lg">
                Official roster listing. Rosters are locked.
            </p>
        </div>
        <div className="w-full md:w-auto">
            <input 
                type="text" 
                placeholder="Search teams..." 
                className="bg-[#0b0c0f] border border-zinc-700 text-white px-4 py-2 rounded-lg w-full md:w-64 focus:border-fuchsia-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeams.length > 0 ? (
            filteredTeams.map(team => (
                <TeamCard key={team.id} team={team} />
            ))
        ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-xl">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-500">No teams found</h3>
                <p className="text-zinc-600 text-sm">Teams will appear here once imported.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TeamRoster;
