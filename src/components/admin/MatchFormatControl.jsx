import React, { useState } from 'react';
import { Settings, ShieldAlert, Check, Lock } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';

export const MatchFormatControl = ({ match, onUpdate }) => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  // 1. Guard: State Locking
  // If match is LIVE or COMPLETED, this control is read-only.
  const isLocked = ['live', 'completed'].includes(match.status);

  const handleFormatChange = async (newFormat) => {
    if (isLocked || loading) return;
    if (newFormat === match.best_of) return;

    // Confirm Intent (Because this resets veto logic potentially)
    const confirmed = window.confirm(
      `⚠️ CHANGING MATCH FORMAT \n\nChanging from BO${match.best_of} to BO${newFormat}.\nThis will be logged in the Audit Trail.\n\nProceed?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('api_update_match_format', {
        p_match_id: match.id,
        p_new_format: parseInt(newFormat),
        p_admin_id: session.identity.id
      });

      if (error) throw error;

      if (data.success) {
        if (onUpdate) onUpdate(); // Refresh parent view
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Format Update Failed:", err);
      alert("Failed to update format. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-zinc-900/50 p-3 rounded border border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-1">
          <Settings className="w-3 h-3" /> Match Format
        </span>
        {isLocked && (
          <span className="text-[10px] text-red-500 flex items-center gap-1 uppercase font-bold bg-red-900/10 px-1.5 py-0.5 rounded">
            <Lock className="w-3 h-3" /> Locked ({match.status})
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 3, 5].map((fmt) => {
          const isActive = match.best_of === fmt;
          return (
            <button
              key={fmt}
              onClick={() => handleFormatChange(fmt)}
              disabled={isLocked || loading}
              className={`
                relative px-3 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all
                ${isActive 
                  ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-lg shadow-fuchsia-900/20' 
                  : 'bg-black text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}
                ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              BO{fmt}
              {isActive && <Check className="w-3 h-3 absolute top-1 right-1 opacity-50" />}
            </button>
          );
        })}
      </div>
      
      {!isLocked && (
        <div className="text-[9px] text-zinc-600 flex items-center gap-1 mt-1">
          <ShieldAlert className="w-3 h-3" />
          <span>Changes are logged to Admin Audit</span>
        </div>
      )}
    </div>
  );
};
