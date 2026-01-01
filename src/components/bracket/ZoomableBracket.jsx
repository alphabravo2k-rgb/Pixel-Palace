import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

export const ZoomableBracket = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    // Prevent default scroll behavior to handle zooming
    // Note: If you want standard scrolling, remove e.preventDefault() logic
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.5, scale + delta), 2);
        setScale(newScale);
    }
  };

  const startDrag = (e) => {
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

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-[#050505] border border-white/10 rounded-xl group select-none">
      
      {/* --- HUD CONTROLS --- */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2">
        <div className="flex gap-2 bg-zinc-900/90 backdrop-blur border border-white/10 p-1 rounded-lg shadow-2xl">
            <button 
                onClick={() => setScale(s => Math.min(s + 0.2, 2))} 
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Zoom In"
            >
                <ZoomIn size={18}/>
            </button>
            <div className="w-px bg-white/10 my-1"></div>
            <button 
                onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} 
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Zoom Out"
            >
                <ZoomOut size={18}/>
            </button>
            <div className="w-px bg-white/10 my-1"></div>
            <button 
                onClick={() => { setScale(1); setPosition({x:0,y:0}); }} 
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Reset View"
            >
                <Maximize size={18}/>
            </button>
        </div>
      </div>

      {/* --- INSTRUCTIONS OVERLAY --- */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur text-zinc-500 text-[10px] font-mono uppercase border border-white/5 rounded-full pointer-events-none">
        <Move size={12} />
        <span>Drag to Pan • Scroll to Zoom</span>
      </div>

      {/* --- INTERACTIVE AREA --- */}
      <div 
        ref={containerRef}
        className={`w-full h-full origin-top-left ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="inline-block p-20 min-w-max min-h-max"
        >
            {/* The actual Bracket Content goes here */}
            {children}
        </div>
      </div>
    </div>
  );
};
