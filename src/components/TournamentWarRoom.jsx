/**
 * 🎛️ TOURNAMENT WAR ROOM: OVERSEER HUD
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // AUTHORIZED
 */

import React, { useState, useEffect } from 'react';
import { 
  Loader2, ShieldAlert, Trophy, RefreshCw, 
  Play, AlertTriangle, Wifi, Radio, Zap, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// MASTER CORE
import { useNexus } from '../hooks/useNexus';
import { useTournament } from '../tournament/useTournament';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';
import { cn } from '../lib/utils';

// UI
import { BracketView } from './BracketView';

export const TournamentWarRoom = () => {
  const { user, can, isAuthenticated, isLoading: authLoading } = useNexus();
  const { selectedTournamentId, tournamentData, lifecycle } = useTournament();
  const { execute, loading: opsLoading } = useAdminConsole();
  
  const [generating, setGenerating] = useState(false);

  // 🔊 AMBIENT INITIALIZATION
  useEffect(() => {
    if (isAuthenticated) {
      try { SoundNexus.playSpatial(CUES.UI_POWER_UP, 0); } catch(e){}
    }
  }, [isAuthenticated]);

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505] gap-4">
        <Loader2 className="animate-spin text-fuchsia-500 w-12 h-12" />
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Establishing Secure Uplink...</span>
    </div>
  );

  // 🛡️ SECURITY PROTOCOL: CONTAINMENT BREACH
  if (!can('CAP_MANAGE_TOURNAMENT')) {
    try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
    Telemetry.log(EVENTS.SECURITY, { action: 'UNAUTHORIZED_WARROOM_ACCESS', role: user?.role });
    
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020202] text-red-500 p-8 text-center relative overflow-hidden">
        {/* SCANLINES */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-20" />
        
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="z-10 bg-black/80 p-16 border-2 border-red-600 rounded-sm backdrop-blur-3xl shadow-[0_0_100px_rgba(220,38,38,0.2)] max-w-2xl"
        >
            <ShieldAlert className="w-24 h-24 mb-8 mx-auto animate-pulse text-red-600" />
            <h1 className="text-5xl font-display font-black uppercase italic tracking-tighter mb-4 text-white leading-none">Access <span className="text-red-600">Denied</span></h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] mb-10">Insufficient Clearance // Level {user?.clearance || 0}</p>
            
            <div className="p-6 bg-red-950/20 border border-red-600/30 rounded-sm text-left">
                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-2 font-mono">Incident Forensics:</p>
                <code className="text-red-500/70 text-[11px] font-mono block break-all">
                  TRACE_ID: {user?.id || 'ANON_ENTITY'}<br/>
                  TIMESTAMP: {new Date().toISOString()}<br/>
                  ORIGIN: WAR_ROOM_ENTRY_PROHIBITED
                </code>
            </div>
            
            <button 
              onClick={() => window.history.back()}
              className="mt-10 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase italic tracking-widest text-[10px] rounded-sm transition-all active:scale-95"
            >
              Abort Connection
            </button>
        </motion.div>
      </div>
    );
  }

  const isSetupPhase = ['SETUP', 'SEEDING', 'REGISTRATION'].includes(lifecycle?.status);
  const isLive = ['ACTIVE', 'LIVE', 'PLAYOFFS'].includes(lifecycle?.status);

  // --- ⚡ COMMANDS ---
  
  const handleSync = async () => {
      try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
      toast("ROSTER SYNC: PENDING COMMANDER VALIDATION", {
          icon: <Radio size={14} className="text-fuchsia-500" />,
          style: { background: '#09090b', color: '#fff', border: '1px solid #ffffff10', fontSize: '12px', letterSpacing: '0.1em' }
      });
  };

  const handleGenerate = async () => {
    if (!selectedTournamentId) return;
    
    try { SoundNexus.play(CUES.UI_NOTIFICATION); } catch(e){}
    
    const confirm = window.confirm("☢️ NUCLEAR ACTION DETECTED\n\nThis will PERMANENTLY WIPE current match data and re-initialize the bracket geometry.\n\nExecute command?");
    if (!confirm) return;

    setGenerating(true);
    try { SoundNexus.play(CUES.UI_CLICK_HEAVY); } catch(e){}

    const result = await execute('admin_generate_bracket', { 
        p_tournament_id: selectedTournamentId 
    });
    
    setGenerating(false);

    if (result.success) {
        try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
        Telemetry.log(EVENTS.ACTION, { action: 'BRACKET_RECONSTRUCTED', tournamentId: selectedTournamentId });
        toast.success("GEOMETRY RECONSTRUCTION COMPLETE");
    } else {
        try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
        toast.error(result.message?.toUpperCase() || "RECONSTRUCTION FAILED");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#020202] text-white overflow-hidden font-sans">
      
      {/* 🎛️ COMMAND HUD BAR */}
      <div className="h-20 px-8 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-3xl flex items-center justify-between z-50 shadow-2xl relative">
          {/* SCANLINE DECORATOR */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-fuchsia-500/20" />
          
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-fuchsia-600/10 rounded-sm border border-fuchsia-500/20 flex items-center justify-center rotate-45 shadow-neon">
                <Trophy className="text-fuchsia-500 w-6 h-6 -rotate-45" />
            </div>
            <div>
                <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter leading-none text-white">
                    {tournamentData?.name || 'Sector Command'}
                </h2>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isLive ? 'bg-emerald-500 animate-pulse shadow-neon' : 'bg-zinc-700')} />
                    <span className="text-[9px] text-zinc-500 font-mono tracking-[0.4em] uppercase">
                       Mode: <span className={isLive ? 'text-emerald-500' : 'text-zinc-500'}>{lifecycle?.status || 'STANDBY'}</span>
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <span className="text-[9px] text-zinc-700 font-mono tracking-widest uppercase">ID: {selectedTournamentId?.slice(0,8)}</span>
                </div>
            </div>
         </div>

         <div className="flex gap-4">
            <button 
                onClick={handleSync} 
                disabled={!isSetupPhase || opsLoading}
                className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all rounded-sm text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 disabled:opacity-30"
            >
               <RefreshCw size={14} className={cn(opsLoading && 'animate-spin')} /> 
               Sync Personnel
            </button>
            
            <button 
                onClick={handleGenerate} 
                disabled={!isSetupPhase || opsLoading || generating}
                className={cn(
                  "flex items-center gap-3 px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95",
                  isSetupPhase 
                    ? "bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-2xl shadow-fuchsia-600/20" 
                    : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
            >
               {generating ? <Loader2 size={16} className="animate-spin" /> : isSetupPhase ? <Zap size={16} className="fill-current" /> : <AlertTriangle size={16} />}
               {generating ? 'Calculating Nodes...' : 'Reconstruct Bracket'}
            </button>
         </div>
      </div>

      {/* 📊 TACTICAL VIEWPORT */}
      <div className="flex-1 relative bg-[#020202] overflow-hidden">
        {/* COORDINATE GRID BACKGROUND */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 w-full h-full">
            <BracketView adminMode={true} />
        </div>

        {/* TELEMETRY OVERLAY */}
        <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-3">
            <div className="flex items-center gap-4 bg-[#09090b]/80 backdrop-blur-xl border border-white/5 p-4 rounded-sm shadow-2xl">
                <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
                    <Wifi size={14} className={isLive ? "text-emerald-500" : "text-zinc-800"} />
                    <span>UPLINK: {isLive ? "High-Fidelity" : "Standby"}</span>
                </div>
                <div className="w-[1px] h-3 bg-zinc-800" />
                <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
                    <Activity size={14} className="text-fuchsia-500" />
                    <span>Sensors: Active</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
