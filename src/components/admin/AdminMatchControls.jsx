import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { Settings, RefreshCw, ArrowRightLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminMatchControls = ({ match, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const selectedFormat = match?.best_of || 1;

  const isLocked = ['completed'].includes(match.status); // Allow edits in 'live' if needed

  // 1. Format Toggle
  const handleFormatChange = async (newFormat) => {
    if (isLocked || loading) return;
    if (newFormat === selectedFormat) return;

    setLoading(true);
    const { error } = await supabase.rpc('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: newFormat
    });

    if (error) {
        toast.error(error.message);
    } else {
        toast.success(`Format changed to Best of ${newFormat}`);
        if(onUpdate) onUpdate();
    }
    setLoading(false);
  };

  // 2. Team Swap
  const handleSwap = async () => {
      if(isLocked || loading) return;
      if(!window.confirm("Swap Team 1 (Left) and Team 2 (Right)?\n\nThis will also swap their scores.")) return;
      
      setLoading(true);
      const { error } = await supabase.rpc('admin_swap_teams', { 
          p_match_id: match.id 
      });

      if(error) toast.error(error.message);
      else {
          toast.success('Teams & Scores Swapped');
          if(onUpdate) onUpdate();
      }
      setLoading(false);
  };

  // 3. Hard Reset
  const handleReset = async () => {
      const confirmText = "RESET MATCH";
      const input = window.prompt(`⚠️ DANGER ZONE\n\nThis will:\n- Wipe all vetoes\n- Reset scores to 0-0\n- Set status to 'Scheduled'\n\nType "${confirmText}" to confirm:`);
      
      if (input !== confirmText) return;

      setLoading(true);
      const { error } = await supabase.rpc('admin_reset_match', { 
          p_match_id: match.id 
      });

      if (error) toast.error(error.message);
      else {
          toast.success('Match Hard Reset Complete');
          if(onUpdate) onUpdate();
      }
      setLoading(false);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <Settings size={14} /> Mission Configuration
          </div>
      </div>

      {/* CONTROLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FORMAT SELECTOR */}
          <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-mono">Engagement Length</label>
              <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map(bo => (
                      <button
                          key={bo}
                          disabled={isLocked || loading}
                          onClick={() => handleFormatChange(bo)}
                          className={`py-2 text-xs font-black uppercase rounded border transition-all
                              ${selectedFormat === bo 
                                  ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-[0_0_10px_rgba(192,38,211,0.3)]' 
                                  : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}
                              ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                      >
                          BO{bo}
                      </button>
                  ))}
              </div>
          </div>

          {/* ACTIONS */}
          <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-mono">Roster Management</label>
              <div className="flex gap-2">
                  <button 
                      onClick={handleSwap} 
                      disabled={isLocked || loading}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase rounded border border-zinc-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <ArrowRightLeft size={14} /> Swap Sides
                  </button>
                  <button 
                      onClick={handleReset}
                      disabled={loading}
                      className="flex-1 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 text-xs font-bold uppercase rounded border border-red-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                      <Trash2 size={14} /> Reset Data
                  </button>
              </div>
          </div>

      </div>
    </div>
  );
};
