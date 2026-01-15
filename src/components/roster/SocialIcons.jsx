/**
 * 🔗 SOCIAL ICONS: CONNECTIVITY
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // ATOMIC
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER INTEGRATION
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// 🎨 BRAND ICONS (High-Definition Tactical Paths)
const BrandIcons = {
  Discord: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  ),
  Steam: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.979 0C5.66 0 .473 4.904.035 11.12l4.477 6.577 3.32-1.38c.75.526 1.642.85 2.61.88l1.64 4.793c.123.007.245.01.37.01 6.627 0 12-5.373 12-12S19.105 0 11.979 0zm.066 3.99c2.56 0 4.636 2.076 4.636 4.637 0 2.56-2.076 4.637-4.636 4.637-2.56 0-4.637-2.077-4.637-4.637 0-2.56 2.077-4.637 4.637-4.637zm-2.922 8.78c-.76.012-1.48.196-2.12.513l-3.32-1.325c-.29-.115-.595-.195-.913-.23.23-.01.46-.017.693-.017 1.83 0 3.51.64 4.866 1.71-.383-.236-.787-.43-1.206-.59V12.77zm1.87 3.21c-.37-.02-.733-.09-1.08-.205l-1.61 4.707c-.432-.132-.843-.302-1.23-.507l1.71-4.996c.66.425 1.433.682 2.27.682.022 0 .044-.002.066-.002l-.127.32z"/>
    </svg>
  ),
  Faceit: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.999 2.705c-.167-1.446-1.41-2.433-2.802-2.585-6.522-.73-12.603 1.353-12.603 1.353s-6.336 2.456-12.288 3.03C-.62 4.88-.633 6.643 2.053 6.34c3.418-.387 13.923-2.08 13.923-2.08l.385 1.554-15.01 2.37c-1.396.22-1.35 2.03.02 2.24l15.114 2.253.402 1.62-15.187 2.155c-1.48.212-1.31 2.14.07 2.21 4.545.232 14.832-.852 14.832-.852l.52 2.102-14.898 3.522c-1.8.426-1.077 2.924.787 2.502 6.556-1.48 13.116-2.923 13.116-2.923s5.88-1.528 7.625-5.914c1.19-2.99 1.483-11.233.178-14.394" />
    </svg>
  )
};

export const SocialIcons = ({ discord, steam, faceit, twitter, className = "" }) => {
  
  const isSafeUrl = (url) => {
    try {
      if (!url) return false;
      const u = new URL(url);
      return ['http:', 'https:'].includes(u.protocol);
    } catch {
      return false; 
    }
  };

  const SocialLink = ({ url, icon: Icon, colorClass, type, isCopyOnly = false }) => {
    if (!url) return null;

    const handleInteraction = (e) => {
      if (isCopyOnly || !isSafeUrl(url)) {
        e.preventDefault();
        navigator.clipboard.writeText(url);
        
        try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
        Telemetry.log(EVENTS.ACTION, { action: 'handle_copied', type });
        
        toast.success(`${type} COPIED`, {
            style: { background: '#09090b', color: '#fff', fontSize: '10px', border: '1px solid #ffffff10', letterSpacing: '0.1em' },
            icon: <Copy size={12} className="text-zinc-400" />
        });
      } else {
        try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
        Telemetry.log(EVENTS.ACTION, { action: 'external_link_open', type });
      }
    };

    const href = !isCopyOnly && isSafeUrl(url) ? url : '#';

    return (
      <motion.a 
        href={href}
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleInteraction}
        onMouseEnter={() => { try{ SoundNexus.play(CUES.UI_HOVER, { volume: 0.05 }); }catch(e){} }}
        whileHover={{ y: -2, scale: 1.1, filter: 'brightness(1.2)' }}
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-sm border border-transparent transition-all cursor-pointer opacity-40 hover:opacity-100 flex items-center justify-center relative group ${colorClass}`}
        title={isCopyOnly ? `Copy ${type}` : `Redirect to ${type}`}
      >
        <Icon className="w-3.5 h-3.5" />
        
        {/* ACTION HINT INDICATOR */}
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isCopyOnly ? <Copy size={6} /> : <ExternalLink size={6} />}
        </div>
      </motion.a>
    );
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <SocialLink 
        url={faceit} 
        icon={BrandIcons.Faceit} 
        colorClass="text-[#ff5500] hover:bg-[#ff5500]/5 hover:border-[#ff5500]/20" 
        type="FACEIT" 
      />
      <SocialLink 
        url={steam} 
        icon={BrandIcons.Steam} 
        colorClass="text-[#66c0f4] hover:bg-[#66c0f4]/5 hover:border-[#66c0f4]/20" 
        type="STEAM" 
      />
      <SocialLink 
        url={discord} 
        icon={BrandIcons.Discord} 
        colorClass="text-[#5865F2] hover:bg-[#5865F2]/5 hover:border-[#5865F2]/20" 
        type="DISCORD" 
        isCopyOnly={true} 
      />
      <SocialLink 
        url={twitter} 
        icon={Twitter} 
        colorClass="text-white hover:bg-white/5 hover:border-white/20" 
        type="X" 
      />
    </div>
  );
};
