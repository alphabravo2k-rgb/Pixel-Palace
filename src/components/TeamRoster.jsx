import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { 
  Search, RefreshCw, Shield, Crown, Minus, 
  ArrowUpRight, AlertTriangle, Users, Trophy 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

// --- 1. ASSETS & ICONS ---
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

// --- 2. LOGIC HELPERS ---
const getFaceitLevel = (elo) => {
    if (!elo || elo < 1) return 1;
    if (elo <= 800) return 1;
    if (elo <= 950) return 2;
    if (elo <= 1100) return 3;
    if (elo <= 1250) return 4;
    if (elo <= 1400) return 5;
    if (elo <= 1550) return 6;
    if (elo <= 1700) return 7;
    if (elo <= 1850) return 8;
    if (elo <= 2000) return 9;
    return 10;
};

const getLevelColor = (level) => {
    if (level === 10) return "text-red-500";
    if (level >= 8) return "text-orange-500";
    if (level >= 5) return "text-yellow-500";
    return "text-zinc-400";
};

// --- 3. SUB-COMPONENTS ---
const SocialButton = ({ href, type }) => {
  const Icon = Icons[type];
  if (!href) return <div className="p-1.5 opacity-10 cursor-not-allowed"><Icon className="w-3.5 h-3.5 grayscale" /></div>;
  
  const colors = {
      Faceit: 'hover:text-[#ff5500]',
      Steam: 'hover:text-blue-400',
      Discord: 'hover:text-[#5865F2]'
  }[type];

  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} 
       className={`p-1 text-zinc-500 transition-all duration-200 ${colors} hover:scale-125`}>
      <Icon className="w-3.5 h-3.5" />
    </a>
  );
};

const StatsCard = ({ title, value, icon: Icon, color = "text-white" }) => (
  <div className="bg-bg-panel border border-tactical rounded p-4 flex flex-col justify-between h-full relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
      <Icon size={100} />
    </div>
    <div className="flex justify-between items-start z-10">
      <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">{title}</span>
    </div>
    <div className="mt-2 z-10">
      <span className={cn("text-3xl font-bold font-display", color)}>{value}</span>
    </div>
  </div>
);

const PlayerRow = ({ member }) => {
    const normalizedRole = member.role?.toUpperCase() || 'PLAYER';
    const isCaptain = normalizedRole === 'CAPTAIN';
    const level = getFaceitLevel(member.elo);
    
    return (
        <div className="relative group w-full h-11 border-b border-white/5 last:border-0 overflow-hidden bg-transparent hover:bg-white/5 transition-colors">
            {/* LAYER 1: DATA */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border",
                        isCaptain ? "bg-brand/10 text-brand-glow border-brand/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                    )}>
                        {isCaptain ? <Crown size={12} /> : member.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className={cn("text-xs font-medium truncate max-w-[140px]", isCaptain ? "text-white" : "text-zinc-400")}>
                        {member.username}
                    </span>
                </div>
                
                {/* ELO / LEVEL BADGE */}
                <div className="flex items-center gap-3">
                   {member.elo > 0 && (
                       <div className="flex items-center gap-1.5" title={`ELO: ${member.elo}`}>
                           <span className={cn("text-xs font-display font-bold", getLevelColor(level))}>LVL {level}</span>
                       </div>
                   )}
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <SocialButton href={member.faceit_url} type="Faceit" />
                        <SocialButton href={member.steam_url} type="Steam" />
                   </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. MAIN COMPONENT ---
export const TeamRoster = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      // 1. Get Teams
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id, name, logo_url, seed_number,
          team_members ( id, role, user_id )
        `)
        .order('name');

      if (error) throw error;

      // 2. Get Profiles Manually (Avoids RLS Join issues)
      const allUserIds = data.flatMap(t => t.team_members.map(m => m.user_id)).filter(Boolean);
      let profileMap = {};
      
      if (allUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('global_identities')
            .select('id, display_name, faceit_elo, faceit_url, steam_url, discord_id')
            .in('id', allUserIds);
          profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      }

      // 3. Merge & Sort
      const formatted = data.map(team => {
        const members = (team.team_members || []).map(tm => {
          const profile = profileMap[tm.user_id] || {};
          return {
            id: tm.id,
            role: tm.role,
            username: profile.display_name || 'Unknown Agent',
            faceit_url: profile.faceit_url,
            steam_url: profile.steam_url,
            elo: profile.faceit_elo || 0
          };
        }).sort((a, b) => (b.role === 'CAPTAIN' ? 1 : -1)); // Captain first

        return { ...team, members };
      });

      setTeams(formatted);
    } catch (err) {
      console.error("Roster Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  // Filter Logic
  const filteredTeams = teams.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.members.some(m => m.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPlayers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const avgElo = Math.round(teams.reduce((acc, t) => acc + t.members.reduce((s, m) => s + (m.elo || 1000), 0), 0) / (totalPlayers || 1));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 md:p-8 bg-bg min-h-screen text-white">
      
      {/* HUD Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Registered Squads" value={teams.length} icon={Shield} color="text-white" />
        <StatsCard title="Active Operators" value={totalPlayers} icon={Users} color="text-brand-glow" />
        <StatsCard title="Average ELO" value={avgElo} icon={Trophy} color="text-yellow-500" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
        <div>
            <h2 className="text-4xl font-display font-black italic tracking-tighter uppercase">
                Roster <span className="text-brand">Intel</span>
            </h2>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">
                LIVE DATABASE // {teams.length} SQUADS ONLINE
            </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="FIND SQUAD OR OPERATOR..." 
                    className="w-full bg-bg-surface border border-tactical pl-10 pr-4 py-2 rounded-sm text-xs font-mono uppercase text-white focus:border-brand outline-none transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={fetchTeams} className="p-2 bg-bg-surface border border-tactical hover:border-brand text-zinc-400 hover:text-white transition-colors">
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredTeams.map(team => (
           <div key={team.id} className="group bg-bg-panel border border-tactical hover:border-brand/50 transition-all duration-300 flex flex-col overflow-hidden shadow-glass relative">
               
               {/* Team Header */}
               <div className="p-4 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-black border border-white/10 rounded-sm flex items-center justify-center p-1">
                           {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" /> : <Shield className="w-5 h-5 text-zinc-700" />}
                       </div>
                       <div>
                           <h3 className="text-sm font-black uppercase italic tracking-tighter text-white truncate max-w-[150px]">{team.name}</h3>
                           <span className="text-[10px] text-zinc-500 font-mono tracking-widest">
                               {team.seed_number ? `SEED #${team.seed_number}` : 'UNRANKED'}
                           </span>
                       </div>
                   </div>
                   <span className="text-[10px] font-mono text-zinc-600">{team.members.length}/6</span>
               </div>

               {/* Members List */}
               <div className="flex-grow bg-bg-surface/30">
                   {team.members.map(m => <PlayerRow key={m.id} member={m} />)}
                   {/* Empty Slots */}
                   {[...Array(Math.max(0, 5 - team.members.length))].map((_, i) => (
                       <div key={i} className="h-11 border-b border-white/5 flex items-center px-4 opacity-20">
                           <div className="w-6 h-6 rounded bg-white/10 mr-3" />
                           <div className="h-2 w-16 bg-white/10 rounded" />
                       </div>
                   ))}
               </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default TeamRoster;
