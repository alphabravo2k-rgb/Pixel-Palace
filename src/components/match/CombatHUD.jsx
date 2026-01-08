/**
 * PIXEL PALACE: COMBAT COMMAND COCKPIT
 * VERSION: 4.1.0 (MASTER HYBRID)
 * STATUS: OPERATIONAL
 * - Hardware Accelerated WebGL Engine
 * - Real-time Nexus Data Stream
 * - Tactical Audio-Tactile Feedback
 */

import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Float, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Radio, Crosshair, Users, Shield, 
  Cpu, Activity, Zap, Terminal, AlertCircle 
} from 'lucide-react';
import { clsx } from 'clsx';

// MASTER CORE
import { useNexusStore } from '../../store/useNexusStore';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { ROLE_THEMES } from '../../lib/security/theme';

// 🌌 3D COMPONENT: TACTICAL SPHERE
const TacticalSphere = ({ tier, status }) => {
  const mesh = useRef();
  const color = status === 'disputed' ? '#ef4444' : '#10b981';
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
      // Pulse animation based on match activity
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      mesh.current.scale.set(scale, scale, scale);
    }
  });

  if (tier === 'low') return null;

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={mesh}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          wireframe 
          transparent 
          opacity={0.05} 
        />
      </mesh>
    </Float>
  );
};

export const CombatHUD = ({ matchData }) => {
  const { graphicsTier, is3DEnabled, profile, isLive } = useNexusStore();
  const theme = useMemo(() => ROLE_THEMES[profile?.role] || ROLE_THEMES.player, [profile]);

  // 🔊 BOOT SEQUENCE
  useEffect(() => {
    SoundNexus.play(CUES.NOTIFICATION);
    const timer = setTimeout(() => SoundNexus.play(CUES.NAVIGATION_SWISH), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#020202] overflow-hidden selection:bg-brand/30">
      
      {/* 🟢 LAYER 1: GPU ENGINE */}
      {is3DEnabled && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Canvas dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <Suspense fallback={null}>
              <Stars 
                radius={50} 
                depth={50} 
                count={graphicsTier === 'ultra' ? 4000 : 1000} 
                factor={4} 
                saturation={0} 
                fade 
                speed={1.5} 
              />
              <TacticalSphere tier={graphicsTier} status={matchData?.status} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* 🔴 LAYER 2: TEXTURE & OVERLAYS */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="scanlines opacity-[0.03]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--brand-rgb),0.05),transparent)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      </div>

      {/* 🔵 LAYER 3: HOLOGRAPHIC INTERFACE */}
      <div className="relative z-10 h-full flex flex-col p-8 font-sans">
        
        {/* TOP HUD: IDENTITY & TELEMETRY */}
        <header className="flex justify-between items-start">
          <motion.div 
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-brand/10 border border-brand/30 rounded-sm">
                <span className="text-[10px] font-black text-brand tracking-[0.4em] uppercase animate-pulse">
                  System Live
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 font-mono text-[9px] uppercase tracking-widest">
                <Activity size={12} /> Latency: 14ms
              </div>
            </div>
            
            <h1 className="text-7xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
              SECTOR <span className="text-zinc-800">#</span>{matchData?.match_no || '00'}
            </h1>
          </motion.div>

          <motion.div 
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={clsx(
              "p-1 rounded-sm border backdrop-blur-2xl transition-all duration-700 shadow-2xl",
              theme.border, theme.bg
            )}
          >
            <div className="flex items-center gap-6 px-6 py-4">
              <div className="text-right">
                <p className={clsx("text-xs font-black uppercase tracking-widest", theme.color)}>
                  {profile?.display_name || 'IDENT_PENDING'}
                </p>
                <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-[0.3em] mt-1">
                  Uplink: Verified // {profile?.role}
                </p>
              </div>
              <div className={clsx("w-12 h-12 rounded-sm border flex items-center justify-center shadow-neon", theme.border)}>
                 <Shield size={20} className={theme.color} />
              </div>
            </div>
          </motion.div>
        </header>

        {/* CENTER DECK: THE FOCUS UNIT */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {matchData?.status === 'live' ? (
              <motion.div 
                key="live"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="text-center"
              >
                 <div className="relative mb-12">
                    <Crosshair size={80} className="text-brand/20 animate-spin-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Zap size={32} className="text-brand shadow-neon" />
                    </div>
                 </div>
                 <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">
                   Engagement <span className="text-brand">Active</span>
                 </h2>
                 <p className="text-zinc-500 font-mono text-[10px] mt-4 uppercase tracking-[0.5em]">
                   Clear for Server Entry // Comms Open
                 </p>
                 <button className="mt-10 px-12 py-5 bg-brand text-white font-black uppercase italic tracking-widest text-xs rounded-sm shadow-neon hover:brightness-110 active:scale-95 transition-all">
                   Join Combat Instance
                 </button>
              </motion.div>
            ) : (
              <motion.div 
                key="standby"
                className="flex flex-col items-center gap-8"
              >
                <div className="w-48 h-[1px] bg-zinc-800 relative">
                   <div className="absolute inset-0 bg-brand animate-ping opacity-20" />
                </div>
                <div className="text-center">
                   <h2 className="text-xl font-black text-zinc-400 uppercase tracking-[0.4em]">Standby for Handshake</h2>
                   <p className="text-zinc-700 font-mono text-[9px] mt-2 uppercase tracking-widest">Awaiting Command Clearance</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* BOTTOM DECK: DIAGNOSTICS */}
        <footer className="flex justify-between items-end border-t border-white/5 pt-8">
           <div className="flex gap-12">
              <div className="space-y-2">
                 <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Hardware Engine</p>
                 <div className="flex items-center gap-3">
                    <Cpu size={14} className="text-brand" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tier: {graphicsTier}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Data Stream</p>
                 <div className="flex items-center gap-3">
                    <Terminal size={14} className="text-zinc-700" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">0.0.0.0:27015</span>
                 </div>
              </div>
           </div>

           <div className="text-right space-y-2">
              <p className="text-[8px] text-zinc-800 font-mono uppercase tracking-[0.4em]">Pixel Palace // Genesis Protocol</p>
              <div className="flex items-center gap-3 justify-end">
                 <div className={clsx("w-1.5 h-1.5 rounded-full", isLive ? "bg-emerald-500 shadow-neon-emerald" : "bg-red-500")} />
                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Nexus Link {isLive ? 'Active' : 'Lost'}</span>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
};
