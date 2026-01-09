/**
 * 🔑 AUTH LAYOUT: IDENTITY PORTAL (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: SECURED // 3D GRID & SPATIAL ENABLED
 */

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberOverlay } from '../CyberOverlay';
// Note: Ensure /lib/soundNexus.js exists in the next phase
import { SoundNexus, CUES } from '../../lib/soundNexus';

export const AuthLayout = () => {
  const location = useLocation();

  // 🔊 SPATIAL HANDSHAKE: Play entry sound when mounting the portal
  useEffect(() => {
    try {
      SoundNexus.playSpatial(CUES.UI_POWER_UP, { volume: 0.4 });
    } catch (e) {
      // Audio engine fallback
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020202]">
      
      {/* 1. ATMOSPHERIC SCANNING (High Intensity for Auth) */}
      <CyberOverlay intensity="high" show3DDepth={true} />
      
      {/* 2. DYNAMIC 3D GRID FLOOR (The "Tron" Effect) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `linear-gradient(to right, #c026d3 1px, transparent 1px), 
                              linear-gradient(to bottom, #c026d3 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) translateY(200px) scale(3)',
            maskImage: 'linear-gradient(to bottom, transparent, black 80%)'
          }}
        />
        {/* Pulsing Light from the bottom */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand/20 to-transparent blur-3xl opacity-40" />
      </div>

      {/* 3. THE AUTH MONOLITH (Perspective Anchor) */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-6 perspective-container"
      >
        <div className="glass-hard p-10 relative overflow-hidden group perspective-card">
          {/* TOP DECORATIVE NEON LINE */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent shadow-neon" />
          
          {/* HEADER SECTION */}
          <div className="mb-10 text-center relative">
            <h1 className="text-4xl font-display font-black tracking-tighter text-white italic">
              PIXEL<span className="text-brand text-neon">PALACE</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="h-[1px] w-8 bg-zinc-800" />
              <p className="text-[10px] font-mono text-brand-glow uppercase tracking-[0.4em] font-bold">
                Identity // Verification
              </p>
              <div className="h-[1px] w-8 bg-zinc-800" />
            </div>
          </div>

          {/* FORM CONTAINER WITH PAGE TRANSITIONS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet /> 
            </motion.div>
          </AnimatePresence>
          
          {/* BOTTOM STATUS INDICATOR */}
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6">
            <div className="w-1.5 h-1.5 bg-brand rounded-full animate-ping" />
            <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">
              Nexus Encryption Active // 256-BIT
            </span>
          </div>

          {/* CORNER ACCENTS */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/10" />
        </div>
      </motion.div>

      {/* 4. BACKGROUND 3D ELEMENTS (Framer Motion Decor) */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -right-20 w-96 h-96 border border-brand/5 rounded-full pointer-events-none" 
      />
    </div>
  );
};
