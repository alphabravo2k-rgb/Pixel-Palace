import React from 'react';
import { MessageCircle, Gamepad2, Twitter } from 'lucide-react';

export const SocialIcons = ({ discord, steam, twitter }) => {
  
  // Security: Prevent javascript: links
  const isSafeUrl = (url) => {
    try {
      if (!url) return false;
      const u = new URL(url);
      return ['http:', 'https:'].includes(u.protocol);
    } catch {
      return false; 
    }
  };

  const SocialLink = ({ url, icon: Icon, colorClass, type }) => {
    if (!url) return null;

    // Discord Logic: Usually a username, not a URL. Click to copy.
    const isCopyable = type === 'discord' || !isSafeUrl(url);
    const href = isSafeUrl(url) ? url : '#';

    const handleClick = (e) => {
      if (isCopyable) {
        e.preventDefault();
        navigator.clipboard.writeText(url);
        // Optional: You could trigger a toast here if you have a UI library
        // alert(`Copied: ${url}`); 
      }
    };

    return (
      <a 
        href={href}
        target="_blank" 
        rel="noopener noreferrer"
        className={`p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer ${colorClass}`}
        onClick={handleClick}
        title={isCopyable ? `Copy ${type}: ${url}` : `Visit ${type}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </a>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <SocialLink url={discord} icon={MessageCircle} colorClass="text-[#5865F2]" type="discord" />
      <SocialLink url={steam} icon={Gamepad2} colorClass="text-[#1b2838] hover:text-white" type="steam" />
      <SocialLink url={twitter} icon={Twitter} colorClass="text-[#1DA1F2]" type="twitter" />
    </div>
  );
};
