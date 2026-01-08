import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Database, Speaker, Cpu, Monitor, Terminal
} from 'lucide-react';
import { clsx } from 'clsx';

// MASTER CORE
import { useNexusStore } from '../../store/useNexusStore';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { supabase } from '../../supabase/client';
import { getRoleTheme } from '../../lib/security/theme'; // ✅ Safe Import

/**
 * 🩺 SYSTEM DIAGNOSTIC: KERNEL MONITOR
 * ------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * UPGRADES:
 * 1. ROBUST PING: Pings 'profiles' table to ensure valid DB handshake.
 * 2. THEME SAFETY: Uses 'getRoleTheme' to prevent crashes on null roles.
 * 3. MEMORY TRACKING: Real-time JS Heap monitoring (Chrome/Edge).
 */

export const SystemDiagnostic = () => {
  const { graphicsTier, is3DEnabled, toggle3D, profile } = useNexusStore();
  
  // ✅ SAFE THEME RESOLUTION
  const theme = getRoleTheme(profile?.role);
  
  const [latency, setLatency] = useState(0);
  const [dbStatus, setDbStatus] = useState('idle');
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(null);
  
  // 1️⃣ FPS & PERFORMANCE TRACKER
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      setFps(Math.round(1000 / deltaTime));
      
      // Check Memory (Chrome/Edge Only)
      if (window.performance && window.performance.memory) {
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

  // 2️⃣ DB STRESS TEST
  const checkUplink = async () => {
    setDbStatus('checking');
    const start = performance.now();
    
    try {
      // ✅ FIXED: Ping a table guaranteed to exist ('profiles')
      const { error } = await supabase.from('profiles').select('id').limit(1).single();
      
      // Allow "Row not found" as success (means connection worked, just empty DB)
      if (error && error.code !== 'PGRST116') throw error;
      
      const end = performance.now();
      setLatency(Math.round(end - start));
      setDbStatus('online');
      SoundNexus.play(CUES.SUCCESS);
    } catch (err) {
      console.error("Ping Failed:", err);
      setDbStatus('offline');
      SoundNexus.play(CUES.DISPUTE_TRIGGER);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#050505] border border-white/5 rounded-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
      
      {/* HUD HEADER */}
      <div className="p-6 bg-zinc-950/80 border-b border-white/5 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-sm flex items-center justify-center">
            <Activity className="text-brand animate-pulse" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">System Kernel</h2>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Nexus Diagnostic Utility // v4.5.0</p>
          </div>
        </div>
        <div className={clsx("px-4 py-2 border rounded-sm text-[10px] font-black uppercase tracking-widest bg-black shadow-neon", theme.border, theme.color)}>
          Clearance: {profile?.role || 'UNKNOWN'}
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PANEL 1: DATA TELEMETRY */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 border border-white/5 bg-zinc-900/20 rounded-sm space-y-6">
            <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <Database size={14} className="text-brand" /> Uplink Latency
            </div>
            <div className="flex items-end justify-between">
               <span className={clsx(
                 "text-4xl font-display font-black tracking-tighter",
                 dbStatus === 'online' ? "text-white" : "text-zinc-800"
               )}>
                 {dbStatus === 'checking' ? '---' : `${latency}ms`}
               </span>
               <button onClick={checkUplink} className="px-6 py-2 bg-brand text-white text-[10px] font-black uppercase rounded-sm hover:brightness-110 transition-all active:scale-95">
                 Execute Ping
               </button>
            </div>
            <div className="flex items-center gap-2">
              <div className={clsx("w-1.5 h-1.5 rounded-full", dbStatus === 'online' ? "bg-emerald-500 shadow-neon-emerald" : "bg-red-500")} />
              <span className="text-[9px] text-zinc-600 font-mono uppercase">Status: {dbStatus.toUpperCase()}</span>
            </div>
          </div>

          <div className="p-5 border border-white/5 bg-zinc-900/20 rounded-sm space-y-6">
            <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <Monitor size={14} className="text-blue-500" /> GPU Performance
            </div>
            <div className="space-y-1">
               <span className="text-4xl font-display font-black text-white tracking-tighter tabular-nums">
                 {fps} <span className="text-sm text-zinc-700">FPS</span>
               </span>
               <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-2">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((fps / 144) * 100, 100)}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                 />
               </div>
            </div>
            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Tier: {graphicsTier.toUpperCase()}</p>
          </div>
        </div>

        {/* PANEL 2: AUDIO ENGINE */}
        <div className="p-5 border border-white/5 bg-zinc-900/20 rounded-sm space-y-6">
           <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <Speaker size={14} className="text-purple-500" /> Sensory Check
           </div>
           <div className="space-y-3">
              <button 
                onClick={() => SoundNexus.play(CUES.NOTIFICATION)}
                className="w-full py-4 border border-white/5 hover:bg-white/5 text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-all rounded-sm"
              >
                Pulse Mono SFX
              </button>
              <button 
                onClick={() => SoundNexus.play(CUES.NAVIGATION_SWISH)}
                className="w-full py-4 bg-purple-500/10 border border-purple-500/30 text-[10px] font-black uppercase text-purple-400 hover:bg-purple-500/20 transition-all rounded-sm"
              >
                Initialize Spatial
              </button>
           </div>
        </div>

        {/* PANEL 3: MEMORY & ENVIRONMENT */}
        <div className="md:col-span-3 p-5 border border-white/5 bg-black/40 rounded-sm">
           <div className="flex items-center gap-6">
              <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-3 text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                    <Cpu size={12} /> JS Heap Allocation
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-xl font-display font-black text-zinc-300 italic">{memory?.used || '--'} MB</span>
                    <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                       <motion.div 
                         animate={{ width: `${(memory?.used / memory?.limit) * 100 || 0}%` }}
                         className="h-full bg-zinc-600" 
                       />
                    </div>
                    <span className="text-[10px] text-zinc-700 font-mono">MAX: {memory?.limit || '--'}MB</span>
                 </div>
              </div>

              <div className="w-px h-12 bg-white/5" />

              <div className="flex-1 space-y-2">
                 <div className="flex items-center gap-3 text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                    <Terminal size={12} /> Render Architecture
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">WebGL 2.0 // Fiber</span>
                    <button 
                      onClick={toggle3D}
                      className={clsx(
                        "px-4 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest transition-all",
                        is3DEnabled ? "bg-emerald-600 text-white shadow-neon-emerald" : "bg-zinc-800 text-zinc-500"
                      )}
                    >
                      {is3DEnabled ? 'Core Online' : 'Core Offline'}
                    </button>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
