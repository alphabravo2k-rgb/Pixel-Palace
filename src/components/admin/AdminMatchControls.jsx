import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { Settings, RefreshCw, ArrowRightLeft, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminMatchControls = ({ match, onUpdate }) => {
  const [selectedFormat, setSelectedFormat] = useState(match?.best_of || 1);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const isLocked = ['live', 'completed'].includes(match.status);

  // 1. Format Toggle
  const handleFormatChange = async (newFormat) => {
    if (isLocked) return;
    setLoading(true);
    
    const { error } = await supabase.rpc('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: newFormat
    });

    if (error) {
        setStatusMsg({ type: 'error', msg: error.message });
    } else {
        setSelectedFormat(newFormat);
        setStatusMsg({ type: 'success', msg: `Updated to Best of ${newFormat}` });
        if(onUpdate) onUpdate();
    }
    setLoading(false);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // 2. Team Swap
  const handleSwap = async () => {
      if(isLocked || !window.confirm("Swap Team 1 and Team 2?")) return;
      setLoading(true);
      
      const { error } = await supabase.rpc('api_swap_match_slots', { 
          p_match_id: match.id, 
          p_reason: "Manual Admin Swap" 
      });

      if(error) setStatusMsg({ type: 'error', msg: error.message });
      else {
          setStatusMsg({ type: 'success', msg: 'Teams Swapped' });
          if(onUpdate) onUpdate();
      }
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <Settings size={14} /> Mission Configuration
          </div>
          {statusMsg && (
              <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${statusMsg.type === 'success' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
                  {statusMsg.type === 'success' ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                  {statusMsg.msg}
              </div>
          )}
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

          {/* SWAP & RESET */}
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
                      disabled 
                      className="flex-1 py-2 bg-red-900/20 text-red-500 text-xs font-bold uppercase rounded border border-red-900/30 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                      title="Coming Soon"
                  >
                      <RefreshCw size={14} /> Reset Match
                  </button>
              </div>
          </div>

      </div>
    </div>
  );
};
