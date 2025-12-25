import React from 'react';
import { Play, RefreshCw, AlertTriangle, Trophy } from 'lucide-react';

// ✅ UP ONE LEVEL IMPORTS
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { useSession } from '../auth/useSession';

export const TournamentWarRoom = () => {
  const { selectedTournamentId, tournamentData } = useTournament();
  const { generateBracket, syncRegistrations, loading } = useAdminConsole();
  const { can } = useSession();

  // Guard Clause
  if (!selectedTournamentId) return null;

  const canManage = can('CAN_MANAGE_BRACKET', { tournamentId: selectedTournamentId });
  const isSetupPhase = tournamentData?.status?.toLowerCase() === 'setup';

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <div>
          <h3 className="font-['Teko'] text-2xl uppercase tracking-wide text-white leading-none">
            Tournament Operations
          </h3>
          <p className="text-xs text-zinc-500 font-mono">
             Status: <span className="text-white">{tournamentData?.status || 'UNKNOWN'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sync Controls */}
        <div className="p-4 bg-black/40 rounded border border-white/5">
          <h4 className="font-bold text-zinc-300 mb-2 uppercase text-xs tracking-wider">Roster Sync</h4>
          <p className="text-[10px] text-zinc-500 mb-4">
            Pulls raw registration data and normalizes it into Teams/Players tables.
          </p>
          <button
            onClick={() => syncRegistrations(selectedTournamentId)}
            disabled={!canManage || !isSetupPhase || loading}
            className={`
              flex items-center justify-center gap-2 w-full py-3 rounded uppercase font-bold text-sm transition-all
              ${!isSetupPhase 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
            `}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
            {loading ? 'Syncing...' : 'Sync Rosters'}
          </button>
        </div>

        {/* Bracket Controls */}
        <div className="p-4 bg-black/40 rounded border border-white/5">
          <h4 className="font-bold text-zinc-300 mb-2 uppercase text-xs tracking-wider">Bracket Logic</h4>
           <p className="text-[10px] text-zinc-500 mb-4">
            Generates the seeding and match nodes based on current roster.
          </p>
          <button
            onClick={() => generateBracket(selectedTournamentId)}
            disabled={!canManage || !isSetupPhase || loading}
            className={`
              flex items-center justify-center gap-2 w-full py-3 rounded uppercase font-bold text-sm transition-all
              ${!isSetupPhase 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/20'}
            `}
          >
            {isSetupPhase ? <Play className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} 
            {loading ? 'Processing...' : 'Generate Bracket'}
          </button>
        </div>
      </div>
    </div>
  );
};
