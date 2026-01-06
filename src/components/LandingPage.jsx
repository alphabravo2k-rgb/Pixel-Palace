import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, Terminal, Activity, ShieldCheck } from 'lucide-react';

// ✅ UPGRADED IMPORTS (The Nexus Architecture)
import { useNexusStore } from '../store/useNexusStore';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { getClearanceLevel, ROLES } from '../lib/roles';
import { cn } from '../lib/utils';

// 🛡️ LOCAL FALLBACK IDENTITY (Prevents crashes if config is missing)
const BRAND = {
  name: "PIXEL PALACE",
  version: "V2.0.4",
  logo: "https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png"
};

/**
 * ⛩️ PIXEL PALACE: GENESIS PORTAL
 * ------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * * FEATURES:
 * 1. CINEMATIC DELAY: A 1.2s artificial loading sequence to feel "heavy" and premium.
 * 2. ROLE INTELLIGENCE: Auto-directs Admins to War Room, Players to Dashboard.
 * 3. ATMOSPHERE: GPU-accelerated glow orbs and CRT scanlines.
 */

export const LandingPage = () => {
  const navigate = useNavigate();
  const { uid, role, isLive } = useNexusStore(); // 🧠 Global Brain
  const [isConnecting, setIsConnecting] = useState(false);

  // 🚀 THE ENTRY LOGIC
  const handleEnter = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    // 🔊 Audio Ignition
    SoundNexus.play(CUES.UI_CLICK);
    SoundNexus.play(CUES.NAVIGATION_SWISH);

    // ⏳ Cinematic Pause (Builds anticipation)
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (uid) {
      // 🛡️ Security Clearance Check
      const clearance = getClearanceLevel(role);
      
      if (clearance >= 60) { // Level 60 = Staff/Admin
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [uid, role, isConnecting, navigate]);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center selection:bg-brand/30">
      
      {/* 1. ATMOSPHERIC SHROUD (Background Layers) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* CRT Scanlines */}
        <div className="scanlines opacity-[0.4]" />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* GPU Accelerated Glow Orbs (The "Pulse") */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand/10 rounded-full blur-[120px] animate-pulse will-change-transform" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-brand-glow/5 rounded-full blur-[120px] animate-pulse will-change-transform" />
      </div>
      
      {/* 2. CORE INTERFACE */}
      <div className="relative z-20 flex flex-col items-center max-w-4xl w-full px-6">
        
        {/* The Monolith Logo */}
        <div className="relative mb-12 group cursor-default">
          <div className="absolute inset-0 bg-brand/40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-1000" />
          <img 
            src={BRAND.logo} 
            alt="Nexus" 
            className="relative w-48 h-48 md:w-64 md:h-64 object-contain animate-breathe drop-shadow-[0_0_30px_rgba(var(--color-brand)/0.2)] transition-transform duration-500 group-hover:scale-105" 
          />
        </div>

        {/* Tactical Typography */}
        <div className="text-center">
          <h1 className="text-7xl md:text-9xl font-display font-black text-white italic tracking-tighter leading-none uppercase select-none drop-shadow-2xl">
             PIXEL <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">PALACE</span>
          </h1>
          
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="h-[1px] w-16 bg-gradient-to-l from-zinc-800 to-transparent" />
            <p className="text-zinc-500 font-mono text-[10px] tracking-[0.5em] uppercase animate-flicker">
              ESTABLISHING SECURE UPLINK // {BRAND.version}
            </p>
            <div className="h-[1px] w-16 bg-gradient-to-r from-zinc-800 to-transparent" />
          </div>
        </div>

        {/* Master Action Button */}
        <div className="mt-20 w-full max-w-sm relative group">
          {/* Button Glow Effect */}
          <div className="absolute -inset-0.5 bg-brand opacity-20 blur group-hover:opacity-50 transition duration-1000" />
          
          <button 
            onClick={handleEnter}
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
                <span className="animate-pulse">Connecting...</span>
              </>
            ) : (
              <>
                <span>Initialize</span> 
                <ChevronRight className="w-6 h-6 text-brand translate-y-[-1px]" />
              </>
            )}
          </button>
        </div>

        {/* System Diagnostics Footer */}
        <div className="mt-24 flex items-center gap-12 text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] select-none">
          <span className="flex items-center gap-2.5">
            <div className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
              uid ? "bg-emerald-500 text-emerald-500" : "bg-brand text-brand animate-pulse"
            )} />
            {uid ? 'IDENTITY SECURED' : 'NEURAL LINK STANDBY'}
          </span>
          <span className="flex items-center gap-2.5">
            <Terminal size={14} className="text-zinc-800" />
            PORT: 443
          </span>
          <span className="flex items-center gap-2.5">
            <Activity size={14} className={cn(isLive ? "text-emerald-500" : "text-zinc-800")} />
            {isLive ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

      </div>
    </div>
  );
};
