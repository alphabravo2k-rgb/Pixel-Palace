import React from 'react';
import { Play, RefreshCw, AlertTriangle, Trophy } from 'lucide-react';
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { useSession } from '../auth/useSession';

/**
 * 🧩 Architecture Fix: TournamentWarRoom
 * Separated from Dashboard to handle specific Tournament Ops.
 * * 🔒 Security: 
 * - Uses useAdminConsole (no raw PINs).
 * - Checks can('CAN_MANAGE_BRACKET') before rendering sensitive buttons.
 */
export const TournamentWarRoom = () => {
  const { selectedTournamentId, tournamentData } = useTournament();
  const { generateBracket, syncRegistrations, loading } = useAdminConsole();
  const { can } = useSession();

  if (!selectedTournamentId) return null;

  // 🔒 Permission & State Check (Role + Scope + State)
  const canManage = can('CAN_MANAGE_BRACKET', { 
    tournamentId: selectedTournamentId 
  });

  const isSetupPhase = tournamentData?.status === 'SETUP';

  const handleSync = async () => {
    // 🧠 Logic: UI checks status, but Backend (via hook) must also reject if invalid.
    if (!isSetupPhase) return;
    await syncRegistrations(selectedTournamentId);
  };

  const handleGenerate = async () => {
    // ❌ Optimistic Lock: UI prevents race condition, Backend must enforce "setup" status.
    if (!isSetupPhase) return;
    await generateBracket(selectedTournamentId);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="font-['Teko'] text-2xl uppercase tracking-wide text-white">
          Tournament Operations
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SYNC ACTION */}
        <div className="p-4 bg-black/40 rounded border border-white/5">
          <h4 className="font-bold text-zinc-300 mb-2">Roster Synchronization</h4>
          <p className="text-xs text-zinc-500 mb-4">
            Pull latest teams from database. Valid only in Setup phase.
          </p>
          <button
            onClick={handleSync}
            disabled={!canManage || !isSetupPhase || loading}
            className={`
              flex items-center justify-center gap-2 w-full py-2 rounded uppercase font-bold text-sm
              ${!isSetupPhase 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'}
            `}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Rosters
          </button>
        </div>

        {/* GENERATE ACTION */}
        <div className="p-4 bg-black/40 rounded border border-white/5">
          <h4 className="font-bold text-zinc-300 mb-2">Bracket Generation</h4>
          <p className="text-xs text-zinc-500 mb-4">
            Lock seeds and generate match tree. Irreversible.
          </p>
          <button
            onClick={handleGenerate}
            disabled={!canManage || !isSetupPhase || loading}
            className={`
              flex items-center justify-center gap-2 w-full py-2 rounded uppercase font-bold text-sm
              ${!isSetupPhase 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'}
            `}
          >
            {isSetupPhase ? <Play className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            Generate Bracket
          </button>
        </div>
      </div>
    </div>
  );
};
