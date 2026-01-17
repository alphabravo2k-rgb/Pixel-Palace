/**
 * 🛡️ TEAM ROSTER: THE BARRACKS (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // DATA-ENRICHED
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, RefreshCw, Shield, Crown, 
  Users, Trophy, User, Zap, Activity, Target
} from 'lucide-react';
import { cn } from '../lib/utils';

// MASTER CORE
import { supabase } from '../supabase/client';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';

// --- 1. ASSETS & BRANDING ---
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
  )
};

// --- 2. LOGIC: POWER INDEX ---
const getLevelColor = (elo) => {
    if (elo >= 2000) return "text-red-500 shadow-[0_0_10px_#ef4444]";
    if (elo >= 1500) return "text-fuchsia-500";
    if (elo >= 1000) return "text-emerald-500";
    return "text-zinc-600";
};

// --- 3. SUB-COMPONENTS ---
const PlayerRow = ({ member, index }) => {
    const isCaptain = member.role?.toUpperCase() === 'CAPTAIN';
    
    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onMouseEnter={() => { try{ SoundNexus.play(CUES.UI_HOVER, { volume: 0.05 }); }catch(e){} }}
            className="flex items-center justify-between px-4 h-12 border-b border-white/5 last:border-0 hover:bg-white/[0.02] group transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-7 h-7 rounded-sm flex items-center justify-center border transition-all duration-500 rotate-45 group-hover:rotate-0",
                    isCaptain ? "bg-fuchsia-600/10 border-fuchsia-500/40 text-fuchsia-500" : "bg-zinc-900 border-zinc-800 text-zinc-600"
                )}>
                    <div className={cn("-rotate-45 group-hover:rotate-0 transition-transform", isCaptain ? "text-fuchsia-500" : "text-zinc-700")}>
                        {isCaptain ? <Crown size={14} /> : <User size={14} />}
                    </div>
                </div>
                <span className={cn(
                  "text-xs font-black uppercase italic tracking-tighter transition-colors",
                  isCaptain ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"
                )}>
                    {member.username}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {member.elo > 0 && (
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-black tracking-widest">
                        <Zap size={10} className="text-amber-500" />
                        <span className={getLevelColor(member.elo)}>{member.elo}</span>
                    </div>
                )}
                <div className="flex gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                    {member.faceit_url && <a href={member.faceit_url} target="_blank" rel="noreferrer"><Icons.Faceit className="w-3.5 h-3.5 text-zinc-600 hover:text-[#ff5500]" /></a>}
                    {member.steam_url && <a href={member.steam_url} target="_blank" rel="noreferrer"><Icons.Steam className="w-3.5 h-3.5 text-zinc-600 hover:text-blue-400" /></a>}
                </div>
            </div>
        </motion.div>
    );
};

// --- 4. MAIN BARRACKS COMPONENT ---
export const TeamRoster = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    const startLog = Telemetry.time('roster_uplink');
    
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`id, name, logo_url, seed_number, team_members(id, role, user_id)`)
        .order('name');

      if (teamsError) throw teamsError;

      const allUserIds = teamsData.flatMap(t => t.team_members.map(m => m.user_id)).filter(Boolean);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, faceit_elo, faceit_url, steam_url')
        .in('id', allUserIds);

      const profileMap = profiles?.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}) || {};

      const formatted = teamsData.map(team => ({
        ...team,
        members: team.team_members.map(tm => ({
          id: tm.id,
          role: tm.role,
          username: profileMap[tm.user_id]?.display_name || 'Anonymous',
          elo: profileMap[tm.user_id]?.faceit_elo || 0,
          faceit_url: profileMap[tm.user_id]?.faceit_url,
          steam_url: profileMap[tm.user_id]?.steam_url
        })).sort((a, b) => (b.role === 'captain' ? 1 : -1))
      }));

      setTeams(formatted);
      startLog.end();
    } catch (err) {
      console.error("Uplink Interrupted:", err);
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const filteredTeams = teams.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.members.some(m => m.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    squads: teams.length,
    ops: teams.reduce((acc, t) => acc + t.members.length, 0),
    power: Math.round(teams.reduce((acc, t) => acc + t.members.reduce((s, m) => s + (m.elo || 0), 0), 0) / (teams.reduce((acc, t) => acc + t.members.length, 0) || 1))
  };

  return (
    <div className="p-10 space-y-12 bg-[#050505] min-h-screen relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-5"><div className="scanlines" /></div>

      {/* TACTICAL HUD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {[
          { label: 'Registered Squads', val: stats.squads, icon: Shield, col: 'text-white' },
          { label: 'Active Operators', val: stats.ops, icon: Users, col: 'text-fuchsia-500' },
          { label: 'Average Power Index', val: stats.power, icon: Zap, col: 'text-amber-500' }
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -2 }} className="bg-[#09090b] border border-white/5 p-6 rounded-sm shadow-2xl relative overflow-hidden group">
            <s.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-[0.02] group-hover:opacity-[0.05] transition-opacity" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-3">{s.label}</p>
            <h4 className={cn("text-4xl font-display font-black italic tracking-tighter leading-none", s.col)}>{s.val}</h4>
          </motion.div>
        ))}
      </div>

      {/* CONTROL TERMINAL */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8 relative z-10">
        <div>
            <h2 className="text-6xl font-display font-black italic tracking-tighter uppercase leading-none text-white">
                The <span className="text-fuchsia-600">Barracks</span>
            </h2>
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.6em] mt-4 flex items-center gap-3">
               <Activity size={12} className="text-fuchsia-500 animate-pulse" /> Personnel Registry // Secure Uplink Active
            </p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-fuchsia-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search Operator/Squad..." 
                    className="w-full bg-zinc-900/40 border border-zinc-800 pl-12 pr-4 py-4 rounded-sm text-[10px] font-mono uppercase text-white focus:border-fuchsia-500 outline-none transition-all placeholder:text-zinc-800"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={fetchTeams} className="p-4 bg-zinc-900 border border-zinc-800 hover:border-fuchsia-500 text-zinc-600 hover:text-white transition-all active:scale-95">
                <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
        </div>
      </div>

      {/* SQUAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 relative z-10">
        <AnimatePresence mode="popLayout">
            {filteredTeams.map((team, i) => (
               <motion.div 
                 key={team.id}
                 layout
                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ duration: 0.4, delay: i * 0.02 }}
                 className="bg-[#09090b] border border-white/5 hover:border-fuchsia-500/40 transition-all duration-500 flex flex-col rounded-sm overflow-hidden shadow-2xl relative group"
               >
                   <div className="p-6 bg-zinc-900/20 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
                       <div className="flex items-center gap-5 relative z-10">
                           <div className="w-12 h-12 bg-black border border-white/5 rounded-sm flex items-center justify-center p-2 shadow-inner group-hover:border-fuchsia-500/20 transition-colors">
                               {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" alt=""/> : <Shield className="w-6 h-6 text-zinc-800" />}
                           </div>
                           <div>
                               <h3 className="text-xl font-display font-black uppercase italic tracking-tighter text-white truncate max-w-[160px] group-hover:text-fuchsia-400 transition-colors">{team.name}</h3>
                               <p className="text-[9px] text-zinc-600 font-mono tracking-widest mt-1 uppercase">Node_{team.seed_number || 'XX'}</p>
                           </div>
                       </div>
                       <Trophy size={20} className="text-zinc-900 group-hover:text-amber-500/20 transition-colors" />
                   </div>

                   <div className="flex-grow bg-black/20">
                       {team.members.map((m, idx) => <PlayerRow key={m.id} member={m} index={idx} />)}
                       {Array.from({ length: Math.max(0, 5 - team.members.length) }).map((_, idx) => (
                           <div key={idx} className="h-12 border-b border-white/5 flex items-center px-4 opacity-10 grayscale">
                               <div className="w-7 h-7 rounded-sm bg-zinc-900 border border-white/5 mr-4 rotate-45" />
                               <div className="h-1 w-20 bg-zinc-800 rounded-full" />
                           </div>
                       ))}
                   </div>

                   <div className="p-3 bg-zinc-900/40 flex justify-center">
                        <span className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">Sector_Secure</span>
                   </div>
               </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
