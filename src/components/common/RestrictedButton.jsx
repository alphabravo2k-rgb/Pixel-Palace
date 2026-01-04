import React from 'react';
import { useSession } from '../../auth/useSession';
import { can } from '../../lib/permissions';
import { Lock } from 'lucide-react';
import { cn } from '../../lib/utils'; // Optional, but good for class merging if you have it

export const RestrictedButton = ({ 
  action, 
  context = null, 
  children, 
  fallback = null, 
  className = "", 
  disabled = false, 
  silent = false, // New: If true, renders nothing instead of a lock button
  ...props 
}) => {
  const { session } = useSession();
  
  // 🛡️ SECURITY CHECK
  // Directly asks the Permission Engine
  const allowed = can(action, session, context); 

  if (!allowed) {
    // 1. Silent Mode: Vanish completely
    if (silent) return null;

    // 2. Custom Fallback: Render what the parent wants (e.g. a "Login to Vote" text)
    if (fallback) return fallback;

    // 3. Default: Render a locked, grayed-out button
    return (
      <button 
        disabled 
        className={`opacity-50 cursor-not-allowed flex items-center justify-center gap-2 grayscale pointer-events-none ${className}`} 
        title="Access Denied: Insufficient Permissions"
      >
        <Lock className="w-3 h-3" />
        {children}
      </button>
    );
  }

  // Render the actual button if allowed
  return (
    <button className={className} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
