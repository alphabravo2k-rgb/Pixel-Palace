import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ArrowRightLeft, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';

/**
 * ⚙️ ADMIN MATCH CONTROLS: MISSION CONFIG
 * --------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * UPGRADES:
 * 1. PHYSICS: Tactile button presses.
 * 2. AUDIO: Mechanical clicks on interaction.
 */

export const AdminMatchControls = ({ match, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const selectedFormat = match?.best_of || 1;

  const isLocked = ['completed'].includes(match.status);

  // 1. Format Toggle
  const handleFormatChange = async (newFormat) => {
    if (isLocked || loading) return;
    if (newFormat === selectedFormat) return;

    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);

    const { error } = await supabase.rpc('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: newFormat
    });

    if (error) {
        toast.error(error.message);
        SoundNexus.play(CUES.ERROR);
    } else {
        toast.success(`FORMAT: BEST OF ${newFormat}`);
        SoundNexus.play(CUES.SUCCESS);
        if(onUpdate) onUpdate();
    }
    setLoading(false);
  };

  // 2. Team Swap
  const handleSwap = async () => {
      if(isLocked || loading) return;
      if(!window.confirm("SWAP TEAMS & SCORES?")) return;
      
      setLoading(true);
      SoundNexus.play(CUES.UI_CLICK);

      const { error } = await supabase.rpc('admin_swap_teams', { 
          p_match_id: match.id 
      });

      if(error) {
          toast.error(error.message);
          SoundNexus.play(CUES.ERROR);
      } else {
          toast.success('SIDES SWAPPED');
          SoundNexus.play(CUES.NAVIGATION_SWISH);
          if(onUpdate) onUpdate();
      }
      setLoading(false);
  };

  // 3. Hard Reset
  const handleReset = async () => {
      const confirmText = "RESET MATCH";
      const input = window.prompt(`⚠️ DANGER ZONE\n\nThis will wipe all data.\nType "${confirmText}" to confirm:`);
      
      if (input !== confirmText) return;

      setLoading(true);
      SoundNexus.play(CUES.DISPUTE_TRIGGER);

      const { error } = await supabase.rpc('admin_reset_match', { 
          p_match_id: match.id 
      });

      if (error) {
          toast.error(error.message);
      } else {
          toast.success('MATCH FACTORY RESET');
          if(onUpdate) onUpdate();
      }
      setLoading(false);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-sm p-5 space-y-6">
      
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
                      <motion.button
                          key={bo}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isLocked || loading}
                          onClick={() => handleFormatChange(bo)}
                          className={`py-2 text-xs font-black uppercase rounded-sm border transition-all
                              ${selectedFormat === bo 
                                  ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-[0_0_10px_rgba(192,38,211,0.3)]' 
                                  : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}
                              ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                      >
                          BO{bo}
                      </motion.button>
                  ))}
              </div>
          </div>

          {/* ACTIONS */}
          <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-mono">Roster Management</label>
              <div className="flex gap-2">
                  <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSwap} 
                      disabled={isLocked || loading}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase rounded-sm border border-zinc-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <ArrowRightLeft size={14} /> Swap Sides
                  </motion.button>
                  <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset} 
                      disabled={loading}
                      className="flex-1 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 text-xs font-bold uppercase rounded-sm border border-red-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                      <Trash2 size={14} /> Reset Data
                  </motion.button>
              </div>
          </div>

      </div>
    </div>
  );
};
