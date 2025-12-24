import React from 'react';

const ICONS = {
  FACEIT: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 2.6l-1.9-.3c-2.9-.4-5.2.3-6.8 1.9-.3.3-.6.6-.9 1L12.9 2h-1L10.3 3.6 2.6 13.9l.6 2.2 1.9.6 1.9-2.6.3-.3.3-.6c1.6-3.2 4.5-4.5 7.4-4.2l3.6.3 3.5-3.6 1.9-3.1zM2.6 21.4l1.9.3c2.9.4 5.2-.3 6.8-1.9.3-.3.6-.6.9-1L13.7 17h1l1.6-1.6 7.7-10.3-.6-2.2-1.9-.6-1.9 2.6-.3.3-.3.6c-1.6 3.2-4.5 4.5-7.4 4.2l-3.6-.3L4.5 13.3 2.6 16.4v5z" /></svg>
  ),
  STEAM: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.979 0C5.66 0 .473 4.904.035 11.12l4.477 6.577 3.32-1.38c.75.526 1.642.85 2.61.88l1.64 4.793c.123.007.245.01.37.01 6.627 0 12-5.373 12-12S19.105 0 11.979 0zm.066 3.99c2.56 0 4.636 2.076 4.636 4.637 0 2.56-2.076 4.637-4.636 4.637-2.56 0-4.637-2.077-4.637-4.637 0-2.56 2.077-4.637 4.637-4.637zm-2.922 8.78c-.76.012-1.48.196-2.12.513l-3.32-1.325c-.29-.115-.595-.195-.913-.23.23-.01.46-.017.693-.017 1.83 0 3.51.64 4.866 1.71-.383-.236-.787-.43-1.206-.59V12.77zm1.87 3.21c-.37-.02-.733-.09-1.08-.205l-1.61 4.707c-.432-.132-.843-.302-1.23-.507l1.71-4.996c.66.425 1.433.682 2.27.682.022 0 .044-.002.066-.002l-.127.32z"/></svg>
  ),
  DISCORD: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
  )
};

export const SocialButton = ({ href, type }) => {
  if (!type || typeof type !== 'string') return null;
  const Icon = ICONS[type.toUpperCase()];
  if (!Icon) return null; 

  const isValid = href && href.length > 5; // Simple length check
  
  // ✅ FIX: Visually disabled state + Tooltip explanation
  if (!isValid) {
    return (
      <div className="p-1 text-zinc-700 cursor-not-allowed opacity-40" title={`No ${type} linked`}>
         <Icon className="w-3.5 h-3.5" />
      </div>
    );
  }
  
  const colors = {
    FACEIT: 'hover:text-[#ff5500]',
    STEAM: 'hover:text-blue-400',
    DISCORD: 'hover:text-[#5865F2]'
  };

  return (
    <a href={href} target="_blank" rel="noreferrer" 
       className={`p-1 text-zinc-500 transition-all duration-200 ${colors[type.toUpperCase()] || ''} hover:scale-110 active:scale-95 cursor-pointer relative z-50`} 
       onMouseDown={(e) => e.stopPropagation()} 
       onClick={(e) => e.stopPropagation()}
       title={`Open ${type}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </a>
  );
};
