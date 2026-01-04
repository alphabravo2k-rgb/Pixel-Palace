import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { X, Save, Shield, Trophy, Monitor, Map, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const MatchWarRoom = ({ matchId, onClose }) => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local State for Edits
  const [formData, setFormData] = useState({
    server_ip: '',
    start_time: '',
    status: 'SCHEDULED',
    score_t1: 0,
    score_t2: 0,
    winner_id: null
  });

  // 1. Fetch Match Details
  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`*, team1:teams!team1_id(*), team2:teams!team2_id(*)`)
        .eq('id', matchId)
        .single();

      if (error) throw error;
      setMatch(data);
      setFormData({
        server_ip: data.server_ip || '',
        start_time: data.start_time || '',
        status: data.status || 'SCHEDULED',
        score_t1: data.score_team1 || 0, // Ensure your DB has these columns or add JSONB 'scores'
        score_t2: data.score_team2 || 0,
        winner_id: data.winner_id || null
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load match details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) fetchMatch();
  }, [matchId]);

  // 2. Save Changes & Advance Winner
  const handleSave = async () => {
    setSaving(true);
    try {
      // A. Update Current Match
      const { error } = await supabase
        .from('matches')
        .update({
          server_ip: formData.server_ip,
          start_time: formData.start_time,
          status: formData.status,
          winner_id: formData.winner_id
          // Note: You might need to add 'score_team1' and 'score_team2' columns to your 'matches' table if you haven't yet.
          // Or store them in a JSONB column like: scores: { t1: formData.score_t1, t2: formData.score_t2 }
        })
        .eq('id', matchId);

      if (error) throw error;

      // B. AUTO-ADVANCE LOGIC (If winner picked)
      if (formData.winner_id && formData.winner_id !== match.winner_id) {
        await advanceWinner(match, formData.winner_id);
      }

      toast.success("Match Updated Successfully");
      onClose(); // Close modal on success
    } catch (e) {
      console.error(e);
      toast.error("Save Failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper: Calculate Next Bracket Slot
  const advanceWinner = async (currentMatch, winnerId) => {
    // Logic: Round 1, Pos 1 & 2 -> Round 2, Pos 1
    const nextRound = currentMatch.round_number + 1;
    const nextPos = Math.ceil(currentMatch.match_position / 2);
    const isTeam1Slot = (currentMatch.match_position % 2 !== 0); // Odd positions go to Team 1 slot

    const updateField = isTeam1Slot ? 'team1_id' : 'team2_id';

    const { error } = await supabase
      .from('matches')
      .update({ [updateField]: winnerId })
      .eq('tournament_id', currentMatch.tournament_id)
      .eq('round_number', nextRound)
      .eq('match_position', nextPos);

    if (error) toast.error("Could not auto-advance winner to next round");
    else toast.success("Winner Advanced to Next Round!");
  };

  if (loading) return <div className="p-10 text-white">Loading War Room...</div>;

  return (
    <div className="bg-bg-panel border border-brand/30 w-full h-full rounded-lg flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-black/80 p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-display font-black text-white italic uppercase flex items-center gap-2">
          <Monitor className="text-red-500" /> WAR ROOM: <span className="text-zinc-400">MATCH #{match.match_position}</span>
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded text-zinc-400"><X /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        
        {/* Scoreboard Editor */}
        <div className="grid grid-cols-3 gap-4 items-center bg-black/40 p-6 rounded-lg border border-white/5">
          {/* Team 1 */}
          <div className={`text-center p-4 rounded border cursor-pointer transition-all ${formData.winner_id === match.team1?.id ? 'border-brand bg-brand/10' : 'border-transparent hover:bg-white/5'}`}
               onClick={() => setFormData({...formData, winner_id: match.team1?.id})}>
            <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center border border-zinc-700 mb-2">
              {match.team1?.logo_url ? <img src={match.team1.logo_url} className="w-10 h-10 object-contain"/> : <Shield className="text-zinc-600"/>}
            </div>
            <h3 className="font-bold text-lg text-white">{match.team1?.name || "TBD"}</h3>
            {formData.winner_id === match.team1?.id && <div className="text-xs text-brand font-bold mt-1 uppercase">Winner Selected</div>}
          </div>

          {/* VS / Score */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-zinc-600 font-black text-2xl">VS</span>
            <div className="flex gap-2">
              <input type="number" value={formData.score_t1} onChange={e => setFormData({...formData, score_t1: parseInt(e.target.value)})} className="w-12 bg-black border border-zinc-700 text-center text-white font-mono text-xl p-1 rounded focus:border-brand outline-none"/>
              <span className="text-white text-xl">:</span>
              <input type="number" value={formData.score_t2} onChange={e => setFormData({...formData, score_t2: parseInt(e.target.value)})} className="w-12 bg-black border border-zinc-700 text-center text-white font-mono text-xl p-1 rounded focus:border-brand outline-none"/>
            </div>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="bg-zinc-900 text-zinc-300 text-xs uppercase font-bold p-1 rounded border border-zinc-700 outline-none">
              <option value="SCHEDULED">Scheduled</option>
              <option value="LIVE">🔴 LIVE</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Team 2 */}
          <div className={`text-center p-4 rounded border cursor-pointer transition-all ${formData.winner_id === match.team2?.id ? 'border-brand bg-brand/10' : 'border-transparent hover:bg-white/5'}`}
               onClick={() => setFormData({...formData, winner_id: match.team2?.id})}>
            <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center border border-zinc-700 mb-2">
              {match.team2?.logo_url ? <img src={match.team2.logo_url} className="w-10 h-10 object-contain"/> : <Shield className="text-zinc-600"/>}
            </div>
            <h3 className="font-bold text-lg text-white">{match.team2?.name || "TBD"}</h3>
            {formData.winner_id === match.team2?.id && <div className="text-xs text-brand font-bold mt-1 uppercase">Winner Selected</div>}
          </div>
        </div>

        {/* Server & Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><Map size={12}/> Server Connect String</label>
            <div className="flex gap-2">
              <input 
                value={formData.server_ip} 
                onChange={e => setFormData({...formData, server_ip: e.target.value})} 
                className="flex-1 bg-black border border-zinc-700 p-3 text-brand font-mono text-sm rounded focus:border-brand outline-none"
                placeholder="connect 192.168.1.1; password..."
              />
            </div>
            <p className="text-[10px] text-zinc-600">Visible to players only when match is LIVE or READY.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><Clock size={12}/> Start Time</label>
            <input 
              type="datetime-local"
              value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0,16) : ''} 
              onChange={e => setFormData({...formData, start_time: e.target.value})} 
              className="w-full bg-black border border-zinc-700 p-3 text-white font-mono text-sm rounded focus:border-brand outline-none"
            />
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 bg-zinc-900 border-t border-white/5 flex justify-end gap-3">
        <button onClick={onClose} className="px-6 py-2 text-zinc-400 hover:text-white font-bold uppercase text-xs">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-brand hover:bg-brand-glow text-white font-bold uppercase text-xs rounded shadow-lg disabled:opacity-50 flex items-center gap-2">
          <Save size={14}/> {saving ? 'Saving...' : 'Update Match Data'}
        </button>
      </div>
    </div>
  );
};
