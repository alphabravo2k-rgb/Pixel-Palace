import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, AlertCircle, Shield, Crown, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { normalizeRole } from '../../lib/security/engine'; // ✅ Correct import path

// MASTER INTEGRATION
import { SoundNexus, CUES } from '../../lib/soundNexus';

/**
 * 🪪 TEAM CARD: SQUAD UNIT
 * ------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * FEATURES:
 * 1. ROLE SORTING: Captains always on top.
 * 2. GHOST SLOTS: Visualizes empty roster spots.
 * 3. HAPTIC FEEDBACK: Audio/Visual response to hover.
 */

// Internal Sub-Component
const PlayerRow = ({ player, index }) => {
  const role = normalizeRole(player.role);
  const isCaptain = role === 'captain';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-center gap-3">
        {/* Avatar / Role Icon */}
        <div className={cn(
          "w-8 h-8 rounded-sm flex items-center justify-center text-xs font-black border shadow-sm transition-all group-hover:scale-110",
          isCaptain 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
            : "bg-zinc-900 text-zinc-500 border-zinc-800"
        )}>
          {isCaptain ? <Crown size={14} /> : <User size={14} />}
        </div>
        
        {/* Name & Role */}
        <div className="flex flex-col">
          <span className={cn(
            "text-xs font-bold uppercase tracking-wide leading-none truncate max-w-[120px]",
            isCaptain ? "text-white" : "text-zinc-400"
          )}>
            {player.name}
          </span>
          <span className="text-[9px] text-zinc-600 font-mono mt-1 uppercase tracking-wider">
            {role}
          </span>
        </div>
      </div>

      {/* ELO / Status */}
      {player.elo > 0 && (
         <div className="text-[9px] font-mono font-bold text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
            {player.elo}
         </div>
      )}
    </motion.div>
  );
};

const ROLE_ORDER = {
  captain: 0,
  player: 1,
  substitute: 2,
  coach: 3,
  guest: 99
};

const getRolePriority = (role) => {
  const norm = normalizeRole(role); 
  return ROLE_ORDER[norm] ?? 99;
};

export const TeamCard = ({ team, rank, tournamentRules = {} }) => {
  if (!team) return null;

  const slotsNeeded = team.max_players ?? tournamentRules.team_size ?? 5; // Standard 5v5

  // 1. Sort Players (Captain First)
  const sortedPlayers = useMemo(() => {
      return [...(team.members || [])].sort((a, b) => {
        const pA = getRolePriority(a.role);
        const pB = getRolePriority(b.role);
        if (pA !== pB) return pA - pB;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [team.members]);

  const emptySlots = Math.max(0, slotsNeeded - sortedPlayers.length);
  const displaySeed = team.seed_number;
  const hasSeed = displaySeed !== undefined && displaySeed !== null;

  return (
    <motion.div 
      whileHover={{ y: -4, borderColor: 'rgba(16, 185, 129, 0.4)' }}
      onMouseEnter={() => SoundNexus.play(CUES.UI_HOVER, { volume: 0.1 })}
      className="relative overflow-hidden rounded-sm border border-white/5 bg-[#09090b] shadow-lg transition-all duration-300 group"
    >
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02] relative overflow-hidden">
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center gap-4 relative z-10">
          
          {/* Rank/Seed Badge */}
          <div className={cn(
            "w-10 h-10 flex items-center justify-center font-black text-xl italic font-display border rounded-sm",
            hasSeed ? "bg-black text-zinc-400 border-zinc-800" : "bg-red-900/10 text-red-500 border-red-900/30"
          )}>
             {hasSeed ? `#${displaySeed}` : <AlertCircle className="w-4 h-4" />}
          </div>

          {/* Info */}
          <div>
            <h3 className="text-lg font-black italic tracking-tighter uppercase font-display leading-none text-white group-hover:text-emerald-400 transition-colors">
              {team.name}
            </h3>
            <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
              <Users className="w-3 h-3" />
              <span>{sortedPlayers.length} / {slotsNeeded} OPS</span>
            </div>
          </div>
        </div>

        {/* Winner Trophy Icon */}
        {rank === 1 && <Trophy className="w-5 h-5 text-yellow-500 animate-pulse drop-shadow-md" />}
        
        {/* Logo Watermark */}
        {team.logo_url ? (
            <img src={team.logo_url} className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-24 w-24 object-contain opacity-[0.05] grayscale group-hover:grayscale-0 group-hover:opacity-10 transition-all pointer-events-none" />
        ) : (
            <Shield className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-24 w-24 text-white opacity-[0.02] pointer-events-none" />
        )}
      </div>

      {/* ROSTER LIST */}
      <div className="bg-black/20 min-h-[200px]">
        {sortedPlayers.map((player, i) => (
          <PlayerRow 
            key={player.id || i} 
            player={player} 
            index={i}
          />
        ))}

        {/* GHOST SLOTS */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`ghost-${i}`} className="flex items-center justify-between p-3 opacity-20 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 border-dashed" />
              <div className="w-20 h-2 bg-white/10 rounded-sm" />
            </div>
            <div className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">
              OPEN SLOT
            </div>
          </div>
        ))}
      </div>
      
      {/* BOTTOM GLOW LINE */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </motion.div>
  );
};

export default TeamCard;
