import React from 'react';
import { useTournament } from '../tournament/useTournament';
import { Users, Shield, Crown, Globe, AlertCircle } from 'lucide-react';

const ROLE_LABELS = {
  CAPTAIN: 'Captain',
  PLAYER: 'Player',
  SUBSTITUTE: 'Sub'
};

const TeamRoster = () => {
  const { teams, loading } = useTournament();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
        <div className="w-8 h-8 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold tracking-widest uppercase">Loading teams...</p>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4 border border-dashed border-zinc-800 rounded-xl">
        <Users className="w-12 h-12 opacity-20" />
        <p className="text-sm font-bold tracking-widest uppercase">No teams registered</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map(team => {
        // 1. HARDENING: Normalize players array to prevent crashes
        const players = Array.isArray(team.players) ? team.players : [];
        
        // 2. DEFENSIVE: Check for data integrity issues
        const captainCount = players.filter(p => p.role === 'CAPTAIN').length;

        return (
          <div key={team.id} className="bg-[#15191f] border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-fuchsia-600 transition-colors"></div>
             
             {/* Header */}
             <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-tight">{team.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase bg-black/30 px-1.5 py-0.5 rounded">Seed #{team.seed_number}</span>
                      {team.region && (
                        <span className="text-[10px] text-zinc-500 font-mono uppercase bg-black/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                           <Globe className="w-3 h-3" /> {team.region}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
             </div>

             {/* Warnings (Admin Visibility) */}
             {captainCount > 1 && (
                <div className="mb-3 flex items-center gap-2 text-[10px] text-red-400 bg-red-900/10 border border-red-900/30 p-2 rounded">
                   <AlertCircle className="w-3 h-3" />
                   Multiple captains detected (Audit required)
                </div>
             )}

             {/* Roster List */}
             <div className="space-y-1">
                {players.length > 0 ? (
                    players.map(p => (
                      <div key={`${team.id}-${p.uid}`} className="flex items-center justify-between text-xs bg-[#0b0c0f]/50 p-2 rounded border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-zinc-300">
                          {p.role === 'CAPTAIN' && <Crown className="w-3 h-3 text-yellow-500" />}
                          {p.role === 'SUBSTITUTE' && <span className="text-[9px] bg-zinc-700 px-1 rounded text-zinc-400">SUB</span>}
                          
                          {/* 3. IDENTITY: Support future 'display_name' format (PL(BSV)Name) */}
                          <span className={p.role === 'CAPTAIN' ? 'font-bold text-white' : ''}>
                             {p.display_name || p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                           {p.rank && <span className="text-zinc-600 font-mono text-[9px] uppercase">LVL {p.rank}</span>}
                        </div>
                      </div>
                    ))
                ) : (
                    <div className="text-xs text-zinc-600 italic p-2 text-center border border-dashed border-zinc-800 rounded">
                      {team.players === undefined
                        ? 'Roster unavailable (Sync Error)'
                        : 'Roster pending...'}
                    </div>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamRoster;
