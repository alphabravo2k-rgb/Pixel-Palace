import React, { useState, useCallback, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera } from '@react-three/drei';
import { ChevronRight, Loader2, Terminal, Activity } from 'lucide-react';

// ✅ CORE ARCHITECTURE
import { useNexusStore } from '../store/useNexusStore';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { getClearanceLevel } from '../lib/security/engine';
import { cn } from '../lib/utils';

// 🛡️ CONFIG
const BRAND = {
  name: "PIXEL PALACE",
  version: "V2.0.4",
  logo: "https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png"
};

/**
 * 🌌 3D COMPONENT: THE NEXUS CORE
 * A living, breathing geometric heart that spins behind the UI.
 */
const NexusCore = ({ active }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      // Idle Rotation
      mesh.current.rotation.y += 0.002;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Active State (Hover) - Spin faster and grow
      const targetScale = active ? 1.4 : 1;
      mesh.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
      
      if (active) {
        mesh.current.rotation.y += 0.02;
      }
    }
  });

  return (
    <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[2.8, 0]} />
        <meshStandardMaterial 
          color={active ? "#10b981" : "#09090b"} 
          wireframe 
          emissive={active ? "#10b981" : "#000000"}
          emissiveIntensity={active ? 2 : 0}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

/**
 * ⛩️ PIXEL PALACE: GENESIS PORTAL (3D HYBRID)
 * -------------------------------------------
 * STATUS: MASTERED
 * * LAYERS:
 * 1. 3D ENGINE: React Three Fiber (Stars + NexusCore).
 * 2. ATMOSPHERE: CSS Glows + Scanlines.
 * 3. UI: Cinematic Interface.
 */
export const LandingPage = () => {
  const navigate = useNavigate();
  const { uid, role, is3DEnabled } = useNexusStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hovered, setHovered] = useState(false); // Tracks hover state for 3D interaction

  // 🚀 ENTRY LOGIC
  const handleEnter = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    // 🔊 Audio Ignition
    SoundNexus.play(CUES.UI_CLICK);
    setTimeout(() => SoundNexus.play(CUES.COMBAT_START), 200);

    // ⏳ Cinematic Pause
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (uid) {
      const clearance = getClearanceLevel(role);
      navigate(clearance >= 60 ? '/admin/warroom' : '/dashboard');
    } else {
      navigate('/login');
    }
  }, [uid, role, isConnecting, navigate]);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center selection:bg-brand/30">
      
      {/* 🟢 LAYER 1: 3D ENGINE (High Tier Only) */}
      {is3DEnabled && (
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none transition-opacity duration-1000">
          <Canvas dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
            <Suspense fallback={null}>
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              <NexusCore active={hovered} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* 🔴 LAYER 2: ATMOSPHERE (Fallback / Overlay) */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="scanlines opacity-[0.3]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)]" />
        
        {/* Glow Orbs (Only visible if 3D is off, or as subtle tint) */}
        {!is3DEnabled && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-brand-glow/5 rounded-full blur-[120px] animate-pulse" />
          </>
        )}
      </div>
      
      {/* 🔵 LAYER 3: CORE INTERFACE */}
      <div className="relative z-20 flex flex-col items-center max-w-4xl w-full px-6">
        
        {/* The Monolith Logo */}
        <div className="relative mb-12 group cursor-default">
          <img 
            src={BRAND.logo} 
            alt="Nexus" 
            className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-float" 
          />
        </div>

        {/* Typography */}
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-9xl font-display font-black text-white italic tracking-tighter leading-none uppercase select-none drop-shadow-2xl">
              PIXEL <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">PALACE</span>
          </h1>
          
          <div className="flex items-center justify-center gap-6">
            <div className="h-[1px] w-16 bg-gradient-to-l from-zinc-800 to-transparent" />
            <p className="text-zinc-500 font-mono text-[10px] tracking-[0.5em] uppercase animate-flicker">
              GENESIS PROTOCOL // {BRAND.version}
            </p>
            <div className="h-[1px] w-16 bg-gradient-to-r from-zinc-800 to-transparent" />
          </div>
        </div>

        {/* Master Action Button */}
        <div className="mt-20 w-full max-w-sm relative group">
          <div className="absolute -inset-0.5 bg-brand opacity-20 blur group-hover:opacity-60 transition duration-500" />
          
          <button 
            onClick={handleEnter}
            onMouseEnter={() => { setHovered(true); SoundNexus.play(CUES.UI_HOVER); }}
            onMouseLeave={() => setHovered(false)}
            disabled={isConnecting}
            className={cn(
              "relative w-full py-5 bg-white text-black font-black text-xl uppercase tracking-[0.2em] transition-all duration-300",
              "flex items-center justify-center gap-4 hover:tracking-[0.4em] active:scale-95 disabled:grayscale disabled:cursor-not-allowed",
              isConnecting && "bg-zinc-200"
            )}
            style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
                <span className="animate-pulse">Initializing...</span>
              </>
            ) : (
              <>
                <span>Enter Nexus</span> 
                <ChevronRight className="w-6 h-6 text-brand" />
              </>
            )}
          </button>
        </div>

        {/* Footer Stats */}
        <div className="mt-24 flex items-center gap-12 text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] select-none">
          <span className="flex items-center gap-2.5">
            <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", uid ? "bg-emerald-500 text-emerald-500" : "bg-brand text-brand animate-pulse")} />
            {uid ? 'IDENTITY VERIFIED' : 'GUEST MODE'}
          </span>
          <span className="flex items-center gap-2.5">
            <Terminal size={14} className="text-zinc-800" />
            PORT: 443
          </span>
          <span className="flex items-center gap-2.5">
            <Activity size={14} className="text-emerald-500" />
            SYSTEM: ONLINE
          </span>
        </div>

      </div>
    </div>
  );
};
