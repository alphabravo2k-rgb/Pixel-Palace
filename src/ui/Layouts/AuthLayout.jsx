import React from 'react';
import { Outlet } from 'react-router-dom';
import { CyberOverlay } from '../CyberOverlay';

export const AuthLayout = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-bg">
      {/* 1. Background Ambience */}
      <CyberOverlay intensity="high" />
      
      {/* 2. 3D Grid Floor (CSS Perspective) */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ 
             background: 'linear-gradient(to bottom, transparent 0%, #c026d3 100%)',
             maskImage: 'linear-gradient(to bottom, transparent, black)'
           }} 
      />

      {/* 3. The Auth Monolith */}
      <div className="relative z-10 w-full max-w-md p-6 perspective-container">
        <div className="glass-hard p-8 relative overflow-hidden group">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent" />
          
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-display font-black tracking-tighter text-white italic">
              PIXEL<span className="text-brand">PALACE</span>
            </h1>
            <p className="text-xs font-mono text-brand-glow uppercase tracking-[0.3em] mt-2">
              Identity Verification
            </p>
          </div>

          <Outlet /> {/* Renders Login/Register Forms */}
          
          {/* Bottom Decorative Line */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-800" />
        </div>
      </div>
    </div>
  );
};
