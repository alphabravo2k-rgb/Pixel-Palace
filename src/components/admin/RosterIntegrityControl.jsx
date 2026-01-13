/**
 * 🛡️ ROSTER INTEGRITY: SURGICAL OVERRIDE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // AUDIT-ENFORCED
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, UserCog, UserMinus, Loader2, AlertTriangle, Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const RosterIntegrityControl = ({ player, teamId, onUpdate }) => {
  const { user: admin, can } = useNexus();
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); 
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // 🛡️ SECURITY: Level 90 Clearance for Roster Manipulation
  const hasClearance = can('CAP_MANAGE_ROSTERS');

  const initiateForceAction = (type, payload) => {
    if (!hasClearance) {
        SoundNexus.play(CUES.UI_ERROR);
        return toast.error("INSUFFICIENT CLEARANCE");
    }
    setPendingAction({ type, payload });
    setShowModal(true);
    setReason('');
    SoundNexus.play(CUES.DISPUTE_TRIGGER);
  };

  const executeAction = async () => {
    if (reason.length < 10) {
        toast.error("FORMAL JUSTIFICATION REQUIRED (MIN 10 CHARS)");
        return;
    }

    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);

    try {
        // 1. LOG TO TELEMETRY FIRST (Audit Trail)
        Telemetry.log(EVENTS.ACTION, {
            subsystem: 'ROSTER_INTEGRITY',
            action: pendingAction.type,
            target_user: player.user_id,
            team_id: teamId,
            justification: reason
        }, admin.id);

        if (pendingAction.type === 'KICK') {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('user_id', player.user_id)
                .eq('team_id', teamId);
            
            if (error) throw error;
        } else if (pendingAction.type === 'ROLE') {
            const { error } = await supabase
                .from('team_members')
                .update({ role: pendingAction.payload })
                .eq('user_id', player.user_id)
                .eq('team_id', teamId);

            if (error) throw error;
        }

        SoundNexus.play(CUES.UI_SUCCESS);
        toast.success(`INTEGRITY ACTION EXECUTED`);
        setShowModal(false);
        if (onUpdate) onUpdate();

    } catch (err) {
        toast.error(`OVERRIDE FAILED: ${err.message}`);
        SoundNexus.play(CUES.UI_ERROR);
    } finally {
        setLoading(false);
    }
  };

  if (!hasClearance) return null;

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button 
            onClick={() => initiateForceAction('ROLE', player.role === 'captain' ? 'player' : 'captain')} 
            className="p-1.5 bg-zinc-900 border border-white/5 hover:border-amber-500/50 text-zinc-500 hover:text-amber-500 rounded-sm transition-all"
            title="Modify Role"
        >
          <UserCog size={13} />
        </button>
        <button 
            onClick={() => initiateForceAction('KICK', null)} 
            className="p-1.5 bg-zinc-900 border border-white/5 hover:border-red-500/50 text-zinc-500 hover:text-red-500 rounded-sm transition-all"
            title="Surgical Removal"
        >
          <UserMinus size={13} />
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-md"
                onClick={() => setShowModal(false)}
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#09090b] border border-red-600/50 w-full max-w-md p-8 rounded-sm shadow-[0_0_100px_rgba(220,38,38,0.15)] relative z-10"
            >
              {/* SCANLINE OVERLAY */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />

              <div className="flex items-center gap-4 text-red-500 mb-8 border-b border-white/5 pb-6">
                <ShieldAlert size={32} className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <div>
                  <h2 className="font-display font-black text-xl uppercase italic tracking-tighter text-white">Integrity Override</h2>
                  <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                    <Terminal size={10} /> Bypass Standard Protocol
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="text-[11px] text-zinc-400 leading-relaxed bg-red-950/10 p-4 rounded-sm border border-red-900/20 font-mono">
                    <div className="flex gap-3 mb-2">
                        <AlertTriangle className="shrink-0 text-red-500" size={16} />
                        <span className="text-red-200 font-black uppercase tracking-widest underline">Critical Action Notice</span>
                    </div>
                    Target: <span className="text-white">{player.username}</span><br/>
                    Operation: <span className="text-white">{pendingAction.type}</span><br/>
                    <span className="text-red-400 mt-2 block italic">Action will be recorded in the Global Audit Log.</span>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Formal Justification</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Input ticket ID or specific violation reason..."
                      className="w-full bg-black border border-zinc-800 p-4 rounded-sm text-xs h-32 outline-none focus:border-red-600 text-white placeholder:text-zinc-800 transition-all font-mono"
                    />
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Abort</button>
                  <button 
                      onClick={executeAction} 
                      disabled={reason.length < 10 || loading}
                      className="flex-1 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-3 hover:bg-red-500 shadow-2xl shadow-red-600/20 transition-all active:scale-95 disabled:opacity-20"
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Execute Overwrite'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
