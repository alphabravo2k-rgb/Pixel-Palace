import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import StatsCard from '../StatsCard';
import { Search, RefreshCw, ShieldAlert, Users } from 'lucide-react';
import { RosterIntegrityControl } from './RosterIntegrityControl';
import { PlayerRow } from '../roster/PlayerRow';

export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    
    // Fetch Teams with nested members
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id, name, logo_url, region, access_code,
        team_members (
            id, role,
            global_identities (id, display_name, discord_handle)
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
    } else {
      // Flatten for UI
      const processed = data?.map(t => ({
          ...t,
          members: t.team_members.map(tm => ({
              id: tm.id, // This is the team_member ID needed for RosterIntegrityControl
              role: tm.role,
              username: tm.global_identities?.display_name,
              discord: tm.global_identities?.discord_handle
          }))
      }));
      setTeams(processed || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlayers = teams.reduce((acc, team) => acc + (team.members?.length || 0), 0);
  const fullRosters = teams.filter(t => (t.members?.length || 0) >= 5).length;

  return (
    <div className="space-y-6">
      
      {/* STATS */}
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

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredTeams.map((team) => (
            <div key={team.id} className="bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden">
                <div className="bg-black/40 p-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={team.logo_url || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded bg-black object-cover"/>
                        <span className="font-bold text-sm text-zinc-200">{team.name}</span>
                    </div>
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                        {team.members?.length || 0} / 6
                    </span>
                </div>

                <div className="divide-y divide-white/5">
                    {team.members && team.members.length > 0 ? (
                        team.members.map(player => (
                            <div key={player.id} className="p-2 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-1.5 h-1.5 rounded-full ${player.role === 'CAPTAIN' ? 'bg-yellow-500' : 'bg-zinc-600'}`}></div>
                                    <span className="text-zinc-300">{player.username}</span>
                                </div>
                                
                                {/* Controls appear on hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <RosterIntegrityControl 
                                        player={player} 
                                        teamId={team.id} 
                                        onUpdate={fetchTeams} 
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-red-500/50 text-xs font-mono flex flex-col items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> EMPTY SQUAD
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
