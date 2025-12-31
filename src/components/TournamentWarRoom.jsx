import React from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { Loader2, ShieldAlert, Trophy, RefreshCw, Play } from 'lucide-react';
import { can } from '../lib/permissions'; // ✅ Added
import { PERM_CAPABILITIES } from '../lib/permissions.actions'; // ✅ Added
import { BracketView } from './BracketView'; // ✅ Added

export const TournamentWarRoom = () => {
  const { session, loading: authLoading } = useSession();
  const { selectedTournamentId, tournamentData, lifecycle } = useTournament();
  const { execute, loading: opsLoading } = useAdminConsole(); // Use execute directly

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-fuchsia-500" /></div>;

  // Permission Check
  if (!can(PERM_CAPABILITIES.MANAGE_TOURNAMENT, session)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 p-8 text-center">
        <ShieldAlert className="w-16 h-16 mb-4 animate-pulse" />
        <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Unauthorized</h1>
        <p className="text-zinc-500 font-mono text-sm">Access Denied to War Room.</p>
      </div>
    );
  }

  const isSetupPhase = ['SETUP', 'SEEDING', 'REGISTRATION'].includes(lifecycle?.status);
  const isLive = ['ACTIVE', 'LIVE', 'PLAYOFFS'].includes(lifecycle?.status);

  // Temporary handlers for missing RPCs
  const handleSync = () => alert("Sync Logic requires 'admin_sync_rosters' RPC (Currently disabled).");
  const handleGenerate = () => alert("Bracket Logic requires 'admin_generate_bracket' RPC (Currently disabled).");

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-black/60 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500 w-5 h-5" />
            <div>
               <h2 className="text-lg font-['Teko'] uppercase font-bold tracking-wide leading-none">{tournamentData?.name || 'Loading...'}</h2>
               <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
                 <span className="text-[10px] text-zinc-500 font-mono">STATUS: {lifecycle?.status || 'UNKNOWN'}</span>
               </div>
            </div>
         </div>

         <div className="flex gap-2">
            <button 
               onClick={handleSync}
               disabled={!isSetupPhase || opsLoading}
               className={`px-4 py-2 border rounded text-xs font-bold uppercase flex items-center gap-2 transition-all ${isSetupPhase ? 'bg-blue-600/20 text-blue-400 border-blue-600/50 hover:bg-blue-600/40' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50'}`}
            >
               <RefreshCw size={14} className={opsLoading ? 'animate-spin' : ''} /> Sync Roster
            </button>
            <button 
               onClick={handleGenerate}
               disabled={!isSetupPhase || opsLoading}
               className={`px-4 py-2 border rounded text-xs font-bold uppercase flex items-center gap-2 transition-all ${isSetupPhase ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/50 hover:bg-fuchsia-600/40' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50'}`}
            >
               <Play size={14} /> Generate Bracket
            </button>
         </div>
      </div>

      <div className="flex-1 relative">
        <BracketView />
      </div>
    </div>
  );
};
