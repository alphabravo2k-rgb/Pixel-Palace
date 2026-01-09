/**
 * 🛡️ ROLE GUARD: NEURAL CLEARANCE SYSTEM
 * VERSION: 2050.5.0 (GENESIS OMNI)
 * STATUS: SECURED // HIERARCHY ENFORCED
 */

import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

// ⚠️ SYSTEM LINK: We will build these stores in the next phase (Logic Layer)
// If the app crashes, it means we haven't created /store/useNexusStore yet.
import { useNexusStore } from '../store/useNexusStore'; 
import { ROLE_DEF } from '../lib/roles';

export const RoleGuard = ({ 
  children, 
  minLevel = 0, 
  allowedRoles = [], 
  fallback = null,
  showVisualFallback = false 
}) => {
  const { profile, loading } = useNexusStore();

  // 1. SYSTEM LOADING STATE
  if (loading) return null;

  // 2. IDENTITY VALIDATION
  // We grab the role from the profile (e.g., 'owner', 'admin') and normalize it
  const userRoleStr = profile?.role || 'guest';
  const userRoleKey = userRoleStr.toUpperCase();
  
  // 3. LEVEL CHECK
  // We assume ROLE_DEF has numeric levels (Owner=100, Admin=90, etc.)
  const userLevel = ROLE_DEF?.[userRoleKey]?.level || 0;

  // 4. AUTHORIZATION LOGIC
  // A user passes if they meet the Level Requirement OR have a Specific Allowed Role
  const hasLevel = userLevel >= minLevel;
  const hasSpecificRole = allowedRoles.length > 0 ? allowedRoles.includes(userRoleStr) : true;
  
  const isAuthorized = hasLevel && hasSpecificRole;

  if (isAuthorized) {
    return <>{children}</>;
  }

  // 5. RESTRICTED ACCESS UI (The "Faceit-Killer" Visual)
  // Used for protecting entire routes or critical sections
  const RequiredVisual = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 border border-red-900/30 bg-red-950/5 rounded-sm perspective-container group"
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 animate-pulse" />
        <div className="relative p-4 border border-red-500/50 bg-black rounded-sm shadow-neon-red">
          <ShieldAlert size={32} className="text-red-500 animate-glitch" />
        </div>
      </div>
      
      <h3 className="text-white font-display font-black text-xl uppercase tracking-widest italic">
        Access Denied
      </h3>
      <p className="text-red-500/60 font-mono text-[10px] uppercase tracking-tighter mt-2">
        Neural Signature Invalid // Requires Level {minLevel}+ Clearance
      </p>
      
      <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
    </motion.div>
  );

  if (showVisualFallback) return <RequiredVisual />;
  
  // 6. INLINE FALLBACK (Subtle)
  // Used for hiding buttons or small divs
  return fallback || (
    <div className="group relative flex items-center gap-3 px-3 py-2 text-red-500 text-[10px] font-mono border border-red-900/20 bg-red-950/10 rounded-sm clip-path-slant overflow-hidden select-none cursor-not-allowed opacity-80">
      <div className="absolute inset-0 bg-scanline opacity-10 animate-scan pointer-events-none" />
      <Lock size={12} className="animate-flicker" />
      <span className="uppercase tracking-widest">Clearance Level {minLevel} Required</span>
    </div>
  );
};
