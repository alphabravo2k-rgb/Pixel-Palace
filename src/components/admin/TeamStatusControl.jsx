import React from 'react';
import { useTournament } from '../../tournament/useTournament';
import { useAdminConsole } from '../../hooks/useAdminConsole';
import { Lock, Trophy, Star } from 'lucide-react';

export const TeamStatusControl = ({ team, onUpdate }) => {
  const { tournamentData, lifecycle } = useTournament();
  const { execute, loading } = useAdminConsole();

  // 1. THE LIFECYCLE LOCK
  // If the bracket is already generated, changing qualification status is dangerous.
  const isLocked = tournamentData?.bracket_generated;

  const handleToggle = async (field, currentValue) => {
    // 2. STOP "CASUAL" CLICKS
    if (isLocked) {
      alert("ACTION BLOCKED: The bracket has already been generated.\n\nYou cannot change qualification status now without corrupting the tournament. Reset the bracket first if this is required.");
      return;
    }

    const newValue = !currentValue;
    
    // 3. BACKEND IDEMPOTENCY (Send request, let DB handle it)
    await execute('admin_update_team_status', {
      p_team_id: team.id,
      p_field: field, // 'is_playoff' or 'is_wildcard'
      p_value: newValue,
      p_reason: `Manual toggle of ${field} to ${newValue}`
    });

    if (onUpdate) onUpdate();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Playoff Toggle */}
      <button
        onClick={() => handleToggle('is_playoff', team.is_playoff)}
        disabled={loading || isLocked}
        className={`
          relative p-1.5 rounded border transition-all
          ${team.is_playoff 
            ? 'bg-fuchsia-900/20 border-fuchsia-500/50 text-fuchsia-400' 
            : 'bg-zinc-900/50 border-white/5 text-zinc-600 hover:text-zinc-400'}
          ${isLocked ? 'cursor-not-allowed opacity-50' : ''}
        `}
        title={isLocked ? "Locked: Bracket Generated" : "Toggle Playoff Qualification"}
      >
        <Trophy size={14} />
        {isLocked && <Lock size={10} className="absolute -top-1 -right-1 text-zinc-500 bg-black rounded-full p-0.5" />}
      </button>

      {/* Wildcard Toggle */}
      <button
        onClick={() => handleToggle('is_wildcard', team.is_wildcard)}
        disabled={loading || isLocked}
        className={`
          relative p-1.5 rounded border transition-all
          ${team.is_wildcard 
            ? 'bg-amber-900/20 border-amber-500/50 text-amber-400' 
            : 'bg-zinc-900/50 border-white/5 text-zinc-600 hover:text-zinc-400'}
          ${isLocked ? 'cursor-not-allowed opacity-50' : ''}
        `}
        title={isLocked ? "Locked: Bracket Generated" : "Toggle Wildcard Status"}
      >
        <Star size={14} />
        {isLocked && <Lock size={10} className="absolute -top-1 -right-1 text-zinc-500 bg-black rounded-full p-0.5" />}
      </button>
    </div>
  );
};
