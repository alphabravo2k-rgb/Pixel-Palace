import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Search, AlertTriangle, MessageCircle, Shield, Pin } from 'lucide-react';

// --- ICONS ---
const Icons = {
  Faceit: ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 2.6l-1.9-.3c-2.9-.4-5.2.3-6.8 1.9-.3.3-.6.6-.9 1L12.9 2h-1L10.3 3.6 2.6 13.9l.6 2.2 1.9.6 1.9-2.6.3-.3.3-.6c1.6-3.2 4.5-4.5 7.4-4.2l3.6.3 3.5-3.6 1.9-3.1zM2.6 21.4l1.9.3c2.9.4 5.2-.3 6.8-1.9.3-.3.6-.6.9-1L13.7 17h1l1.6-1.6 7.7-10.3-.6-2.2-1.9-.6-1.9 2.6-.3.3-.3.6c-1.6 3.2-4.5 4.5-7.4 4.2l-3.6-.3L4.5 13.3 2.6 16.4v5z" /></svg>,
  Steam: ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.979 0C5.66 0 .473 4.904.035 11.12l4.477 6.577 3.32-1.38c.75.526 1.642.85 2.61.88l1.64 4.793c.123.007.245.01.37.01 6.627 0 12-5.373 12-12S19.105 0 11.979 0zm.066 3.99c2.56 0 4.636 2.076 4.636 4.637 0 2.56-2.076 4.637-4.636 4.637-2.56 0-4.637-2.077-4.637-4.637 0-2.56 2.077-4.637 4.637-4.637zm-2.922 8.78c-.76.012-1.48.196-2.12.513l-3.32-1.325c-.29-.115-.595-.195-.913-.23.23-.01.46-.017.693-.017 1.83 0 3.51.64 4.866 1.71-.383-.236-.787-.43-1.206-.59V12.77zm1.87 3.21c-.37-.02-.733-.09-1.08-.205l-1.61 4.707c-.432-.132-.843-.302-1.23-.507l1.71-4.996c.66.425 1.433.682 2.27.682.022 0 .044-.002.066-.002l-.127.32z"/></svg>,
  Discord: ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
};

const SocialButton = ({ href, type }) => {
  const Icon = Icons[type === 'faceit' ? 'Faceit' : type === 'steam' ? 'Steam' : 'Discord'];
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  
  if (!href) {
    return <div className="p-1.5 opacity-20 cursor-not-allowed"><Icon className="w-3.5 h-3.5 grayscale" /></div>;
  }
  
  const colors = type === 'faceit' ? 'hover:text-[#ff5500]' : type === 'steam' ? 'hover:text-blue-400' : 'hover:text-[#5865F2]';
  return (
    <a href={href} target="_blank" rel="noreferrer" 
       className={`p-1 text-zinc-500 transition-all duration-200 ${colors} hover:scale-110 active:scale-95 cursor-pointer z-50`} 
       title={`Open ${label}`}
       onMouseDown={(e) => e.stopPropagation()} 
    >
      <Icon className="w-3.5 h-3.5" />
    </a>
  );
};

const PlayerRow = ({ player }) => {
  const isSub = player.role === 'SUBSTITUTE';
  const isCap = player.role === 'CAPTAIN';
  const tag = isCap ? 'CPT' : isSub ? 'SUB' : 'PLY';
  
  // Theme: Fuchsia/Purple for Subs/Players, Blue for Captains
  const tagColor = isCap 
    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
    : isSub 
      ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/50' 
      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50';

  return (
    <div className={`relative group w-full h-12 border-b border-white/5 last:border-0 flex items-center overflow-hidden will-change-transform ${isSub ? 'bg-fuchsia-900/10' : 'bg-[#0a0a0c]'}`}>
      
      {/* Pattern for Subs */}
      {isSub && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 20px)' }} 
        />
      )}

      {/* DEFAULT VIEW */}
      <div className="absolute inset-0 flex items-center justify-between px-4 z-10 transition-transform duration-300 group-hover:-translate-y-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
            {player.avatar ? (
               <img src={player.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
               <span className="text-[10px] font-bold opacity-30 tracking-tighter text-zinc-500">{player.name?.substring(0,2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate max-w-[110px] font-['Rajdhani'] ${isCap ? 'text-white' : 'text-zinc-400'}`}>
               {player.nickname}
            </span>
            {isCap && <Pin className="w-3 h-3 text-blue-500 fill-blue-500/20 rotate-45" />}
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-fuchsia-500 tabular-nums">
          {player.elo ? `${player.elo}` : '—'}
        </span>
      </div>

      {/* HOVER VIEW (Socials & Full ID) */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-4 bg-[#0a0a0c] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <div className="flex items-center gap-2 relative z-50">
           <SocialButton href={player.socials?.faceit} type="faceit" />
           <SocialButton href={player.socials?.steam} type="steam" />
           <SocialButton href={player.socials?.discord} type="discord" />
        </div>
        <span className={`text-[9px] px-2 py-0.5 rounded-sm font-mono font-bold tracking-wider ${tagColor}`}>
           {tag}
        </span>
      </div>

      {/* Hover Neon Accent */}
      <div className={`absolute left-0 top-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${isCap ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-fuchsia-500 shadow-[0_0_10px_#d946ef]'}`} />
    </div>
  );
};

const GhostRow = () => (
  <div className="relative w-full h-12 border-b border-white/5 last:border-0 flex items-center bg-white/[0.02] overflow-hidden grayscale opacity-30">
    <div className="px-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-zinc-800/50 border border-zinc-700/50" />
      <span className="text-[9px] font-mono uppercase tracking-[0.4em] italic text-zinc-600">Reserve Slot</span>
    </div>
  </div>
);

const TeamCard = ({ team }) => {
  const players = team.players || [];
  const sortedPlayers = [...players].sort((a, b) => {
     const roleOrder = { 'CAPTAIN': 0, 'PLAYER': 1, 'SUBSTITUTE': 2 };
     return (roleOrder[a.role] || 1) - (roleOrder[b.role] || 1);
  });
  const slotsNeeded = 6; 
  const currentSlots = sortedPlayers.length;
  const emptySlots = Math.max(0, slotsNeeded - currentSlots);

  return (
    <div className="group relative bg-[#0b0c0f]/80 border border-white/10 hover:border-fuchsia-500/50 transition-all duration-500 flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-sm hover:shadow-[0_0_30px_rgba(192,38,211,0.15)]"
         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 94% 100%, 0 100%)' }}>
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#15191f] to-[#0b0c0f] border-b border-white/10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner group-hover:border-fuchsia-500/30 transition-colors">
              {team.logo_url ? <img src={team.logo_url} alt="" className="w-full h-full object-contain" /> : <Shield className="w-5 h-5 text-zinc-700" />}
           </div>
           <div className="flex flex-col">
               <h3 className="text-white font-black text-lg truncate max-w-[140px] uppercase italic tracking-tighter font-['Teko'] group-hover:text-fuchsia-400 transition-colors">
                 {team.name}
               </h3>
               <span className="text-[10px] text-zinc-500 font-mono tracking-widest">SEED #{team.seed_number}</span>
           </div>
        </div>
        {team.region_iso2 && team.region_iso2 !== 'un' && (
          <img src={`https://flagcdn.com/w40/${team.region_iso2}.png`} className="w-6 h-4 rounded shadow opacity-50 group-hover:opacity-100 transition-opacity" alt="Region" />
        )}
      </div>

      <div className="flex flex-col flex-grow bg-[#0b0c0f]/50 relative z-10">
        {sortedPlayers.map((p) => <PlayerRow key={p.id} player={p} />)}
        {[...Array(emptySlots)].map((_, i) => <GhostRow key={`ghost-${i}`} />)}
      </div>

      {team.discord_channel_url && (
        <a href={team.discord_channel_url} target="_blank" rel="noreferrer" 
           className="flex items-center justify-center gap-2 w-full py-3 mt-auto bg-[#15191f] hover:bg-fuchsia-900/20 text-zinc-500 hover:text-fuchsia-400 transition-all text-[10px] font-bold uppercase tracking-[0.2em] border-t border-white/5 relative z-10 group/link">
           <MessageCircle className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" /> COMMS UNIT
        </a>
      )}
    </div>
  );
};

const TeamRoster = () => {
  const { teams, loading, error } = useTournament(); 
  const [searchTerm, setSearchTerm] = useState('');
  const filteredTeams = teams.filter(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Add Font Link dynamically if missing
  React.useEffect(() => {
    if (!document.getElementById('google-fonts-rajdhani')) {
        const link = document.createElement('link');
        link.id = 'google-fonts-rajdhani';
        link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Teko:wght@600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
  }, []);

  if (loading) return <div className="h-96 flex flex-col items-center justify-center text-fuchsia-500 gap-4 font-mono text-xs uppercase animate-pulse tracking-[0.5em]">SYNCING...</div>;
  if (error) return <div className="p-12 text-center text-red-500 font-mono text-xs uppercase">SYNC FAILURE: {error}</div>;

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-700 font-['Rajdhani']">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase font-['Teko'] drop-shadow-[0_0_10px_rgba(192,38,211,0.5)]">
                   ROSTER <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">INTEL</span>
                </h2>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
                   Operational Status: {teams.length} Squads Active
                </p>
            </div>
            <div className="w-full md:w-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" placeholder="FIND SQUAD //" 
                  className="bg-[#0b0c0f] border border-zinc-800 text-white pl-10 pr-4 py-3 rounded w-full md:w-72 focus:border-fuchsia-500/50 focus:bg-fuchsia-900/10 outline-none text-xs font-bold uppercase transition-all tracking-wider placeholder-zinc-700" 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.map(t => <TeamCard key={t.id} team={t} />)}
        </div>
    </div>
  );
};

export default TeamRoster;
