import React, { useState, useMemo } from 'react';
import { X, BookOpen, ChevronRight, FileText, Zap, ShieldCheck } from 'lucide-react';
import { MANUALS } from '../../lib/manuals';
import { Modal } from '../../ui/Components';
import { cn } from '../../lib/utils';

/**
 * 📟 NEXUS DATAPAD
 * The interactive manual viewer.
 */
export const NexusManual = ({ role = 'guest', isOpen, onClose }) => {
  const [view, setView] = useState('SHORT'); // 'SHORT' | 'DETAILED'

  // 🧠 INTELLIGENT CONTENT RESOLVER
  const content = useMemo(() => {
    const key = role.toLowerCase().trim();
    // 1. Direct Match
    if (MANUALS[key]) return MANUALS[key];
    
    // 2. Fallbacks for unlisted sub-roles
    if (key === 'substitute') return MANUALS.player;
    if (key === 'manager') return MANUALS.captain;
    
    // 3. Default
    return MANUALS.guest;
  }, [role]);

  // Color coding based on hierarchy (Cosmetic)
  const getThemeColor = () => {
    const r = role.toLowerCase();
    if (['owner', 'admin'].includes(r)) return 'text-brand';
    if (['captain', 'scout'].includes(r)) return 'text-emerald-400';
    if (['caster', 'streamer'].includes(r)) return 'text-purple-400';
    return 'text-white';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`ARCHIVE // ${role.toUpperCase()}`}>
      <div className="flex flex-col gap-6 p-2 min-h-[400px]">
        
        {/* HEADER CARD */}
        <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-sm flex items-start gap-5 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={100} />
          </div>

          <div className="p-3 bg-white/5 rounded-full border border-white/10 z-10">
            <BookOpen className={cn("w-6 h-6", getThemeColor())} />
          </div>
          <div className="z-10">
            <h3 className={cn("text-xl font-display font-black uppercase italic tracking-tighter leading-none", getThemeColor())}>
              {content.title}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 bg-zinc-700 rounded-full animate-pulse" />
              {content.description}
            </p>
          </div>
        </div>

        {/* TABS */}
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

        {/* CONTENT AREA */}
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {view === 'SHORT' ? (
            <div className="space-y-3 mt-4">
              {content.short.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-black border border-zinc-800 p-4 rounded-sm group hover:border-brand/50 transition-colors">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-black font-black font-mono shadow-lg", idx === 0 ? "bg-white" : "bg-zinc-800 text-white")}>
                    {step.step}
                  </div>
                  <span className="text-sm text-zinc-300 font-medium">{step.text}</span>
                  <ChevronRight className="ml-auto w-4 h-4 text-zinc-700 group-hover:text-brand transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-6 bg-black border border-white/5 rounded-sm h-full max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap font-sans text-zinc-400 leading-relaxed text-sm">
                  {content.detailed}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="text-center pt-4 border-t border-white/5">
          <button 
            onClick={onClose}
            className="text-[9px] text-zinc-600 hover:text-white uppercase tracking-widest font-bold transition-colors"
          >
            [ Close Terminal ]
          </button>
        </div>

      </div>
    </Modal>
  );
};
