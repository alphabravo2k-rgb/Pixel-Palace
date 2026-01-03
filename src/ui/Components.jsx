import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { BRAND } from '@/lib/identity'; 

// 🎨 HELPER: Merges Tailwind Classes (Optional but recommended if you have clsx)
const cn = (...classes) => classes.filter(Boolean).join(' ');

// 1. 🆕 GOD MODE BUTTON (Skewed & Database Themed)
// Uses 'from-brand to-brand-glow' so it matches the active tournament color
export const SkewButton = ({ children, onClick, className = "", disabled = false, type = "button", title = "", loading = false }) => (
  <button 
    type={type}
    onClick={disabled || loading ? undefined : onClick} 
    disabled={disabled || loading}
    className={cn(
      "relative group px-8 py-3 transform -skew-x-[10deg] transition-all duration-300",
      "bg-gradient-to-r from-brand to-brand-dim hover:to-brand", // 🎨 DB Driven Gradient
      "text-white font-bold uppercase tracking-widest text-lg shadow-lg hover:shadow-neon", // 💡 Neon Glow
      "disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
      className
    )}
    title={title}
  >
    {/* Background Scanline Effect */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 group-hover:opacity-40 transition-opacity" />
    
    <span className="relative block transform skew-x-[10deg] flex items-center gap-2 justify-center">
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </span>
  </button>
);

// 2. 🆕 HUD PANEL (Glassmorphism & DB Borders)
export const HudPanel = ({ children, className = "", title }) => (
  <div className={cn(
    "relative bg-[#141419]/80 backdrop-blur-md p-6",
    "border border-white/5", 
    "hover:border-brand/50 transition-colors duration-500", // 🎨 DB Driven Border
    className
  )}
    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }} // Tactical Cut
  >
    {/* Sidebar Accent Line (Color matches DB) */}
    <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-brand to-brand-dim opacity-80" />
    
    {title && (
      <div className="mb-4 pb-2 border-b border-white/5 flex justify-between items-end">
        <h3 className="text-xl font-display font-bold text-white italic tracking-tighter uppercase">
          {title}
        </h3>
        <div className="flex gap-1">
           <div className="w-2 h-2 bg-brand/50 rounded-full animate-pulse" />
           <div className="w-2 h-2 bg-brand-dim/50 rounded-full" />
        </div>
      </div>
    )}
    {children}
  </div>
);

// 3. 🆕 DYNAMIC LOGO (Supports DB Logo or Fallback)
export const BreathingLogo = ({ size = "w-40 h-40", logoUrl, className = "" }) => (
  <a 
    href={BRAND.discord} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`relative block group cursor-pointer ${className}`}
    title="Join Community"
  >
    {/* Glow Effect behind logo matches DB color */}
    <div className={`absolute inset-0 bg-brand/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
    
    <img 
      src={logoUrl || BRAND.logo} // 🎨 Uses DB logo if provided, else fallback
      alt="Tournament Logo" 
      className={`${size} object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-1 animate-breathe drop-shadow-[0_0_15px_rgba(var(--color-brand)/0.5)]`}
    />
  </a>
);

// --- UTILITY COMPONENTS ---

export const Button = ({ children, variant = 'primary', className = '', onClick, disabled, loading, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2";
  
  const variants = {
    // 🎨 Primary now uses the DB Brand Color
    primary: "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-brand hover:text-white hover:border-brand-glow hover:shadow-neon",
    danger: "bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/60 hover:text-white",
    success: "bg-emerald-950/30 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-900/60 hover:text-white",
    ghost: "bg-transparent text-zinc-500 hover:text-white hover:bg-white/5"
  };
  
  const finalVariant = disabled ? "bg-zinc-900 text-zinc-600 cursor-not-allowed border-zinc-800" : (variants[variant] || variants.primary);

  return (
    <button 
        className={`${baseStyle} ${finalVariant} ${className}`} 
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled || loading}
        {...props}
    >
        {loading && <Loader2 size={12} className="animate-spin" />}
        {children}
    </button>
  );
};

export const Badge = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    brand: 'bg-brand/10 text-brand-glow border-brand/50', // 🎨 New DB Variant
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
    green: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    yellow: 'bg-yellow-900/30 text-yellow-500 border-yellow-800',
    red: 'bg-red-900/30 text-red-400 border-red-800',
    gray: 'bg-zinc-800 text-zinc-400 border-zinc-700'
  };
  return <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${colors[color] || colors.gray} ${className}`}>{children}</span>;
};

// 🛡️ ACCESSIBLE MODAL (Themed)
export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0b0c0f] border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300" 
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}
      >
        {/* Header with Brand Accent */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#15191f]/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand" /> {/* 🎨 Brand Stripe */}
          <h3 className="text-xl font-display font-black text-white italic tracking-tighter uppercase pl-2">
            {title}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-2 hover:bg-white/5 rounded transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );
};
