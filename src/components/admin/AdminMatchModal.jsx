import React, { useState } from 'react';
import { X, Trophy, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useCapabilities } from '../../auth/useCapabilities'; // 👈 The New Brain
import { RestrictedButton } from '../common/RestrictedButton'; // 👈 The Enforcer

export const AdminMatchModal = ({ match, onClose, onUpdate }) => {
  const { can } = useCapabilities(); // We no longer look at session.role directly
  const [loading, setLoading] = useState(false);

  if (!match) return null;

  // 1. ACTION: Force Win
  const handleForceWin = async (winnerTeamId) => {
    if (!window.confirm("CRITICAL: Are you sure you want to FORCE a result? This overrides all game data.")) return;
    setLoading(true);
    
    try {
      // Call the Secure RPC (Database enforces the permission too)
      const { error } = await supabase.rpc('admin_force_match_result', {
        p_match_id: match.id,
        p_winner_id: winnerTeamId,
        p_reason: "Admin Override via Console"
      });

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. ACTION: Reset Match
  const handleReset = async () => {
    if (!window.confirm("WARNING: This will wipe all scores, logs, and vetoes. Proceed?")) return;
    setLoading(true);

    try {
      const { error } = await supabase.rpc('admin_reset_match', {
        p_match_id: match.id
      });

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-zinc-950 p-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-fuchsia-500" />
            <h3 className="text-white font-['Teko'] text-xl tracking-wide uppercase">
              Match Authority Console
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Context */}
        <div className="p-6 text-center border-b border-white/5 bg-zinc-900/50">
          <div className="text-xs font-mono text-zinc-500 uppercase mb-2">Target Match ID: {match.id.substring(0,8)}</div>
          <div className="flex justify-between items-center px-4">
            <div className="text-right">
              <div className="text-lg font-bold text-white">{match.team1?.name || 'TBD'}</div>
              <div className="text-xs text-zinc-500 uppercase">Team A</div>
            </div>
            <div className="font-['Teko'] text-3xl px-4 text-zinc-600">VS</div>
            <div className="text-left">
              <div className="text-lg font-bold text-white">{match.team2?.name || 'TBD'}</div>
              <div className="text-xs text-zinc-500 uppercase">Team B</div>
            </div>
          </div>
        </div>

        {/* CONTROLS: Strictly Permission Gated */}
        <div className="p-6 space-y-4">
          
          {/* SECTION: Winner Declaration */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Force Result Override
            </label>
            <div className="grid grid-cols-2 gap-3">
              <RestrictedButton
                action="MATCH:FORCE_WIN" // 👈 The Guard Rail
                resourceId={match.id}
                onClick={() => handleForceWin(match.team1_id)}
                disabled={loading || !match.team1_id}
                className="py-3 bg-zinc-800 hover:bg-green-900/30 hover:text-green-400 hover:border-green-500/50 border border-transparent rounded transition-all text-xs font-bold uppercase flex flex-col items-center justify-center gap-1"
              >
                <Trophy className="w-4 h-4" />
                {match.team1?.name} Wins
              </RestrictedButton>

              <RestrictedButton
                action="MATCH:FORCE_WIN" // 👈 The Guard Rail
                resourceId={match.id}
                onClick={() => handleForceWin(match.team2_id)}
                disabled={loading || !match.team2_id}
                className="py-3 bg-zinc-800 hover:bg-green-900/30 hover:text-green-400 hover:border-green-500/50 border border-transparent rounded transition-all text-xs font-bold uppercase flex flex-col items-center justify-center gap-1"
              >
                <Trophy className="w-4 h-4" />
                {match.team2?.name} Wins
              </RestrictedButton>
            </div>
          </div>

          {/* SECTION: Danger Zone */}
          <div className="pt-4 border-t border-white/5">
            <label className="text-xs font-bold text-red-900/70 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> Danger Zone
            </label>
            
            <RestrictedButton
              action="MATCH:RESET" // 👈 High-Level Permission Only
              resourceId={match.id}
              onClick={handleReset}
              disabled={loading}
              className="w-full py-3 bg-red-950/10 hover:bg-red-950/40 text-red-500 border border-red-900/20 rounded transition-all text-xs font-bold uppercase flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Hard Reset Match State
            </RestrictedButton>
          </div>

        </div>
        
        {/* Footer Audit */}
        <div className="bg-black/40 p-2 text-center">
           <span className="text-[10px] text-zinc-600 font-mono">
             Action Authorized via Capability Protocol v2.5
           </span>
        </div>

      </div>
    </div>
  );
};
