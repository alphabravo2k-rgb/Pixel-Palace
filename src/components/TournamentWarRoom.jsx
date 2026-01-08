import React, { useState } from 'react';
import { Loader2, ShieldAlert, Trophy, RefreshCw, Play, AlertTriangle, Wifi } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// MASTER CORE
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { can } from '../lib/security/engine';
import { PERMISSIONS } from '../lib/security/permissions';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { cn } from '../lib/utils';

// UI
import { BracketView } from './BracketView';
import { Button } from '../ui/Components';

/**
 * 🎛️ TOURNAMENT WAR ROOM
 * -----------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * PURPOSE:
 * The "God View" of the entire tournament structure.
 * * UPGRADES:
 * 1. 8D AUDIO: Heavy mechanical sounds for bracket generation.
 * 2. SECURITY VISUALS: "Access Denied" screen looks like a terminal lockout.
 */

export const TournamentWarRoom = () => {
  const { session, loading: authLoading } = useSession();
  const { selectedTournamentId, tournamentData, lifecycle } = useTournament();
  const { execute, loading: opsLoading } = useAdminConsole();
  
  // Local state for specific action loaders
  const [generating, setGenerating] = useState(false);

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-brand w-12 h-12" />
    </div>
  );

  // 🛡️ PERMISSION CHECK (Red Screen of Death)
  if (!can(PERMISSIONS.MANAGE_TOURNAMENT, session)) {
    SoundNexus.play(CUES.ERROR);
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-red-500 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
        <div className="z-10 bg-black/80 p-12 border border-red-900/50 rounded-sm backdrop-blur-xl shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <ShieldAlert className="w-20 h-20 mb-6 mx-auto animate-pulse text-red-600" />
            <h1 className="text-4xl font-display font-black uppercase tracking-widest mb-2 text-white">Unauthorized Access</h1>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wide">Clearance Level: {session?.role || 'NONE'}</p>
            <div className="mt-8 p-4 bg-red-950/20 border border-red-900/50 rounded max-w-md">
                <p className="text-red-400 text-xs font-mono">INCIDENT LOGGED: {new Date().toISOString()}</p>
                <p className="text-red-500/50 text-[10px] font-mono mt-1">IP: ::1 (LOCAL)</p>
            </div>
        </div>
      </div>
    );
  }

  const isSetupPhase = ['SETUP', 'SEEDING', 'REGISTRATION'].includes(lifecycle?.status);
  const isLive = ['ACTIVE', 'LIVE', 'PLAYOFFS'].includes(lifecycle?.status);

  // --- ⚡ ACTIONS ---
  
  const handleSync = async () => {
      SoundNexus.play(CUES.UI_CLICK);
      toast("ROSTER SYNC: PENDING DISCORD INTEGRATION", {
          icon: 'ℹ️',
          style: { background: '#18181b', color: '#fff', border: '1px solid #27272a', fontFamily: 'monospace' }
      });
  };

  const handleGenerate = async () => {
    if (!selectedTournamentId) return;
    
    SoundNexus.play(CUES.WARNING);
    
    // ⚠️ CRITICAL WARNING (Browser Native is safest here to prevent accidental clicks)
    const confirm = window.confirm("⚠️ NUCLEAR LAUNCH DETECTED\n\nThis will WIPE all current matches and generate a new bracket.\n\nProceed?");
    if (!confirm) return;

    setGenerating(true);
    SoundNexus.play(CUES.COMBAT_START); // Heavy impact sound

    const result = await execute('admin_generate_bracket', { 
        p_tournament_id: selectedTournamentId 
    });
    setGenerating(false);

    if (result.success) {
        SoundNexus.play(CUES.SUCCESS);
        toast.success("BRACKET GENERATION COMPLETE");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">
      
      {/* 🎛️ COMMAND BAR */}
      <div className="h-16 px-6 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md flex items-center justify-between z-50 shadow-2xl">
         
         {/* Title & Status */}
         <div className="flex items-center gap-4">
            <div className="p-2 bg-brand/10 rounded-sm border border-brand/20">
                <Trophy className="text-brand-glow w-5 h-5" />
            </div>
            <div>
               <h2 className="text-xl font-display uppercase font-bold tracking-wide leading-none text-white italic">
                   {tournamentData?.name || 'Command Center'}
               </h2>
               <div className="flex items-center gap-2 mt-1">
                 <span className={cn("w-1.5 h-1.5 rounded-full", isLive ? 'bg-emerald-500 animate-pulse shadow-neon-emerald' : 'bg-zinc-500')} />
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
               className={isSetupPhase ? "shadow-neon" : ""}
            >
               {!isSetupPhase ? <AlertTriangle size={14} /> : <Play size={14} />}
               {generating ? 'CALCULATING...' : 'GENERATE BRACKET'}
            </Button>
         </div>
      </div>

      {/* 📊 THE VIEWPORT */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Bracket Engine */}
        <div className="relative z-10 w-full h-full">
            <BracketView adminMode={true} />
        </div>

        {/* Overlay Stats */}
        <div className="absolute bottom-6 left-6 z-20 flex gap-4 text-[10px] font-mono text-zinc-600">
            <div className="flex items-center gap-2 bg-black/50 px-3 py-1 border border-white/5 rounded-full">
                <Wifi size={12} className={isLive ? "text-emerald-500" : "text-zinc-500"} />
                <span>UPLINK: {isLive ? "STABLE" : "STANDBY"}</span>
            </div>
        </div>
      </div>
    </div>
  );
};
