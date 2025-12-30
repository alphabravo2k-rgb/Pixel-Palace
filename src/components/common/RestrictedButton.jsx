import React from 'react';
import { useCapabilities } from '../../auth/useCapabilities'; 
import { Lock } from 'lucide-react';

/**
 * 🛡️ RestrictedButton
 * UX Gating Component. 
 * Instantly checks permissions without layout shift.
 */
export const RestrictedButton = ({ 
  action, 
  resourceId = null, // Added to support context checks (e.g. Captain owning a match)
  children, 
  fallback = null, 
  className = "", 
  disabled = false,
  ...props 
}) => {
  const { can } = useCapabilities();
  
  // Synchronous check - Instant result
  const allowed = can(action, { id: resourceId }); 

  if (!allowed) {
    if (fallback) return fallback;

    // Default fallback: A disabled, locked button
    return (
      <button disabled className={`opacity-50 cursor-not-allowed flex items-center gap-2 ${className}`} title="Access Denied">
        <Lock className="w-3 h-3" />
        {children}
      </button>
    );
  }

  // Render the actual button
  return (
    <button className={className} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
