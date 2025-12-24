import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * ❌ CRITICAL FIX: Prevent XSS by validating URL protocol
 * We only allow http: and https: protocols.
 * Javascript: schemes will be rejected immediately.
 */
const isSafeUrl = (url) => {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
};

export const SocialButton = ({ icon: Icon, href, label, color = "text-white" }) => {
  const isValid = href && href.length > 3; // Basic length check
  
  // 🛡️ NON-NEGOTIABLE SECURITY CHECK
  // If URL is invalid OR unsafe (javascript: etc), treat as disabled.
  const isSafe = isSafeUrl(href);
  const isDisabled = !isValid || !isSafe;

  if (isDisabled) {
    return (
      <div 
        className="group relative p-2 rounded-md bg-zinc-900/50 opacity-50 cursor-not-allowed"
        aria-label={`${label} (Unavailable)`}
      >
        <Icon className="w-5 h-5 text-zinc-600" />
        
        {/* Tooltip for Disabled State */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-[10px] text-zinc-500 uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {label} Unlinked
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer" // Security best practice for external links
      className={`
        group relative p-2 rounded-md bg-zinc-900/50 hover:bg-zinc-800 
        transition-all duration-300 hover:scale-110 active:scale-95
        ${color}
      `}
      onClick={(e) => e.stopPropagation()} // ✅ Event propagation handling kept
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
      <ExternalLink className="absolute top-1 right-1 w-2 h-2 opacity-0 group-hover:opacity-50 transition-opacity" />
      
      {/* Tooltip for Active State */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-[10px] text-white uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Open {label}
      </div>
    </a>
  );
};
