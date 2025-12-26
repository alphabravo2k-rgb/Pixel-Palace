import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { X, Shield, Trophy, RefreshCw, AlertTriangle, Activity } from 'lucide-react';
import { useSession } from '../../auth/useSession'; 

// Components
import { AdminMatchControls } from './AdminMatchControls'; // ✅ Standard Ops
import { RestrictedButton } from '../common/RestrictedButton'; // ✅ Security Enforcer

export const AdminMatchModal = ({ match, isOpen, onClose, onUpdate }) => {
  const { session } = useSession();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Context (Teams for dropdowns)
  useEffect(() => {
    if (isOpen && match.tournament_id) {
      const fetchTeams = async () => {
        const { data } = await supabase
          .from('teams')
          .select('id, name, seed_number')
          .eq('tournament_id', match.tournament_id)
          .order('name');
        setTeams(data || []);
      };
      fetchTeams();
    }
  }, [isOpen, match.tournament_id]);

  // 2. NUCLEAR ACTION: Force Win
  const handleForceWin = async (winnerId) => {
    if (!window.confirm("CRITICAL: Force this result? This overrides game data.")) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('admin_force_match_result', {
        p_match_id: match.id,
        p_winner_id: winnerId,
        p_admin_id: session.user.id, // Explicit ID for audit
        p_reason: "Manual Override via Admin Console"
      });
      if (error) throw error;
      onUpdate(); onClose();
    } catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  // 3. NUCLEAR ACTION: Reset
  const handleReset = async () => {
    if (!window.confirm("WARNING: This wipes scores and logs. Proceed?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('admin_reset_match', {
        p_match_id: match.id,
        p_admin_id: session.user.id,
        p_reason: "Hard Reset via Admin Console"
      });
      if (error) throw error;
      onUpdate(); onClose();
    } catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-zinc-950 p-4 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-fuchsia-500" />
            <h3 className="text-white font-['Teko'] text-xl tracking-wide uppercase">Match Authority</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
            
            {/* ZONE A: Standard Operations (Swap, Schedule, Format) */}
            <section>
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Activity className="w-3 h-3" /> Standard Protocol
                </div>
                <AdminMatchControls 
                    match={match} 
                    teams={teams} 
                    onUpdate={onUpdate} 
                />
            </section>

            {/* ZONE B: Nuclear Options (Permission Gated) */}
            <section className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-red-500/80 text-xs font-bold uppercase tracking-wider mb-4">
                    <AlertTriangle className="w-3 h-3" /> Danger Zone
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <RestrictedButton
                        action="MATCH:FORCE_WIN"
                        resourceId={match.id}
                        disabled={loading || !match.team1_id}
                        onClick={() => handleForceWin(match.team1_id)}
                        className="py-3 bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:bg-green-900/10 hover:text-green-400 text-zinc-400 rounded transition-all text-xs font-bold uppercase flex flex-col items-center gap-1"
                    >
                        <Trophy className="w-4 h-4" /> {match.team1?.name || 'Team A'} Wins
                    </RestrictedButton>

                    <RestrictedButton
                        action="MATCH:FORCE_WIN"
                        resourceId={match.id}
                        disabled={loading || !match.team2_id}
                        onClick={() => handleForceWin(match.team2_id)}
                        className="py-3 bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:bg-green-900/10 hover:text-green-400 text-zinc-400 rounded transition-all text-xs font-bold uppercase flex flex-col items-center gap-1"
                    >
                        <Trophy className="w-4 h-4" /> {match.team2?.name || 'Team B'} Wins
                    </RestrictedButton>
                </div>

                <RestrictedButton
                    action="MATCH:RESET"
                    resourceId={match.id}
                    disabled={loading}
                    onClick={handleReset}
                    className="w-full py-3 bg-red-950/10 border border-red-900/20 text-red-500 hover:bg-red-950/30 hover:border-red-500/50 rounded transition-all text-xs font-bold uppercase flex items-center justify-center gap-2"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Hard Reset Match
                </RestrictedButton>
            </section>
        </div>

        {/* Footer */}
        <div className="bg-black/40 p-2 text-center border-t border-white/5 shrink-0">
           <span className="text-[10px] text-zinc-600 font-mono">
             ID: {match.id} • SECURE CONSOLE
           </span>
        </div>

      </div>
    </div>
  );
};
