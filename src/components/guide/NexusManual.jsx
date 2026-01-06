/**
 * PIXEL PALACE: NEXUS DATAPAD (OPERATIONAL HUD)
 * VERSION: 1.1.0 (MASTER HYBRID)
 * STATUS: MASTERED (DUBAI STANDARD)
 * - Haptic Navigation: Integrated SoundNexus
 * - Dynamic Theme Shielding: Role-based GPU effects
 * - Intelligent Content Routing
 */

import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, ChevronRight, FileText, Zap, ShieldCheck, Terminal, Activity } from 'lucide-react';
import { MANUALS } from '../../lib/manuals';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Modal } from '../../ui/Components';
import { cn } from '../../lib/utils';

export const NexusManual = ({ role = 'guest', isOpen, onClose }) => {
  const [view, setView] = useState('SHORT');

  // 🔊 Audio Feedback on Tab Switch
  const handleTabChange = (newView) => {
    if (view === newView) return;
    SoundNexus.play(CUES.UI_CLICK);
    setView(newView);
  };

  // 🧠 INTELLIGENT CONTENT RESOLVER
  const content = useMemo(() => {
    const key = String(role).toLowerCase().trim();
    
    // 1. Direct Match
    if (MANUALS[key]) return MANUALS[key];
    
    // 2. Alias Resolution
    const fallbacks = {
      substitute: 'player',
      bench: 'player',
      manager: 'captain',
      igl: 'captain',
      mod: 'crew',
      referee: 'crew'
    };

    return MANUALS[fallbacks[key]] || MANUALS.guest;
  }, [role]);

  // 🎨 GPU Theme Logic
  const roleStyles = useMemo(() => {
    const r = String(role).toLowerCase();
    if (['owner', 'admin'].includes(r)) return { color: 'text-brand', glow: 'shadow-neon', bg: 'bg-brand/5' };
    if (['captain', 'scout'].includes(r)) return { color: 'text-emerald-400', glow: 'shadow-neon-emerald', bg: 'bg-emerald-500/5' };
    if (['caster', 'streamer'].includes(r)) return { color: 'text-purple-400', glow: 'shadow-neon-purple', bg: 'bg-purple-500/5' };
    return { color: 'text-white', glow: '', bg: 'bg-white/5' };
  }, [role]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`INTEL // CLEARANCE: ${role.toUpperCase()}`}>
      <div className="flex flex-col gap-6 p-2 relative overflow-hidden">
        
        {/* HOLOGRAPHIC OVERLAY */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#000000_100%)] pointer-events-none z-0" />

        {/* 1. IDENTITY HEADER */}
        <div className={cn(
          "border border-white/10 p-6 rounded-sm flex items-start gap-6 relative z-10 transition-all duration-700",
          roleStyles.bg
        )}>
          <div className={cn(
            "p-4 rounded-full border border-white/10 backdrop-blur-xl transition-all duration-1000",
            roleStyles.glow
          )}>
            <ShieldCheck className={cn("w-8 h-8", roleStyles.color)} />
          </div>
          <div className="flex-1">
            <h3 className={cn("text-2xl font-display font-black uppercase italic tracking-tighter", roleStyles.color)}>
              {content.title}
            </h3>
            <div className="flex items-center gap-3 mt-2">
               <Activity size={12} className="text-zinc-600 animate-pulse" />
               <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.3em]">
                 {content.description}
               </p>
            </div>
          </div>
        </div>

        {/* 2. OPERATIONAL TABS */}
        <div className="flex bg-black border border-white/5 rounded-sm p-1 z-10">
          {[
            { id: 'SHORT', label: 'Quick Start', icon: Zap },
            { id: 'DETAILED', label: 'Full Protocol', icon: FileText }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded-sm",
                view === tab.id ? "bg-white text-black shadow-neon" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
              )}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* 3. CORE CONTENT BUFFER */}
        <div className="flex-1 min-h-[300px] z-10">
          {view === 'SHORT' ? (
            <div className="space-y-3">
              {content.short.map((step, idx) => (
                <div key={idx} className="flex items-center gap-5 bg-zinc-950 border border-white/5 p-5 rounded-sm group hover:border-brand/40 transition-all">
                  <div className="w-10 h-10 bg-black border border-zinc-800 flex items-center justify-center text-zinc-500 font-black font-mono text-sm group-hover:text-brand group-hover:border-brand/20 transition-all">
                    0{step.step}
                  </div>
                  <span className="text-xs text-zinc-400 font-black uppercase tracking-widest leading-relaxed">
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-black border border-white/5 rounded-sm max-h-[350px] overflow-y-auto custom-scrollbar shadow-inner">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap font-sans text-zinc-400 leading-relaxed text-sm">
                  {content.detailed}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. SYSTEM EXIT */}
        <div className="pt-4 border-t border-white/5 z-10 flex justify-between items-center">
            <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Nexus Kernel v4.2.0</span>
            <button 
                onClick={() => { SoundNexus.play(CUES.UI_CLICK); onClose(); }}
                className="text-[9px] text-zinc-600 hover:text-red-500 uppercase tracking-[0.4em] font-black transition-colors"
            >
                [ Terminate Connection ]
            </button>
        </div>
      </div>
    </Modal>
  );
};
