import React from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { BracketView } from './BracketView';
import { ShieldAlert, Loader2, Play, RefreshCw, Trophy } from 'lucide-react';

// You can keep AdminToolbar separated, or embed controls directly if simpler
import { AdminToolbar } from './admin/AdminToolbar'; 

export const TournamentWarRoom = () => {
  const { session, can, loading: authLoading } = useSession();
  const { selectedTournamentId, tournamentData } = useTournament();
  const { syncRegistrations, generateBracket, loading: opsLoading } = useAdminConsole();

  // 1. Loading State
  if (authLoading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-fuchsia-500" /></div>;

  // 2. PERMISSION CHECK: Explicit & Loud
  // Don't just disable buttons. If they can't manage, they shouldn't see the War Room.
  const hasAccess = can && can('MANAGE_TOURNAMENT', { tournamentId: selectedTournamentId });

  if (!hasAccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 p-8 text-center">
        <ShieldAlert className="w-16 h-16 mb-4 animate-pulse" />
        <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Unauthorized Access</h1>
        <p className="text-zinc-500 font-mono text-sm max-w-md">
          Your credentials do not grant access to the War Room for Tournament ID: {selectedTournamentId || 'Unknown'}.
        </p>
      </div>
    );
  }

  // 3. Render The Control Center
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      
      {/* Top Bar: Operations */}
      <div className="p-4 border-b border-white/5 bg-black/60 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500 w-5 h-5" />
            <div>
               <h2 className="text-lg font-['Teko'] uppercase font-bold tracking-wide leading-none">{tournamentData?.name}</h2>
               <span className="text-[10px] text-zinc-500 font-mono">STATUS: {tournamentData?.status}</span>
            </div>
         </div>

         <div className="flex gap-2">
            <button 
                onClick={() => syncRegistrations(selectedTournamentId)}
                disabled={opsLoading}
                className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded text-xs font-bold uppercase hover:bg-blue-600/40 transition-all flex items-center gap-2"
            >
                <RefreshCw size={14} className={opsLoading ? 'animate-spin' : ''} /> Sync Roster
            </button>
            <button 
                onClick={() => generateBracket(selectedTournamentId)}
                disabled={opsLoading}
                className="px-4 py-2 bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-600/50 rounded text-xs font-bold uppercase hover:bg-fuchsia-600/40 transition-all flex items-center gap-2"
            >
                <Play size={14} /> Generate Bracket
            </button>
         </div>
      </div>
      
      {/* Main View */}
      <div className="flex-1 relative">
        <BracketView />
      </div>
    </div>
  );
};
