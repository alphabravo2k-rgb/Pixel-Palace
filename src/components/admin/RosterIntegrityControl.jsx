import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { ROLES } from '../../lib/roles';

export const RosterIntegrityControl = ({ player, onUpdate }) => {
  const { getAuthIdentifier } = useSession(); // ✅ Use Helper
  const [loading, setLoading] = useState(false);

  const handleFixRole = async (targetRole) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('api_force_update_player_role', {
        p_player_id: player.id,
        p_new_role: targetRole,
        p_admin_id: getAuthIdentifier() // 🛡️ Audit Key
      });

      if (error) throw error;
      if (onUpdate) onUpdate(); 
    } catch (err) {
      console.error("Role Fix Failed:", err);
      alert("Failed to update role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {player.role === ROLES.CAPTAIN ? (
        <span className="text-[10px] bg-fuchsia-900/20 text-fuchsia-500 px-2 py-0.5 rounded border border-fuchsia-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> CAPTAIN
        </span>
      ) : (
        <button
          onClick={() => handleFixRole(ROLES.CAPTAIN)}
          disabled={loading}
          className="text-[10px] bg-zinc-800 text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-zinc-700 hover:border-zinc-500 transition-all flex items-center gap-1"
        >
          Promote to CPT
        </button>
      )}

      {player.role === ROLES.CAPTAIN && (
        <button
          onClick={() => handleFixRole(ROLES.PLAYER)}
          disabled={loading}
          className="text-[10px] text-red-500 hover:bg-red-900/10 px-1 rounded"
        >
          Demote
        </button>
      )}
    </div>
  );
};
