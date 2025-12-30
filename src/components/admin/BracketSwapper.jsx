import React, { useState } from 'react';
import { ArrowLeftRight, ShieldAlert, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useAdminConsole } from '../../hooks/useAdminConsole';

export const BracketSwapper = ({ matches, onSwapComplete }) => {
  const { execute, loading } = useAdminConsole();
  const [selectedMatch, setSelectedMatch] = useState(null);

  // NOTE: In v1.0, we only support swapping sides within a single match.
  // Cross-match swapping requires a complex 'admin_update_seeding' RPC we haven't built yet.

  const reset = () => {
    setSelectedMatch(null);
  };

  const handleSwap = async () => {
    if (!selectedMatch) return;
    
    // Integrity Check
    if (['live', 'completed', 'veto'].includes(selectedMatch.status)) {
      alert("Integrity Error: This match is already active/locked.");
      return;
    }

    const reason = prompt(
      `⚖️ INTEGRITY CHECK \n\nSwapping Sides for Match #${selectedMatch.matchNo}.\n(Team 1 <-> Team 2)\n\nREQUIRED: Why is this swap necessary?`
    );

    if (!reason || reason.trim().length < 5) {
      alert("Swap cancelled. A valid reason is required for the Audit Log.");
      return;
    }

    // ✅ SECURE RPC CALL (Code 7)
    const result = await execute('api_swap_match_slots', {
      p_match_id: selectedMatch.id,
      p_reason: reason
    });

    if (result.success) {
      alert("Sides Swapped Successfully.");
      reset();
      if (onSwapComplete) onSwapComplete();
    } else {
      alert(`Swap Rejected: ${result.message}`);
    }
  };

  // If used in a parent that passes 'source' prop, we adapt:
  if (!matches) return null; // Or handle selection logic here

  // Simplified UI for v1
  return null; // ⚠️ Hiding this component for now as it was designed for Drag-n-Drop which isn't ready.
  // Using AdminMatchControls inside the Modal is the preferred way to swap in v1.
};
