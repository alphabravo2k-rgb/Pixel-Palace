import React, { useState } from 'react';
import { ArrowLeftRight, ShieldAlert, X } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';

// Usage: Pass this into your Bracket Node renderer. 
// When an Admin clicks a "Swap" button on a node, it activates this context.

export const BracketSwapper = ({ matches, onSwapComplete }) => {
  const { session } = useSession();
  const [source, setSource] = useState(null); // { matchId, slot: 1|2, teamName }
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to cancel selection
  const reset = () => {
    setSource(null);
    setTarget(null);
  };

  const handleSwap = async () => {
    if (!source || !target) return;
    
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
        alert(data.message);
      }
    } catch (err) {
      console.error("Swap Error:", err);
      alert("Swap failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🎮 SELECTION UI (Floating Action Bar)
  if (!source) return null; // Invisible until first selection is made via parent

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-fuchsia-500/50 p-4 rounded-lg shadow-2xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-5">
      
      <div className="flex items-center gap-4">
        {/* Source */}
        <div className="flex flex-col">
          <span className="text-[10px] text-fuchsia-400 uppercase font-bold">Swap From</span>
          <span className="font-mono text-white font-bold">{source.teamName}</span>
        </div>

        <ArrowLeftRight className={`w-5 h-5 text-zinc-500 ${target ? 'animate-pulse text-white' : ''}`} />

        {/* Target */}
        <div className="flex flex-col">
          <span className="text-[10px] text-fuchsia-400 uppercase font-bold">Swap With</span>
          {target ? (
            <span className="font-mono text-white font-bold">{target.teamName}</span>
          ) : (
            <span className="text-zinc-500 italic text-sm">Select Target...</span>
          )}
        </div>
      </div>

      <div className="h-8 w-px bg-white/10" />

      <div className="flex items-center gap-2">
        <button 
          onClick={handleSwap}
          disabled={!target || loading}
          className="bg-fuchsia-600 text-white px-4 py-2 rounded font-bold uppercase text-sm hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Swapping..." : "Confirm Swap"}
        </button>
        <button 
          onClick={reset}
          className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute -top-3 left-4 bg-black px-2 text-[10px] text-zinc-400 flex items-center gap-1 border border-zinc-800 rounded">
        <ShieldAlert className="w-3 h-3 text-fuchsia-500" />
        <span>Action will be logged</span>
      </div>
    </div>
  );
};
