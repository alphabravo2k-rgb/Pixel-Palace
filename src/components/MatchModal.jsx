import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui/Components';
import VetoPanel from './VetoPanel'; 
import { useTournament } from '../tournament/useTournament';
import { isAdmin } from '../tournament/permissions';
import { useSession } from '../auth/useSession'; // FIXED

const MatchModal = ({ match, onClose }) => {
  const { adminUpdateMatch, teams } = useTournament();
  const { session } = useSession(); // FIXED
  const [loading, setLoading] = useState(false);
  const [confirmWinId, setConfirmWinId] = useState(null);
  
  // Cleanup timer
  useEffect(() => {
    let timer;
    if (confirmWinId) timer = setTimeout(() => setConfirmWinId(null), 3000);
    return () => clearTimeout(timer);
  }, [confirmWinId]);

  if (!match) return null;

  const team1 = teams?.find(t => t.id === match.team1Id) || { name: 'Team 1' };
  const team2 = teams?.find(t => t.id === match.team2Id) || { name: 'Team 2' };

  const handleForceWin = async (winnerId) => {
    if (confirmWinId !== winnerId) {
        setConfirmWinId(winnerId);
        return;
    }

    setLoading(true);
    try {
        await adminUpdateMatch(match.id, { 
            winnerId, 
            status: 'completed',
            'vetoState.phase': 'completed'
        });
        onClose();
    } catch (e) {
        alert("Admin Action Failed: " + e.message);
    } finally {
        setLoading(false);
        setConfirmWinId(null);
    }
  };

  return (
    <Modal isOpen={!!match} onClose={onClose} title="Match Control" maxWidth="max-w-5xl">
      <div className="space-y-6">
        <div className="grid grid-cols-3 items-center text-center p-6 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-white">{team1.name}</div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-slate-500 font-mono text-xs uppercase">VS</span>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                    match.status === 'live' ? 'bg-red-900 text-red-200 animate-pulse' : 
                    match.status === 'completed' ? 'bg-green-900 text-green-200' : 'bg-slate-700 text-slate-300'
                }`}>
                    {match.status}
                </span>
            </div>
            <div className="text-2xl font-black text-white">{team2.name}</div>
        </div>

        <div className="min-h-[300px]">
            <VetoPanel match={match} />
        </div>

        {isAdmin(session) && (
            <div className="border-t border-slate-800 pt-4 bg-red-950/10 -mx-4 px-4 pb-2 rounded-b">
                <h4 className="text-red-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                    🛡️ Admin Override
                </h4>
                <div className="flex gap-3">
                    <Button 
                        variant={confirmWinId === match.team1Id ? "danger" : "ghost"}
                        onClick={() => handleForceWin(match.team1Id)} 
                        disabled={loading}
                        className={confirmWinId === match.team1Id ? "animate-pulse ring-2 ring-red-500" : ""}
                    >
                        {confirmWinId === match.team1Id ? "Confirm?" : `Force Win: ${team1.name}`}
                    </Button>
                    <Button 
                        variant={confirmWinId === match.team2Id ? "danger" : "ghost"}
                        onClick={() => handleForceWin(match.team2Id)} 
                        disabled={loading}
                        className={confirmWinId === match.team2Id ? "animate-pulse ring-2 ring-red-500" : ""}
                    >
                        {confirmWinId === match.team2Id ? "Confirm?" : `Force Win: ${team2.name}`}
                    </Button>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default MatchModal;
