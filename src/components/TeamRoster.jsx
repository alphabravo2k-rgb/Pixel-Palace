import React, { useState, useEffect } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Button, Modal, Badge } from '../ui/Components';
import { RANKS } from '../lib/constants';
import { useSession } from '../auth/useSession'; // FIXED

const TeamRoster = () => {
  const { teams, createTeam, joinTeam, error: tournamentError } = useTournament();
  const { session } = useSession(); // FIXED
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerRank, setPlayerRank] = useState(RANKS[0]);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!isModalOpen) {
        setNewTeamName('');
        setLocalError(null);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!joinTeamId) {
        setPlayerName('');
        setPlayerRank(RANKS[0]);
        setLocalError(null);
    }
  }, [joinTeamId]);

  const handleCreate = async () => {
    if (!session.isAuthenticated) return;
    if (!newTeamName.trim()) {
        setLocalError("Team name is required.");
        return;
    }
    try {
        await createTeam(newTeamName);
        setIsModalOpen(false);
    } catch (err) {
        setLocalError("Failed to create team.");
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !joinTeamId) {
        setLocalError("Player name is required.");
        return;
    }
    try {
        await joinTeam(joinTeamId, playerName, playerRank);
        setJoinTeamId(null);
    } catch (err) {
        setLocalError(err.message || "Failed to join team.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Participating Teams</h2>
        {session.isAuthenticated && (
            <Button onClick={() => setIsModalOpen(true)}>Register New Team</Button>
        )}
      </div>

      {tournamentError && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg">
            Error: {tournamentError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{team.name}</h3>
              <Badge color={team.players.length >= 5 ? 'green' : 'blue'}>
                {team.players.length}/6
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {team.players.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-slate-700/50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    {p.role === 'CAPTAIN' && <span title="Captain">👑</span>}
                    {p.role === 'SUBSTITUTE' && <span title="Sub" className="text-xs bg-slate-600 px-1 rounded">SUB</span>}
                    <span className="text-slate-200">{p.name}</span>
                  </div>
                  <span className="text-slate-400 text-xs">{p.rank}</span>
                </div>
              ))}
            </div>

            {team.players.length < 6 && (
              <Button 
                variant="secondary" 
                className="w-full text-sm"
                onClick={() => setJoinTeamId(team.id)}
              >
                Join Team
              </Button>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Team">
        <div className="space-y-4">
          {localError && <div className="text-red-400 text-sm">{localError}</div>}
          <input 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Team Name"
          />
          <Button onClick={handleCreate} className="w-full">Create Team</Button>
        </div>
      </Modal>

      <Modal isOpen={!!joinTeamId} onClose={() => setJoinTeamId(null)} title="Join Team">
        <div className="space-y-4">
           {localError && <div className="text-red-400 text-sm">{localError}</div>}
          <input 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="In-Game Name"
          />
          <select 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
            value={playerRank}
            onChange={(e) => setPlayerRank(e.target.value)}
          >
            {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button onClick={handleJoin} className="w-full">Join Roster</Button>
        </div>
      </Modal>
    </div>
  );
};

export default TeamRoster;
