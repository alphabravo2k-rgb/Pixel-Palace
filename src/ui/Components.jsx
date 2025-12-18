import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * OPINIONATED TACTICAL BUTTON
 * Design System Primitive: Do not use for generic text buttons.
 * Locked API to prevent variant prop drilling.
 */
export const Button = ({ children, variant = 'primary', className = '', disabled = false, type = 'button', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-zinc-800 text-zinc-300 hover:bg-[#ff5500] hover:text-black border border-zinc-700 hover:border-[#ff5500]",
    secondary: "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600",
    danger: "bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 hover:border-red-500",
    success: "bg-emerald-900/20 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-900/40 hover:border-emerald-500",
    ghost: "bg-transparent text-zinc-500 hover:text-white"
  };

  // Safe fallback for invalid variants
  const resolvedVariant = variants[variant] ?? variants.primary;

  return (
    <button 
     type={type}
     disabled={disabled}
     className={`${baseStyle} ${resolvedVariant} ${className}`}
     {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
    green: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    red: 'bg-red-900/30 text-red-400 border-red-800',
    yellow: 'bg-yellow-900/30 text-yellow-500 border-yellow-800',
    gray: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-800'
  };

  const resolvedColor = colors[color] || colors.gray;

  return (
    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${resolvedColor} ${className}`}>
      {children}
    </span>
  );
};

/**
 * TACTICAL MODAL SHELL
 * Handles backdrop, focus capture, scroll locking, and basic keyboard events.
 * * Note: This component is currently responsible for both behavior and layout.
 * If needs diverge (e.g. headless modals), split into ModalShell + ModalContent.
 */
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const modalRef = useRef(null);
  
  // Generate unique ID for aria-labelledby to prevent collisions
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;

  // 1. Handle Keydown (ESC to Close + Strict Tab Block)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Strict Focus Containment: Block Tab navigation entirely to prevent leakage
      // A full focus cycle would be better UX, but blocking is safer than leaking.
      if (e.key === 'Tab') {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 2. Handle Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 3. Handle Initial Focus (Recapture)
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure DOM is ready for focus
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose} // Click outside to close
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div 
        ref={modalRef}
        tabIndex={-1} // Makes the div focusable
        className={`relative w-full ${maxWidth} bg-[#0b0c0f] border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] outline-none`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-[#15191f]/50">
          {title && (
            <h3 id={titleId} className="text-xl font-black text-white italic tracking-tighter uppercase">
              {title}
            </h3>
          )}
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
