import React from 'react';
import { useSession } from '../auth/useSession';
import { X, Clock, AlertTriangle, Shield } from 'lucide-react';
import { RestrictedButton } from './common/RestrictedButton';
import { PERM_CAPABILITIES } from '../lib/permissions.actions';
import { VetoController } from './match/VetoController'; // ✅ NEW IMPORT

// Inline TeamCard helper
const TeamCard = ({ team, isWinner }) => (
  <div className={`flex flex-col items-center gap-3 p-4 rounded border ${isWinner ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center border border-white/10">
        {team?.logo_url ? <img src={team.logo_url} className="w-10 h-10 object-contain" alt={team.name} /> : <Shield className="text-zinc-600" />}
    </div>
    <div className={`font-bold uppercase text-lg ${isWinner ? 'text-emerald-400' : 'text-white'}`}>{team?.name || 'TBD'}</div>
  </div>
);

export const MatchModal = ({ match, isOpen, onClose }) => {
  const { session } = useSession();
  
  if (!isOpen || !match) return null;

  const myTeamId = session.identity?.team_id; 
  const isTeam1 = myTeamId === match.team1_id;
  const isTeam2 = myTeamId === match.team2_id;
  const isParticipant = isTeam1 || isTeam2;

  const isPlayerActionable = !match.is_locked && ['scheduled', 'veto', 'live'].includes(match.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-[url('/grid-pattern.svg')]">
          <div>
            <div className="flex items-center gap-2 text-fuchsia-500 font-bold uppercase tracking-widest text-xs mb-1">
              <Clock className="w-3 h-3" /> Match {match.match_no}
            </div>
            <h2 className="text-3xl font-['Teko'] text-white uppercase">
              {match.status} PHASE
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          {/* VS Display */}
          <div className="flex justify-between items-center gap-8 mb-12">
            <TeamCard team={match.team1} isWinner={match.winner_id === match.team1_id} />
            <div className="text-4xl font-['Teko'] text-zinc-700">VS</div>
            <TeamCard team={match.team2} isWinner={match.winner_id === match.team2_id} />
          </div>

          {/* --- ACTIVE GAMEPLAY SECTION --- */}
          {isParticipant && isPlayerActionable && (
            <div className="space-y-8">
                
                {/* 1. Pre-Match Ready Check */}
                {match.status === 'scheduled' && (
                    <div className="bg-fuchsia-900/10 border border-fuchsia-500/20 p-6 rounded-lg text-center">
                        <h3 className="text-fuchsia-400 font-bold uppercase tracking-widest text-sm mb-4">
                            Captain Command Link
                        </h3>
                        <div className="flex justify-center gap-4">
                            <RestrictedButton
                                action={PERM_CAPABILITIES.ACT_AS_CAPTAIN} 
                                context={match}
                                className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase rounded text-sm transition-all shadow-lg shadow-fuchsia-900/20"
                                onClick={() => alert("Ready Check: Feature coming in v1.1. Ask Admin to start match.")}
                            >
                                Ready Check
                            </RestrictedButton>
                        </div>
                    </div>
                )}

                {/* 2. Veto Interface */}
                {match.status === 'veto' && (
                    <div className="border-t border-white/5 pt-8 animate-in slide-in-from-bottom-2">
                        <h3 className="text-center text-fuchsia-500 font-bold text-sm uppercase tracking-[0.2em] mb-6">
                            // Map Veto Protocol Active //
                        </h3>
                        <VetoController match={match} />
                    </div>
                )}
            </div>
          )}

          {/* Locked State */}
          {isParticipant && match.is_locked && (
             <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg text-center flex items-center justify-center gap-2 text-red-400 font-bold mt-8">
                <AlertTriangle size={16} /> MATCH LOCKED BY ADMIN
             </div>
          )}

          {/* Spectator Footer */}
          {!isParticipant && (
            <div className="text-center text-zinc-500 font-mono text-xs mt-12 border-t border-white/5 pt-4">
              SPECTATOR MODE // READ ONLY ACCESS
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
