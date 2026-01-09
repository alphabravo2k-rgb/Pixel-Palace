/**
 * 🌌 CYBER OVERLAY: ATMOSPHERIC KERNEL
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // 3D DEPTH ENABLED
 */

import React from 'react';
import { cn } from '../lib/utils';

export const CyberOverlay = ({ intensity = 'normal', show3DDepth = true, className }) => {
  return (
    <div className={cn("pointer-events-none fixed inset-0 z-[1] overflow-hidden", className)}>
      
      {/* 1. THE MASTER VIGNETTE (Focus Tunnel) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_120%)] z-10" />

      {/* 2. CRT SCANLINE MATRIX (Kinetic) */}
      {/* Uses the .animate-scan class from index.css for smooth scrolling lines */}
      <div className={cn(
        "absolute inset-0 bg-scanline opacity-[0.02] mix-blend-overlay animate-scan",
        intensity === 'high' && "opacity-[0.05]"
      )} />

      {/* 3. NEURAL GRAIN (Physical Texture) */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 brightness-100 mix-blend-screen" />

      {/* 4. TACTICAL HUD FRAME (3D Depth Layer) */}
      {show3DDepth && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Subtle Corner Brackets - Gives the UI a 'Heads Up Display' feel */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-white/5" />
          <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-white/5" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-white/5" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-white/5" />
        </div>
      )}

      {/* 5. CHROMATIC ABERRATION (Glitch Edges) */}
      {/* Adds a very subtle red/cyan shift to the edges of the screen */}
      <div className="absolute inset-0 opacity-[0.02] bg-gradient-to-r from-red-500/20 via-transparent to-cyan-500/20 mix-blend-screen" />

      {/* 6. BOTTOM UPLINK GLOW */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-brand/10 via-brand/5 to-transparent opacity-60 mix-blend-plus-lighter" />

      {/* 7. DUST MOTES (Floating Particles) */}
      {/* Adds life to the void */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-2/3 w-0.5 h-0.5 bg-brand-glow/40 rounded-full animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-white/10 rounded-full animate-float" style={{ animationDelay: '5s' }} />
      </div>

    </div>
  );
};
