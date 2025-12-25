import React, { useEffect } from 'react';
import { X, ShieldAlert, Trophy } from 'lucide-react';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';

// ✅ Correct Import Paths (Assuming they are in same folder or subfolder)
// Adjust './admin/...' if your file structure is flat or nested
import { AdminMatchControls } from './AdminMatchControls'; 
import { AdminAuditLog } from './AdminAuditLog';
// import { VetoPanel } from './VetoPanel'; // Uncomment when VetoPanel is created

export const MatchModal = ({ match, teams, onClose }) => {
  const { session } = useSession();

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!match) return null;

  // Permissions
  const isAdmin = [ROLES.ADMIN, ROLES.OWNER, ROLES.REFEREE].includes(session.role);
  
  // Captain Logic
  const userTeamId = session.identity?.id; 
  const isCaptain = session.role === ROLES.CAPTAIN;
  const isMyMatch = isCaptain && (match.team1_id === userTeamId || match.team2_id === userTeamId);

  // Render Logic
  const showAdminControls = isAdmin;
  const showVeto = (isCaptain && isMyMatch) || isAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-fuchsia-500" />
            <div>
              <h2 className="font-['Teko'] text-2xl uppercase tracking-wide leading-none text-white">
                Match Details
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                {match.team1?.name || 'TBD'} vs {match.team2?.name || 'TBD'} • Round {match.round}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. ADMIN CONTROLS */}
          {showAdminControls && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400 text-sm font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" /> Admin Control Deck
              </div>
              <AdminMatchControls match={match} teams={teams} onUpdate={onClose} />
            </div>
          )}

          {/* 2. VETO PANEL */}
          {/* {showVeto ? (
            <div className="space-y-4">
              <VetoPanel matchId={match.id} />
            </div>
          ) : (
             <div className="p-10 text-center text-zinc-500 italic border border-dashed border-white/10 rounded">
               Waiting for teams to be determined or map veto to begin.
             </div>
          )}
          */}

          {/* 3. MATCH AUDIT LOG */}
          {showAdminControls && (
            <div className="pt-6 border-t border-white/5">
              <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Match Logs</h3>
              <AdminAuditLog /> 
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
