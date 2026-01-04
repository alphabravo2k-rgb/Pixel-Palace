import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ZoomableBracket = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // 🖱️ WHEEL ZOOM (Ctrl + Scroll)
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2));
    }
  };

  // 🖱️ PANNING LOGIC
  const startDrag = (e) => {
    // Only allow left click (button 0)
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onDrag = (e) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const stopDrag = () => setIsDragging(false);

  // 🎛️ CONTROLS
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetView = () => { 
      setScale(1); 
      setPosition({x: 0, y: 0}); 
  };

  return (
    <div 
        className="relative w-full h-full overflow-hidden bg-bg rounded-lg group select-none cursor-grab active:cursor-grabbing border border-tactical"
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onWheel={handleWheel}
    >
      {/* 📐 TACTICAL GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ 
               backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
               backgroundSize: '40px 40px',
               transform: `translate(${position.x % 40}px, ${position.y % 40}px) scale(${scale})` // Parallax effect
           }} 
      />

      {/* 🎛️ HUD CONTROLS */}
      <div className="absolute bottom-6 right-6 z-50 flex gap-2 bg-zinc-900/90 p-1.5 rounded-md border border-white/10 shadow-xl backdrop-blur-md">
         <button onClick={zoomIn} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors" title="Zoom In"><ZoomIn size={18}/></button>
         <div className="w-px bg-white/10 my-1"></div>
         <button onClick={zoomOut} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors" title="Zoom Out"><ZoomOut size={18}/></button>
         <div className="w-px bg-white/10 my-1"></div>
         <button onClick={resetView} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors" title="Reset View"><Maximize size={18}/></button>
      </div>

      {/* ℹ️ INSTRUCTION PILL */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur text-zinc-500 text-[10px] font-mono uppercase border border-white/5 rounded-full pointer-events-none transition-opacity opacity-50 group-hover:opacity-100">
        <Move size={12} />
        <span>Drag to Pan • Ctrl+Scroll to Zoom</span>
      </div>

      {/* 🖼️ THE CANVAS */}
      <div 
        className="origin-top-left transition-transform duration-75 ease-out will-change-transform" 
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
      >
        <div className="p-20 min-w-max min-h-max relative z-10">
            {children}
        </div>
      </div>
    </div>
  );
};
