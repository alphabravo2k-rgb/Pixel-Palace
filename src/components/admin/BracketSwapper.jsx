import React, { useState } from 'react';
import { ArrowRightLeft, ShieldAlert, X, AlertTriangle, Loader2 } from 'lucide-react'; // ✅ Fixed Icon Name
import { useAdminConsole } from '../../hooks/useAdminConsole';

export const BracketSwapper = ({ matches, onSwapComplete }) => {
  const { execute, loading } = useAdminConsole();
  const [selectedMatch, setSelectedMatch] = useState(null);

  const reset = () => {
    setSelectedMatch(null);
  };

  const handleSwap = async () => {
    if (!selectedMatch) return;
    
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

  return null; // Logic-only component for now
};
