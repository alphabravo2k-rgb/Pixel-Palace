import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import StatsCard from '../StatsCard';
import { Search, RefreshCw, ShieldCheck, ShieldAlert, Users } from 'lucide-react';

export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    // ⚡ Fetch Teams and just COUNT the members ID
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (id) 
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
    } else {
      setTeams(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Filter Logic
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Logic
  const totalPlayers = teams.reduce((acc, team) => acc + (team.team_members?.length || 0), 0);
  const fullRosters = teams.filter(t => (t.team_members?.length || 0) >= 5).length;

  return (
    <div className="space-y-6">
      
      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Teams" value={teams.length} type="teams" />
        <StatsCard title="Active Operators" value={totalPlayers} type="players" />
        <StatsCard title="Combat Ready (5+)" value={fullRosters} type="pending" />
      </div>

      {/* CONTROLS */}
      <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-lg border border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search roster..." 
            className="bg-black/50 border border-zinc-700 rounded text-sm pl-10 pr-4 py-2 focus:outline-none focus:border-fuchsia-500 text-white w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={fetchTeams}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs uppercase font-bold text-zinc-300 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left">
          <thead className="bg-black/40 border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
            <tr>
              <th className="p-4">Identity</th>
              <th className="p-4">Region</th>
              <th className="p-4">Squad Size</th>
              <th className="p-4">Access Protocol</th>
              <th className="p-4">Readiness</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTeams.map((team) => {
               const rosterCount = team.team_members?.length || 0;
               const isReady = rosterCount >= 5;

               return (
              <tr key={team.id} className="hover:bg-white/5 transition-colors group">
                
                {/* Team Name & Logo */}
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-black flex items-center justify-center border border-zinc-700 overflow-hidden">
                    <img 
                        src={team.logo_url} 
                        alt={team.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = `https://ui-avatars.com/api/?name=${team.name}&background=18181b&color=71717a`;
                        }}
                    />
                  </div>
                  <span className="font-bold text-white font-['Teko'] text-xl tracking-wide">{team.name}</span>
                </td>

                {/* Region */}
                <td className="p-4">
                  <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {team.region || 'GLOBAL'}
                  </span>
                </td>

                {/* Roster Count */}
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${isReady ? 'text-zinc-500' : 'text-red-500'}`} />
                    <span className={`text-lg font-bold font-['Teko'] ${!isReady ? 'text-red-500' : 'text-white'}`}>
                      {rosterCount} <span className="text-zinc-600 text-sm">/ 6</span>
                    </span>
                  </div>
                </td>

                {/* Access Code (Shows Badge if VIP) */}
                <td className="p-4">
                  {team.access_code ? (
                    <span className="flex items-center gap-2 text-yellow-500 text-[10px] uppercase font-bold px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded w-fit">
                      <ShieldCheck className="w-3 h-3" />
                      VIP: {team.access_code}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs italic font-mono">Public Slot</span>
                  )}
                </td>

                {/* Status */}
                <td className="p-4">
                   {isReady ? (
                     <div className="flex items-center gap-2 text-green-400 text-xs uppercase font-bold tracking-wider">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                       Deployed
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-red-500 text-xs uppercase font-bold tracking-wider">
                       <ShieldAlert className="w-3 h-3" />
                       Incomplete
                     </div>
                   )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        
        {filteredTeams.length === 0 && !loading && (
          <div className="p-12 text-center text-zinc-500 font-mono text-sm">
            NO SIGNALS DETECTED.
          </div>
        )}
      </div>
    </div>
  );
};
