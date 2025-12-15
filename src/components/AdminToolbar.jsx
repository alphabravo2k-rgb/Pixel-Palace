import React from 'react';
import { useTournament } from '../tournament/useTournament';
import { useAuth } from '../auth/useAuth';
import { Button } from '../ui/Components';
import { isAdmin } from '../tournament/permissions';

const AdminToolbar = () => {
  const { user } = useAuth();
  const { createMatch, teams } = useTournament();

  if (!isAdmin(user)) return null;

  const handleSeed = () => {
    // Basic seeding logic for demo: Create Quarter Finals (4 matches)
    // Takes first 8 teams
    if (teams.length < 2) {
        alert("Need at least 2 teams to seed.");
        return;
    }
    
    // Create one match for demo
    createMatch(1, 0, teams[0]?.id, teams[1]?.id);
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h3 className="text-slate-400 font-mono text-sm uppercase tracking-wider">Admin Controls</h3>
        <div className="space-x-2">
          <Button variant="ghost" onClick={handleSeed}>Seed Bracket (Demo)</Button>
          <Button variant="danger" onClick={() => console.log('Resetting...')}>Reset Tournament</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminToolbar;
