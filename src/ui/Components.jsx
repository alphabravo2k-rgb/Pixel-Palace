import React from 'react';
import { X } from 'lucide-react';

// 🆕 Skewed Action Button
export const SkewButton = ({ children, onClick, className = "", disabled = false, type = "button" }) => (
  <button 
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative transform -skew-x-[10deg] px-8 py-3 
      bg-gradient-to-r from-purple-600 to-pink-600 
      hover:brightness-125 transition-all duration-300
      text-white font-bold uppercase tracking-widest text-lg shadow-lg
      disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
      group ${className}
    `}
  >
    <span className="block transform skew-x-[10deg]">{children}</span>
  </button>
);

// 🆕 HUD Panel
export const HudPanel = ({ children, className = "" }) => (
  <div className={`
    relative bg-[#141419]/70 backdrop-blur-md 
    border border-white/10 
    hover:border-fuchsia-500/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]
    transition-all duration-300
    p-6 ${className}
  `}
  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}
  >
    {/* Left Accent Line */}
    <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-fuchsia-500 to-purple-600 opacity-80" />
    {children}
  </div>
);

// 🆕 Breathing Logo
export const BreathingLogo = ({ size = "w-40 h-40", className = "" }) => (
  <a 
    href="https://discord.gg/JdXheQbvec" 
    target="_blank" 
    rel="noopener noreferrer"
    className={`relative block group cursor-pointer ${className}`}
    title="Join Pixel Palace Discord"
  >
    <img 
      src="https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png" 
      alt="Pixel Palace" 
      className={`${size} object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-1 animate-breathe`}
    />
  </a>
);

// --- Compatibility Components ---
export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all";
  const variants = {
    primary: "bg-zinc-800 text-zinc-300 hover:bg-[#ff5500] hover:text-black border border-zinc-700",
    danger: "bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40",
    success: "bg-emerald-900/20 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-900/40"
  };
  return <button className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`} {...props}>{children}</button>;
};

export const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
    green: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    yellow: 'bg-yellow-900/30 text-yellow-500 border-yellow-800',
    red: 'bg-red-900/30 text-red-400 border-red-800',
    gray: 'bg-zinc-800 text-zinc-400 border-zinc-700'
  };
  return <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${colors[color]}`}>{children}</span>;
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0b0c0f] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}>
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#15191f]/50">
          <h3 className="text-xl font-black text-white italic tracking-tighter uppercase brand-font">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
