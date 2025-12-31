import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Search, RefreshCw, Shield, Crown, Pin, 
  ArrowUpRight, Minus, AlertTriangle, Users 
} from 'lucide-react';

// --- ASSETS: CUSTOM SVGs (Socials) ---
const Icons = {
  Faceit: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 2.6l-1.9-.3c-2.9-.4-5.2.3-6.8 1.9-.3.3-.6.6-.9 1L12.9 2h-1L10.3 3.6 2.6 13.9l.6 2.2 1.9.6 1.9-2.6.3-.3.3-.6c1.6-3.2 4.5-4.5 7.4-4.2l3.6.3 3.5-3.6 1.9-3.1zM2.6 21.4l1.9.3c2.9.4 5.2-.3 6.8-1.9.3-.3.6-.6.9-1L13.7 17h1l1.6-1.6 7.7-10.3-.6-2.2-1.9-.6-1.9 2.6-.3.3-.3.6c-1.6 3.2-4.5 4.5-7.4 4.2l-3.6-.3L4.5 13.3 2.6 16.4v5z" />
    </svg>
  ),
  Steam: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.979 0C5.66 0 .473 4.904.035 11.12l4.477 6.577 3.32-1.38c.75.526 1.642.85 2.61.88l1.64 4.793c.123.007.245.01.37.01 6.627 0 12-5.373 12-12S19.105 0 11.979 0zm.066 3.99c2.56 0 4.636 2.076 4.636 4.637 0 2.56-2.076 4.637-4.636 4.637-2.56 0-4.637-2.077-4.637-4.637 0-2.56 2.077-4.637 4.637-4.637zm-2.922 8.78c-.76.012-1.48.196-2.12.513l-3.32-1.325c-.29-.115-.595-.195-.913-.23.23-.01.46-.017.693-.017 1.83 0 3.51.64 4.866 1.71-.383-.236-.787-.43-1.206-.59V12.77zm1.87 3.21c-.37-.02-.733-.09-1.08-.205l-1.61 4.707c-.432-.132-.843-.302-1.23-.507l1.71-4.996c.66.425 1.433.682 2.27.682.022 0 .044-.002.066-.002l-.127.32z"/>
    </svg>
  ),
  Discord: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  )
};

const SocialButton = ({ href, type }) => {
  const Icon = Icons[type];
  const label = type;
  
  if (!href) {
    return (
      <div className="p-1.5 opacity-10 cursor-not-allowed" title={`${label} Not Linked`}>
        <Icon className="w-3.5 h-3.5 grayscale" />
      </div>
    );
  }

  const colors = type === 'Faceit' ? 'hover:text-[#ff5500]' : type === 'Steam' ? 'hover:text-blue-400' : 'hover:text-[#5865F2]';
  
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      className={`p-1 text-zinc-500 transition-all duration-200 ${colors} hover:scale-125 active:scale-95`}
      title={`Open ${label}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className="w-3.5 h-3.5" />
    </a>
  );
};

// --- CONFIG: LOGIC & SORTING ---
const ROLE_WEIGHT = { 'CAPTAIN': 1, 'PLAYER': 2, 'SUBSTITUTE': 3, 'COACH': 4 };
const getRoleWeight = (role) => ROLE_WEIGHT[role] || 99;

const StatsCard = ({ title, value, type }) => {
  const isGood = type === 'teams' || type === 'players';
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Shield size={64} />
      </div>
      <div className="flex justify-between items-start z-10">
        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">{title}</span>
        {isGood ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <Minus className="w-4 h-4 text-zinc-600" />}
      </div>
      <div className="mt-2 z-10">
        <span className="text-3xl font-bold font-['Teko'] text-white">{value}</span>
      </div>
    </div>
  );
};

// --- COMPONENT: PLAYER ROW (THE "SLIDER") ---
const PlayerRow = ({ member, idx }) => {
    // Determine Role & Visuals
    const isCaptain = member.role === 'CAPTAIN';
    // Treat 6th/7th players as Subs visually if not Captains
    const isOverflow = idx >= 5 && !isCaptain; 
    const isSub = member.role === 'SUBSTITUTE' || isOverflow;

    const tag = isCaptain ? 'CPT' : isSub ? 'SUB' : 'OPR';
    const accentColor = isCaptain ? 'bg-fuchsia-500' : isSub ? 'bg-yellow-500' : 'bg-zinc-700';
    const textColor = isCaptain ? 'text-white font-bold' : isSub ? 'text-zinc-500' : 'text-zinc-300';
    
    // Fallback Initial
    const initial = member.username?.charAt(0).toUpperCase() || '?';

    return (
        <div className={`relative group w-full h-10 border-b border-white/5 last:border-0 overflow-hidden ${isSub ? 'bg-black/30' : 'bg-transparent'}`}>
            
            {/* SUB PATTERN */}
            {isSub && (
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #ffffff 5px, #ffffff 10px)' }} 
                />
            )}

            {/* LAYER 1: DEFAULT VIEW */}
            <div className="absolute inset-0 flex items-center justify-between px-3 transition-transform duration-300 group-hover:-translate-y-full">
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${isCaptain ? 'bg-fuchsia-900/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
                        {isCaptain ? <Crown size={12} /> : initial}
                    </div>
                    <span className={`text-xs truncate max-w-[120px] ${textColor}`}>
                        {member.username}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    {member.elo > 0 && (
                        <span className="text-[10px] font-mono text-orange-400 tabular-nums">
                            {member.elo}
                        </span>
                    )}
                    {/* Tiny Status Dot */}
                    <div className={`w-1 h-1 rounded-full ${isCaptain ? 'bg-fuchsia-500' : isSub ? 'bg-yellow-500' : 'bg-green-500'}`} />
                </div>
            </div>

            {/* LAYER 2: HOVER SOCIALS VIEW */}
            <div className="absolute inset-0 flex items-center justify-between px-3 bg-zinc-900 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                <div className="flex items-center gap-1">
                    <SocialButton href={member.faceit_url} type="Faceit" />
                    <SocialButton href={member.steam_url} type="Steam" />
                    <SocialButton href={`https://discord.com/users/${member.discord_id}`} type="Discord" />
                </div>

                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold tracking-widest ${isCaptain ? 'bg-fuchsia-900/30 text-fuchsia-400' : isSub ? 'bg-yellow-900/30 text-yellow-500' : 'bg-zinc-800 text-zinc-400'}`}>
                    {tag}
                </span>
            </div>

            {/* HOVER ACCENT BAR */}
            <div className={`absolute left-0 top-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${accentColor} shadow-[0_0_8px_currentColor]`} />
        </div>
    );
};

const GhostRow = () => (
    <div className="relative w-full h-10 border-b border-white/5 last:border-0 flex items-center bg-black/20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
        <div className="px-3 flex items-center gap-3 opacity-20">
            <div className="w-6 h-6 rounded bg-white/10" />
            <div className="h-2 w-16 bg-white/10 rounded" />
        </div>
    </div>
);

// --- MAIN PAGE ---
export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id, name, logo_url, region, access_code, seed_number,
          team_members (
            id, role,
            global_identities (id, display_name, discord_handle, faceit_elo, faceit_url, steam_url, discord_id)
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      const formatted = data?.map(team => {
        const sortedMembers = team.team_members.map(tm => ({
          id: tm.id,
          role: tm.role?.toUpperCase() || 'PLAYER',
          username: tm.global_identities?.display_name || 'Unknown',
          discord_id: tm.global_identities?.discord_id,
          faceit_url: tm.global_identities?.faceit_url,
          steam_url: tm.global_identities?.steam_url,
          elo: tm.global_identities?.faceit_elo || 0
        })).sort((a, b) => {
            const weightA = getRoleWeight(a.role);
            const weightB = getRoleWeight(b.role);
            if (weightA !== weightB) return weightA - weightB;
            return a.username.localeCompare(b.username);
        });

        return { ...team, members: sortedMembers };
      });

      setTeams(formatted || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load roster data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPlayers = teams.reduce((acc, team) => acc + (team.members?.length || 0), 0);
  const readyTeams = teams.filter(t => (t.members?.length || 0) >= 5).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Teams" value={teams.length} type="teams" />
        <StatsCard title="Active Operators" value={totalPlayers} type="players" />
        <StatsCard title="Combat Ready" value={readyTeams} type="pending" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
        <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-['Teko']">
                ROSTER <span className="text-fuchsia-500">INTEL</span>
            </h2>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                LIVE DATABASE // {teams.length} SQUADS ONLINE
            </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="FIND SQUAD //" 
                    className="bg-black border border-white/10 pl-10 pr-4 py-2 rounded text-xs font-mono uppercase text-white w-64 focus:border-fuchsia-500 outline-none transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={fetchTeams} className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-zinc-400 transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredTeams.map(team => {
          const playerCount = team.members?.length || 0;
          const slotsNeeded = 6;
          const emptySlots = Math.max(0, slotsNeeded - playerCount);
          
          let statusColor = "border-zinc-800 hover:border-zinc-600";
          if (playerCount < 5) statusColor = "border-red-900/50 hover:border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]";
          else if (playerCount > 6) statusColor = "border-yellow-900/50 hover:border-yellow-500/50";

          return (
            <div key={team.id} className={`group bg-[#0b0c0f] border ${statusColor} transition-all duration-300 flex flex-col overflow-hidden shadow-2xl relative`}>
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-zinc-900 to-black border-b border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-black flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain p-1" /> : <Shield className="w-5 h-5 text-zinc-700" />}
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm uppercase italic tracking-tighter truncate max-w-[120px]">
                                {team.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500 font-mono tracking-widest">
                                    {team.seed_number ? `SEED #${team.seed_number}` : 'UNRANKED'}
                                </span>
                                {playerCount < 5 && <AlertTriangle size={10} className="text-red-500" />}
                            </div>
                        </div>
                    </div>
                    {/* Region Flag Placeholder or Count */}
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${playerCount < 5 ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-zinc-500'}`}>
                        {playerCount} / 6
                    </span>
                </div>

                {/* Roster */}
                <div className="flex-grow bg-zinc-900/20 relative z-10">
                    {team.members.map((m, idx) => (
                        <PlayerRow key={m.id} member={m} idx={idx} />
                    ))}
                    {[...Array(emptySlots)].map((_, i) => (
                        <GhostRow key={`ghost-${i}`} />
                    ))}
                </div>

                {/* Corner Decoration */}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-white/5 to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
