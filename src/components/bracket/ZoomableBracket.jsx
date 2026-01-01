import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

export const ZoomableBracket = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        // Use prevScale explicit naming
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2));
    }
  };

  const startDrag = (e) => {
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

  // Helper functions to avoid inline arrow complexity
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetView = () => { setScale(1); setPosition({x:0,y:0}); };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050505] rounded-xl group select-none cursor-grab active:cursor-grabbing border border-white/5"
         onMouseDown={startDrag}
         onMouseMove={onDrag}
         onMouseUp={stopDrag}
         onMouseLeave={stopDrag}
         onWheel={handleWheel}
    >
      {/* Controls */}
      <div className="absolute bottom-6 right-6 z-50 flex gap-2 bg-zinc-900/90 p-1 rounded-lg border border-white/10 shadow-xl backdrop-blur-md">
         <button onClick={zoomIn} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"><ZoomIn size={18}/></button>
         <div className="w-px bg-white/10 my-1"></div>
         <button onClick={zoomOut} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"><ZoomOut size={18}/></button>
         <div className="w-px bg-white/10 my-1"></div>
         <button onClick={resetView} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"><Maximize size={18}/></button>
      </div>

      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur text-zinc-500 text-[10px] font-mono uppercase border border-white/5 rounded-full pointer-events-none transition-opacity opacity-50 group-hover:opacity-100">
        <Move size={12} />
        <span>Drag to Pan • Ctrl+Scroll to Zoom</span>
      </div>

      <div className="origin-top-left transition-transform duration-75 ease-out" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}>
        <div className="p-20 min-w-max min-h-max">
            {children}
        </div>
      </div>
    </div>
  );
};
