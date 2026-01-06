import React, { useState, useMemo } from 'react';
import { X, BookOpen, ChevronRight, FileText, Zap, ShieldCheck, Terminal } from 'lucide-react';
import { MANUALS } from '../../lib/manuals';
import { Modal } from '../../ui/Components';
import { cn } from '../../lib/utils';

/**
 * 📟 PIXEL PALACE: NEXUS DATAPAD
 * ------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * PURPOSE: Interactive, Role-Aware User Manual Viewer.
 */

export const NexusManual = ({ role = 'guest', isOpen, onClose }) => {
  const [view, setView] = useState('SHORT'); // 'SHORT' | 'DETAILED'

  // 🧠 INTELLIGENT CONTENT RESOLVER
  // Matches the user's role to the manual, handling edge cases.
  const content = useMemo(() => {
    const key = String(role).toLowerCase().trim();
    
    // 1. Direct Match
    if (MANUALS[key]) return MANUALS[key];
    
    // 2. Intelligent Fallbacks
    if (key === 'substitute') return MANUALS.player;
    if (key === 'manager' || key === 'igl') return MANUALS.captain;
    if (key === 'mod' || key === 'referee') return MANUALS.crew;
    
    // 3. Default Safety
    return MANUALS.guest;
  }, [role]);

  // 🎨 DYNAMIC THEMING
  const getThemeColor = () => {
    const r = String(role).toLowerCase();
    if (['owner', 'admin'].includes(r)) return 'text-brand';
    if (['captain', 'scout'].includes(r)) return 'text-emerald-400';
    if (['caster', 'streamer'].includes(r)) return 'text-purple-400';
    return 'text-white';
  };

  const themeColor = getThemeColor();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`ARCHIVE // ${role.toUpperCase()}`}>
      <div className="flex flex-col gap-6 p-2 min-h-[400px]">
        
        {/* 1. HOLOGRAPHIC HEADER CARD */}
        <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-sm flex items-start gap-5 relative overflow-hidden group">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform duration-1000 group-hover:scale-110">
            <ShieldCheck size={100} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="p-3 bg-white/5 rounded-full border border-white/10 z-10 backdrop-blur-md">
            <BookOpen className={cn("w-6 h-6", themeColor)} />
          </div>
          <div className="z-10">
            <h3 className={cn("text-xl font-display font-black uppercase italic tracking-tighter leading-none", themeColor)}>
              {content.title}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", themeColor === 'text-white' ? 'bg-zinc-500' : 'bg-current')} />
              {content.description}
            </p>
          </div>
        </div>

        {/* 2. NAVIGATION TABS */}
        <div className="flex border-b border-white/10">
          <button 
            onClick={() => setView('SHORT')}
            className={cn(
              "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2",
              view === 'SHORT' ? "border-brand text-white bg-brand/5" : "border-transparent text-zinc-600 hover:text-zinc-400"
            )}
          >
            <Zap size={14} /> Quick Start
          </button>
          <button 
            onClick={() => setView('DETAILED')}
            className={cn(
              "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2",
              view === 'DETAILED' ? "border-brand text-white bg-brand/5" : "border-transparent text-zinc-600 hover:text-zinc-400"
            )}
          >
            <FileText size={14} /> Full Protocol
          </button>
        </div>

        {/* 3. CONTENT VIEWPORT */}
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {view === 'SHORT' ? (
            <div className="space-y-3 mt-4">
              {content.short.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-black border border-zinc-800 p-4 rounded-sm group hover:border-brand/50 transition-all hover:translate-x-1">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-black font-black font-mono shadow-lg", idx === 0 ? "bg-white" : "bg-zinc-800 text-white")}>
                    {step.step}
                  </div>
                  <span className="text-sm text-zinc-300 font-medium">{step.text}</span>
                  <ChevronRight className="ml-auto w-4 h-4 text-zinc-700 group-hover:text-brand transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-6 bg-black border border-white/5 rounded-sm h-full max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap font-sans text-zinc-400 leading-relaxed text-sm">
                  {content.detailed}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER ACTION */}
        <div className="pt-4 border-t border-white/5">
          {view === 'SHORT' && (
             <button 
                onClick={() => setView('DETAILED')}
                className="w-full p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-sm flex items-center justify-center gap-3 transition-all group"
             >
                <Terminal size={14} className="text-zinc-500 group-hover:text-brand transition-colors" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] group-hover:text-white">
                  Read Full Documentation
                </span>
             </button>
          )}
          
          <div className="text-center mt-4">
            <button 
                onClick={onClose}
                className="text-[9px] text-zinc-600 hover:text-red-500 uppercase tracking-widest font-bold transition-colors"
            >
                [ Close Terminal ]
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
