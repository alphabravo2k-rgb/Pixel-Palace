import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { TeamCard } from './roster/TeamCard';

const TeamRoster = () => {
  const { teams, loading, error, refreshMatches } = useTournament(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // 🛡️ GUARD: Ensure teams is an array before filtering. 
  // This prevents the white screen crash.
  const safeTeams = Array.isArray(teams) ? teams : [];
  
  const filteredTeams = safeTeams.filter(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMatches();
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) return <div className="h-96 flex flex-col items-center justify-center text-fuchsia-500 gap-4 font-mono text-xs uppercase animate-pulse tracking-[0.5em]">SYNCING...</div>;
  if (error) return <div className="p-12 text-center text-red-500 font-mono text-xs uppercase flex flex-col items-center gap-3"><AlertTriangle className="w-8 h-8" /><span>Sync Failure: {error}</span></div>;

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-700 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase font-['Teko'] drop-shadow-[0_0_10px_rgba(192,38,211,0.5)]">
                   ROSTER <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">INTEL</span>
                </h2>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] flex items-center gap-2">
                   Operational Status: {safeTeams.length} Squads Active
                   <button onClick={handleRefresh} className={`text-fuchsia-500 hover:text-white transition-colors ${refreshing ? 'animate-spin' : ''}`}>
                     <RefreshCw className="w-3 h-3" />
                   </button>
                </p>
            </div>
            <div className="w-full md:w-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" placeholder="FIND SQUAD //" 
                  className="bg-[#0b0c0f] border border-zinc-800 text-white pl-10 pr-4 py-3 rounded w-full md:w-72 focus:border-fuchsia-500/50 focus:bg-fuchsia-900/10 outline-none text-xs font-bold uppercase transition-all tracking-wider placeholder-zinc-700" 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.map(t => <TeamCard key={t.id} team={t} />)}
        </div>
    </div>
  );
};

export default TeamRoster;
