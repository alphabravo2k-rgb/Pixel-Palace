import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { MessageCircle, Globe, Shield, Users, Crown, Search, Gamepad2, Swords, User } from 'lucide-react';

// --- HELPERS (Pure & Safe) ---

// Safely extracts a clean name from a Faceit URL
const extractFaceitName = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const parts = url.split('/players/');
    return parts.length > 1 ? parts[1].split('/')[0] : null;
  } catch (e) {
    return null;
  }
};

// Renders country flag or fallback globe
const CountryFlag = ({ code }) => {
  if (!code || code === 'un') return <Globe className="w-4 h-4 text-zinc-600" />;
  return (
    <img 
      src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
      alt={code}
      className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm"
      loading="lazy"
    />
  );
};

// Social Button Component
const SocialButton = ({ href, type }) => {
  if (!href) return null;
  
  let Icon = Globe;
  let label = 'Link';
  let colorClass = 'hover:bg-zinc-600 text-zinc-400 hover:text-white';

  if (type === 'faceit') {
    Icon = Swords; 
    label = 'Faceit';
    colorClass = 'hover:bg-[#ff5500] text-zinc-400 hover:text-white';
  } else if (type === 'steam') {
    Icon = Gamepad2;
    label = 'Steam';
    colorClass = 'hover:bg-[#171a21] text-zinc-400 hover:text-white';
  } else if (type === 'discord') {
    Icon = MessageCircle;
    label = 'Discord';
    colorClass = 'hover:bg-[#5865F2] text-zinc-400 hover:text-white';
  }

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className={`p-1.5 rounded bg-zinc-700/50 transition-all duration-200 ${colorClass} group/btn`}
      title={label}
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className="w-3.5 h-3.5" />
    </a>
  );
};

// --- SUB-COMPONENTS (The Card Design) ---

const PlayerRow = ({ player }) => {
  // Uses the strict data contract from Provider
  const displayName = extractFaceitName(player.socials?.faceit) || player.name || 'Unknown';
  const elo = player.elo;
  const country = player.country;
  
  return (
    <div className={`relative group w-full h-12 bg-[#15191f] border-b border-zinc-800/50 last:border-0 overflow-hidden flex items-center ${player.role === 'SUBSTITUTE' ? 'opacity-70 hover:opacity-100' : ''}`}>
      
      {/* Default View */}
      <div className="absolute inset-0 flex items-center justify-between px-3 z-10 transition-opacity duration-300 group-hover:opacity-0">
        <div className="flex items-center gap-3">
          
          {/* Avatar Area */}
          <div className="relative">
             {player.avatar ? (
               <img src={player.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-700" />
             ) : (
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-500">
                 <User className="w-4 h-4" />
               </div>
             )}
             <div className="absolute -bottom-1 -right-1">
               <CountryFlag code={country} />
             </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
                {player.role === 'CAPTAIN' && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />}
                <span className={`text-sm font-bold truncate max-w-[100px] ${player.role === 'CAPTAIN' ? 'text-white' : 'text-zinc-300'}`}>
                    {displayName}
                </span>
                {player.role === 'SUBSTITUTE' && (
                    <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-px rounded uppercase tracking-wider font-bold">SUB</span>
                )}
            </div>
            
            {/* Status Dots */}
            <div className="flex gap-1 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${player.socials?.faceit ? 'bg-emerald-500' : 'bg-yellow-600'}`} title="Faceit Linked"></div>
                <div className={`w-1.5 h-1.5 rounded-full ${player.socials?.steam ? 'bg-emerald-500' : 'bg-red-600'}`} title="Steam Linked"></div>
            </div>
          </div>
        </div>

        {/* ELO Display */}
        <div className="flex flex-col items-end">
          {typeof elo === 'number' ? (
            <>
                <span className="text-xs font-mono font-bold text-[#ff5500]">{elo}</span>
                <span className="text-[9px] text-zinc-600 font-mono uppercase">ELO</span>
            </>
          ) : (
            <span className="text-xs text-zinc-700 font-mono">—</span>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-3 bg-[#15191f]
                      transform -translate-x-full group-hover:translate-x-0 
                      transition-transform duration-300 ease-out will-change-transform">
        
        <div className="flex items-center gap-2">
            <SocialButton href={player.socials?.faceit} type="faceit" />
            <SocialButton href={player.socials?.steam} type="steam" />
            <SocialButton href={player.socials?.discord} type="discord" />
        </div>

        <span className="text-xs text-zinc-500 font-mono">
            {player.role === 'CAPTAIN' ? 'CAPTAIN' : player.role === 'SUBSTITUTE' ? 'SUBSTITUTE' : 'PLAYER'}
        </span>
      </div>
    </div>
  );
};

const TeamCard = ({ team }) => {
  const players = Array.isArray(team.players) ? team.players : [];
  
  // Sort: Captain -> Players -> Subs
  const sortedPlayers = [...players].sort((a, b) => {
      const roleOrder = { 'CAPTAIN': 0, 'PLAYER': 1, 'SUBSTITUTE': 2 };
      return (roleOrder[a.role] || 1) - (roleOrder[b.role] || 1);
  });

  return (
    <div className="bg-[#0b0c0f] border border-zinc-800 rounded-lg overflow-hidden shadow-xl hover:border-zinc-600 transition-all duration-300 flex flex-col h-full">
      <div className="p-4 bg-gradient-to-r from-[#15191f] to-[#0b0c0f] border-b border-zinc-800 flex items-center gap-3">
        {team.logo_url ? (
            <img src={team.logo_url} alt="" className="w-12 h-12 rounded bg-black/50 object-contain shadow-lg" />
        ) : (
            <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-zinc-600" />
            </div>
        )}
        <div className="flex flex-col min-w-0">
            <h3 className="text-zinc-100 font-black text-lg truncate leading-tight">{team.name || 'Unknown Team'}</h3>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">
                    Seed #{team.seed_number}
                </span>
                {team.region && (
                     <span className="text-[10px] text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase font-bold">
                        <Globe className="w-3 h-3" /> {team.region}
                     </span>
                )}
            </div>
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        {sortedPlayers.length > 0 ? (
            sortedPlayers.map((player, idx) => (
                <PlayerRow key={player.id || idx} player={player} />
            ))
        ) : (
            <div className="p-8 text-center text-zinc-600 text-xs italic flex flex-col items-center gap-2">
                <Users className="w-6 h-6 opacity-20" />
                <span>No players registered.</span>
            </div>
        )}
      </div>

      {team.discord_channel_url && (
        <div className="p-2 bg-[#15191f] border-t border-zinc-800 mt-auto">
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

// --- MAIN COMPONENT ---

const TeamRoster = () => {
  const { teams, loading } = useTournament(); 
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = teams.filter(t => 
    t.name && t.name.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
            <div className="w-8 h-8 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold tracking-widest uppercase">Loading teams...</p>
        </div>
    );
  }

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.length > 0 ? (
                filteredTeams.map(team => (
                    <TeamCard key={team.id} team={team} />
                ))
            ) : (
                <div className="col-span-full py-20 text-center text-zinc-500 flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <span>No teams match your search.</span>
                </div>
            )}
        </div>
    </div>
  );
};

export default TeamRoster;
