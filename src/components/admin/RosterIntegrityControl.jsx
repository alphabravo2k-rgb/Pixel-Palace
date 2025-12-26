import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { ShieldAlert, AlertTriangle, UserCog, UserMinus } from 'lucide-react';

export const RosterIntegrityControl = ({ player, teamId, onUpdate }) => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleForceRole = async (newRole) => {
    // 1. FRICTION: The Reason Prompt
    const reason = prompt(
      `⚠️ FORCE UPDATE WARNING ⚠️\n\nChanging ${player.username} to ${newRole}.\nThis bypasses standard roster limits.\n\nREQUIRED: Enter reason for audit log:`
    );

    if (!reason || reason.trim().length < 5) {
      alert("Action Aborted: A valid reason is required for forced roster mutations.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('admin_force_update_player_role', {
        p_player_id: player.id,
        p_team_id: teamId,
        p_new_role: newRole,
        p_admin_id: session.user.id,
        p_reason: reason
      });

      if (error) throw error;
      if (onUpdate) onUpdate();

    } catch (err) {
      alert(`Force Update Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceKick = async () => {
    // 1. FRICTION: Double Confirmation
    if (!window.confirm(`CRITICAL: Are you sure you want to KICK ${player.username} from the team?`)) return;

    const reason = prompt("Enter reason for ejection (Required):");
    if (!reason) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('admin_force_kick_player', {
        p_player_id: player.id,
        p_team_id: teamId,
        p_admin_id: session.user.id,
        p_reason: reason
      });

      if (error) throw error;
      if (onUpdate) onUpdate();

    } catch (err) {
      alert(`Kick Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Role Toggle: Visually Distinct "Force" Actions */}
      {player.role !== 'CAPTAIN' ? (
        <button
          onClick={() => handleForceRole('CAPTAIN')}
          disabled={loading}
          className="p-1.5 bg-zinc-800 hover:bg-amber-900/30 text-zinc-400 hover:text-amber-500 rounded border border-transparent hover:border-amber-500/50 transition-all group"
          title="Force Promote to Captain"
        >
          <UserCog className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => handleForceRole('PLAYER')}
          disabled={loading}
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-500 hover:text-zinc-400 rounded border border-amber-500/20 hover:border-transparent transition-all"
          title="Demote Captain"
        >
          <UserCog className="w-4 h-4" />
        </button>
      )}

      {/* The Nuclear Option */}
      <button
        onClick={handleForceKick}
        disabled={loading}
        className="p-1.5 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-500 rounded border border-transparent hover:border-red-500/50 transition-all"
        title="Force Eject Player"
      >
        <UserMinus className="w-4 h-4" />
      </button>

      {/* Hidden Audit Indicator */}
      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <ShieldAlert className="w-3 h-3 text-zinc-600" />
      </div>
    </div>
  );
};
