import React, { useEffect } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 🎨 HELPER: Merges Tailwind Classes smartly (prevents conflicts)
export const cn = (...inputs) => twMerge(clsx(inputs));

// ==========================================
// 1. ATOMS (Basic Building Blocks)
// ==========================================

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled, 
  loading, 
  type = "button",
  ...props 
}) => {
  
  const variants = {
    // Uses your dynamic CSS variables for Brand Color
    primary: "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-brand hover:text-white hover:border-brand-glow hover:shadow-neon hover:scale-[1.02]",
    secondary: "bg-tactical/50 text-gray-300 border border-tactical hover:bg-tactical hover:text-white",
    danger: "bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/60 hover:text-white hover:border-red-500/50",
    success: "bg-emerald-950/30 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-900/60 hover:text-white",
    ghost: "bg-transparent text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent",
    brand: "bg-brand text-white border border-brand-glow hover:bg-brand-dim shadow-neon"
  };

  const sizes = {
    sm: "px-3 py-1 text-[10px]",
    md: "px-5 py-2 text-xs",
    lg: "px-8 py-3 text-sm"
  };
  
  return (
    <button 
        type={type}
        className={cn(
          "rounded-sm font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 active:scale-95",
          variants[variant],
          sizes[size],
          (disabled || loading) && "opacity-50 grayscale cursor-not-allowed hover:scale-100 hover:shadow-none hover:bg-zinc-800 hover:text-zinc-500",
          className
        )} 
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled || loading}
        {...props}
    >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
    </button>
  );
};

export const Input = ({ label, error, className, ...props }) => (
  <div className="w-full space-y-1">
    {label && <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">{label}</label>}
    <input 
      className={cn(
        "w-full bg-bg-surface border border-tactical p-3 text-sm text-gray-200 outline-none transition-all",
        "focus:border-brand focus:shadow-[0_0_15px_rgba(var(--color-brand)/0.2)] placeholder:text-zinc-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error && "border-red-500 focus:border-red-500 focus:shadow-none",
        className
      )}
      {...props}
    />
    {error && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wide flex items-center gap-1"><AlertTriangle size={10} /> {error}</span>}
  </div>
);

export const Select = ({ label, options = [], error, className, ...props }) => (
  <div className="w-full space-y-1">
    {label && <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">{label}</label>}
    <select 
      className={cn(
        "w-full bg-bg-surface border border-tactical p-3 text-sm text-gray-200 outline-none transition-all appearance-none cursor-pointer",
        "focus:border-brand focus:shadow-[0_0_15px_rgba(var(--color-brand)/0.2)]",
        error && "border-red-500",
        className
      )}
      {...props}
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value} className="bg-bg-elevated text-gray-300">
          {opt.label}
        </option>
      ))}
    </select>
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
// 2. MOLECULES (Complex UI)
// ==========================================

// 🚀 SKEWED CTA BUTTON (The "God Mode" Button)
export const SkewButton = ({ children, onClick, className = "", disabled = false, type = "button", title = "", loading = false }) => (
  <button 
    type={type}
    onClick={disabled || loading ? undefined : onClick} 
    disabled={disabled || loading}
    className={cn(
      "relative group px-10 py-4 transform -skew-x-[12deg] transition-all duration-300 overflow-hidden",
      "bg-zinc-900 border border-zinc-700 hover:border-brand", // Base
      "disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
      className
    )}
    title={title}
  >
    {/* Animated Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-dim opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    {/* Scanline Overlay */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
    
    {/* Content (Unskewed) */}
    <span className="relative block transform skew-x-[12deg] flex items-center gap-3 justify-center text-white font-display font-bold uppercase tracking-[0.15em] text-xl">
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : children}
    </span>
    
    {/* Glitch Element */}
    <div className="absolute top-0 right-0 w-2 h-2 bg-white/20 group-hover:bg-white/50 transform skew-x-[12deg]" />
  </button>
);

// 📦 HUD PANEL (The Glass Card)
export const HudPanel = ({ children, className = "", title, icon: Icon }) => (
  <div className={cn(
    "relative bg-bg-panel/90 backdrop-blur-sm p-6 group",
    "border border-white/5 hover:border-brand/30 transition-colors duration-500",
    className
  )}
    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
  >
    {/* Sidebar Accent Line */}
    <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-brand to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
    
    {title && (
      <div className="mb-6 pb-3 border-b border-white/5 flex justify-between items-end">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-brand-glow mb-1" />}
            <h3 className="text-2xl font-display font-bold text-white italic tracking-tighter uppercase leading-none">
            {title}
            </h3>
        </div>
        
        {/* Decorative Dots */}
        <div className="flex gap-1 mb-1">
           <div className="w-1.5 h-1.5 bg-brand/50 rounded-sm animate-pulse" />
           <div className="w-1.5 h-1.5 bg-zinc-700 rounded-sm" />
           <div className="w-1.5 h-1.5 bg-zinc-800 rounded-sm" />
        </div>
      </div>
    )}
    {children}
  </div>
);

// 🛡️ MODAL (The Popup)
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', handleEsc); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      full: 'max-w-[95vw]'
  }[size];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={cn(
            "relative w-full bg-bg-elevated border border-tactical shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300",
            widthClass
        )}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-zinc-900/50 relative overflow-hidden select-none">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand" />
          <h3 className="text-xl font-display font-bold text-white italic tracking-wide uppercase pl-3 flex items-center gap-2">
            {title}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500 hover:rotate-90 transition-all p-1">
            <X size={24} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );
};
