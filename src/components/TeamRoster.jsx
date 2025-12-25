import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../../tournament/useTournament'; // 🛑 NEW: Scope Source
import { Users, Loader2, Shield } from 'lucide-react';

export const TeamRoster = () => {
  // 1. Get Context (The Scope)
  const { selectedTournamentId, loading: contextLoading } = useTournament();
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 🛑 2. PREVENT LEAKS
    // If no tournament is selected, do NOT fetch data.
    if (!selectedTournamentId) return;

    const fetchRoster = async () => {
      setLoading(true);
      try {
        // 🛑 3. SCOPED QUERY
        // strictly filter by tournament_id
        const { data, error } = await supabase
          .from('teams')
          .select(`
            *,
            players (*)
          `)
          .eq('tournament_id', selectedTournamentId) // <--- CRITICAL FIX
          .order('name', { ascending: true });

        if (error) throw error;
        setTeams(data || []);
      } catch (err) {
        console.error("Roster Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [selectedTournamentId]);

  if (contextLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!selectedTournamentId) {
    return <div className="p-8 text-center text-zinc-500">No Tournament Active</div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-4">
        <Users className="w-6 h-6 text-fuchsia-500" />
        <h2 className="text-2xl font-bold text-white font-['Teko'] uppercase tracking-wider">
          Active Roster
        </h2>
        <span className="ml-auto text-xs font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded">
          {teams.length} TEAMS DEPLOYED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors">
            {/* Team Header */}
            <div className="p-4 bg-black/40 flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700">
                {team.logo_url ? (
                  <img src={team.logo_url} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-5 h-5 text-zinc-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white uppercase tracking-wide text-sm">{team.name}</h3>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">
                  Seed #{team.seed_number || '-'}
                </span>
              </div>
            </div>

            {/* Players List */}
            <div className="p-4 space-y-2">
              {team.players?.length > 0 ? (
                team.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between text-xs group">
                    <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {player.gamertag || player.name || 'Unknown'}
                    </span>
                    {player.role === 'CAPTAIN' && (
                      <span className="text-[9px] bg-fuchsia-900/20 text-fuchsia-500 px-1.5 py-0.5 rounded border border-fuchsia-500/20">
                        CPT
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-[10px] text-zinc-700 italic">
                  Roster Pending...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
