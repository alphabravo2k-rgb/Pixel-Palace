import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui/Components';
import VetoPanel from './VetoPanel';
import { useTournament } from '../tournament/useTournament';
import { isAdmin } from '../tournament/permissions';
import { useAuth } from '../auth/useAuth';

const MatchModal = ({ match, onClose }) => {
  const { updateMatch, teams } = useTournament();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [confirmWinId, setConfirmWinId] = useState(null); // For two-step admin confirmation
  
  // Cleanup timer to prevent memory leaks if component unmounts
  useEffect(() => {
    let timer;
    if (confirmWinId) {
      timer = setTimeout(() => setConfirmWinId(null), 3000);
    }
    return () => clearTimeout(timer);
  }, [confirmWinId]);

  if (!match) return null;

  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);

  const handleWin = async (winnerId) => {
    // Two-step confirmation for Admin actions
    if (confirmWinId !== winnerId) {
        setConfirmWinId(winnerId);
        // Timeout is now handled by the useEffect above
        return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await updateMatch(match.id, {
        winnerId,
        status: 'completed'
      });
      onClose();
    } catch (err) {
      setUpdateError("Failed to update match result. Check console.");
      console.error(err);
    } finally {
      setIsUpdating(false);
      setConfirmWinId(null);
    }
  };

  return (
    <Modal isOpen={!!match} onClose={onClose} title="Match Details" maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Match Header */}
        <div className="flex justify-between items-center text-center p-4 bg-slate-900/50 rounded-lg">
          <div className="w-1/3">
            <div className="text-2xl font-bold text-white">{team1?.name}</div>
          </div>
          <div className="w-1/3 text-4xl font-black text-slate-700">VS</div>
          <div className="w-1/3">
            <div className="text-2xl font-bold text-white">{team2?.name}</div>
          </div>
        </div>

        {/* Error Feedback */}
        {updateError && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded text-sm text-center">
                {updateError}
            </div>
        )}

        {/* Veto System */}
        <VetoPanel match={match} />

        {/* Admin Controls */}
        {isAdmin(user) && match.status !== 'completed' && (
          <div className="border-t border-slate-700 pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm text-slate-400 uppercase">Admin Zone</h4>
                <span className="text-xs text-slate-500">Double-tap to confirm win</span>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => handleWin(match.team1Id)} 
                className={`flex-1 transition-all ${confirmWinId === match.team1Id ? 'animate-pulse ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                variant={confirmWinId === match.team1Id ? "danger" : "ghost"}
                disabled={isUpdating}
                aria-pressed={confirmWinId === match.team1Id}
                aria-label={confirmWinId === match.team1Id ? `Confirm victory for ${team1?.name}` : `Set ${team1?.name} as winner`}
              >
                {isUpdating ? 'Updating...' : confirmWinId === match.team1Id ? `Confirm: ${team1?.name} Won?` : `Force Win: ${team1?.name}`}
              </Button>
              <Button 
                onClick={() => handleWin(match.team2Id)} 
                className={`flex-1 transition-all ${confirmWinId === match.team2Id ? 'animate-pulse ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                variant={confirmWinId === match.team2Id ? "danger" : "ghost"}
                disabled={isUpdating}
                aria-pressed={confirmWinId === match.team2Id}
                aria-label={confirmWinId === match.team2Id ? `Confirm victory for ${team2?.name}` : `Set ${team2?.name} as winner`}
              >
                {isUpdating ? 'Updating...' : confirmWinId === match.team2Id ? `Confirm: ${team2?.name} Won?` : `Force Win: ${team2?.name}`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MatchModal;
