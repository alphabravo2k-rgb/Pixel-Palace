/**
 * ⚡ PIXEL PALACE: ADMIN MATCH CONTROLS
 * FILE: src/components/admin/AdminMatchControls.jsx
 * -----------------------------------------
 * VERSION: 2050.5.0 (MASTER OMNI)
 * DATE: 2026-01-22
 * STATUS: OPERATIONAL // LOGIC-GATED
 * -----------------------------------------
 * DESCRIPTION:
 * Tactical control panel for Marshals to manage match configuration.
 * Enforces strict "Dubai Standard" logic: No team swaps after a match goes live.
 * * UPGRADES (V5.0):
 * - [Intervention Gate]: Prevents swapping teams if Round > 1 OR Status is Live.
 * - [Atomic RPCs]: Uses 'admin_update_match_format' and 'admin_swap_teams'.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ArrowRightLeft, Trash2, ShieldAlert, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const AdminMatchControls = ({ match, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const selectedFormat = match?.best_of || 1;
  const isCompleted = ['completed'].includes(match.status);

  // 🛑 DUBAI STANDARD: THE BRACKET INTEGRITY LOCK
  // "Humans should never touch the bracket after the first bullet is fired."
  // 1. Must be Round 1 (Later rounds are fed by the engine).
  // 2. Must NOT be 'live' (Cannot swap teams while they are playing).
  // 3. Must NOT be 'completed' (History is immutable).
  const isInterventionAllowed = (match.round_number === 1) && (match.status !== 'live') && !isCompleted;

  // 1. FORMAT COMMAND (BO1 -> BO3 -> BO5)
  const handleFormatChange = async (newFormat) => {
    if (isCompleted || loading || newFormat === selectedFormat) return;

    setLoading(true);
    try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}

    try {
      const { error } = await supabase.rpc('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: newFormat
      });

      if (error) throw error;

      Telemetry.log(EVENTS.ACTION, { action: 'change_format', matchId: match.id, newFormat });
      toast.success(`ENGAGEMENT UPDATED: BEST OF ${newFormat}`, {
        style: { background: '#09090b', color: '#c026d3', border: '1px solid #c026d350' }
      });
      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message);
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
    } finally {
      setLoading(false);
    }
  };

  // 2. TEAM INVERSION (The Swap)
  const handleSwap = async () => {
    // SECURITY GATE: Physical rejection of command
    if (!isInterventionAllowed || loading) {
        if (!isInterventionAllowed) toast.error("DENIED: ENGINE LOCK ACTIVE");
        return;
    }
    
    if (!window.confirm("INVERT SIDES & SCORES?")) return;
      
    setLoading(true);
    try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}

    try {
      const { error } = await supabase.rpc('admin_swap_teams', { 
        p_match_id: match.id 
      });

      if (error) throw error;

      Telemetry.log(EVENTS.ACTION, { action: 'swap_sides', matchId: match.id });
      toast.success('SIDES INVERTED');
      try { SoundNexus.play(CUES.NAVIGATION_SWISH); } catch(e){}
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message);
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
    } finally {
      setLoading(false);
    }
  };

  // 3. NUCLEAR RESET
  const handleReset = async () => {
    const confirmText = "RESET MATCH";
    const input = window.prompt(`⚠️ DANGER: This will wipe scores and vetoes.\nType "${confirmText}" to confirm:`);
      
    if (input !== confirmText) return;

    setLoading(true);
    try { SoundNexus.play(CUES.DISPUTE_TRIGGER); } catch(e){}

    try {
      const { error } = await supabase.rpc('admin_reset_match', { 
        p_match_id: match.id 
      });

      if (error) throw error;

      Telemetry.log(EVENTS.ERROR, { action: 'hard_reset', matchId: match.id });
      toast.success('MATCH FACTORY RESET');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] border border-white/10 rounded-sm p-6 space-y-8 relative overflow-hidden">
      {/* 🧩 AMBIENT GLOW */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/5 blur-[60px] pointer-events-none" />
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 border border-white/10 rounded-sm">
            <Settings size={14} className="text-fuchsia-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Command Configuration</h3>
            <p className="text-[8px] text-zinc-500 font-mono mt-0.5 uppercase tracking-widest">Override active mission parameters</p>
          </div>
        </div>
        {!isInterventionAllowed && (
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-sm text-[9px] text-zinc-500 font-black uppercase tracking-tighter">
            <ShieldAlert size={12} /> Read Only
          </div>
        )}
      </div>

      {/* CONTROLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
        {/* FORMAT SELECTOR */}
        <div className="space-y-3">
          <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest block">Engagement Length</label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 5].map(bo => (
              <motion.button
                key={bo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isCompleted || loading}
                onClick={() => handleFormatChange(bo)}
                className={cn(
                  "py-3 text-[10px] font-black uppercase rounded-sm border transition-all relative overflow-hidden group",
                  selectedFormat === bo 
                    ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-[0_0_20px_rgba(192,38,211,0.2)]' 
                    : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                )}
              >
                BO{bo}
                {selectedFormat === bo && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* TACTICAL ACTIONS */}
        <div className="space-y-3">
          <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest block">Roster Operations</label>
          <div className="flex gap-2 h-[46px]">
            <motion.button 
              whileHover={isInterventionAllowed ? { scale: 1.02 } : {}}
              whileTap={isInterventionAllowed ? { scale: 0.98 } : {}}
              onClick={handleSwap} 
              // VISUAL LOCK: Grayscale and unclickable if forbidden
              disabled={!isInterventionAllowed || loading}
              className={cn(
                "flex-1 text-[9px] font-black uppercase tracking-widest rounded-sm border flex items-center justify-center gap-2 transition-all",
                isInterventionAllowed 
                  ? "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                  : "bg-zinc-950 text-zinc-700 border-zinc-900 cursor-not-allowed opacity-50"
              )}
            >
              {isInterventionAllowed ? <ArrowRightLeft size={14} className="text-zinc-400" /> : <Lock size={12} />} 
              {isInterventionAllowed ? "Invert Sides" : "LOCKED BY ENGINE"}
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset} 
              disabled={loading}
              className="flex-1 bg-red-950/20 hover:bg-red-900/30 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-sm border border-red-900/30 flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={14} /> Factory Reset
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  );
};
