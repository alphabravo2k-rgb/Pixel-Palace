import React, { useState } from 'react';
import { useAdminConsole } from '../../hooks/useAdminConsole'; // Using the secure hook
import { ShieldAlert, UserCog, UserMinus, Loader2 } from 'lucide-react';

export const RosterIntegrityControl = ({ player, teamId, onUpdate }) => {
  const { execute, loading } = useAdminConsole(); // ✅ Use the standard admin hook
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [reason, setReason] = useState('');

  const initiateForceAction = (type, payload) => {
    setPendingAction({ type, payload });
    setShowModal(true);
    setReason('');
  };

  const executeAction = async () => {
    if (reason.length < 5) return alert("Audit reason required (min 5 chars).");

    // ✅ SECURE RPC CALL (No more direct DB mutations)
    const result = await execute('admin_manage_roster', {
        p_action: pendingAction.type, // 'KICK' or 'ROLE'
        p_member_id: player.id,
        p_payload: pendingAction.payload || null, // 'CAPTAIN'/'PLAYER' or null
        p_reason: reason
    });

    if (result.success) {
      setShowModal(false);
      if (onUpdate) onUpdate();
    } else {
      alert(`Action Failed: ${result.message}`);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button 
            onClick={() => initiateForceAction('ROLE', player.role === 'CAPTAIN' ? 'PLAYER' : 'CAPTAIN')} 
            className="p-1.5 bg-zinc-900/50 hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 rounded border border-transparent hover:border-amber-500/50 transition-all"
            title="Toggle Captain Role"
        >
          <UserCog size={14} />
        </button>
        <button 
            onClick={() => initiateForceAction('KICK', null)} 
            className="p-1.5 bg-zinc-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded border border-transparent hover:border-red-500/50 transition-all"
            title="Force Kick Player"
        >
          <UserMinus size={14} />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border-2 border-red-600 w-full max-w-md p-6 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="flex items-center gap-3 text-red-500 mb-4 border-b border-red-900/30 pb-4">
              <ShieldAlert size={28} />
              <div>
                <h2 className="font-['Teko'] text-2xl uppercase leading-none">Force Action Protocol</h2>
                <p className="text-[10px] text-red-400 font-mono">BYPASSING STANDARD ROSTER LOCKS</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                You are about to <strong>{pendingAction.type}</strong> user <strong>{player.username}</strong>.
                This action is irreversible and logged.
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required Audit Justification..."
                className="w-full bg-black border border-white/10 p-3 rounded text-sm h-24 outline-none focus:border-red-500"
              />
              
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-bold uppercase text-zinc-500 bg-white/5 rounded hover:bg-white/10">Cancel</button>
                <button 
                    onClick={executeAction} 
                    disabled={reason.length < 5 || loading} 
                    className="flex-1 py-3 bg-red-600 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-2 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="animate-spin w-3 h-3" />} Confirm Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
