import React from 'react';
import { MessageCircle, Gamepad2, Twitter } from 'lucide-react';

export const SocialIcons = ({ discord, steam, twitter }) => {
  const isSafeUrl = (url) => {
    try {
      if (!url) return false;
      const u = new URL(url);
      return ['http:', 'https:'].includes(u.protocol);
    } catch {
      return false; // Handle invalid URLs safely
    }
  };

  // Helper to render a safe link
  const SocialLink = ({ url, icon: Icon, colorClass }) => {
    if (!url) return null;
    
    // If it's a full URL, check safety. If it's just a username, we might need to build the URL.
    // For now, assuming raw strings or usernames might need specific handling.
    // Let's assume Discord is a username (copy only), Steam is a URL.
    
    return (
      <a 
        href={isSafeUrl(url) ? url : '#'}
        target="_blank" 
        rel="noopener noreferrer"
        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${colorClass}`}
        onClick={(e) => {
          if (!isSafeUrl(url)) {
            e.preventDefault();
            navigator.clipboard.writeText(url); // Copy username if not a URL
            alert(`Copied: ${url}`);
          }
        }}
      >
        <Icon className="w-3.5 h-3.5" />
      </a>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <SocialLink url={discord} icon={MessageCircle} colorClass="text-[#5865F2]" />
      <SocialLink url={steam} icon={Gamepad2} colorClass="text-[#1b2838]" />
      <SocialLink url={twitter} icon={Twitter} colorClass="text-[#1DA1F2]" />
    </div>
  );
};
