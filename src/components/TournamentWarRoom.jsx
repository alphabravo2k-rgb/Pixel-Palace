import React from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { Loader2, ShieldAlert, Trophy, RefreshCw, Play } from 'lucide-react';
import { can } from '../lib/permissions';
import { PERM_CAPABILITIES } from '../lib/permissions.actions';
import { BracketView } from './BracketView';

export const TournamentWarRoom = () => {
  const { session, loading: authLoading } = useSession();
  const { selectedTournamentId, tournamentData, lifecycle } = useTournament();
  const { execute, loading: opsLoading } = useAdminConsole();

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-fuchsia-500" /></div>;

  // 🛡️ PERMISSION CHECK
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

  // --- ⚡ ACTIONS ---
  
  const handleSync = async () => {
     // Placeholder for future Discord sync integration
     alert("Roster data is currently synchronized with the registration system.");
  };

  const handleGenerate = async () => {
    if (!selectedTournamentId) return;
    
    // ⚠️ CRITICAL WARNING
    const confirm = window.confirm("⚠️ WARNING: This will WIPE all current matches and generate a new bracket based on registered teams. Continue?");
    if (!confirm) return;

    // 🚀 EXECUTE DATABASE ENGINE
    const result = await execute('admin_generate_bracket', { 
        p_tournament_id: selectedTournamentId 
    });

    if (result.success) {
        // Success feedback
        console.log("Generation Stats:", result.data);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      {/* 🎛️ COMMAND BAR */}
      <div className="p-4 border-b border-white/5 bg-black/60 flex items-center justify-between backdrop-blur-md">
         <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500 w-5 h-5" />
            <div>
               <h2 className="text-lg font-['Teko'] uppercase font-bold tracking-wide leading-none">{tournamentData?.name || 'Command Center'}</h2>
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

      {/* 📊 THE VIEWPORT */}
      <div className="flex-1 relative bg-black">
        <BracketView />
      </div>
    </div>
  );
};
