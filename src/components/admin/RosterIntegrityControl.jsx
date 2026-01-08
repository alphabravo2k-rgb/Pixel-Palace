import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, UserCog, UserMinus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';

/**
 * 🛡️ ROSTER INTEGRITY: ADMIN OVERRIDE
 * -----------------------------------
 * STATUS: MASTERED (DIRECT LINK)
 * * PURPOSE:
 * Allows Admins to surgically alter rosters (Kick/Promote) bypassing normal locks.
 * * SECURITY:
 * Relies on RLS policies granting 'DELETE' and 'UPDATE' rights to Admins.
 */

export const RosterIntegrityControl = ({ player, teamId, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'KICK' | 'ROLE', payload: 'captain' | 'player' }
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const initiateForceAction = (type, payload) => {
    setPendingAction({ type, payload });
    setShowModal(true);
    setReason('');
    SoundNexus.play(CUES.DISPUTE_TRIGGER); // Warning sound
  };

  const executeAction = async () => {
    if (reason.length < 5) {
        toast.error("AUDIT REASON REQUIRED (MIN 5 CHARS)");
        SoundNexus.play(CUES.ERROR);
        return;
    }

    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);

    try {
        if (pendingAction.type === 'KICK') {
            // 1. KICK PLAYER
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('user_id', player.user_id)
                .eq('team_id', teamId);
            
            if (error) throw error;
            toast.success("PLAYER REMOVED FROM ROSTER");

        } else if (pendingAction.type === 'ROLE') {
            // 2. CHANGE ROLE
            const { error } = await supabase
                .from('team_members')
                .update({ role: pendingAction.payload })
                .eq('user_id', player.user_id)
                .eq('team_id', teamId);

            if (error) throw error;
            toast.success(`ROLE SET TO ${pendingAction.payload.toUpperCase()}`);
        }

        SoundNexus.play(CUES.SUCCESS);
        setShowModal(false);
        if (onUpdate) onUpdate();

    } catch (err) {
        console.error("Integrity Error:", err);
        toast.error(`OPERATION FAILED: ${err.message}`);
        SoundNexus.play(CUES.ERROR);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            onClick={() => initiateForceAction('ROLE', player.role === 'captain' ? 'player' : 'captain')} 
            className="p-1.5 bg-zinc-900/80 hover:bg-amber-500/20 text-zinc-500 hover:text-amber-500 rounded border border-transparent hover:border-amber-500/50 transition-all"
            title="Force Toggle Captain Role"
        >
          <UserCog size={14} />
        </button>
        <button 
            onClick={() => initiateForceAction('KICK', null)} 
            className="p-1.5 bg-zinc-900/80 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded border border-transparent hover:border-red-500/50 transition-all"
            title="Force Remove Player"
        >
          <UserMinus size={14} />
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
            />
            
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-950 border-2 border-red-600 w-full max-w-md p-6 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)] relative z-10"
            >
              
              {/* Header */}
              <div className="flex items-center gap-3 text-red-500 mb-4 border-b border-red-900/30 pb-4">
                <ShieldAlert size={28} />
                <div>
                  <h2 className="font-display font-black text-2xl uppercase leading-none text-white">Force Action Protocol</h2>
                  <p className="text-[10px] text-red-400 font-mono tracking-widest mt-1">BYPASSING STANDARD ROSTER LOCKS</p>
                </div>
              </div>
              
              {/* Body */}
              <div className="space-y-4">
                <div className="text-sm text-zinc-300 leading-relaxed bg-red-950/20 p-3 rounded border border-red-900/30 flex gap-3">
                  <AlertTriangle className="shrink-0 text-red-500" size={18} />
                  <div>
                      You are about to <strong className="text-white">{pendingAction.type}</strong> user <strong className="text-white">{player.username}</strong>.
                      <br/>
                      <span className="text-red-400 text-xs uppercase font-bold mt-1 block">This action is immediate and irreversible.</span>
                  </div>
                </div>

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="REQUIRED: Enter audit justification (e.g., 'Toxic behavior ticket #123')..."
                  className="w-full bg-black border border-zinc-800 p-3 rounded text-sm h-24 outline-none focus:border-red-500 text-white placeholder:text-zinc-600 font-mono"
                />
                
                <div className="flex gap-3">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-bold uppercase text-zinc-500 bg-white/5 rounded hover:bg-white/10 transition-colors">Abort</button>
                  <button 
                      onClick={executeAction} 
                      disabled={reason.length < 5 || loading}
                      className="flex-1 py-3 bg-red-600 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-2 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20 transition-all"
                  >
                    {loading && <Loader2 className="animate-spin w-3 h-3" />} CONFIRM OVERRIDE
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
