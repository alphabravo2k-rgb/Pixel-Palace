import React, { useState } from 'react';
import { useAdminConsole } from '../../hooks/useAdminConsole';
import { ShieldAlert, UserCog, UserMinus } from 'lucide-react';

export const RosterIntegrityControl = ({ player, teamId, onUpdate }) => {
  const { execute, loading } = useAdminConsole();
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); 
  const [reason, setReason] = useState('');

  // 1. TRIGGER: Opens the friction modal
  const initiateForceAction = (type, payload) => {
    setPendingAction({ type, payload });
    setShowModal(true);
    setReason('');
  };

  // 2. EXECUTE: The actual RPC call via our Hook
  const executeAction = async () => {
    if (reason.length < 5) return; // Frontend validation
    
    let rpcName = '';
    let params = { 
        p_player_id: player.id, 
        p_team_id: teamId, 
        p_reason: reason // ✅ Audit trail enforced
    };

    if (pendingAction.type === 'ROLE') {
        rpcName = 'admin_force_update_player_role';
        params.p_new_role = pendingAction.payload;
    } else if (pendingAction.type === 'KICK') {
        rpcName = 'admin_force_kick_player';
    }

    const result = await execute(rpcName, params);

    if (result.success) {
        setShowModal(false);
        if (onUpdate) onUpdate();
    } else {
        alert(`Action Rejected: ${result.message}`);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => initiateForceAction('ROLE', player.role === 'CAPTAIN' ? 'PLAYER' : 'CAPTAIN')}
          className="p-1.5 bg-zinc-900/50 hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 rounded border border-transparent hover:border-amber-500/50 transition-all"
          title="Force Role Change"
        >
          <UserCog size={14} />
        </button>

        <button
          onClick={() => initiateForceAction('KICK', null)}
          className="p-1.5 bg-zinc-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded border border-transparent hover:border-red-500/50 transition-all"
          title="Force Eject Player"
        >
          <UserMinus size={14} />
        </button>
      </div>

      {/* 🔴 FRICTION MODAL 🔴 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border-2 border-red-600 w-full max-w-md p-6 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="flex items-center gap-3 text-red-500 mb-4 border-b border-red-900/30 pb-4">
              <ShieldAlert size={28} />
              <div>
                <h2 className="font-['Teko'] text-2xl uppercase leading-none">Force Action Protocol</h2>
                <p className="text-[10px] text-red-400 font-mono">BYPASSING STANDARD ROSTER LOCKS</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-500/5 p-3 rounded border border-red-500/10">
                <p className="text-zinc-300 text-sm">
                  You are about to force <span className="text-white font-bold">{pendingAction.type}</span> on 
                  <span className="text-white font-bold ml-1">{player.username || 'Player'}</span>.
                </p>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Required Audit Justification</label>
                <textarea
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this manual override is necessary..."
                  className="w-full bg-black border border-white/10 p-3 rounded text-sm h-24 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-xs font-bold uppercase text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={reason.length < 5 || loading}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase rounded shadow-lg shadow-red-900/20"
                >
                  {loading ? 'Processing...' : 'Confirm Override'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
