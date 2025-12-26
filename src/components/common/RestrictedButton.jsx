import React, { useState, useEffect } from 'react';
import { useCapabilities } from '../../auth/useCapabilities';
import { Lock } from 'lucide-react';

export const RestrictedButton = ({ 
  action, 
  resourceId, 
  children, 
  fallback = null,
  className = "",
  ...props 
}) => {
  const { can } = useCapabilities();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const result = await can(action, resourceId);
      if (mounted) {
        setAllowed(result);
        setLoading(false);
      }
    };
    check();
    return () => { mounted = false; };
  }, [action, resourceId, can]);

  if (loading) {
    return <div className="w-8 h-4 bg-white/5 animate-pulse rounded" />;
  }

  if (!allowed) {
    // If fallback is provided (like a Lock icon), show it. Otherwise render nothing.
    return fallback ? (
      <button disabled className={`opacity-50 cursor-not-allowed flex items-center gap-2 ${className}`}>
        <Lock className="w-3 h-3" />
        {children}
      </button>
    ) : null;
  }

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};
