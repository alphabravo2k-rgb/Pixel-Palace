import React from 'react';
import { useSession } from '../auth/useSession';
import { X, Clock, AlertTriangle, Shield, Copy, Server } from 'lucide-react';
import { PERMISSIONS } from '../lib/roles';
import { can } from '../lib/permissions';
import { VetoPanel } from './VetoPanel'; 
import { cn, copyToClipboard } from '../lib/utils';
import { toast } from 'react-hot-toast';

// Helper component for Team Cards
const TeamCard = ({ team, isWinner, score }) => (
  <div className={cn(
      "flex flex-col items-center gap-4 p-6 rounded-lg border transition-all duration-300 w-1/3",
      isWinner 
        ? "bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
        : "bg-bg-panel border-tactical"
  )}>
    <div className="relative">
        <div className={cn(
            "w-20 h-20 bg-black rounded-full flex items-center justify-center border-2 overflow-hidden",
            isWinner ? "border-emerald-500" : "border-white/10"
        )}>
            {team?.logo_url ? <img src={team.logo_url} className="w-14 h-14 object-contain" alt={team.name} /> : <Shield className="w-10 h-10 text-zinc-700" />}
        </div>
        {isWinner && <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">WIN</div>}
    </div>
    <div className="text-center">
        <div className={cn("font-display font-bold uppercase text-xl leading-none", isWinner ? "text-emerald-400" : "text-white")}>
            {team?.name || 'TBD'}
        </div>
        <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
            {team?.seed_number ? `SEED #${team.seed_number}` : 'UNRANKED'}
        </div>
    </div>
    <div className="font-display font-black text-4xl text-white">
        {score || 0}
    </div>
  </div>
);

export const MatchModal = ({ match, isOpen, onClose }) => {
  const { session } = useSession();
  
  if (!isOpen || !match) return null;

  // Identity Check: Extract Team ID from session
  const myTeamId = session?.user?.user_metadata?.team_id || session?.team_id || session?.teamId; 
  const isAdmin = can(PERMISSIONS.VIEW_HIDDEN_DATA, session);
  const isParticipant = (myTeamId === match.team1_id || myTeamId === match.team2_id);
  const showSensitiveInfo = isParticipant || isAdmin;

  const handleCopy = (text, label) => {
      if (!text) return;
      copyToClipboard(text);
      toast.success(`${label} Copied!`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-5xl bg-zinc-950 border border-tactical rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-zinc-900/50">
          <div>
            <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-xs mb-1">
              <Clock className="w-3 h-3" /> Match #{match.match_position} • Round {match.round_number}
            </div>
            <h2 className="text-4xl font-display text-white uppercase italic tracking-wide">
              {match.status} PHASE
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-black">
          
          <div className="flex justify-between items-center gap-4 mb-12 max-w-3xl mx-auto">
            <TeamCard team={match.team1} isWinner={match.winner_id === match.team1_id} score={match.team1_score} />
            <div className="flex flex-col items-center">
                <span className="text-6xl font-display font-black text-zinc-800 italic select-none">VS</span>
                <span className="text-[10px] font-mono text-zinc-600 uppercase border border-zinc-800 px-2 py-0.5 rounded mt-2">
                    {match.best_of === 1 ? 'Best of 1' : 'Best of 3'}
                </span>
            </div>
            <TeamCard team={match.team2} isWinner={match.winner_id === match.team2_id} score={match.team2_score} />
          </div>

          {/* SERVER CONNECTION INTEL */}
          {match.status === 'live' && showSensitiveInfo && (
              <div className="mb-8 p-6 bg-brand/5 border border-brand/20 rounded-lg animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-4 text-brand-glow font-bold uppercase tracking-widest text-sm italic">
                      <Server className="w-4 h-4" /> Operational Connection Commands
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-black/40 p-4 rounded border border-white/5 flex justify-between items-center group cursor-pointer hover:border-brand/50 transition-colors" onClick={() => handleCopy(match.server_ip, 'IP')}>
                          <div>
                              <div className="text-[9px] text-zinc-500 font-mono uppercase">Connect String</div>
                              <div className="text-emerald-400 font-mono text-xs mt-1">{match.server_ip || 'Waiting for deploy...'}</div>
                          </div>
                          <Copy className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                      </div>
                      <div className="bg-black/40 p-4 rounded border border-white/5 flex justify-between items-center group cursor-pointer hover:border-brand/50 transition-colors" onClick={() => handleCopy(match.server_pass, 'Password')}>
                          <div>
                              <div className="text-[9px] text-zinc-500 font-mono uppercase">Server Password</div>
                              <div className="text-white font-mono text-xs mt-1 filter blur-[4px] group-hover:blur-none transition-all duration-300">
                                  {match.server_pass || '••••••••'}
                              </div>
                          </div>
                          <Copy className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                      </div>
                  </div>
              </div>
          )}

          {/* VETO INTERFACE */}
          {match.status === 'veto' && (
            <div className="border-t border-tactical pt-8">
                <h3 className="text-center text-brand font-black text-xs uppercase tracking-[0.3em] mb-8 flex items-center justify-center gap-3 italic">
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse"/> Veto Protocol Active
                </h3>
                <VetoPanel match={match} myTeamId={myTeamId} />
            </div>
          )}

          {/* LOCK STATE */}
          {match.is_locked && (
             <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg text-center flex items-center justify-center gap-2 text-red-500 font-bold mt-8 uppercase tracking-widest text-[10px]">
                <AlertTriangle size={14} /> This match has been locked by tournament directors.
             </div>
          )}

          {/* SCHEDULED STATE */}
          {match.status === 'scheduled' && isParticipant && !match.is_locked && (
             <div className="mt-8 text-center">
                 <button 
                    disabled 
                    className="px-8 py-4 bg-zinc-800 text-zinc-500 font-bold uppercase tracking-widest rounded cursor-not-allowed border border-zinc-700"
                 >
                    Waiting for Admin to Start Veto
                 </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
