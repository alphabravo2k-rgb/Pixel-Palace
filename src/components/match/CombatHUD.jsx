/**
 * ⚔️ COMBAT HUD: COMMAND COCKPIT (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // GPU-ACCELERATED
 */

import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Crosshair, Shield, Cpu, Activity, Zap, Terminal, Radio } from 'lucide-react';
import { cn } from '../../lib/utils';

// MASTER CORE
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// 🌌 3D COMPONENT: TACTICAL RESONANCE SPHERE
const TacticalSphere = ({ tier, status }) => {
  const mesh = useRef();
  
  // Dynamic color shift based on match health
  const color = useMemo(() => {
    if (status === 'disputed') return '#ef4444';
    if (status === 'live') return '#c026d3';
    return '#10b981';
  }, [status]);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
      mesh.current.rotation.z += 0.0005;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      mesh.current.scale.set(pulse, pulse, pulse);
    }
  });

  if (tier === 'low') return null;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={mesh}>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          wireframe 
          transparent 
          opacity={0.04} 
        />
      </mesh>
    </Float>
  );
};

export const CombatHUD = ({ matchData }) => {
  const { user, theme, isLoading } = useNexus();
  
  // 🔊 SENSORY INITIALIZATION
  useEffect(() => {
    try {
        SoundNexus.playSpatial(CUES.UI_POWER_UP, 0);
        const timer = setTimeout(() => SoundNexus.play(CUES.NAVIGATION_SWISH), 800);
        
        Telemetry.log(EVENTS.PERFORMANCE, { action: 'HUD_MOUNTED', matchId: matchData?.id });
        
        return () => clearTimeout(timer);
    } catch(e) { console.warn("Audio Context blocked"); }
  }, [matchData?.id]);

  return (
    <div className="relative w-full h-screen bg-[#020202] overflow-hidden selection:bg-fuchsia-500/30">
      
      {/* 🟢 LAYER 1: THE REALITY ENGINE (3D) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} />
          <Suspense fallback={null}>
            <Stars 
              radius={100} 
              depth={50} 
              count={user?.clearance >= 90 ? 5000 : 1500} 
              factor={4} 
              saturation={0} 
              fade 
              speed={1} 
            />
            <TacticalSphere status={matchData?.status} />
          </Suspense>
        </Canvas>
      </div>

      {/* 🔴 LAYER 2: SCANLINES & ATMOSPHERE */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]" />
        <div className="scanlines opacity-[0.2]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(192,38,211,0.03),_transparent)]" />
      </div>

      {/* 🔵 LAYER 3: TACTICAL OVERLAY (HUD) */}
      <div className="relative z-10 h-full flex flex-col p-10 font-mono">
        
        {/* HEADER: TELEMETRY & ID */}
        <header className="flex justify-between items-start">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-5">
              <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-[9px] font-black text-emerald-500 tracking-[0.5em] uppercase animate-pulse">
                  Signal: Secure
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 text-[9px] uppercase tracking-widest">
                <Radio size={12} className="text-fuchsia-500" /> Relay Node: 0xPPG-24
              </div>
            </div>
            
            <h1 className="text-8xl font-display font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">
              Sector <span className="text-zinc-800">/</span>{matchData?.match_position || 'XX'}
            </h1>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={cn(
              "p-1 rounded-sm border backdrop-blur-3xl shadow-2xl transition-all duration-1000",
              theme.border, theme.bg
            )}
          >
            <div className="flex items-center gap-8 px-8 py-5">
              <div className="text-right">
                <p className={cn("text-sm font-black uppercase tracking-[0.2em]", theme.color)}>
                  {user?.username || 'AGENT_NULL'}
                </p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] mt-1.5">
                  Clearance: Level {user?.clearance || 0}
                </p>
              </div>
              <div className={cn("w-14 h-14 rounded-sm border flex items-center justify-center shadow-2xl rotate-3", theme.border)}>
                 <Shield size={24} className={theme.color} />
              </div>
            </div>
          </motion.div>
        </header>

        {/* CENTER DECK: ENGAGEMENT CONTROL */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {matchData?.status === 'live' ? (
              <motion.div 
                key="live"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.05, opacity: 0 }}
                className="text-center relative"
              >
                 <div className="relative mb-16 flex justify-center">
                    <Crosshair size={120} className="text-fuchsia-500/10 animate-spin-slow absolute" />
                    <Zap size={48} className="text-fuchsia-500 drop-shadow-[0_0_15px_#c026d3]" />
                 </div>
                 <h2 className="text-5xl font-display font-black text-white uppercase italic tracking-tighter">
                   Engagement <span className="text-fuchsia-500">Live</span>
                 </h2>
                 <p className="text-zinc-500 text-[11px] mt-6 uppercase tracking-[0.6em] font-light">
                   Handshake Protocol Complete // Execute Deployment
                 </p>
                 <button className="mt-12 px-16 py-6 bg-fuchsia-600 text-white font-black uppercase italic tracking-[0.3em] text-[10px] rounded-sm shadow-2xl hover:bg-fuchsia-500 active:scale-95 transition-all group">
                   <span className="group-hover:tracking-[0.5em] transition-all">Join Combat Instance</span>
                 </button>
              </motion.div>
            ) : (
              <motion.div 
                key="standby"
                className="flex flex-col items-center gap-10 opacity-40 grayscale"
              >
                <div className="w-64 h-[1px] bg-zinc-800 relative overflow-hidden">
                   <motion.div 
                    animate={{ x: ['-100%', '100%'] }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" 
                   />
                </div>
                <div className="text-center">
                   <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.8em]">Awaiting Uplink</h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* FOOTER: SYSTEM VITALS */}
        <footer className="flex justify-between items-end border-t border-white/5 pt-10">
            <div className="flex gap-16">
              <div className="space-y-3">
                 <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Hardware Kernel</p>
                 <div className="flex items-center gap-3">
                    <Cpu size={16} className="text-fuchsia-500" />
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Build: SentinX-Omni</span>
                 </div>
              </div>
              <div className="space-y-3">
                 <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Security State</p>
                 <div className="flex items-center gap-3">
                    <Terminal size={16} className="text-zinc-500" />
                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">Encrypted</span>
                 </div>
              </div>
            </div>

            <div className="text-right space-y-3">
              <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.5em]">Pixel Palace // Dubai Standard v5.0</p>
              <div className="flex items-center gap-4 justify-end">
                 <div className={cn("w-2 h-2 rounded-full", matchData ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" : "bg-red-600")} />
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Network Connection: {matchData ? 'Stable' : 'Lost'}</span>
              </div>
            </div>
        </footer>
      </div>
    </div>
  );
};
