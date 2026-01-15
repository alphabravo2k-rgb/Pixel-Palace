/**
 * 🪪 TEAM CARD: SQUAD UNIT (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // DATA-LOCKED
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, AlertCircle, Shield, Crown, User, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { normalizeRole } from '../../lib/security/engine';

// MASTER INTEGRATION
import { SoundNexus, CUES } from '../../lib/soundNexus';

// 👤 INTERNAL SUB-COMPONENT: OPERATOR ROW
const PlayerRow = ({ player, index }) => {
  const role = normalizeRole(player.role);
  const isCaptain = role === 'captain';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
      className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-emerald-500/[0.03] transition-colors group/row"
    >
      <div className="flex items-center gap-3">
        {/* AVATAR BOX */}
        <div className={cn(
          "w-8 h-8 rounded-sm flex items-center justify-center text-xs font-black border transition-all duration-500",
          isCaptain 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)] rotate-45 group-hover/row:rotate-0" 
            : "bg-zinc-900 text-zinc-600 border-zinc-800"
        )}>
          <div className={cn(isCaptain && "-rotate-45 group-hover/row:rotate-0 transition-transform duration-500")}>
            {isCaptain ? <Crown size={14} /> : <User size={14} />}
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className={cn(
            "text-xs font-black uppercase italic tracking-tighter leading-none truncate max-w-[120px] transition-colors",
            isCaptain ? "text-white" : "text-zinc-500 group-hover/row:text-zinc-300"
          )}>
            {player.username || player.name || 'ANON_OP'}
          </span>
          <span className="text-[8px] text-zinc-700 font-mono mt-1 uppercase tracking-[0.2em]">
            {role}
          </span>
        </div>
      </div>

      {/* TACTICAL ELO */}
      {player.elo > 0 && (
         <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-sm border border-white/5 font-mono text-[9px] text-zinc-500">
            <Zap size={8} className="text-amber-500" />
            {player.elo}
         </div>
      )}
    </motion.div>
  );
};

const ROLE_ORDER = { captain: 0, player: 1, substitute: 2, coach: 3, guest: 99 };

export const TeamCard = ({ team, rank, tournamentRules = {} }) => {
  if (!team) return null;

  const slotsNeeded = team.max_players ?? tournamentRules.team_size ?? 5;

  // 🧠 ROLE HIERARCHY ENGINE
  const sortedPlayers = useMemo(() => {
      return [...(team.members || [])].sort((a, b) => {
        const pA = ROLE_ORDER[normalizeRole(a.role)] ?? 99;
        const pB = ROLE_ORDER[normalizeRole(b.role)] ?? 99;
        if (pA !== pB) return pA - pB;
        return (a.username || a.name || '').localeCompare(b.username || b.name || '');
      });
  }, [team.members]);

  const emptySlots = Math.max(0, slotsNeeded - sortedPlayers.length);
  const displaySeed = team.seed_number;
  const hasSeed = displaySeed !== undefined && displaySeed !== null;

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onMouseEnter={() => SoundNexus.play(CUES.UI_HOVER, { volume: 0.05 })}
      className="relative overflow-hidden rounded-sm border border-zinc-800 bg-[#09090b] shadow-2xl transition-all duration-300 group"
    >
      {/* 🧩 ATMOSPHERIC SCANLINE */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

      {/* HEADER SECTION */}
      <div className="p-5 flex items-center justify-between border-b border-white/5 bg-zinc-900/20 relative z-10">
        <div className="flex items-center gap-4 relative">
          
          {/* SEED INDICATOR */}
          <div className={cn(
            "w-12 h-12 flex items-center justify-center font-display font-black text-2xl italic border rounded-sm transition-all duration-500 group-hover:rotate-6",
            hasSeed ? "bg-black text-fuchsia-500 border-fuchsia-500/30 shadow-[0_0_15px_rgba(192,38,211,0.1)]" : "bg-red-950/10 text-red-500 border-red-900/30"
          )}>
             {hasSeed ? `#${displaySeed}` : <AlertCircle className="w-5 h-5" />}
          </div>

          <div>
            <h3 className="text-xl font-display font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-fuchsia-400 transition-colors">
              {team.name}
            </h3>
            <div className="flex items-center gap-3 text-[9px] text-zinc-600 font-mono tracking-[0.3em] uppercase mt-2">
              <Users className="w-3 h-3 text-fuchsia-500" />
              <span>{sortedPlayers.length} / {slotsNeeded} Units</span>
            </div>
          </div>
        </div>

        {rank === 1 && (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_#eab308]" />
            </motion.div>
        )}
        
        {/* LOGO WATERMARK */}
        <div className="absolute right-[-20px] opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none">
            {team.logo_url ? (
                <img src={team.logo_url} className="h-32 w-32 object-contain grayscale" alt="" />
            ) : (
                <Shield className="h-32 w-32 text-white" />
            )}
        </div>
      </div>

      {/* ROSTER GRID */}
      <div className="bg-black/40 min-h-[220px] relative z-10">
        {sortedPlayers.map((player, i) => (
          <PlayerRow key={player.id || i} player={player} index={i} />
        ))}

        {/* GHOST SLOTS (Roster Shortage) */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`ghost-${i}`} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 opacity-20">
            <div className="flex items-center gap-3 pl-1">
              <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 border-dashed" />
              <div className="w-24 h-1.5 bg-zinc-800 rounded-full" />
            </div>
            <div className="text-[7px] text-zinc-700 font-mono uppercase tracking-[0.4em]">
              VACANT_SLOT
            </div>
          </div>
        ))}
      </div>
      
      {/* HOLOGRAPHIC ACCENT */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
    </motion.div>
  );
};

export default TeamCard;
