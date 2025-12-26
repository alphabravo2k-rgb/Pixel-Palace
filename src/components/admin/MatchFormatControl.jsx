import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { Settings, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export const MatchFormatControl = ({ match, onUpdate }) => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [currentFormat, setCurrentFormat] = useState(match.best_of);

  const handleFormatChange = async (newFormat) => {
    // 1. UI FEEDBACK: Immediate optimistic update (optional, but feels snappy)
    setCurrentFormat(newFormat);
    setLoading(true);

    try {
      // 2. BACKEND AUTHORITY: We send the request even if it's the same.
      // The DB decides if an update is needed.
      const { data, error } = await supabase.rpc('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: newFormat,
        p_admin_id: session.user.id
      });

      if (error) throw error;

      // 3. IDEMPOTENCY CHECK: Did the backend actually change anything?
      if (data?.idempotent) {
        console.log("Audit: Admin verified format (No change needed).");
      } else {
        console.log("Audit: Format updated successfully.");
        if (onUpdate) onUpdate();
      }
      
    } catch (err) {
      // Revert optimistic update on failure
      setCurrentFormat(match.best_of);
      alert(`Format Sync Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 text-zinc-400">
        <Settings className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Match Protocol</span>
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
                  ? 'bg-fuchsia-900/20 border-fuchsia-500/50 text-fuchsia-400 shadow-[0_0_10px_rgba(192,38,211,0.1)]' 
                  : 'bg-black border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300'}
              `}
            >
              BO{fmt}
              {isActive && !loading && <CheckCircle className="w-3 h-3 absolute top-1 right-1 text-fuchsia-500" />}
              {isActive && loading && <RefreshCw className="w-3 h-3 absolute top-1 right-1 text-fuchsia-500 animate-spin" />}
            </button>
          );
        })}
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
        <ShieldAlert className="w-3 h-3" />
        <span>Config Locked to Server Authority</span>
      </div>
    </div>
  );
};
