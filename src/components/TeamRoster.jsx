import React from 'react';
import { MessageCircle, Globe, Shield } from 'lucide-react';

// --- HELPERS (Pure & Safe) ---

// Safe extractor for Faceit names - never crashes
const extractFaceitName = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    // Expected format: .../players/nickname
    const parts = url.split('/players/');
    return parts.length > 1 ? parts[1].split('/')[0] : null;
  } catch (e) {
    return null;
  }
};

// Safe Country Flag Component
const CountryFlag = ({ code }) => {
  if (!code) return <Globe className="w-4 h-4 text-zinc-600" />;
  
  return (
    <img 
      src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
      alt={code}
      className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm"
      loading="lazy"
    />
  );
};

// Official Icon Button (Strict: No URL or No Icon = No Render)
const SocialButton = ({ href, type, iconPath }) => {
  if (!href || !iconPath) return null;

  const label = type === 'faceit' ? 'Faceit' : 
                type === 'steam' ? 'Steam' : 
                'Discord Contact';
  
  const bgColor = type === 'faceit' ? 'hover:bg-[#ff5500]' : 
                  type === 'steam' ? 'hover:bg-[#171a21]' : 
                  'hover:bg-[#5865F2]';

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className={`p-1.5 rounded bg-zinc-700/50 text-white transition-colors duration-200 ${bgColor} group/btn`}
      title={label}
      onClick={(e) => e.stopPropagation()} // Prevent row clicks
    >
      <img src={iconPath} alt={label} className="w-4 h-4 object-contain" />
    </a>
  );
};

// --- SUB-COMPONENTS ---

const PlayerRow = ({ player }) => {
  // 1. Prepare Data (Safe Fallbacks)
  const displayName = extractFaceitName(player.faceit_url) || player.name || 'Unknown Player';
  const elo = player.faceit_elo; // Number or null
  const country = player.country_code;

  return (
    <div className="relative group w-full h-10 bg-[#15191f] border-b border-zinc-800/50 last:border-0 overflow-hidden">
      
      {/* LAYER 1: Default View (Visible when not hovering) */}
      <div className="absolute inset-0 flex items-center justify-between px-3 z-10 transition-opacity duration-300 group-hover:opacity-0">
        <div className="flex items-center gap-3">
          <CountryFlag code={country} />
          <span className="text-sm text-zinc-300 font-medium truncate max-w-[120px]">
            {displayName}
          </span>
        </div>
        
        {/* ELO Display (Strict Check) */}
        <div className="flex items-center gap-1.5">
          {typeof elo === 'number' ? (
            <span className="text-xs font-mono font-bold text-[#ff5500]">
              {elo}
            </span>
          ) : (
            <span className="text-xs text-zinc-600 font-mono">—</span>
          )}
        </div>
      </div>

      {/* LAYER 2: Hover Actions (Slides in from Left) */}
      <div className="absolute inset-0 z-20 flex items-center px-3 gap-2 bg-[#15191f]
                      transform -translate-x-full group-hover:translate-x-0 
                      transition-transform duration-300 ease-out will-change-transform">
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
            <SocialButton 
                href={player.faceit_url} 
                type="faceit" 
                iconPath="/icons/faceit.svg" 
            />
            <SocialButton 
                href={player.steam_url} 
                type="steam" 
                iconPath="/icons/steam.svg" 
            />
            <SocialButton 
                href={player.discord_url} 
                type="discord" 
                iconPath="/icons/discord.svg" 
            />
        </div>

        {/* Name Reiteration (Optional context on hover) */}
        <span className="ml-auto text-xs text-zinc-500 font-mono truncate opacity-0 group-hover:opacity-100 transition-opacity delay-100">
            {displayName}
        </span>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const TeamRoster = ({ team }) => {
  if (!team) return null;

  // Safe access to players array
  const players = Array.isArray(team.players) ? team.players : [];
  
  return (
    <div className="w-full max-w-sm bg-[#0b0c0f] border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#15191f] to-[#0b0c0f] border-b border-zinc-800 flex items-center gap-3">
        {team.logo_url ? (
            <img src={team.logo_url} alt="" className="w-10 h-10 rounded bg-black/50 object-contain" />
        ) : (
            <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-zinc-600" />
            </div>
        )}
        <div className="flex flex-col min-w-0">
            <h3 className="text-zinc-100 font-bold text-base truncate">{team.name || 'Unknown Team'}</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                {players.length} Players
            </span>
        </div>
      </div>

      {/* Roster List */}
      <div className="flex flex-col">
        {players.length > 0 ? (
            players.map((player, idx) => (
                <PlayerRow key={player.id || idx} player={player} />
            ))
        ) : (
            <div className="p-6 text-center text-zinc-600 text-xs italic">
                No players registered.
            </div>
        )}
      </div>

      {/* Footer: Team Private Discord */}
      {team.discord_channel_url && (
        <div className="p-2 bg-[#15191f] border-t border-zinc-800">
          <a 
            href={team.discord_channel_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 rounded 
                       bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] 
                       transition-colors duration-200 text-xs font-bold uppercase tracking-wide"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Team Channel</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default TeamRoster;
