import React from 'react';
import { Shield, MessageCircle } from 'lucide-react';
import { PlayerRow } from './PlayerRow';

const getFlagUrl = (isoCode) => {
  if (!isoCode || isoCode === 'un') return null;
  return `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
};

const GhostRow = () => (
  <div className="relative w-full h-12 border-b border-white/5 last:border-0 flex items-center bg-white/[0.02] overflow-hidden grayscale opacity-30">
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 20px)' }} />
    <div className="px-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-zinc-800/50 border border-zinc-700/50" />
      <span className="text-[9px] font-mono uppercase tracking-[0.4em] italic text-zinc-600">Reserve Slot</span>
    </div>
  </div>
);

export const TeamCard = ({ team }) => {
  const players = Array.isArray(team.players) ? team.players : [];
  
  const sortedPlayers = [...players].sort((a, b) => {
     const roleOrder = { 'CAPTAIN': 0, 'PLAYER': 1, 'SUBSTITUTE': 2 };
     const rA = (a.role || 'PLAYER').toUpperCase();
     const rB = (b.role || 'PLAYER').toUpperCase();
     return (roleOrder[rA] || 1) - (roleOrder[rB] || 1);
  });
  
  const flagUrl = getFlagUrl(team.region_iso2);
  const slotsNeeded = 6; 
  const currentSlots = sortedPlayers.length;
  const emptySlots = Math.max(0, slotsNeeded - currentSlots);

  return (
    <div className="group relative bg-[#0b0c0f]/80 border border-white/10 hover:border-fuchsia-500/50 transition-all duration-500 flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-sm hover:shadow-[0_0_30px_rgba(192,38,211,0.15)]"
         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 94% 100%, 0 100%)' }}>
      
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      <div className="p-4 bg-gradient-to-r from-[#15191f] to-[#0b0c0f] border-b border-white/10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner group-hover:border-fuchsia-500/30 transition-colors">
              {team.logo_url ? <img src={team.logo_url} alt="" className="w-full h-full object-contain" /> : <Shield className="w-5 h-5 text-zinc-700" />}
           </div>
           <div className="flex flex-col">
               <h3 className="text-white font-black text-lg truncate max-w-[140px] uppercase italic tracking-tighter font-['Teko'] group-hover:text-fuchsia-400 transition-colors">
                 {team.name}
               </h3>
               <span className="text-[10px] text-zinc-500 font-mono tracking-widest">SEED #{team.seed_number || '-'}</span>
           </div>
        </div>
        {flagUrl && (
          <img src={flagUrl} alt={team.region_iso2} title={team.region_iso2} className="w-6 h-4 rounded shadow opacity-60 group-hover:opacity-100 transition-opacity border border-white/10" />
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
