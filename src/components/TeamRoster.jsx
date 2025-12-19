import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Search, Shield, ChevronRight, Users } from 'lucide-react';

const TeamRoster = () => {
  const { teams, loading } = useTournament();
  const [filter, setFilter] = useState('');

  if (loading) return <div className="text-zinc-500 font-mono text-xs animate-pulse p-12 text-center uppercase tracking-widest">Accessing Registry...</div>;

  // 1. DATA SAFETY: Ensure teams is an array and filter out placeholders
  const teamList = Array.isArray(teams) ? teams : [];
  const realTeams = teamList.filter(t => t && t.status === 'REGISTERED');
  
  const totalSlots = 32;
  const filledSlots = realTeams.length;

  const filteredTeams = realTeams.filter(t => 
    (t.name || '').toLowerCase().includes(filter.toLowerCase()) || 
    (t.tag || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
        <div>
           <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">Active Roster</h2>
           <p className="text-zinc-500 font-mono text-[10px] tracking-[0.2em]">OFFICIAL_REGISTRATION_DATABASE</p>
        </div>
        
        <div className="w-full md:w-64">
           <div className="flex justify-between text-[9px] font-mono uppercase mb-2 tracking-widest">
              <span className="text-[#ff5500]">Deployment Active</span>
              <span className="text-zinc-400">{filledSlots} / {totalSlots} Units</span>
           </div>
           <div className="h-1 bg-zinc-900 w-full overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-[#ff5500] shadow-[0_0_8px_rgba(255,85,0,0.5)] transition-all duration-1000" 
                style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
              />
           </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#ff5500] transition-colors" />
        <input 
          type="text" 
          placeholder="SEARCH_REGISTRY..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-[#0b0c0f] border border-zinc-800 text-zinc-300 text-xs font-mono py-3 pl-10 pr-4 focus:outline-none focus:border-[#ff5500]/50 transition-colors placeholder:text-zinc-800"
        />
      </div>

      {filteredTeams.length === 0 ? (
        <div className="p-12 border border-zinc-900 bg-black/20 text-center rounded-sm">
            <Users className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em]">No Authorized Squads Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => {
              // SAFETY: Ensure players is always an array before mapping
              const playerArray = Array.isArray(team.players) ? team.players : [];
              const captain = playerArray.find(p => p.is_captain)?.name || 'UNASSIGNED';

              return (
                <div key={team.id} className="bg-[#0b0c0f] border border-zinc-800 p-5 hover:border-zinc-700 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-[#ff5500] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                          <h3 className="text-lg font-black text-white italic tracking-tighter uppercase truncate">{team.name || 'UNKNOWN_UNIT'}</h3>
                          <span className="text-[9px] font-mono text-[#ff5500] tracking-[0.2em] opacity-80">
                          [{team.tag || 'TBA'}]
                          </span>
                      </div>
                      <Shield className="w-4 h-4 text-zinc-800 group-hover:text-[#ff5500]/50 transition-colors" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] border-b border-zinc-900 pb-2">
                          <span className="text-zinc-600 font-mono uppercase">Command</span>
                          <span className="text-zinc-200 font-bold tracking-widest uppercase">
                            {captain}
                          </span>
                      </div>
                      
                      <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {playerArray.slice(0, 5).map((p, i) => (
                                <span key={p.id || i} className="text-[9px] font-mono text-zinc-500 bg-zinc-900/50 px-2 py-1 border border-zinc-800/50 uppercase">
                                  {p.name || 'OPERATOR'}
                                </span>
                            ))}
                            {playerArray.length > 5 && (
                                <span className="text-[9px] font-mono text-zinc-700 px-1 py-1">+{playerArray.length - 5}</span>
                            )}
                          </div>
                      </div>
                    </div>

                    <button className="w-full mt-6 bg-zinc-900/50 hover:bg-[#ff5500]/10 text-zinc-600 hover:text-[#ff5500] py-2 text-[9px] font-black uppercase tracking-[0.3em] border border-zinc-800 hover:border-[#ff5500]/30 transition-all flex items-center justify-center gap-2 group">
                      Unit_Details <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default TeamRoster;
