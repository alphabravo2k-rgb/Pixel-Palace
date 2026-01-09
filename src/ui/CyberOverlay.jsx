import React from 'react';
import { cn } from '../lib/utils';

/**
 * 🌌 CYBER OVERLAY
 * Injects the "Industrial Texture" into the viewport.
 * - Noise: Physical texture
 * - Scanlines: CRT effect
 * - Vignette: Focuses attention to center
 */
export const CyberOverlay = ({ intensity = 'normal', className }) => {
  return (
    <div className={cn("pointer-events-none fixed inset-0 z-[0]", className)}>
      {/* 1. Neural Noise (CSS handled in index.css body::before, but here for local overrides) */}
      
      {/* 2. CRT Scanlines */}
      <div className={cn(
        "absolute inset-0 bg-scanline opacity-[0.03] mix-blend-overlay",
        intensity === 'high' && "opacity-[0.06]"
      )} />

      {/* 3. Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      
      {/* 4. Ambient Glow (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-brand/5 to-transparent opacity-50" />
    </div>
  );
};
