import React, { useState } from 'react';
import { Search, Shield, ChevronRight, AlertCircle } from 'lucide-react';
import { useTournament } from '../tournament/useTournament'; // <--- IMPORT THIS

const TeamRoster = () => {
  const { teams, loading } = useTournament(); // <--- USE REAL DATA
  const [filter, setFilter] = useState('');

  if (loading) return <div className="text-zinc-500 font-mono text-xs animate-pulse">Downloading Roster...</div>;

  const filteredTeams = teams.filter(t => 
    (t.name || '').toLowerCase().includes(filter.toLowerCase()) || 
    (t.tag || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom">
      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="relative w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#ff5500] transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH DATABASE..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-[#0b0c0f] border border-zinc-800 text-zinc-300 text-xs font-mono py-2 pl-10 pr-4 focus:outline-none focus:border-[#ff5500] transition-colors placeholder:text-zinc-700"
          />
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          {filteredTeams.length} Active Squads
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="p-8 border border-zinc-800 border-dashed text-center">
            <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-500 font-mono text-xs">NO TEAMS FOUND IN DATABASE</p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
            <div key={team.id} className="bg-[#0b0c0f] border border-zinc-800 p-5 hover:border-zinc-600 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#ff5500] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase">{team.name}</h3>
                    <span className="text-[10px] font-mono text-[#ff5500] bg-[#ff5500]/10 px-2 py-0.5 rounded-sm">
                    [{team.tag}]
                    </span>
                </div>
                <Shield className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>

                <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500 font-mono uppercase w-16">Captain</span>
                    <span className="text-white font-bold tracking-wide flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                    {team.captain || 'N/A'}
                    </span>
                </div>
                
                <div className="space-y-1">
                    <span className="text-[10px] text-zinc-600 font-mono uppercase block mb-1">Roster</span>
                    <div className="flex flex-wrap gap-2">
                    {/* Handle JSONB array or text array from Supabase */}
                    {(Array.isArray(team.players) ? team.players : []).map(p => (
                        <span key={p} className="text-xs text-zinc-400 bg-zinc-900 px-2 py-1 border border-zinc-800">
                        {p}
                        </span>
                    ))}
                    </div>
                </div>
                </div>

                <button className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-2 text-[10px] font-black uppercase tracking-widest border border-zinc-800 transition-colors flex items-center justify-center gap-2 group-hover:border-zinc-600">
                View Profile <ChevronRight className="w-3 h-3" />
                </button>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TeamRoster;
