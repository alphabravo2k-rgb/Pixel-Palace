import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { Users, Loader2, Shield, Crown } from 'lucide-react';

export const TeamRoster = () => {
  const { selectedTournamentId, loading: contextLoading } = useTournament();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedTournamentId) return;

    const fetchRosterData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Teams + Members + Identity (3-Level Join)
        const { data, error } = await supabase
          .from('teams')
          .select(`
            id, name, logo_url, seed_number,
            members:team_members (
                id, role,
                identity:global_identities (
                    display_name, avatar_url
                )
            )
          `)
          .eq('tournament_id', selectedTournamentId)
          .order('name', { ascending: true });

        if (error) throw error;

        // 2. Format & Sort
        const formatted = data.map(team => {
            const roster = team.members.map(m => ({
                membership_id: m.id,
                role: m.role,
                is_captain: m.role === 'CAPTAIN',
                display_name: m.identity?.display_name,
                avatar_url: m.identity?.avatar_url
            }));

            // Sort: Captains first
            roster.sort((a, b) => (a.is_captain === b.is_captain) ? 0 : a.is_captain ? -1 : 1);

            return { ...team, roster };
        });

        setTeams(formatted);

      } catch (err) {
        console.error("Roster Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRosterData();
  }, [selectedTournamentId]);

  if (contextLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!selectedTournamentId) {
    return <div className="p-8 text-center text-zinc-500 font-mono">SELECT TOURNAMENT</div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-fuchsia-500/10 rounded-full">
                <Users className="w-6 h-6 text-fuchsia-500" />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-white font-['Teko'] uppercase tracking-widest">
                Active Roster
                </h2>
                <p className="text-zinc-500 text-xs font-mono mt-1">CONFIRMED COMBATANTS</p>
            </div>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded">
          {teams.length} UNITS
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="group bg-[#0f0f11] border border-zinc-800/60 rounded-lg overflow-hidden hover:border-zinc-600 transition-all duration-300">
            
            {/* Team Header */}
            <div className="p-4 bg-zinc-900/30 flex items-center gap-4 border-b border-white/5">
              <div className="w-12 h-12 bg-[#050505] rounded flex-shrink-0 flex items-center justify-center border border-zinc-800 group-hover:border-fuchsia-500/30 transition-colors">
                {team.logo_url ? (
                  <img src={team.logo_url} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <Shield className="w-5 h-5 text-zinc-700" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white uppercase tracking-wide text-sm truncate font-['Rajdhani']">
                    {team.name}
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">
                  Seed #{team.seed_number || 'UNRANKED'}
                </span>
              </div>
            </div>

            {/* Players List */}
            <div className="p-4 space-y-2.5">
              {team.roster?.length > 0 ? (
                team.roster.map((player) => (
                  <div key={player.membership_id} className="flex items-center justify-between text-xs group/player">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {player.avatar_url ? (
                                <img src={player.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[9px] text-zinc-500">{player.display_name?.charAt(0)}</span>
                            )}
                        </div>
                        <span className={`transition-colors ${player.is_captain ? 'text-white font-bold' : 'text-zinc-400 group-hover/player:text-zinc-300'}`}>
                        {player.display_name || 'Unknown Agent'}
                        </span>
                    </div>
                    
                    {player.is_captain && (
                      <span className="flex items-center gap-1 text-[9px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                        <Crown size={10} /> CPT
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-[10px] text-zinc-700 italic border border-dashed border-zinc-800 rounded">
                  Pending Registration...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
