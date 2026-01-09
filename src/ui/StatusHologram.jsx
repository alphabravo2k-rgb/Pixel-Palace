/**
 * 📡 STATUS HOLOGRAM (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: SECURED // 3D & 8D ENABLED
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Radio, Disc, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
// Note: Ensure this path is correct. If the audio engine isn't ready, the safe try/catch below handles it.
import { SoundNexus, CUES } from '../lib/soundNexus'; 

export const StatusHologram = ({ type = 'ac', status = 'offline', className = "" }) => {
  const isOnline = status === 'online' || status === 'active';
  
  // 🔊 SENSORY TRIGGER: Audio feedback on status change
  useEffect(() => {
    if (isOnline) {
      try {
        SoundNexus.playSpatial(CUES.UI_SUCCESS); // Spatial ping when link connects
      } catch (e) {
        // Audio engine fallback
      }
    }
  }, [isOnline]);

  const config = {
    ac: {
      label: 'AKROS SHIELD',
      icon: isOnline ? ShieldCheck : ShieldAlert,
      color: isOnline ? 'text-emerald-400' : 'text-red-500',
      glow: isOnline ? 'shadow-neon' : 'shadow-none',
      subtext: isOnline ? 'KERNEL ENFORCED' : 'CLIENT REQUIRED'
    },
    discord: {
      label: 'NEURAL LINK',
      icon: isOnline ? Radio : Disc,
      color: isOnline ? 'text-indigo-400' : 'text-zinc-600',
      glow: isOnline ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'shadow-none',
      subtext: isOnline ? 'SYNCED TO HUB' : 'VIRTUAL OFFLINE'
    },
    system: {
      label: 'GOD EYE',
      icon: Activity,
      color: isOnline ? 'text-brand-glow' : 'text-zinc-700',
      glow: isOnline ? 'shadow-neon-purple' : 'shadow-none',
      subtext: isOnline ? 'LIVE UPLINK' : 'SYSTEM SLEEP'
    }
  }[type];

  return (
    <motion.div 
      whileHover={{ translateZ: 10, rotateX: 2 }}
      className={cn(
        "relative flex items-center justify-between p-4 bg-black/60 border border-white/5 backdrop-blur-xl group perspective-card overflow-hidden",
        config.glow,
        className
      )}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
    >
      {/* 🚀 THE SCANLINE EFFECT (Internal) */}
      <div className={cn(
        "absolute inset-0 opacity-[0.05] pointer-events-none animate-scan",
        isOnline ? "bg-gradient-to-b from-white/20 to-transparent" : "hidden"
      )} />

      <div className="flex items-center gap-4 relative z-10">
        {/* ICON SLOT */}
        <div className={cn(
          "relative p-2 rounded-sm bg-white/[0.03] border border-white/5",
          config.color
        )}>
          <config.icon size={18} className={isOnline ? "animate-breathe" : "opacity-40"} />
          {isOnline && (
            <motion.div 
              layoutId={`glow-${type}`}
              className="absolute inset-0 bg-current opacity-20 blur-md rounded-full" 
            />
          )}
        </div>

        {/* DATA FIELDS */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black leading-tight">
            {config.label}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-mono font-bold uppercase tracking-widest", config.color)}>
              {status}
            </span>
            <span className="text-[8px] text-zinc-700 font-mono tracking-tighter">
              // {config.subtext}
            </span>
          </div>
        </div>
      </div>
      
      {/* 🟢 BLINKING LED / HEARTBEAT */}
      <div className="flex flex-col items-end gap-1 relative z-10">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full shadow-lg",
          isOnline ? "bg-emerald-400 animate-pulse shadow-emerald-500/50" : "bg-zinc-800"
        )} />
        <div className="h-4 w-[1px] bg-white/5" />
      </div>

      {/* TACTICAL CORNER DECOR */}
      <div className={cn(
        "absolute bottom-0 right-0 w-4 h-4 opacity-20",
        isOnline ? "border-r-2 border-b-2" : "border-r border-b",
        config.color
      )} />
    </motion.div>
  );
};
