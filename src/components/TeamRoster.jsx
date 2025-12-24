import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Users } from 'lucide-react';

export const TeamRoster = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      // Fetch teams and join with players
      const { data, error } = await supabase
        .from('teams')
        .select('*, players(*)')
        .order('name');
        
      if (data) setTeams(data);
      if (error) console.error("Roster fetch error:", error);
      
      setLoading(false);
    };
    fetchTeams();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="text-zinc-500 animate-pulse font-mono">LOADING ROSTER DATA...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] p-8 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white uppercase font-['Teko'] mb-12 flex items-center gap-3 border-b border-zinc-800 pb-6">
          <Users className="text-fuchsia-500 w-8 h-8" /> 
          Active Roster
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <div key={team.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-4 mb-6 border-b border-zinc-800/50 pb-4">
                {team.logo_url ? (
                  <img src={team.logo_url} className="w-12 h-12 object-contain" alt={team.name} />
                ) : (
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 text-xs font-bold">
                    N/A
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">{team.name}</h2>
                  <p className="text-xs text-zinc-500 font-mono">SEED #{team.seed_number || '-'}</p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {team.players && team.players.length > 0 ? (
                  team.players.map(player => (
                    <li key={player.id} className="text-zinc-300 text-sm flex justify-between items-center bg-black/20 p-2 rounded">
                      <span className="font-medium">{player.display_name}</span>
                      {player.is_captain && (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded font-bold tracking-wider">
                          CPT
                        </span>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-600 italic text-sm text-center py-2">No players registered</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
