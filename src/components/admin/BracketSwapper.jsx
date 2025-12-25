import React, { useState } from 'react';
import { ArrowLeftRight, ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';

export const BracketSwapper = ({ matches, onSwapComplete }) => {
  const { session } = useSession();
  const [source, setSource] = useState(null); // { matchId, slot: 1|2, teamName, status }
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to cancel selection
  const reset = () => {
    setSource(null);
    setTarget(null);
  };

  const handleSwap = async () => {
    if (!source || !target) return;
    
    // 🔒 FINAL FRONTEND CHECK
    // Even though backend checks this, we stop it here for UX
    if (['live', 'completed', 'veto'].includes(source.status) || 
        ['live', 'completed', 'veto'].includes(target.status)) {
      alert("Integrity Error: One of the selected matches is already locked (Veto started or Live).");
      return;
    }

    const reason = prompt(
      `⚖️ INTEGRITY CHECK \n\nSwapping ${source.teamName} <-> ${target.teamName}.\n\nREQUIRED: Why is this swap necessary?`
    );

    if (!reason || reason.trim().length < 5) {
      alert("Swap cancelled. A valid reason is required for the Audit Log.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('api_swap_match_slots', {
        p_match_a_id: source.matchId,
        p_slot_a: source.slot,
        p_match_b_id: target.matchId,
        p_slot_b: target.slot,
        p_reason: reason,
        p_admin_id: session.identity.id
      });

      if (error) throw error;
      
      if (data.success) {
        alert("Swap Successful.");
        reset();
        if (onSwapComplete) onSwapComplete();
      } else {
        alert(`Swap Rejected: ${data.message}`);
      }
    } catch (err) {
      console.error("Swap Error:", err);
      alert("Swap failed. Server rejected the request.");
    } finally {
      setLoading(false);
    }
  };

  // 🎮 SELECTION UI (Floating Action Bar)
  if (!source) return null; 

  // Visual warning if users try to swap locked matches (feedback)
  const isSourceLocked = ['live', 'completed', 'veto'].includes(source.status);
  const isTargetLocked = target && ['live', 'completed', 'veto'].includes(target.status);
  const hasError = isSourceLocked || isTargetLocked;

  return (
    <div className={`
      fixed bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-2xl z-50 
      flex items-center gap-6 animate-in slide-in-from-bottom-5 border
      ${hasError ? 'bg-red-950 border-red-500' : 'bg-zinc-900 border-fuchsia-500/50'}
    `}>
      
      <div className="flex items-center gap-4">
        {/* Source */}
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase font-bold ${hasError ? 'text-red-400' : 'text-fuchsia-400'}`}>
            Swap From
          </span>
          <span className="font-mono text-white font-bold">{source.teamName}</span>
          {isSourceLocked && <span className="text-[9px] text-red-500 font-bold uppercase">LOCKED ({source.status})</span>}
        </div>

        <ArrowLeftRight className={`w-5 h-5 ${hasError ? 'text-red-500' : 'text-zinc-500'} ${target && !hasError ? 'animate-pulse text-white' : ''}`} />

        {/* Target */}
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase font-bold ${hasError ? 'text-red-400' : 'text-fuchsia-400'}`}>
            Swap With
          </span>
          {target ? (
            <>
              <span className="font-mono text-white font-bold">{target.teamName}</span>
              {isTargetLocked && <span className="text-[9px] text-red-500 font-bold uppercase">LOCKED ({target.status})</span>}
            </>
          ) : (
            <span className="text-zinc-500 italic text-sm">Select Target...</span>
          )}
        </div>
      </div>

      <div className={`h-8 w-px ${hasError ? 'bg-red-500/30' : 'bg-white/10'}`} />

      <div className="flex items-center gap-2">
        {hasError ? (
           <div className="flex items-center gap-2 text-red-200 text-xs font-bold uppercase">
             <AlertTriangle className="w-4 h-4" />
             Cannot Swap Locked Teams
           </div>
        ) : (
          <button 
            onClick={handleSwap}
            disabled={!target || loading}
            className="bg-fuchsia-600 text-white px-4 py-2 rounded font-bold uppercase text-sm hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Swapping..." : "Confirm Swap"}
          </button>
        )}
        
        <button 
          onClick={reset}
          className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!hasError && (
        <div className="absolute -top-3 left-4 bg-black px-2 text-[10px] text-zinc-400 flex items-center gap-1 border border-zinc-800 rounded">
          <ShieldAlert className="w-3 h-3 text-fuchsia-500" />
          <span>Action will be logged</span>
        </div>
      )}
    </div>
  );
};
