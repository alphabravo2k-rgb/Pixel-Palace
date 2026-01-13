/**
 * 🩺 SYSTEM DIAGNOSTIC: KERNEL MONITOR (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // ATOMIC TELEMETRY
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Database, Speaker, Cpu, Monitor, Terminal, Zap, ShieldCheck 
} from 'lucide-react';
import { cn } from '../../lib/utils';

// MASTER CORE
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { supabase } from '../../supabase/client';

export const SystemDiagnostic = () => {
  const { user, theme, can } = useNexus();
  
  const [latency, setLatency] = useState(0);
  const [dbStatus, setDbStatus] = useState('idle');
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(null);
  
  // 1️⃣ HIGH-PRECISION ENGINE TRACKER
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      setFps(Math.round(1000 / deltaTime));
      
      // Memory Telemetry (Chromium Standard)
      if (window.performance?.memory) {
        setMemory({
          used: Math.round(window.performance.memory.usedJSHeapSize / 1048576),
          limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1048576)
        });
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // 2️⃣ DB UPLINK STRESS TEST
  const checkUplink = async () => {
    setDbStatus('checking');
    const start = performance.now();
    SoundNexus.play(CUES.UI_CLICK);
    
    try {
      // Direct ping to the identities/profiles table
      const { error } = await supabase.from('app_admins').select('id').limit(1);
      // PGRST116 (No rows) is acceptable, means connection worked
      if (error && error.code !== 'PGRST116') throw error;
      
      const end = performance.now();
      const ms = Math.round(end - start);
      setLatency(ms);
      setDbStatus('online');
      
      Telemetry.log(EVENTS.PERFORMANCE, { label: 'db_ping', duration_ms: ms });
      SoundNexus.play(CUES.UI_SUCCESS);
    } catch (err) {
      console.error("Ping Error:", err);
      setDbStatus('offline');
      SoundNexus.play(CUES.UI_ERROR);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#09090b] border border-zinc-800 rounded-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative">
      
      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-20" />

      {/* HUD HEADER */}
      <div className="p-6 bg-zinc-900/30 border-b border-white/5 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-sm flex items-center justify-center">
            <Activity className="text-fuchsia-500 animate-pulse" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Kernel Diagnostic</h2>
            <div className="flex items-center gap-3 mt-1">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em]">Nexus Core // Node: {window.location.hostname}</p>
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Active Link</span>
            </div>
          </div>
        </div>
        <div className={cn("px-4 py-2 border rounded-sm text-[10px] font-black uppercase tracking-widest bg-black/50 shadow-2xl", theme.border, theme.color)}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} /> Clearance: {user?.role}
          </div>
        </div>
      </div>

      <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* PANEL 1: DATA TELEMETRY */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 border border-white/5 bg-black/40 rounded-sm space-y-8 relative group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <Database size={16} className="text-fuchsia-500" /> Uplink Latency
                </div>
                <Zap size={14} className="text-zinc-800 group-hover:text-fuchsia-500 transition-colors" />
            </div>
            
            <div className="flex items-end justify-between">
               <span className={cn(
                 "text-5xl font-display font-black tracking-tighter tabular-nums",
                 dbStatus === 'online' ? "text-white" : "text-zinc-800"
               )}>
                 {dbStatus === 'checking' ? '---' : `${latency}ms`}
               </span>
               <button onClick={checkUplink} className="px-5 py-2.5 bg-fuchsia-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-fuchsia-500 transition-all active:scale-95 shadow-lg shadow-fuchsia-600/20">
                 Probe DB
               </button>
            </div>
            <div className="flex items-center gap-2 border-t border-white/5 pt-4">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", dbStatus === 'online' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500")} />
              <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Signal State: {dbStatus}</span>
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-black/40 rounded-sm space-y-8">
            <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <Monitor size={16} className="text-blue-500" /> Render Frequency
            </div>
            <div className="space-y-2">
               <span className="text-5xl font-display font-black text-white tracking-tighter tabular-nums">
                 {fps} <span className="text-base text-zinc-700 font-sans italic">FPS</span>
               </span>
               <div className="w-full h-1.5 bg-zinc-900/50 rounded-full overflow-hidden mt-4">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((fps / 144) * 100, 100)}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
                 />
               </div>
            </div>
            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em] pt-2">Environment: WebGL_V2_PRO</p>
          </div>
        </div>

        {/* PANEL 2: SENSORY RIG */}
        <div className="p-6 border border-white/5 bg-black/40 rounded-sm space-y-8">
           <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <Speaker size={16} className="text-purple-500" /> Sensory Calibration
           </div>
           <div className="space-y-3">
              <button 
                onClick={() => SoundNexus.play(CUES.UI_NOTIFICATION)}
                className="w-full py-4 border border-white/5 bg-zinc-900/20 hover:bg-white/5 text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-all rounded-sm tracking-widest"
              >
                Pulse Signal
              </button>
              <button 
                onClick={() => SoundNexus.playVortex(CUES.UI_SUCCESS, 1500)}
                className="w-full py-4 bg-purple-600/10 border border-purple-500/30 text-[9px] font-black uppercase text-purple-400 hover:bg-purple-600/20 transition-all rounded-sm tracking-widest shadow-lg shadow-purple-600/5"
              >
                Vortex Sweep (8D)
              </button>
           </div>
        </div>

        {/* PANEL 3: MEMORY ALLOCATION */}
        <div className="md:col-span-3 p-8 border border-white/5 bg-zinc-900/10 rounded-sm backdrop-blur-md">
           <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 space-y-5 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                        <Cpu size={14} className="text-zinc-500" /> JS Heap Allocation
                    </div>
                    <span className="text-[10px] text-zinc-700 font-mono uppercase tracking-tighter">Limit: {memory?.limit || '--'}MB</span>
                  </div>
                  <div className="flex items-center gap-6">
                     <span className="text-3xl font-display font-black text-white italic tracking-tighter">{memory?.used || '--'} <span className="text-sm">MB</span></span>
                     <div className="flex-1 h-3 bg-black rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          animate={{ width: `${(memory?.used / memory?.limit) * 100 || 0}%` }}
                          className="h-full bg-gradient-to-r from-zinc-800 to-zinc-600" 
                        />
                     </div>
                  </div>
              </div>

              <div className="hidden lg:block w-px h-16 bg-white/5" />

              <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                     <Terminal size={14} /> Architecture State
                  </div>
                  <div className="flex items-center justify-between bg-black/40 p-3 border border-white/5 rounded-sm">
                     <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Stable Build: SentinX-Omni</span>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-neon-emerald animate-pulse" />
                        <span className="text-[9px] font-black text-white uppercase font-mono tracking-tighter">Verified</span>
                     </div>
                  </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
