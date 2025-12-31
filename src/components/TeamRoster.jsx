import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  ArrowUpRight, Minus, Search, RefreshCw, Shield, 
  User, Crown, AlertTriangle, Users 
} from 'lucide-react';

// --- CONFIG: MILITARY HIERARCHY ---
const ROLE_WEIGHT = {
  'CAPTAIN': 1,
  'PLAYER': 2,
  'SUBSTITUTE': 3,
  'COACH': 4
};

const getRoleWeight = (role) => ROLE_WEIGHT[role] || 99;

const StatsCard = ({ title, value, type }) => {
  const isGood = type === 'teams' || type === 'players';
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">{title}</span>
        {isGood ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <Minus className="w-4 h-4 text-zinc-600" />}
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold font-['Teko'] text-white">{value}</span>
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
          id, name, logo_url, region, access_code, seed_number,
          team_members (
            id, role,
            global_identities (id, display_name, discord_handle)
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      // --- LOGIC: PROCESS & SORT ROSTER ---
      const formatted = data?.map(team => {
        const sortedMembers = team.team_members.map(tm => ({
          id: tm.id,
          role: tm.role?.toUpperCase() || 'PLAYER', 
          username: tm.global_identities?.display_name || 'Unknown',
          discord: tm.global_identities?.discord_handle
        })).sort((a, b) => {
            // 1. Sort by Role Priority (Captain First)
            const weightA = getRoleWeight(a.role);
            const weightB = getRoleWeight(b.role);
            if (weightA !== weightB) return weightA - weightB;
            
            // 2. Sort Alphabetically if Roles are same
            return a.username.localeCompare(b.username);
        });

        return { ...team, members: sortedMembers };
      });

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
        {filteredTeams.map(team => {
          const playerCount = team.members?.length || 0;
          
          // 🚦 Status Colors
          let statusColor = "border-zinc-800"; 
          let statusBadge = null;

          if (playerCount < 5) {
            statusColor = "border-red-600/50 shadow-[0_0_10px_rgba(220,38,38,0.1)]";
            statusBadge = <span className="text-red-500 flex items-center gap-1 font-bold"><AlertTriangle size={10} /> INCOMPLETE ({playerCount}/5)</span>;
          } else if (playerCount > 6) {
            statusColor = "border-yellow-600/50";
            statusBadge = <span className="text-yellow-500 flex items-center gap-1 font-bold"><Users size={10} /> OVER LIMIT ({playerCount})</span>;
          }

          return (
            <div key={team.id} className={`bg-zinc-900/50 border rounded-lg overflow-hidden transition-all ${statusColor}`}>
              <div className="bg-black/40 p-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-black flex items-center justify-center border border-white/10 overflow-hidden">
                    {team.logo_url ? (
                      <img src={team.logo_url} className="w-full h-full object-cover" alt={team.name} />
                    ) : (
                      <Shield className="w-4 h-4 text-zinc-700" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-zinc-200 leading-none">{team.name}</div>
                    <div className="text-[10px] text-zinc-600 font-mono mt-1 flex gap-2">
                        {team.seed_number ? <span>SEED #{team.seed_number}</span> : <span>UNRANKED</span>}
                        {statusBadge}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${playerCount < 5 ? 'bg-red-900/20 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {playerCount} / 6
                </span>
              </div>
              
              <div className="divide-y divide-white/5">
                {team.members && team.members.length > 0 ? (
                  team.members.map((member, idx) => {
                    // Logic: If role is explicitly SUB, or if they are the 6th/7th player and NOT captain
                    const isCaptain = member.role === 'CAPTAIN';
                    const isExplicitSub = member.role === 'SUBSTITUTE';
                    // If we have > 5 players, the extra ones are visually treated as subs if they aren't captains
                    const isOverflow = idx >= 5 && !isCaptain; 
                    const isSubVisual = isExplicitSub || isOverflow;

                    return (
                      <div key={member.id} className={`p-2 flex items-center justify-between group hover:bg-white/5 transition-colors ${isSubVisual ? 'bg-black/20' : ''}`}>
                        <div className="flex items-center gap-2 text-sm">
                          {isCaptain ? (
                             <Crown className="w-3.5 h-3.5 text-yellow-500" />
                          ) : (
                             <div className={`w-1.5 h-1.5 rounded-full ${isSubVisual ? 'bg-zinc-700' : 'bg-green-500'}`}></div>
                          )}
                          <span className={`${isCaptain ? 'text-white font-bold' : isSubVisual ? 'text-zinc-500 italic' : 'text-zinc-300'}`}>
                            {member.username}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                            {isCaptain && <span className="text-[9px] font-bold text-yellow-600 bg-yellow-900/10 px-1 rounded border border-yellow-900/20">CPT</span>}
                            {isSubVisual && <span className="text-[9px] font-bold text-zinc-600 bg-zinc-900 px-1 rounded border border-zinc-800">SUB</span>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-red-500/50 text-xs font-mono flex flex-col items-center gap-2">
                    <Shield className="w-4 h-4" /> EMPTY SQUAD
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
