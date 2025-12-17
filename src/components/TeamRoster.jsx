import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { MessageCircle, Globe, Shield, Users, Crown, Search } from 'lucide-react';

// --- HELPERS (Pure & Safe) ---

// Safely extracts a clean name from a Faceit URL (e.g., .../players/Nickname -> Nickname)
const extractFaceitName = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const parts = url.split('/players/');
    return parts.length > 1 ? parts[1].split('/')[0] : null;
  } catch (e) {
    return null;
  }
};

// Renders a country flag using flagcdn, defaults to Globe icon if code is missing
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

// Renders social buttons with correct styling and hover effects
const SocialButton = ({ href, type, iconPath }) => {
  if (!href || !iconPath) return null;
  const label = type === 'faceit' ? 'Faceit' : type === 'steam' ? 'Steam' : 'Discord';
  
  // Specific colors for each platform
  const bgColor = type === 'faceit' ? 'hover:bg-[#ff5500]' : type === 'steam' ? 'hover:bg-[#171a21]' : 'hover:bg-[#5865F2]';

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className={`p-1.5 rounded bg-zinc-700/50 text-white transition-colors duration-200 ${bgColor} group/btn`}
      title={label}
      onClick={(e) => e.stopPropagation()} // Prevent clicking the row from triggering other events
    >
      <img src={iconPath} alt={label} className="w-4 h-4 object-contain" />
    </a>
  );
};

// --- SUB-COMPONENTS (The Card Design) ---

const PlayerRow = ({ player }) => {
  // Safe Fallbacks using the data fields guaranteed by your useTournament provider
  // extractFaceitName acts as a display name prettifier
  const displayName = extractFaceitName(player.faceit_url) || player.name || 'Unknown';
  const elo = player.faceit_elo || null;
  const country = player.country_code;

  return (
    <div className="relative group w-full h-10 bg-[#15191f] border-b border-zinc-800/50 last:border-0 overflow-hidden">
      
      {/* LAYER 1: Default View (Visible when NOT hovering) */}
      <div className="absolute inset-0 flex items-center justify-between px-3 z-10 transition-opacity duration-300 group-hover:opacity-0">
        <div className="flex items-center gap-3">
          <CountryFlag code={country} />
          <div className="flex items-center gap-2">
            {player.role === 'CAPTAIN' && <Crown className="w-3 h-3 text-yellow-500" />}
            <span className={`text-sm font-medium truncate max-w-[100px] ${player.role === 'CAPTAIN' ? 'text-white' : 'text-zinc-300'}`}>
                {displayName}
            </span>
          </div>
        </div>
        
        {/* ELO / Rank Display */}
        <div className="flex items-center gap-1.5">
          {typeof elo === 'number' ? (
            <span className="text-xs font-mono font-bold text-[#ff5500]">{elo}</span>
          ) : (
            <span className="text-xs text-zinc-600 font-mono">—</span>
          )}
        </div>
      </div>

      {/* LAYER 2: Hover Actions (Slides in on hover) */}
      <div className="absolute inset-0 z-20 flex items-center px-3 gap-2 bg-[#15191f]
                      transform -translate-x-full group-hover:translate-x-0 
                      transition-transform duration-300 ease-out will-change-transform">
        <div className="flex items-center gap-2">
            {/* These use the _url fields your provider builds */}
            <SocialButton href={player.faceit_url} type="faceit" iconPath="/icons/faceit.svg" />
            <SocialButton href={player.steam_url} type="steam" iconPath="/icons/steam.svg" />
            <SocialButton href={player.discord_url} type="discord" iconPath="/icons/discord.svg" />
        </div>
        <span className="ml-auto text-xs text-zinc-500 font-mono truncate opacity-0 group-hover:opacity-100 transition-opacity delay-100">
            {displayName}
        </span>
      </div>
    </div>
  );
};

const TeamCard = ({ team }) => {
  // Ensure players is an array (defensive coding)
  const players = Array.isArray(team.players) ? team.players : [];
  
  return (
    <div className="bg-[#0b0c0f] border border-zinc-800 rounded-lg overflow-hidden shadow-xl hover:border-zinc-600 transition-all duration-300">
      
      {/* Team Header */}
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
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    Seed #{team.seed_number}
                </span>
                {team.region && (
                     <span className="text-[10px] text-zinc-600 flex items-center gap-1 uppercase">
                        <Globe className="w-3 h-3" /> {team.region}
                     </span>
                )}
            </div>
        </div>
      </div>

      {/* Players List */}
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

// --- MAIN COMPONENT (The Page Logic) ---

const TeamRoster = () => {
  const { teams, loading } = useTournament(); // Consuming the Context from your provider
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering Logic
  const filteredTeams = teams.filter(t => 
    t.name && t.name.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  // Loading State
  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
            <div className="w-8 h-8 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold tracking-widest uppercase">Loading teams...</p>
        </div>
    );
  }

  // Empty State
  if (!teams || teams.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4 border border-dashed border-zinc-800 rounded-xl m-8">
            <Users className="w-12 h-12 opacity-20" />
            <p className="text-sm font-bold tracking-widest uppercase">No teams registered</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
            <div>
                <h2 className="text-3xl font-brand font-black text-white tracking-wide">
                    REGISTERED <span className="text-fuchsia-500">TEAMS</span>
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                    Official roster listing ({teams.length} Teams)
                </p>
            </div>
            <div className="w-full md:w-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search teams..." 
                    className="bg-[#0b0c0f] border border-zinc-700 text-white pl-10 pr-4 py-2 rounded-lg w-full md:w-64 focus:border-fuchsia-500 outline-none text-sm transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.length > 0 ? (
                filteredTeams.map(team => (
                    <TeamCard key={team.id} team={team} />
                ))
            ) : (
                <div className="col-span-full py-20 text-center text-zinc-500">
                    No teams match your search.
                </div>
            )}
        </div>
    </div>
  );
};

export default TeamRoster;
