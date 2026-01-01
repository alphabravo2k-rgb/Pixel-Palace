import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { X, Shield, Trophy, AlertTriangle, Activity } from 'lucide-react';
import { AdminMatchControls } from './AdminMatchControls';

export const AdminMatchModal = ({ match, isOpen, onClose, onUpdate }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleForceWin = async (winnerId) => {
    if (!window.confirm("CRITICAL: Force this result? This overrides game data.")) return;
    setLoading(true);
    try {
      // ✅ Calls the backend function we just created (Code 25)
      const { data, error } = await supabase.rpc('admin_force_match_result', {
        p_match_id: match.id,
        p_winner_id: winnerId
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message);

      onUpdate();
      onClose();
    } catch (err) { 
        alert("Error: " + err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-zinc-950 p-4 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-fuchsia-500" />
            <h3 className="text-white font-['Teko'] text-xl tracking-wide uppercase">Match Authority</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
            <section>
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Activity className="w-3 h-3" /> Standard Protocol
                </div>
                <AdminMatchControls match={match} teams={teams} onUpdate={onUpdate} />
            </section>

            <section className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-red-500/80 text-xs font-bold uppercase tracking-wider mb-4">
                    <AlertTriangle className="w-3 h-3" /> Danger Zone
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button disabled={loading || !match.team1_id} onClick={() => handleForceWin(match.team1_id)} className="py-3 bg-zinc-900 border border-zinc-800 hover:text-green-400 rounded text-xs font-bold uppercase flex flex-col items-center gap-1 transition-colors disabled:opacity-50">
                        <Trophy className="w-4 h-4" /> {match.team1?.name || 'Team A'} Wins
                    </button>
                    <button disabled={loading || !match.team2_id} onClick={() => handleForceWin(match.team2_id)} className="py-3 bg-zinc-900 border border-zinc-800 hover:text-green-400 rounded text-xs font-bold uppercase flex flex-col items-center gap-1 transition-colors disabled:opacity-50">
                        <Trophy className="w-4 h-4" /> {match.team2?.name || 'Team B'} Wins
                    </button>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};
