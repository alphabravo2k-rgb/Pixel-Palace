/**
 * 🔍 ZOOMABLE BRACKET: TACTICAL VIEWPORT
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // HIGH-PHYSICS
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, Move, Crosshair } from 'lucide-react';
import { cn } from '../../lib/utils';

// MASTER INTEGRATION
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const ZoomableBracket = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // 🖱️ WHEEL ZOOM (Precise Delta Calculation)
  const handleWheel = useCallback((e) => {
    // Check for Ctrl key (standard browser zoom behavior override)
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomSpeed = 0.0015;
        const delta = e.deltaY * -zoomSpeed;
        setScale(prev => Math.min(Math.max(0.4, prev + delta), 2.5));
    }
  }, []);

  // 🖱️ PANNING LOGIC
  const startDrag = (e) => {
    if (e.button !== 0) return; // Only primary mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    try { SoundNexus.play(CUES.UI_HOVER, { volume: 0.02 }); } catch(e){}
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const stopDrag = () => {
    if (isDragging) setIsDragging(false);
  };

  // 🎛️ HUD COMMANDS
  const updateZoom = (type) => {
    SoundNexus.play(CUES.UI_CLICK);
    setScale(prev => {
      const next = type === 'in' ? prev + 0.25 : prev - 0.25;
      return Math.min(Math.max(0.4, next), 2.5);
    });
  };

  const resetView = () => { 
    try { SoundNexus.playSpatial(CUES.NAVIGATION_SWISH, 0); } catch(e){}
    Telemetry.log(EVENTS.ACTION, { action: 'bracket_view_reset' });
    setScale(1); 
    setPosition({x: 0, y: 0}); 
  };

  return (
    <div 
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#050505] rounded-sm group select-none border border-white/5 shadow-inner",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onWheel={handleWheel}
    >
      {/* 📐 TACTICAL COORDINATE GRID */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none transition-transform duration-75" 
        style={{ 
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: `${40 * scale}px ${40 * scale}px`,
            backgroundPosition: `${position.x}px ${position.y}px`
        }} 
      />

      {/* 🎛️ FLOATING HUD CONTROLS */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-3 bg-zinc-900/40 p-2 rounded-sm border border-white/10 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-4">
          <button onClick={() => updateZoom('in')} className="p-2.5 hover:bg-fuchsia-500/20 rounded-sm text-zinc-500 hover:text-fuchsia-500 transition-all active:scale-90" title="Zoom In">
            <ZoomIn size={20}/>
          </button>
          <div className="h-px bg-white/5 mx-2"></div>
          <button onClick={() => updateZoom('out')} className="p-2.5 hover:bg-fuchsia-500/20 rounded-sm text-zinc-500 hover:text-fuchsia-500 transition-all active:scale-90" title="Zoom Out">
            <ZoomOut size={20}/>
          </button>
          <div className="h-px bg-white/5 mx-2"></div>
          <button onClick={resetView} className="p-2.5 hover:bg-emerald-500/20 rounded-sm text-zinc-500 hover:text-emerald-500 transition-all active:scale-90" title="Recenter View">
            <Maximize size={20}/>
          </button>
      </div>

      {/* 🛰️ TELEMETRY PILL */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/5 rounded-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="flex items-center gap-2 text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">
          <Move size={12} className="text-fuchsia-500" />
          <span>Pan: Active</span>
          <div className="w-1 h-1 bg-zinc-800 rounded-full" />
          <Crosshair size={12} className="text-emerald-500" />
          <span>Zoom: {Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* 🖼️ THE TOURNAMENT CANVAS */}
      <motion.div 
        className="origin-top-left will-change-transform" 
        animate={{ x: position.x, y: position.y, scale: scale }}
        transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
      >
        <div className="p-[200px] min-w-max min-h-max flex items-center justify-center">
            {children}
        </div>
      </motion.div>

      {/* VIGNETTE SHADOW */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
    </div>
  );
};
