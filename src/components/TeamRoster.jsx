import React, { useState, useEffect } from 'react';
import { useTournament } from '../tournament/useTournament';
import { Button, Modal, Badge } from '../ui/Components';
import { RANKS } from '../lib/constants';
import { useAuth } from '../auth/useAuth';

const TeamRoster = () => {
  const { teams, createTeam, joinTeam, currentUserId, error: tournamentError } = useTournament();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  
  // Join form state
  const [joinTeamId, setJoinTeamId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerRank, setPlayerRank] = useState(RANKS[0]);
  const [localError, setLocalError] = useState(null);

  // RESET STATE on Modal Close
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
    if (!newTeamName.trim()) {
        setLocalError("Team name is required.");
        return;
    }
    try {
        await createTeam(newTeamName);
        setIsModalOpen(false);
    } catch (err) {
        setLocalError("Failed to create team. It might already exist.");
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
        setLocalError("Failed to join team. Roster might be full.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Participating Teams</h2>
        <Button onClick={() => setIsModalOpen(true)}>Register New Team</Button>
      </div>

      {tournamentError && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg">
            Error: {tournamentError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{team.name}</h3>
              <Badge color={team.players.length === 5 ? 'green' : 'blue'}>
                {team.players.length}/5
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {team.players.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-slate-700/50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    {team.captainId === p.uid && <span title="Captain">👑</span>}
                    <span className="text-slate-200">{p.name}</span>
                  </div>
                  <span className="text-slate-400 text-xs">{p.rank}</span>
                </div>
              ))}
              {/* Empty Slots Visualizer */}
              {[...Array(5 - team.players.length)].map((_, i) => (
                <div key={`empty-${i}`} className="text-center p-2 border border-dashed border-slate-600/50 rounded text-slate-600 text-xs uppercase tracking-wider">
                  Open Slot
                </div>
              ))}
            </div>

            {team.players.length < 5 && !team.players.find(p => p.uid === currentUserId) && (
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

      {/* Create Team Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Team">
        <div className="space-y-4">
          {localError && <div className="text-red-400 text-sm">{localError}</div>}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Team Name</label>
            <input 
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. Natus Vincere"
              autoFocus
            />
          </div>
          <Button onClick={handleCreate} className="w-full">Create Team</Button>
        </div>
      </Modal>

      {/* Join Team Modal */}
      <Modal isOpen={!!joinTeamId} onClose={() => setJoinTeamId(null)} title="Join Team">
        <div className="space-y-4">
          {localError && <div className="text-red-400 text-sm">{localError}</div>}
          <div>
            <label className="block text-sm text-slate-400 mb-1">In-Game Name</label>
            <input 
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. s1mple"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Rank</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={playerRank}
              onChange={(e) => setPlayerRank(e.target.value)}
            >
              {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <Button onClick={handleJoin} className="w-full">Join Roster</Button>
        </div>
      </Modal>
    </div>
  );
};

export default TeamRoster;
