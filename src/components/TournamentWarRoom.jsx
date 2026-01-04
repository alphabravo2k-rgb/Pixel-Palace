import React, { useState } from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { Loader2, ShieldAlert, Trophy, RefreshCw, Play, AlertTriangle } from 'lucide-react';
import { can } from '../lib/permissions';
import { PERMISSIONS } from '../lib/roles'; // ✅ FIXED IMPORT
import { BracketView } from './BracketView';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Button } from '../ui/Components';

export const TournamentWarRoom = () => {
  const { session, loading: authLoading } = useSession();
  const { selectedTournamentId, tournamentData, lifecycle } = useTournament();
  const { execute, loading: opsLoading } = useAdminConsole();
  
  // Local state for specific action loaders
  const [generating, setGenerating] = useState(false);

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-bg"><Loader2 className="animate-spin text-brand" /></div>;

  // 🛡️ PERMISSION CHECK
  if (!can(PERMISSIONS.MANAGE_TOURNAMENT, session)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-bg text-red-500 p-8 text-center animate-in zoom-in-95 duration-300">
        <ShieldAlert className="w-20 h-20 mb-6 animate-pulse" />
        <h1 className="text-4xl font-display font-black uppercase tracking-widest mb-2">Unauthorized Access</h1>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-wide">Clearance Level: {session?.role || 'NONE'}</p>
        <div className="mt-8 p-4 bg-red-950/20 border border-red-900/50 rounded max-w-md">
            <p className="text-red-400 text-xs">This incident has been logged. If you believe this is an error, contact the Tournament Director.</p>
        </div>
      </div>
    );
  }

  const isSetupPhase = ['SETUP', 'SEEDING', 'REGISTRATION'].includes(lifecycle?.status);
  const isLive = ['ACTIVE', 'LIVE', 'PLAYOFFS'].includes(lifecycle?.status);

  // --- ⚡ ACTIONS ---
  
  const handleSync = async () => {
      // Placeholder for future Discord sync integration
      toast("Roster data is currently synchronized with the registration system.", {
          icon: 'ℹ️',
          style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
      });
  };

  const handleGenerate = async () => {
    if (!selectedTournamentId) return;
    
    // ⚠️ CRITICAL WARNING (Browser Native is safest here to prevent accidental clicks)
    const confirm = window.confirm("⚠️ WARNING: This will WIPE all current matches and generate a new bracket based on seeded teams.\n\nAre you sure?");
    if (!confirm) return;

    setGenerating(true);
    const result = await execute('admin_generate_bracket', { 
        p_tournament_id: selectedTournamentId 
    });
    setGenerating(false);

    if (result.success) {
        toast.success("Bracket Generated Successfully");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg text-white overflow-hidden">
      
      {/* 🎛️ COMMAND BAR */}
      <div className="h-16 px-6 border-b border-tactical bg-bg-panel/80 backdrop-blur-md flex items-center justify-between z-50">
         
         {/* Title & Status */}
         <div className="flex items-center gap-4">
            <div className="p-2 bg-brand/10 rounded border border-brand/20">
                <Trophy className="text-brand-glow w-5 h-5" />
            </div>
            <div>
               <h2 className="text-xl font-display uppercase font-bold tracking-wide leading-none text-white">
                   {tournamentData?.name || 'Command Center'}
               </h2>
               <div className="flex items-center gap-2 mt-1">
                 <span className={cn("w-1.5 h-1.5 rounded-full", isLive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500')} />
                 <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                    STATUS: <span className={isLive ? 'text-emerald-400' : 'text-zinc-500'}>{lifecycle?.status || 'OFFLINE'}</span>
                 </span>
               </div>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="flex gap-3">
            <Button 
               variant="ghost" 
               size="sm"
               onClick={handleSync}
               disabled={!isSetupPhase || opsLoading}
               className="border-zinc-800 text-zinc-400 hover:text-white"
            >
               <RefreshCw size={14} className={opsLoading ? 'animate-spin' : ''} /> 
               Sync Rosters
            </Button>
            
            <Button 
               variant={isSetupPhase ? "brand" : "secondary"}
               size="sm"
               onClick={handleGenerate}
               loading={generating}
               disabled={!isSetupPhase || opsLoading}
               title={!isSetupPhase ? "Tournament is locked" : "Generate Bracket"}
            >
               {!isSetupPhase ? <AlertTriangle size={14} /> : <Play size={14} />}
               {generating ? 'GENERATING...' : 'GENERATE BRACKET'}
            </Button>
         </div>
      </div>

      {/* 📊 THE VIEWPORT */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Bracket Engine */}
        <BracketView />
      </div>
    </div>
  );
};
