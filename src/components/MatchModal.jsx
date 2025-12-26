import React from 'react';
import { X, Clock, AlertTriangle } from 'lucide-react';
import { useSession } from '../auth/useSession';
import { TeamCard } from './roster/TeamCard'; // Assuming you have this
import { RestrictedButton } from './common/RestrictedButton';

export const MatchModal = ({ match, isOpen, onClose }) => {
  const { session } = useSession();
  
  if (!isOpen || !match) return null;

  // 🛡️ IDENTITY LOGIC FIX (Audit Section 4)
  // Don't compare IDs directly. Check if the user's TEAM ID matches.
  // Assuming session.identity looks like { id: 'user_uuid', team_id: 'team_uuid', ... }
  const myTeamId = session.identity?.team_id; 
  
  const isTeam1 = myTeamId === match.team1_id;
  const isTeam2 = myTeamId === match.team2_id;
  const isParticipant = isTeam1 || isTeam2;

  // Is this match actually actionable? (Audit Section 5)
  // Players can only act if it's scheduled or in veto.
  const isPlayerActionable = ['scheduled', 'veto'].includes(match.status);

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
        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-center gap-8 mb-12">
            <TeamCard team={match.team1} isWinner={match.winner_id === match.team1_id} />
            <div className="text-4xl font-['Teko'] text-zinc-700">VS</div>
            <TeamCard team={match.team2} isWinner={match.winner_id === match.team2_id} />
          </div>

          {/* PLAYER ACTIONS */}
          {isParticipant && isPlayerActionable && (
            <div className="bg-fuchsia-900/10 border border-fuchsia-500/20 p-6 rounded-lg text-center">
              <h3 className="text-fuchsia-400 font-bold uppercase tracking-widest text-sm mb-4">
                Captain Command Link
              </h3>
              
              <div className="flex justify-center gap-4">
                <RestrictedButton
                  action="MATCH:CHECK_IN"
                  resourceId={match.id}
                  className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase rounded text-sm"
                  onClick={() => alert("Check-in logic goes here via useCaptainVeto")}
                >
                  Ready Check
                </RestrictedButton>
                
                {match.status === 'veto' && (
                   <button className="px-6 py-2 border border-fuchsia-500 text-fuchsia-400 font-bold uppercase rounded text-sm hover:bg-fuchsia-500/10">
                     Enter Veto Chamber
                   </button>
                )}
              </div>
            </div>
          )}

          {!isParticipant && (
            <div className="text-center text-zinc-500 font-mono text-xs mt-8">
              SPECTATOR MODE // READ ONLY
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
