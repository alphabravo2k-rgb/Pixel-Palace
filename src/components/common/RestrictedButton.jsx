import React from 'react';
import { useCapabilities } from '../../auth/useCapabilities';
import { Lock } from 'lucide-react';

export const RestrictedButton = ({ 
  action, 
  context = null, 
  children, 
  fallback = null, 
  className = "", 
  disabled = false, 
  ...props 
}) => {
  const { can } = useCapabilities();
  
  // Check if the user has the capability to perform the action
  const allowed = can(action, context); 

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

  // Render the actual button if the user is allowed
  return (
    <button className={className} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
