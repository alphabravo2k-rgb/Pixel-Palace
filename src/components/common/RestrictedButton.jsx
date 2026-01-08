import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

// MASTER INTEGRATION
import { useNexusStore } from '../../store/useNexusStore';
import { can } from '../../lib/security/engine'; // ✅ ALIGNED PATH
import { SoundNexus, CUES } from '../../lib/soundNexus';

/**
 * 🔒 RESTRICTED BUTTON: SECURITY GATE
 * -----------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * FEATURES:
 * 1. INTELLIGENT GATING: Checks permissions against the Nexus Security Engine.
 * 2. SILENT MODE: Can render nothing if unauthorized (for cleaner UI).
 * 3. HAPTIC FEEDBACK: Audio clicks for authorized actions.
 */

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
  const { profile } = useNexusStore();
  
  // 🛡️ SECURITY CHECK
  // We pass the profile directly. The engine handles null checks.
  const allowed = can(action, { role: profile?.role }, context); 

  if (!allowed) {
    // 1. Silent Mode: Vanish completely
    if (silent) return null;

    // 2. Custom Fallback: Render alternative UI
    if (fallback) return fallback;

    // 3. Default: Render a locked, visual-only button
    return (
      <div 
        className={cn(
            "flex items-center justify-center gap-2 opacity-50 cursor-not-allowed grayscale pointer-events-none select-none",
            className
        )}
        title="ACCESS DENIED: INSUFFICIENT CLEARANCE"
        aria-disabled="true"
      >
        <Lock className="w-3 h-3" />
        {children}
      </div>
    );
  }

  // 4. Authorized Action
  return (
    <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
            if (!disabled) SoundNexus.play(CUES.UI_CLICK);
            if (onClick) onClick(e);
        }}
        className={cn("transition-colors", className)}
        disabled={disabled} 
        {...props}
    >
      {children}
    </motion.button>
  );
};
