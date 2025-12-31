import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { 
  ArrowUpRight, 
  Minus, 
  Search, 
  RefreshCw, 
  Shield, 
  Swords, 
  Trophy, 
  User, 
  LogOut 
} from 'lucide-react'; // ✅ FIX: Added missing icons

// Sub-component: Stats Card
const StatsCard = ({ title, value, type }) => {
  const isPositive = type === 'teams' || type === 'players';
  
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
          {title}
        </span>
        {isPositive ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : (
          <Minus className="w-4 h-4 text-zinc-600" />
        )}
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold font-['Teko'] text-white">
          {value}
        </span>
      </div>
    </div>
  );
};

export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
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

      if (error) throw error;

      // Flatten data structure
      const formatted = data?.map(team => ({
        ...team,
        members: team.team_members.map(tm => ({
          id: tm.id,
          role: tm.role,
          username: tm.global_identities?.display_name || 'Unknown',
          discord: tm.global_identities?.discord_handle
        }))
      }));

      setTeams(formatted || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load roster data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlayers = teams.reduce((acc, team) => acc + (team.members?.length || 0), 0);
  const readyTeams = teams.filter(t => (t.members?.length || 0) >= 5).length;

  return (
    <div className="space-y-6">
      {/* HUD Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Teams" value={teams.length} type="teams" />
        <StatsCard title="Active Operators" value={totalPlayers} type="players" />
        <StatsCard title="Combat Ready (5+)" value={readyTeams} type="pending" />
      </div>

      {/* Toolbar */}
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

      {error && (
        <div className="p-4 text-center text-red-500 bg-red-900/10 border border-red-900/50 rounded">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredTeams.map(team => (
          <div key={team.id} className="bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden">
            <div className="bg-black/40 p-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={team.logo_url || "https://via.placeholder.com/40"} 
                  className="w-8 h-8 rounded bg-black object-cover" 
                  alt={team.name}
                />
                <span className="font-bold text-sm text-zinc-200">{team.name}</span>
              </div>
              <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                {team.members?.length || 0} / 6
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {team.members && team.members.length > 0 ? (
                team.members.map(member => (
                  <div key={member.id} className="p-2 flex items-center justify-between group hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${member.role === 'CAPTAIN' ? 'bg-yellow-500' : 'bg-zinc-600'}`}></div>
                      <span className="text-zinc-300">{member.username}</span>
                    </div>
                    {/* Placeholder for future Actions (Kick/Promote) */}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-red-500/50 text-xs font-mono flex flex-col items-center gap-2">
                  <Shield className="w-4 h-4" /> EMPTY SQUAD
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
