import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { Settings, ShieldAlert, CheckCircle } from 'lucide-react';

export const MatchFormatControl = ({ match, onUpdate }) => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  
  // We use local state to show optimistic UI updates, but we don't block requests based on it
  const [currentFormat, setCurrentFormat] = useState(match.best_of);

  const handleFormatChange = async (newFormat) => {
    // 🔴 REMOVED: if (newFormat === currentFormat) return;
    // We send the request regardless. The backend is the source of truth.

    if (!window.confirm(`CONFIRM: Set Match ${match.id.substring(0,8)} to Best of ${newFormat}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: newFormat,
        p_admin_id: session.user.id,
        p_reason: `Manual Format Override to BO${newFormat}`
      });

      if (error) throw error;

      // Success feedback
      setCurrentFormat(newFormat);
      if (onUpdate) onUpdate();
      
    } catch (err) {
      alert(`Format Update Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 text-zinc-400">
        <Settings className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Match Format Protocol</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 3, 5].map((fmt) => {
          const isActive = currentFormat === fmt;
          return (
            <button
              key={fmt}
              onClick={() => handleFormatChange(fmt)}
              disabled={loading}
              className={`
                relative px-3 py-2 rounded text-sm font-bold border transition-all
                ${isActive 
                  ? 'bg-fuchsia-900/20 border-fuchsia-500/50 text-fuchsia-400' 
                  : 'bg-black border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300'}
              `}
            >
              BO{fmt}
              {isActive && <CheckCircle className="w-3 h-3 absolute top-1 right-1 text-fuchsia-500" />}
            </button>
          );
        })}
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
        <ShieldAlert className="w-3 h-3" />
        <span>Audit Log Enabled</span>
      </div>
    </div>
  );
};
