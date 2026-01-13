/**
 * PIXEL PALACE: NEXUS DATAPAD (OPERATIONAL HUD)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // DATA-ENRICHED
 */

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Zap, FileText, Activity, 
  Terminal, ChevronRight, Cpu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// MASTER INTEGRATION
import { MANUALS } from '../../lib/manuals';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Modal } from '../../ui/Components';
import { cn } from '../../lib/utils';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const NexusManual = ({ role = 'guest', isOpen, onClose }) => {
  const [view, setView] = useState('SHORT');

  // 🧠 INTELLIGENT CONTENT RESOLVER
  const content = useMemo(() => {
    const key = String(role).toLowerCase().trim();
    
    // Protocol Fallbacks
    const fallbacks = {
      substitute: 'player',
      bench: 'player',
      manager: 'captain',
      igl: 'captain',
      mod: 'crew',
      referee: 'crew'
    };

    return MANUALS[key] || MANUALS[fallbacks[key]] || MANUALS.guest;
  }, [role]);

  // 🎨 DYNAMIC DNA STYLING
  const roleStyles = useMemo(() => {
    const r = String(role).toLowerCase();
    const themes = {
      owner: { color: 'text-fuchsia-500', glow: 'shadow-[0_0_20px_#f472b620]', bg: 'bg-fuchsia-500/5', border: 'border-fuchsia-500/30' },
      admin: { color: 'text-red-500', glow: 'shadow-[0_0_20px_#ef444420]', bg: 'bg-red-500/5', border: 'border-red-500/30' },
      captain: { color: 'text-emerald-400', glow: 'shadow-[0_0_20px_#10b98120]', bg: 'bg-emerald-500/5', border: 'border-emerald-500/30' },
      player: { color: 'text-blue-400', glow: 'shadow-[0_0_20px_#60a5fa20]', bg: 'bg-blue-500/5', border: 'border-blue-500/30' }
    };
    return themes[r] || { color: 'text-zinc-400', glow: '', bg: 'bg-zinc-900/40', border: 'border-white/10' };
  }, [role]);

  const handleTabChange = (newView) => {
    if (view === newView) return;
    try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
    setView(newView);
    Telemetry.log(EVENTS.ACTION, { action: 'MANUAL_VIEW_CHANGE', view: newView });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`PROTOCOL // CLEARANCE: ${role.toUpperCase()}`}
    >
      <div className="flex flex-col gap-6 p-2 relative overflow-hidden bg-[#050505]">
        
        {/* 🧩 ATMOSPHERIC GRID LAYER */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="scanlines" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-transparent to-transparent" />
        </div>

        {/* 1. IDENTITY HEADER */}
        <div className={cn(
          "border p-8 rounded-sm flex items-start gap-8 relative z-10 overflow-hidden",
          roleStyles.bg, roleStyles.border
        )}>
          {/* Role Decorator */}
          <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
             <ShieldCheck size={120} className={roleStyles.color} />
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-16 h-16 rounded-sm border flex items-center justify-center backdrop-blur-3xl transition-all duration-1000 rotate-45 group",
              roleStyles.glow, roleStyles.border
            )}
          >
            <ShieldCheck className={cn("w-8 h-8 -rotate-45", roleStyles.color)} />
          </motion.div>

          <div className="flex-1 relative z-10">
            <h3 className={cn("text-3xl font-display font-black uppercase italic tracking-tighter leading-none", roleStyles.color)}>
              {content.title}
            </h3>
            <div className="flex items-center gap-4 mt-3">
               <Activity size={12} className="text-zinc-700 animate-pulse" />
               <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.4em]">
                 {content.description}
               </p>
            </div>
          </div>
        </div>

        {/* 2. TAB SELECTOR */}
        <div className="flex bg-zinc-900/40 border border-white/5 rounded-sm p-1.5 z-10 relative">
          {[
            { id: 'SHORT', label: 'Tactical Start', icon: Zap },
            { id: 'DETAILED', label: 'Master Protocol', icon: FileText }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 rounded-sm relative overflow-hidden group",
                view === tab.id ? "bg-white text-black shadow-neon" : "text-zinc-600 hover:text-zinc-300"
              )}
            >
              <tab.icon size={14} className={cn(view === tab.id ? "animate-pulse" : "")} /> 
              {tab.label}
              {view !== tab.id && (
                  <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              )}
            </button>
          ))}
        </div>

        {/* 3. SCROLLABLE BUFFER */}
        <div className="flex-1 min-h-[400px] z-10 relative">
          <AnimatePresence mode="wait">
            {view === 'SHORT' ? (
              <motion.div 
                key="short"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 gap-3"
              >
                {content.short.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-6 bg-zinc-900/20 border border-white/5 p-6 rounded-sm group hover:border-zinc-700 transition-all cursor-default">
                    <div className="w-12 h-12 bg-black border border-zinc-800 flex items-center justify-center text-zinc-600 font-black font-mono text-base group-hover:text-white transition-colors relative">
                        <span className="relative z-10">0{step.step}</span>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.2em] leading-relaxed group-hover:text-zinc-200 transition-colors">
                      {step.text}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="detailed"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="p-8 bg-zinc-900/10 border border-white/5 rounded-sm h-[400px] overflow-y-auto custom-scrollbar shadow-inner"
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="flex items-center gap-2 text-zinc-600 mb-6 font-mono text-[9px] uppercase tracking-widest border-b border-white/5 pb-2">
                    <Terminal size={12} /> Decrypted File Content
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-zinc-400 leading-relaxed text-sm">
                    {content.detailed}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. FOOTER COMMANDS */}
        <div className="pt-6 border-t border-white/5 z-10 flex justify-between items-center bg-black/40 px-4 py-3 rounded-b-sm">
            <div className="flex items-center gap-3">
                <Cpu size={12} className="text-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-[0.3em]">Build_SentinX_4.2.0</span>
            </div>
            <button 
                onClick={() => { try{SoundNexus.play(CUES.UI_POWER_DOWN);}catch(e){} onClose(); }}
                className="group flex items-center gap-3 text-[10px] text-zinc-600 hover:text-red-500 uppercase tracking-[0.4em] font-black transition-all"
            >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">Disconnecting...</span>
                [ End Uplink ]
            </button>
        </div>
      </div>
    </Modal>
  );
};
