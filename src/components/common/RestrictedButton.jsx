/**
 * 🔒 RESTRICTED BUTTON: SECURITY GATE (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: SECURED // ATOMIC
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

// MASTER INTEGRATION
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const RestrictedButton = ({ 
  action, 
  context = null, 
  children, 
  fallback = null, 
  className = "", 
  disabled = false, 
  silent = false, 
  onClick,
  ...props 
}) => {
  const { can, user } = useNexus();
  
  // 🛡️ AUTHORIZATION HANDSHAKE
  // Checks permissions against the centralized Role Definition Matrix
  const allowed = can(action, context); 

  if (!allowed) {
    // Protocol 1: Total Stealth (UI cleanup - renders nothing)
    if (silent) return null;

    // Protocol 2: Custom Proxy UI (e.g. "Upgrade to Pro")
    if (fallback) return fallback;

    // Protocol 3: Visual Lock (Standard Gating)
    return (
      <div 
        className={cn(
            "flex items-center justify-center gap-2 opacity-30 cursor-not-allowed grayscale pointer-events-none select-none border border-zinc-800 rounded-sm bg-black/40 px-4 py-2",
            className
        )}
        title="CLEARANCE VOID // ACCESS DENIED"
      >
        <Lock className="w-3 h-3 text-red-500/50" />
        <span className="font-mono text-[10px] uppercase tracking-tighter text-zinc-500">{children}</span>
      </div>
    );
  }

  // 🛰️ EXECUTION HANDLER
  const handleInteraction = (e) => {
    if (disabled) return;

    // 🔊 Haptic Response
    SoundNexus.play(CUES.UI_CLICK);
    
    // 📊 Forensic Logging for sensitive administrative actions
    if (typeof action === 'string' && action.startsWith('CAP_ADMIN_')) {
      Telemetry.log(EVENTS.ACTION, { action, status: 'EXECUTED' }, user?.id);
    }

    if (onClick) onClick(e);
  };

  return (
    <motion.button 
        whileHover={{ y: -1, scale: 1.01, filter: 'brightness(1.1)' }}
        whileTap={{ scale: 0.97 }}
        onClick={handleInteraction}
        className={cn(
          "transition-all duration-300 relative overflow-hidden group", 
          className
        )}
        disabled={disabled} 
        {...props}
    >
      {/* GLOW OVERLAY FOR ACTIVE BUTTONS */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
