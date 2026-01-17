/**
 * ⛩️ PIXEL PALACE: GENESIS PORTAL (3D HYBRID)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // SENSORY ENGAGED
 */

import React, { useState, useCallback, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera } from '@react-three/drei';
import { ChevronRight, Loader2, Terminal, Activity, Cpu } from 'lucide-react';

// MASTER CORE
import { useNexusStore } from '../store/useNexusStore';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { getClearanceLevel } from '../lib/security/engine';
import { Telemetry, EVENTS } from '../lib/telemetry';
import { cn } from '../lib/utils';

// 🛡️ BRAND CONFIG
const BRAND = {
  name: "PIXEL PALACE",
  version: "V5.0.0-PRO",
  logo: "https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png"
};

/**
 * 🌌 3D COMPONENT: RESONANCE CORE
 */
const NexusCore = ({ active }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      // Harmonic Oscillator
      mesh.current.rotation.y += active ? 0.04 : 0.005;
      mesh.current.rotation.z += 0.002;
      
      const bounce = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      const targetScale = active ? 1.5 : 1;
      mesh.current.scale.lerp({ x: targetScale * bounce, y: targetScale * bounce, z: targetScale * bounce }, 0.1);
    }
  });

  return (
    <Float speed={5} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[3, 0]} />
        <meshStandardMaterial 
          color={active ? "#c026d3" : "#18181b"} 
          wireframe 
          emissive={active ? "#f472b6" : "#000000"}
          emissiveIntensity={active ? 5 : 0}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
};

export const LandingPage = () => {
  const navigate = useNavigate();
  // Ensure we safely access store properties even if store is not fully initialized
  const store = useNexusStore();
  const uid = store?.uid;
  const role = store?.role;
  const is3DEnabled = store?.is3DEnabled ?? true; // Default to true if undefined
  const graphicsTier = store?.graphicsTier || 'high';

  const [isConnecting, setIsConnecting] = useState(false);
  const [hovered, setHovered] = useState(false);

  /**
   * ⚡ ENTRY SEQUENCE
   */
  const handleEnter = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    // 🔊 Audio Handshake
    try { SoundNexus.play(CUES.UI_CLICK_HEAVY); } catch(e){}
    Telemetry.log(EVENTS.ACTION, { action: 'GATE_ENTRY_INITIALIZED' });
    
    // ⏳ Neural Sync Simulation
    await new Promise(resolve => setTimeout(resolve, 1800));

    if (uid) {
      const clearance = getClearanceLevel(role);
      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
      navigate(clearance >= 60 ? '/admin/dashboard' : '/dashboard');
    } else {
      try { SoundNexus.play(CUES.NAVIGATION_SWISH); } catch(e){}
      navigate('/login');
    }
  }, [uid, role, isConnecting, navigate]);

  return (
    <div className="relative min-h-screen w-full bg-[#020202] overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* 🟢 LAYER 1: GPU REACTOR (3D) */}
      {is3DEnabled && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-2000">
          <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
            <PerspectiveCamera makeDefault position={[0, 0, 12]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#c026d3" />
            <Suspense fallback={null}>
              <Stars 
                radius={100} 
                depth={50} 
                count={graphicsTier === 'ultra' ? 8000 : 2000} 
                factor={4} 
                saturation={0} 
                fade 
                speed={0.5} 
              />
              <NexusCore active={hovered} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* 🔴 LAYER 2: ATMOSPHERIC SHROUD */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="scanlines opacity-[0.2]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020202_90%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 via-transparent to-transparent" />
      </div>
      
      {/* 🔵 LAYER 3: COMMAND INTERFACE */}
      <div className="relative z-20 flex flex-col items-center max-w-5xl w-full px-10">
        
        {/* LOGO MONOLITH */}
        
        <div className="relative mb-16 group pointer-events-none">
          <div className="absolute inset-0 blur-3xl bg-fuchsia-600/20 rounded-full animate-pulse" />
          <img 
            src={BRAND.logo} 
            alt="Nexus" 
            className="relative w-56 h-56 md:w-72 md:h-72 object-contain drop-shadow-[0_0_80px_rgba(192,38,211,0.2)] animate-float" 
          />
        </div>

        {/* TYPOGRAPHY ENGINE */}
        <div className="text-center space-y-10">
          <h1 className="text-7xl md:text-[12rem] font-display font-black text-white italic tracking-tighter leading-none uppercase select-none relative group">
              <span className="relative z-10">PIXEL</span> 
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-800 ml-4">PALACE</span>
              <div className="absolute -inset-2 bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </h1>
          
          <div className="flex items-center justify-center gap-8">
            <div className="h-[1px] w-24 bg-gradient-to-l from-zinc-800 to-transparent" />
            <div className="flex flex-col gap-2">
                <p className="text-zinc-500 font-mono text-[10px] tracking-[0.6em] uppercase">
                    Establish Connection // {BRAND.version}
                </p>
                <div className="flex justify-center gap-1">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 bg-zinc-900 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
            </div>
            <div className="h-[1px] w-24 bg-gradient-to-r from-zinc-800 to-transparent" />
          </div>
        </div>

        {/* TACTICAL ENTRY BUTTON */}
        <div className="mt-24 w-full max-w-sm relative group">
          <div className="absolute -inset-1 bg-fuchsia-600 opacity-20 blur group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          
          <button 
            onClick={handleEnter}
            onMouseEnter={() => { setHovered(true); try{SoundNexus.play(CUES.UI_HOVER);}catch(e){} }}
            onMouseLeave={() => setHovered(false)}
            disabled={isConnecting}
            className={cn(
              "relative w-full py-6 bg-white text-black font-black text-xl uppercase tracking-[0.3em] transition-all duration-500 overflow-hidden",
              "flex items-center justify-center gap-4 active:scale-95 disabled:grayscale",
              isConnecting ? "cursor-wait" : "cursor-pointer"
            )}
            style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 70%, 85% 100%, 0 100%, 0 30%)' }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {isConnecting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-fuchsia-600" />
                <span className="animate-pulse">Authorizing...</span>
              </>
            ) : (
              <>
                <span>Enter Sector</span> 
                <ChevronRight className="w-6 h-6 text-fuchsia-600 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* SYSTEM TELEMETRY FOOTER */}
        <div className="mt-32 flex flex-wrap justify-center items-center gap-16 text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em] select-none opacity-50 hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-3">
            <div className={cn("w-1.5 h-1.5 rounded-full shadow-neon", uid ? "bg-emerald-500 shadow-emerald-500/50" : "bg-fuchsia-500 shadow-fuchsia-500/50 animate-pulse")} />
            {uid ? 'Identity: Verified' : 'Handshake: Pending'}
          </span>
          <span className="flex items-center gap-3">
            <Terminal size={14} className="text-zinc-800" />
            Encryption: Active
          </span>
          <span className="flex items-center gap-3">
            <Cpu size={14} className="text-zinc-800" />
            Core: {graphicsTier?.toUpperCase() || 'STD'}
          </span>
          <span className="flex items-center gap-3">
            <Activity size={14} className="text-emerald-900" />
            System: Stable
          </span>
        </div>

      </div>
    </div>
  );
};
