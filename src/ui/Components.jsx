import React from 'react';
import { X } from 'lucide-react';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) => {
  const baseStyle = "px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white"
  };

  return (
    <button 
     onClick={onClick}
     disabled={disabled}
     className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
     {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-900/50 text-blue-200 border-blue-700',
    green: 'bg-green-900/50 text-green-200 border-green-700',
    red: 'bg-red-900/50 text-red-200 border-red-700',
    yellow: 'bg-yellow-900/50 text-yellow-200 border-yellow-700',
    gray: 'bg-slate-700 text-slate-300 border-slate-600'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
