import React, { useEffect, forwardRef } from 'react';
import { X, Loader2, AlertTriangle, UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils'; // ✅ Standardized Import

/**
 * 🧱 PIXEL PALACE: ATOMIC UI
 * --------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * PURPOSE: Hardware-accelerated, consistent UI primitives.
 */

// ==========================================
// 1. ATOMS (Primitives)
// ==========================================

export const Button = forwardRef(({ 
  children, variant = 'primary', size = 'md', className = '', 
  onClick, disabled, loading, type = "button", ...props 
}, ref) => {
  
  const variants = {
    primary: "bg-zinc-900 text-zinc-300 border border-zinc-700 hover:bg-brand hover:text-white hover:border-brand-glow hover:shadow-neon hover:scale-[1.02]",
    secondary: "bg-tactical/30 text-zinc-400 border border-tactical hover:bg-tactical hover:text-white",
    danger: "bg-red-950/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white",
    success: "bg-emerald-950/20 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-600 hover:text-white",
    brand: "bg-brand text-white border border-brand-glow shadow-neon hover:bg-brand-dim"
  };

  const sizes = {
    sm: "px-3 py-1 text-[10px]",
    md: "px-5 py-2.5 text-xs",
    lg: "px-8 py-4 text-sm"
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "rounded-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 touch-manipulation select-none relative overflow-hidden",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-40 grayscale cursor-not-allowed pointer-events-none",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
});
Button.displayName = 'Button';

export const Input = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black ml-1">{label}</label>}
    <div className="relative group">
      <input
        ref={ref}
        className={cn(
          "w-full bg-black/40 border border-white/10 p-3.5 text-sm text-gray-200 outline-none transition-all rounded-sm",
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
            "w-full bg-black/40 border border-white/10 p-3 text-sm text-gray-200 outline-none transition-all appearance-none cursor-pointer rounded-sm",
            "focus:border-brand focus:shadow-[0_0_15px_rgba(var(--color-brand)/0.2)]",
            error && "border-red-500",
            className
        )}
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
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
    </div>
  </div>
));
Select.displayName = 'Select';

export const FileInput = ({ label, onFileSelect, accept = "image/*,audio/*", error, fileName }) => (
  <div className="w-full space-y-2">
    {label && <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">{label}</label>}
    <label className={cn(
      "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-sm bg-white/5 cursor-pointer hover:bg-white/10 hover:border-brand/40 transition-all group overflow-hidden relative",
      error && "border-red-500/50"
    )}>
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
// 2. MOLECULES (Complex)
// ==========================================

export const SkewButton = ({ children, onClick, className = "", disabled = false, type = "button", loading = false }) => (
  <button 
    type={type}
    onClick={disabled || loading ? undefined : onClick} 
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
  </button>
);

export const HudPanel = ({ children, className = "", title, icon: Icon, glow = false }) => (
  <div className={cn(
    "relative bg-black/80 backdrop-blur-md p-6 border border-white/5 group",
    glow && "shadow-[0_0_50px_-12px_rgba(var(--color-brand)/0.2)]",
    className
  )}
    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
  >
    <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-brand to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
    {title && (
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-brand-glow" />}
          <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider italic">{title}</h3>
        </div>
        <div className="flex gap-1.5">
          <div className="w-1 h-1 bg-brand animate-ping" />
          <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
        </div>
      </div>
    )}
    {children}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', handleEsc); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-4xl', full: 'max-w-[95vw]' }[size];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className={cn("relative w-full bg-[#09090b] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]", widthClass)}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-2xl font-display font-bold text-white uppercase italic tracking-tighter">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500 transition-all hover:rotate-90"><X size={28} /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
