import React from 'react';
import { ShieldCheck, ShieldAlert, Radio, Disc } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * 📡 STATUS HOLOGRAM
 * Shows live connectivity status for AC and Discord.
 */
export const StatusHologram = ({ type = 'ac', status = 'offline' }) => {
  const isOnline = status === 'online' || status === 'active';
  
  const config = {
    ac: {
      label: 'AKROS AC',
      icon: isOnline ? ShieldCheck : ShieldAlert,
      color: isOnline ? 'text-emerald-500' : 'text-red-500',
      glow: isOnline ? 'shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'shadow-none'
    },
    discord: {
      label: 'NEURAL LINK',
      icon: isOnline ? Radio : Disc,
      color: isOnline ? 'text-indigo-400' : 'text-zinc-500',
      glow: isOnline ? 'shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'shadow-none'
    }
  }[type];

  return (
    <div className={cn(
      "flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-sm backdrop-blur-sm w-full",
      config.glow
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-sm bg-white/5", config.color)}>
          <config.icon size={16} className={isOnline ? "animate-pulse" : ""} />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
            {config.label}
          </span>
          <span className={cn("text-xs font-mono uppercase", config.color)}>
            {isOnline ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>
      
      {/* Blinking LED */}
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        isOnline ? "bg-emerald-500 animate-ping" : "bg-red-900"
      )} />
    </div>
  );
};
