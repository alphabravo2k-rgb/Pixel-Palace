import React, { useState } from 'react';
import { Trophy, Zap, ShieldAlert } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';

export const TeamStatusControl = ({ team, onUpdate }) => {
  const { getAuthIdentifier } = useSession(); // ✅ New Helper
  const [loading, setLoading] = useState(false);

  const toggleStatus = async (type, currentValue) => {
    if (loading) return;
    
    const newValue = !currentValue;
    const reason = prompt(
      `📝 Reason for marking ${team.name} as ${type} ${newValue ? 'ACTIVE' : 'INACTIVE'}?`, 
      "Organizer Decision"
    );

    if (!reason) return;

    setLoading(true);
    try {
      // ✅ RPC CALL
      const { data, error } = await supabase.rpc('api_toggle_team_status', {
        p_team_id: team.id,
        p_status_type: type,
        p_value: newValue,
        p_reason: reason,
        p_admin_id: getAuthIdentifier() // 🛡️ Audit Key
      });

      if (error) throw error;
      if (onUpdate) onUpdate(); 

    } catch (err) {
      console.error("Status Update Failed:", err);
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Playoff Toggle */}
      <button
        onClick={() => toggleStatus('PLAYOFF', team.is_playoff)}
        disabled={loading}
        className={`
          flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded border transition-all
          ${team.is_playoff 
            ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/30' 
            : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-600'}
        `}
      >
        <Trophy className="w-3 h-3" />
        {team.is_playoff ? 'Qualified' : 'Qualify'}
      </button>

      {/* Wildcard Toggle */}
      <button
        onClick={() => toggleStatus('WILDCARD', team.is_wildcard)}
        disabled={loading}
        className={`
          flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded border transition-all
          ${team.is_wildcard 
            ? 'bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/50 hover:bg-fuchsia-500/30' 
            : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-600'}
        `}
      >
        <Zap className="w-3 h-3" />
        {team.is_wildcard ? 'Wildcard' : 'Set Wildcard'}
      </button>

      {team.qualification_reason && (
        <div className="ml-auto text-[9px] text-zinc-600 italic flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          <span>{team.qualification_reason}</span>
        </div>
      )}
    </div>
  );
};
