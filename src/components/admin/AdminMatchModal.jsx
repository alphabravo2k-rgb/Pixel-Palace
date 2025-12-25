import React, { useState } from 'react';
import { X, ShieldAlert, Trophy, Save } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { MatchFormatControl } from './MatchFormatControl';

export const AdminMatchModal = ({ match, isOpen, onClose, onUpdate }) => {
  const { session, getAuthIdentifier } = useSession(); // ✅ Use new helper
  const [loading, setLoading] = useState(false);

  if (!isOpen || !match) return null;

  // 1. Permission Check (Simplified)
  // Backend handles real security. Frontend just hides it for guests.
  if (session.role !== 'ADMIN' && session.role !== 'OWNER' && session.role !== 'REFEREE') {
    return null; 
  }

  const handleScoreUpdate = async (e) => {
    e.preventDefault();
    const t1Score = e.target.t1.value;
    const t2Score = e.target.t2.value;
    
    setLoading(true);
    try {
      // ✅ USE NEW RPC (Code 43)
      // This ensures the update is logged and triggers winner propagation
      const { data, error } = await supabase.rpc('api_report_match_score', {
        p_match_id: match.id,
        p_team1_score: parseInt(t1Score),
        p_team2_score: parseInt(t2Score),
        p_winner_id: null, // Let backend calculate based on score
        p_admin_id: getAuthIdentifier() // 🛡️ Audit Key
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message);

      onUpdate();
      onClose();
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-zinc-950 px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-['Teko'] uppercase tracking-wider text-white">
              Tactical Command
            </h2>
            <span className="text-[10px] text-zinc-500 font-mono">MATCH ID: {match.id.split('-')[0]}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* 1. Format Control */}
          <MatchFormatControl match={match} onUpdate={onUpdate} />

          {/* 2. Score Override (Quick Edit) */}
          <form onSubmit={handleScoreUpdate} className="bg-black/40 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Manual Score Override
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 block mb-1 truncate">{match.team1?.name || 'TBD'}</label>
                <input 
                  name="t1" 
                  defaultValue={match.team1_score} 
                  type="number" 
                  className="w-full bg-zinc-800 border border-zinc-700 text-white p-2 rounded text-center font-mono font-bold"
                />
              </div>
              <span className="text-zinc-600 font-bold">:</span>
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 block mb-1 truncate">{match.team2?.name || 'TBD'}</label>
                <input 
                  name="t2" 
                  defaultValue={match.team2_score} 
                  type="number" 
                  className="w-full bg-zinc-800 border border-zinc-700 text-white p-2 rounded text-center font-mono font-bold"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-3 h-3" /> Update Scoreboard
            </button>
          </form>

          {/* 3. Audit Note */}
          <div className="flex items-start gap-2 text-[10px] text-zinc-500 bg-blue-900/10 p-3 rounded border border-blue-900/30">
            <ShieldAlert className="w-4 h-4 text-blue-500 mt-0.5" />
            <p>
              <strong>COMMANDER NOTE:</strong> Any changes made here are logged against your Admin ID ({session.identity?.name}). 
              Changing team slots triggers a full data reset (Vetoes/Scores wiped).
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
