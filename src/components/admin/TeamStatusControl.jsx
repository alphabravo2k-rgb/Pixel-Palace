import React from 'react';
import { Lock } from 'lucide-react';

export const TeamStatusControl = ({ team }) => {
  // 🛡️ SAFE MODE: Features disabled for v1.0 Launch
  // We return a simple status badge instead of broken toggles.
  
  return (
    <div className="flex items-center gap-2 opacity-50 cursor-not-allowed" title="Status controls locked for v1.0">
      <div className="p-1.5 rounded border border-white/5 bg-zinc-900/50 text-zinc-600">
        <Lock size={14} />
      </div>
    </div>
  );
};
