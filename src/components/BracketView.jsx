import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client'; // ✅ FIXED: Changed ../../ to ../
import { X, Save, Shield, Monitor, Map, Clock, AlertTriangle } from 'lucide-react';
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
        score_t1: data.score_team1 || 0, 
        score_t2: data.score_team2 || 0,
        winner_id: data.winner_id || null
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load match details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) fetchMatch();
  }, [matchId]);

  // 2. Helper: Calculate Next Bracket Slot (Auto-Advance)
  const advanceWinner = async (currentMatch, winnerId) => {
    // Logic: Round 1, Pos 1 & 2 -> Round 2, Pos 1
    const nextRound = currentMatch.round_number + 1;
    const nextPos = Math.ceil(currentMatch.match_position / 2);
    
    // If Match Position is Odd (1, 3, 5), they go to Team 1 slot of next match
    // If Match Position is Even (2, 4, 6), they go to Team 2 slot of next match
    const isTeam1Slot = (currentMatch.match_position % 2 !== 0); 

    const updateField = isTeam1Slot ? 'team1_id' : 'team2_id';

    const { error } = await supabase
      .from('matches')
      .update({ [updateField]: winnerId })
      .eq('tournament_id', currentMatch.tournament_id)
      .eq('round_number', nextRound)
      .eq('match_position', nextPos);

    if (error) {
      console.error("Auto-Advance Error:", error);
      toast.error("Winner saved, but could not auto-advance bracket.");
    } else {
      toast.success(`Winner advanced to Round ${nextRound}!`);
    }
  };

  // 3. Save Changes
  const handleSave = async () => {
    setSaving(true);
    try {
      // A. Update Current Match
      const { error } = await supabase
        .from('matches')
        .update({
          server_ip: formData.server_ip,
          start_time: formData.start_time || null, // Handle empty string as null
          status: formData.status,
          score_team1: formData.score_t1,
          score_team2: formData.score_t2,
          winner_id: formData.winner_id
        })
        .eq('id', matchId);

      if (error) throw error;

      // B. AUTO-ADVANCE LOGIC (Only if winner changed/set)
      if (formData.winner_id && formData.winner_id !== match.winner_id) {
        await advanceWinner(match, formData.winner_id);
      }

      toast.success("Match Updated Successfully");
      onClose(); 
    } catch (e) {
      console.error(e);
      toast.error("Save Failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !match) return <div className="p-10 text-zinc-500 font-mono animate-pulse">ESTABLISHING CONNECTION...</div>;

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
          {/* Team 1 Card */}
          <div 
            className={`text-center p-4 rounded border cursor-pointer transition-all relative overflow-hidden group ${
              formData.winner_id === match.team1?.id ? 'border-brand bg-brand/10' : 'border-zinc-800 hover:bg-white/5'
            }`}
            onClick={() => setFormData({...formData, winner_id: match.team1?.id})}
          >
            <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center border border-zinc-700 mb-2 relative z-10">
              {match.team1?.logo_url ? <img src={match.team1.logo_url} className="w-10 h-10 object-contain" alt="T1"/> : <Shield className="text-zinc-600"/>}
            </div>
            <h3 className="font-bold text-lg text-white relative z-10">{match.team1?.name || "TBD"}</h3>
            {formData.winner_id === match.team1?.id && <div className="text-xs text-brand font-bold mt-1 uppercase relative z-10">Winner Selected</div>}
          </div>

          {/* Center Control */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-zinc-600 font-black text-2xl select-none">VS</span>
            
            <div className="flex items-center gap-3 bg-black/50 p-2 rounded-lg border border-zinc-800">
              <input 
                type="number" 
                value={formData.score_t1} 
                onChange={e => setFormData({...formData, score_t1: parseInt(e.target.value) || 0})} 
                className="w-12 bg-black border border-zinc-700 text-center text-white font-mono text-xl p-1 rounded focus:border-brand outline-none"
              />
              <span className="text-zinc-500 text-xl font-bold">:</span>
              <input 
                type="number" 
                value={formData.score_t2} 
                onChange={e => setFormData({...formData, score_t2: parseInt(e.target.value) || 0})} 
                className="w-12 bg-black border border-zinc-700 text-center text-white font-mono text-xl p-1 rounded focus:border-brand outline-none"
              />
            </div>

            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})} 
              className={`text-xs uppercase font-bold p-1.5 rounded border outline-none w-32 text-center cursor-pointer ${
                formData.status === 'LIVE' ? 'bg-red-900/20 text-red-500 border-red-900/50' : 
                formData.status === 'COMPLETED' ? 'bg-emerald-900/20 text-emerald-500 border-emerald-900/50' : 
                'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="LIVE">🔴 LIVE</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Team 2 Card */}
          <div 
            className={`text-center p-4 rounded border cursor-pointer transition-all relative overflow-hidden group ${
              formData.winner_id === match.team2?.id ? 'border-brand bg-brand/10' : 'border-zinc-800 hover:bg-white/5'
            }`}
            onClick={() => setFormData({...formData, winner_id: match.team2?.id})}
          >
            <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center border border-zinc-700 mb-2 relative z-10">
              {match.team2?.logo_url ? <img src={match.team2.logo_url} className="w-10 h-10 object-contain" alt="T2"/> : <Shield className="text-zinc-600"/>}
            </div>
            <h3 className="font-bold text-lg text-white relative z-10">{match.team2?.name || "TBD"}</h3>
            {formData.winner_id === match.team2?.id && <div className="text-xs text-brand font-bold mt-1 uppercase relative z-10">Winner Selected</div>}
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Map size={12}/> Server IP / Connect Command
            </label>
            <input 
              value={formData.server_ip} 
              onChange={e => setFormData({...formData, server_ip: e.target.value})} 
              className="w-full bg-black border border-zinc-700 p-3 text-brand font-mono text-sm rounded focus:border-brand outline-none placeholder:text-zinc-800"
              placeholder="connect 123.456.78.90:27015; password pixel"
            />
            <p className="text-[10px] text-zinc-600 flex items-center gap-1">
              <AlertTriangle size={10}/> Visible to players only when status is LIVE.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Clock size={12}/> Scheduled Start Time
            </label>
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
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="px-6 py-2 bg-brand hover:bg-brand-glow text-white font-bold uppercase text-xs rounded shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all"
        >
          <Save size={14}/> {saving ? 'Saving...' : 'Update Match Data'}
        </button>
      </div>
    </div>
  );
};
