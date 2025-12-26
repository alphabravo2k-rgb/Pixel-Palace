import React, { useEffect, useState } from 'react';
// ✅ FIX: Correct imports for the 'admin' folder depth
import { useAdminConsole } from '../../hooks/useAdminConsole'; 
import { supabase } from '../../supabase/client';
import { RosterIntegrityControl } from './RosterIntegrityControl';
import { PlayerRow } from '../roster/PlayerRow';
import { Users, AlertTriangle } from 'lucide-react';

export const AdminRosterReview = ({ tournamentId }) => {
  const { execute, loading } = useAdminConsole();
  const [teams, setTeams] = useState([]);
  const [viewLoading, setViewLoading] = useState(true);

  const fetchRosters = async () => {
    if (!tournamentId) return;
    setViewLoading(true);
    
    // 🛡️ DATA FETCH: Standard Supabase call
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id, 
        name, 
        logo_url,
        players (
          id, username, role, faceit_elo, discord_id
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('name');

    if (!error) setTeams(data || []);
    setViewLoading(false);
  };

  useEffect(() => {
    fetchRosters();
  }, [tournamentId]);

  if (viewLoading) return <div className="p-8 text-center text-zinc-500 animate-pulse">Scanning Roster Database...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-['Teko'] uppercase text-zinc-400">Roster Integrity Audit</h2>
         <button onClick={fetchRosters} className="text-xs text-fuchsia-500 hover:text-white underline">Refresh Data</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden">
            {/* Team Header */}
            <div className="bg-black/40 p-3 border-b border-white/5 flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-200">{team.name}</span>
              <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                {team.players?.length || 0} MEMBERS
              </span>
            </div>

            {/* Players List */}
            <div className="divide-y divide-white/5">
              {team.players && team.players.length > 0 ? (
                team.players.map(player => (
                  <div key={player.id} className="p-2 flex items-center justify-between group hover:bg-white/5 transition-colors">
                    {/* Reusing PlayerRow for consistent visuals */}
                    <div className="flex-1 min-w-0">
                       <PlayerRow player={player} isHovered={false} />
                    </div>
                    
                    {/* 🛡️ ADMIN CONTROLS: Only visible here */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-white/5">
                       <RosterIntegrityControl 
                          player={player} 
                          teamId={team.id} 
                          onUpdate={fetchRosters} 
                       />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-red-500/50 text-xs font-mono flex flex-col items-center gap-2">
                   <AlertTriangle className="w-4 h-4" />
                   EMPTY ROSTER
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
