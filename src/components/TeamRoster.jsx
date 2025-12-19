import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Search, Shield, ChevronRight, Users } from 'lucide-react';

const TeamRoster = () => {
  const { teams, loading } = useTournament();
  const [filter, setFilter] = useState('');

  if (loading) return <div className="text-zinc-500 font-mono text-xs animate-pulse">Downloading Roster...</div>;

  // 1. DATA HONESTY: Only show teams that are actually REGISTERED
  const realTeams = teams.filter(t => t.status === 'REGISTERED');
  
  // 2. STATS: Calculate based on the fixed 32-slot bracket
  const totalSlots = 32;
  const filledSlots = realTeams.length;

  const filteredTeams = realTeams.filter(t => 
    (t.name || '').toLowerCase().includes(filter.toLowerCase()) || 
    (t.tag || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
        <div>
           <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">Active Roster</h2>
           <p className="text-zinc-500 font-mono text-xs">OFFICIAL REGISTRATION DATABASE</p>
        </div>
        
        {/* PROGRESS BAR */}
        <div className="w-full md:w-64">
           <div className="flex justify-between text-[10px] font-mono uppercase mb-2">
              <span className="text-[#ff5500]">Registration Live</span>
              <span className="text-zinc-400">{filledSlots} / {totalSlots} Slots Filled</span>
           </div>
           <div className="h-1 bg-zinc-800 w-full overflow-hidden">
              <div 
                className="h-full bg-[#ff5500] transition-all duration-1000" 
                style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
              />
           </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4">
        <div className="relative flex-grow group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#ff5500] transition-colors" />
          <input 
            type="text" 
            placeholder="FIND SQUAD..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-[#0b0c0f] border border-zinc-800 text-zinc-300 text-xs font-mono py-3 pl-10 pr-4 focus:outline-none focus:border-[#ff5500] transition-colors placeholder:text-zinc-700"
          />
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="p-12 border border-zinc-800 border-dashed text-center">
            <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No Teams Found</p>
        </div>
      ) : (
        /* GRID - Only renders Real Teams */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
            <div key={team.id} className="bg-[#0b0c0f] border border-zinc-800 p-5 hover:border-zinc-600 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#ff5500] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="text-lg font-black text-white italic tracking-tighter uppercase truncate max-w-[200px]">{team.name}</h3>
                      <span className="text-[10px] font-mono text-[#ff5500] bg-[#ff5500]/10 px-2 py-0.5 rounded-sm">
                      [{team.tag || 'TAG'}]
                      </span>
                  </div>
                  <Shield className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs border-b border-zinc-900 pb-2">
                      <span className="text-zinc-500 font-mono uppercase w-16">Captain</span>
                      <span className="text-white font-bold tracking-wide flex items-center gap-1 truncate">
                        {team.captain || 'Pending'}
                      </span>
                  </div>
                  
                  <div className="space-y-1">
                      <span className="text-[10px] text-zinc-600 font-mono uppercase block mb-1">Roster</span>
                      <div className="flex flex-wrap gap-2">
                      {(Array.isArray(team.players) ? team.players : []).slice(0, 5).map((p, i) => (
                          <span key={i} className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-1 border border-zinc-800">
                          {p}
                          </span>
                      ))}
                      {(Array.isArray(team.players) ? team.players : []).length > 5 && (
                          <span className="text-[10px] text-zinc-500 px-1 py-1">+{(team.players.length - 5)}</span>
                      )}
                      </div>
                  </div>
                </div>

                <button className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-2 text-[10px] font-black uppercase tracking-widest border border-zinc-800 transition-colors flex items-center justify-center gap-2 group-hover:border-zinc-600">
                View Details <ChevronRight className="w-3 h-3" />
                </button>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TeamRoster;
