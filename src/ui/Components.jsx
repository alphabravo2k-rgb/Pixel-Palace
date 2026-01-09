/**
 * 🧱 PIXEL PALACE: ATOMIC UI (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // 3D & 8D ENABLED
 */

import React, { useEffect, forwardRef, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle, UploadCloud, ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

// 🔊 SENSORY ENGINE (Ensure /lib/soundNexus.js exists)
// If the file is missing, the app will crash. We will create it next.
import { SoundNexus, CUES } from '../lib/soundNexus'; 

// ==========================================
// 1. ATOMS: PRIMITIVES
// ==========================================

export const Button = forwardRef(({ 
  children, variant = 'primary', size = 'md', className = '', 
  onClick, disabled, loading, type = "button", sound = CUES.UI_CLICK, ...props 
}, ref) => {
  
  const variants = {
    primary: "bg-zinc-900 text-zinc-300 border border-zinc-700 hover:bg-brand hover:text-white hover:border-brand-glow hover:shadow-neon",
    secondary: "bg-tactical/30 text-zinc-400 border border-tactical hover:bg-tactical hover:text-white",
    danger: "bg-red-950/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white",
    success: "bg-emerald-950/20 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-600 hover:text-white",
    brand: "bg-brand text-white border border-brand-glow shadow-neon hover:bg-brand-dim",
    ghost: "bg-transparent text-zinc-500 hover:text-white hover:bg-white/5 border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1 text-[10px]",
    md: "px-5 py-2.5 text-xs",
    lg: "px-8 py-4 text-sm"
  };

  const handleClick = (e) => {
    if (!disabled && !loading) {
      try { SoundNexus.play(sound); } catch(e) {} // Safe fail if audio engine not ready
      onClick && onClick(e);
    }
  };

  const handleHover = () => {
    if (!disabled && !loading) {
      try { SoundNexus.play(CUES.UI_HOVER, { volume: 0.1 }); } catch(e) {}
    }
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.96 }}
      onMouseEnter={handleHover}
      className={cn(
        "rounded-sm font-black uppercase tracking-widest transition-colors duration-200 flex items-center justify-center gap-2 select-none relative overflow-hidden",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 grayscale cursor-not-allowed pointer-events-none",
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </motion.button>
  );
});
Button.displayName = 'Button';

export const Input = forwardRef(({ label, error, className, onFocus, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black ml-1">{label}</label>}
    <div className="relative group">
      <input
        ref={ref}
        onFocus={(e) => {
            try { SoundNexus.play(CUES.UI_HOVER, { volume: 0.2 }); } catch(e) {}
            onFocus && onFocus(e);
        }}
        className={cn(
          "w-full bg-black/40 border border-white/10 p-3.5 text-sm text-gray-200 outline-none transition-all rounded-sm font-mono",
          "focus:border-brand/60 focus:bg-black placeholder:text-zinc-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500/50 focus:border-red-500",
          className
        )}
        {...props}
      />
      {/* Animated Underline */}
      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand transition-all duration-500 group-focus-within:w-full" />
    </div>
    {error && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-left-2"><AlertTriangle size={12} /> {error}</span>}
  </div>
));
Input.displayName = 'Input';

export const Select = forwardRef(({ label, options = [], placeholder, error, className, ...props }, ref) => (
  <div className="w-full space-y-1">
    {label && <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">{label}</label>}
    <div className="relative">
        <select 
          ref={ref}
          className={cn(
            "w-full bg-black/40 border border-white/10 p-3 text-sm text-gray-200 outline-none transition-all appearance-none cursor-pointer rounded-sm font-mono",
            "focus:border-brand focus:shadow-[0_0_15px_rgba(var(--color-brand)/0.2)]",
            error && "border-red-500",
            className
          )}
          onClick={() => { try { SoundNexus.play(CUES.UI_CLICK); } catch(e) {} }}
          {...props}
        >
          {placeholder && <option value="" disabled selected>{placeholder}</option>}
          {options.map((opt, i) => (
            <option key={i} value={opt.value} className="bg-zinc-900 text-gray-300">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            <ChevronDown size={14} />
        </div>
    </div>
  </div>
));
Select.displayName = 'Select';

export const FileInput = ({ label, onFileSelect, accept = "image/*,audio/*", error, fileName }) => (
  <div className="w-full space-y-2">
    {label && <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">{label}</label>}
    <label 
      onClick={() => { try { SoundNexus.play(CUES.UI_CLICK); } catch(e) {} }}
      className={cn(
        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-sm bg-white/5 cursor-pointer hover:bg-white/10 hover:border-brand/40 transition-all group overflow-hidden relative",
        error && "border-red-500/50"
      )}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadCloud className={cn("w-8 h-8 mb-2 transition-colors", fileName ? "text-brand" : "text-zinc-600 group-hover:text-brand")} />
        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest group-hover:text-zinc-300 transition-colors">
          {fileName ? fileName : "Transmit Hard File"}
        </p>
      </div>
      <input type="file" className="hidden" accept={accept} onChange={(e) => onFileSelect(e.target.files[0])} />
    </label>
    {error && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5"><AlertTriangle size={12} /> {error}</span>}
  </div>
);

export const Badge = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    brand: 'bg-brand/10 text-brand-glow border-brand/50 shadow-[0_0_10px_rgba(var(--color-brand)/0.2)]',
    blue: 'bg-blue-950/40 text-blue-400 border-blue-800',
    green: 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
    yellow: 'bg-yellow-950/40 text-yellow-500 border-yellow-800',
    red: 'bg-red-950/40 text-red-400 border-red-800',
    gray: 'bg-zinc-800 text-zinc-400 border-zinc-700'
  };
  return <span className={cn("px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border whitespace-nowrap", colors[color], className)}>{children}</span>;
};

// ==========================================
// 2. MOLECULES: COMPLEX INPUTS
// ==========================================

export const PinInput = ({ length = 6, onComplete }) => {
  const [pins, setPins] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (val, index) => {
    if (isNaN(val)) return;
    const newPins = [...pins];
    newPins[index] = val.substring(val.length - 1);
    setPins(newPins);

    if (val && index < length - 1) inputRefs.current[index + 1].focus();
    if (newPins.every(p => p !== "")) onComplete(newPins.join(""));
  };

  return (
    <div className="flex gap-2 justify-center perspective-container">
      {pins.map((p, i) => (
        <motion.input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="text"
          value={p}
          onChange={(e) => handleChange(e.target.value, i)}
          onFocus={() => { try { SoundNexus.playSpatial(CUES.UI_TICK); } catch(e) {} }}
          className="w-12 h-16 bg-black/60 border border-white/10 text-brand text-2xl font-black text-center focus:border-brand-glow focus:shadow-neon outline-none rounded-sm transition-all"
          whileFocus={{ translateZ: 20, scale: 1.1 }}
        />
      ))}
    </div>
  );
};

export const RoleBadge = ({ roleDef, className = "" }) => {
  if (!roleDef) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "px-3 py-1 border text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2 rounded-sm clip-path-slant",
        roleDef.badge,
        roleDef.color,
        className
      )}
    >
      <ShieldCheck size={12} className="animate-pulse" />
      {roleDef.label}
    </motion.div>
  );
};

// ==========================================
// 3. ORGANISMS: CONTAINERS
// ==========================================

export const SkewButton = ({ children, onClick, className = "", disabled = false, type = "button", loading = false }) => (
  <motion.button 
    type={type}
    whileTap={{ scale: 0.98 }}
    onMouseEnter={() => !disabled && (function(){ try { SoundNexus.play(CUES.UI_HOVER); } catch(e){} })()}
    onClick={(e) => {
        if (!disabled && !loading) {
            try { SoundNexus.play(CUES.UI_CLICK); } catch(e) {}
            onClick && onClick(e);
        }
    }}
    disabled={disabled || loading}
    className={cn(
      "relative group px-10 py-4 transform -skew-x-[12deg] transition-all duration-300 overflow-hidden",
      "bg-zinc-950 border border-zinc-800 hover:border-brand", 
      "disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-dim opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <span className="relative block transform skew-x-[12deg] flex items-center gap-3 justify-center text-white font-display font-bold uppercase tracking-[0.15em] text-xl">
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : children}
    </span>
    {/* Glitch Decor */}
    <div className="absolute top-0 right-0 w-2 h-2 bg-brand/40 group-hover:bg-white/50 transform skew-x-[12deg]" />
  </motion.button>
);

export const HudPanel = ({ children, title, icon: Icon, glow = false, variant = "default", className="" }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className={cn(
        "relative p-6 border transition-all duration-500 glass-hard perspective-card",
        glow ? "border-brand/30 shadow-neon" : "border-white/5",
        variant === "danger" && "border-red-500/30 bg-red-500/5 shadow-neon-red",
        className
      )}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
    >
      {/* 🚀 THE SCANLINE EFFECT (Uses CSS class from index.css) */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-10 animate-scan" />
      
      {title && (
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon size={18} className="text-brand animate-flicker" />}
            <h2 className="text-lg font-display font-black italic uppercase tracking-widest text-white underline-offset-8 decoration-brand/50 decoration-2">
              {title}
            </h2>
          </div>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-brand rounded-full animate-ping" />
            <div className="w-4 h-1 bg-zinc-800 rounded-full" />
          </div>
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        try { SoundNexus.play(CUES.NAVIGATION_SWISH); } catch(e) {}
    } else {
        document.body.style.overflow = 'unset';
    }
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', handleEsc); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-4xl', full: 'max-w-[95vw]' }[size];

  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className={cn("relative w-full bg-[#09090b] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]", widthClass)}
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
              >
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-2xl font-display font-bold text-white uppercase italic tracking-tighter">{title}</h3>
                  <button 
                    onClick={() => { try { SoundNexus.play(CUES.UI_ERROR); } catch(e) {} onClose(); }} 
                    className="text-zinc-500 hover:text-red-500 transition-all hover:rotate-90"
                  >
                      <X size={28} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
              </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};
