import React, { useState } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Users, Shield, Crown, Globe, AlertCircle, ChevronDown, ChevronUp, Gamepad2, MessageSquare, ExternalLink } from 'lucide-react';

const ROLE_LABELS = {
  CAPTAIN: 'Captain',
  PLAYER: 'Player',
  SUBSTITUTE: 'Sub'
};

const TeamCard = ({ team }) => {
    // 1. HARDENING: Normalize players array to prevent crashes
    const players = Array.isArray(team.players) ? team.players : [];
    
    // 2. DEFENSIVE: Check for data integrity issues
    const captainCount = players.filter(p => p.role === 'CAPTAIN').length;

    // 4. MOBILE: Split roster to collapse substitutes on small screens
    const mainRoster = players.filter(p => p.role !== 'SUBSTITUTE');
    const substitutes = players.filter(p => p.role === 'SUBSTITUTE');
    const [showSubs, setShowSubs] = useState(false);
    
    // Get Flag (Basic mapping or default)
    // You can expand REGION_FLAGS in a constants file if needed
    const flag = team.region || '🏳️'; 

    const SocialButton = ({ type, url }) => {
        if (!url || url === 'NA' || url === '#') return null;
        let Icon = ExternalLink;
        let color = "hover:text-white";
        let link = url;

        if (type === 'faceit') { Icon = Shield; color = "hover:text-orange-500"; }
        if (type === 'steam') { Icon = Gamepad2; color = "hover:text-blue-500"; }
        if (type === 'discord') { 
            Icon = MessageSquare; 
            color = "hover:text-indigo-400"; 
            if (!url.startsWith('http')) link = `https://discord.com/users/${url}`; 
        }

        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className={`text-zinc-500 transition-colors ${color} p-1`} onClick={(e) => e.stopPropagation()}>
                <Icon className="w-3.5 h-3.5" />
            </a>
        );
    };

    return (
        <div className="bg-[#15191f] border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-fuchsia-600 transition-colors"></div>
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden">
                {team.logo_url ? (
                    <img src={team.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <Shield className="w-6 h-6 text-zinc-700" />
                )}
                </div>
                <div>
                <h3 className="text-lg font-black text-white leading-tight">{team.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase bg-black/30 px-1.5 py-0.5 rounded">Seed #{team.seed_number}</span>
                    {team.region && (
                    <span className="text-[10px] text-zinc-500 font-mono uppercase bg-black/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {team.region}
                    </span>
                    )}
                </div>
                </div>
            </div>
            </div>

            {/* Warnings (Admin Visibility) */}
            {captainCount > 1 && (
            <div className="mb-3 flex items-center gap-2 text-[10px] text-red-400 bg-red-900/10 border border-red-900/30 p-2 rounded">
                <AlertCircle className="w-3 h-3" />
                Multiple captains detected (Audit required)
            </div>
            )}

            {/* Roster List */}
            <div className="space-y-1">
                {/* Main Roster - Always Visible */}
                {mainRoster.length > 0 || substitutes.length > 0 ? (
                    mainRoster.map(p => (
                        <div key={`${team.id}-${p.uid}`} className="relative group/player flex items-center justify-between text-xs bg-[#0b0c0f]/50 p-2 rounded border border-white/5 hover:border-white/10 transition-colors overflow-hidden">
                        
                        <div className="flex items-center gap-2 text-zinc-300 z-10 min-w-0">
                            {p.role === 'CAPTAIN' && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                            
                            {/* 3. IDENTITY: Support future 'display_name' format */}
                            <span className={`${p.role === 'CAPTAIN' ? 'font-bold text-white' : ''} truncate`}>
                                {p.display_name || p.name}
                            </span>
                        </div>

                        {/* Right Side: Elo or Socials (Slide Effect) */}
                        <div className="relative h-4 w-24 flex-shrink-0">
                            {/* Default: Rank/Elo */}
                            <div className="absolute right-0 top-0 transition-transform duration-300 group-hover/player:-translate-x-32 group-hover/player:opacity-0 flex items-center justify-end w-full">
                                {p.rank ? (
                                    <span className="text-zinc-500 font-mono text-[9px] uppercase">
                                        {/* Display 'Elo' if high number, else 'Lvl' */}
                                        {isNaN(p.rank) || parseInt(p.rank) < 20 ? `LVL ${p.rank}` : `${p.rank} ELO`}
                                    </span>
                                ) : (
                                    <span className="text-zinc-700 text-[9px]">-</span>
                                )}
                            </div>

                            {/* Hover: Social Buttons */}
                            <div className="absolute right-0 top-[-2px] flex gap-1 translate-x-32 opacity-0 group-hover/player:translate-x-0 group-hover/player:opacity-100 transition-all duration-300 justify-end w-full">
                                <SocialButton type="steam" url={p.steam} />
                                <SocialButton type="faceit" url={p.faceit} />
                                {/* Discord usually just a handle, but if mapped to URL via bot later */}
                            </div>
                        </div>
                        </div>
                    ))
                ) : (
                    <div className="text-xs text-zinc-600 italic p-2 text-center border border-dashed border-zinc-800 rounded">
                        {team.players === undefined
                        ? 'Roster unavailable (Sync Error)'
                        : 'Roster pending...'}
                    </div>
                )}

                {/* Substitutes - Collapsible on Mobile */}
                {substitutes.length > 0 && (
                    <>
                        {/* Mobile Toggle Button */}
                        <div className="block sm:hidden mt-2">
                            <button 
                                onClick={() => setShowSubs(!showSubs)}
                                className="w-full flex items-center justify-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 py-1"
                            >
                                {showSubs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {showSubs ? 'Hide Substitutes' : `Show ${substitutes.length} Substitute(s)`}
                            </button>
                        </div>

                        {/* Substitutes List (Visible on Desktop OR when toggled on Mobile) */}
                        <div className={`${showSubs ? 'block' : 'hidden'} sm:block space-y-1 mt-2 border-t border-white/5 pt-2`}>
                            {substitutes.map(p => (
                                <div key={`${team.id}-${p.uid}`} className="flex items-center justify-between text-xs text-zinc-500 px-2 py-1 hover:bg-[#0b0c0f]/30 rounded transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] bg-zinc-800 px-1 rounded text-zinc-400">SUB</span>
                                        <span>{p.display_name || p.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                                         <SocialButton type="faceit" url={p.faceit} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const TeamRoster = () => {
  const { teams, loading, error } = useTournament(); 
  const [searchTerm, setSearchTerm] = useState('');

  // Normalize search input to prevent crashes
  const safeSearchTerm = searchTerm || '';
  const filteredTeams = teams.filter(t => 
    t.name && t.name.toLowerCase().includes(safeSearchTerm.toLowerCase())
  );

  // DEBUGGING: Show Error State
  if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-4 border border-red-900/50 bg-red-900/10 rounded-xl">
            <AlertCircle className="w-12 h-12" />
            <div className="text-center">
                <p className="text-sm font-bold tracking-widest uppercase">ROSTER LOAD FAILED</p>
                <p className="text-xs font-mono mt-2 text-red-300">{typeof error === 'object' ? error.message : error}</p>
            </div>
        </div>
      );
  }

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
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4 border border-dashed border-zinc-800 rounded-xl">
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
            <p className="text-zinc-500 text-sm mt-1 max-w-lg">
                Official roster listing. Rosters are locked.
            </p>
        </div>
        <div className="w-full md:w-auto">
            <input 
                type="text" 
                placeholder="Search teams..." 
                className="bg-[#0b0c0f] border border-zinc-700 text-white px-4 py-2 rounded-lg w-full md:w-64 focus:border-fuchsia-500 outline-none text-sm"
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
            <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-xl">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-500">No teams found</h3>
                <p className="text-zinc-600 text-sm">Teams will appear here once imported.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TeamRoster;
