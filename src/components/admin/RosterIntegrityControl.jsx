import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { ShieldAlert, UserCog, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const RosterIntegrityControl = ({ player, teamId, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'KICK' | 'ROLE', payload: 'CAPTAIN' | null }
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const initiateForceAction = (type, payload) => {
    setPendingAction({ type, payload });
    setShowModal(true);
    setReason('');
  };

  const executeAction = async () => {
    if (reason.length < 5) {
        toast.error("Audit reason required (min 5 chars).");
        return;
    }

    setLoading(true);
    try {
        // ✅ SECURE RPC CALL
        const { data, error } = await supabase.rpc('admin_manage_roster', {
            p_action: pendingAction.type, 
            p_member_id: player.id,
            p_payload: pendingAction.payload || null,
            p_reason: reason
        });

        if (error) throw error;
        if (data && !data.success) throw new Error(data.message);

        toast.success(`Action Executed: ${pendingAction.type}`);
        setShowModal(false);
        if (onUpdate) onUpdate();
    } catch (err) {
        toast.error(`Operation Failed: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button 
            onClick={() => initiateForceAction('ROLE', player.role === 'CAPTAIN' ? 'PLAYER' : 'CAPTAIN')} 
            className="p-1.5 bg-zinc-900/50 hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 rounded border border-transparent hover:border-amber-500/50 transition-all"
            title="Force Toggle Captain Role"
        >
          <UserCog size={14} />
        </button>
        <button 
            onClick={() => initiateForceAction('KICK', null)} 
            className="p-1.5 bg-zinc-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded border border-transparent hover:border-red-500/50 transition-all"
            title="Force Remove Player (Override Lock)"
        >
          <UserMinus size={14} />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border-2 border-red-600 w-full max-w-md p-6 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            
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
              <div className="text-sm text-zinc-300 leading-relaxed bg-red-950/20 p-3 rounded border border-red-900/30">
                You are about to <strong>{pendingAction.type}</strong> user <strong className="text-white">{player.username}</strong> from Team ID: {teamId}.
                <br/><br/>
                <span className="text-red-400 text-xs uppercase font-bold">This action is irreversible and will be logged in the Admin Audit Trail.</span>
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
          </div>
        </div>
      )}
    </>
  );
};
