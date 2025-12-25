import React from 'react';
import { Play, RefreshCw, AlertTriangle, Trophy } from 'lucide-react';
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { useSession } from '../auth/useSession';

export const TournamentWarRoom = () => {
  const { selectedTournamentId, tournamentData } = useTournament();
  const { generateBracket, syncRegistrations, loading } = useAdminConsole();
  const { can } = useSession();

  if (!selectedTournamentId) return null;

  // Role + Scope Check
  const canManage = can('CAN_MANAGE_BRACKET', { tournamentId: selectedTournamentId });
  const isSetupPhase = tournamentData?.status === 'setup'; // Check lowercase 'setup' from DB

  const handleSync = async () => {
    if (!isSetupPhase) return;
    await syncRegistrations(selectedTournamentId);
  };

  const handleGenerate = async () => {
    if (!isSetupPhase) return;
    await generateBracket(selectedTournamentId);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="font-['Teko'] text-2xl uppercase tracking-wide text-white">Tournament Operations</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sync Controls */}
        <div className="p-4 bg-black/40 rounded border border-white/5">
          <h4 className="font-bold text-zinc-300 mb-2">Roster Sync</h4>
          <button
            onClick={handleSync}
            disabled={!canManage || !isSetupPhase || loading}
            className={`flex items-center justify-center gap-2 w-full py-2 rounded uppercase font-bold text-sm ${!isSetupPhase ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Rosters
          </button>
        </div>
        {/* Bracket Controls */}
        <div className="p-4 bg-black/40 rounded border border-white/5">
          <h4 className="font-bold text-zinc-300 mb-2">Bracket Generation</h4>
          <button
            onClick={handleGenerate}
            disabled={!canManage || !isSetupPhase || loading}
            className={`flex items-center justify-center gap-2 w-full py-2 rounded uppercase font-bold text-sm ${!isSetupPhase ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'}`}
          >
            {isSetupPhase ? <Play className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} Generate Bracket
          </button>
        </div>
      </div>
    </div>
  );
};
