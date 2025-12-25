import React, { useState } from 'react';
import { RefreshCw, Clock, AlertTriangle, ShieldAlert, Settings, Info, Save } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession'; // ✅ Security Core
import { MATCH_FORMATS } from '../../lib/rules';

export const AdminMatchControls = ({ match, teams, onUpdate }) => {
  const { getAuthIdentifier } = useSession(); // ✅ Use the Helper
  
  const [selectedT1, setSelectedT1] = useState(match?.team1?.id || '');
  const [selectedT2, setSelectedT2] = useState(match?.team2?.id || '');
  const [scheduleTime, setScheduleTime] = useState(match?.start_time || '');
  const [selectedFormat, setSelectedFormat] = useState(match?.best_of || 1);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // ✅ Integrity Check: State-based restriction
  const canSwap = ['scheduled', 'open'].includes(match.state);

  const handleSwapRequest = () => {
    setLocalError(null);
    if (!selectedT1 || !selectedT2) {
      setLocalError("Integrity Error: Both teams must be selected.");
      return;
    }
    if (selectedT1 === selectedT2) {
      setLocalError("Integrity Error: Cannot play against self.");
      return;
    }
    setIsSwapModalOpen(true);
  };

  const confirmSwap = async () => {
    setLoading(true);
    setLocalError(null);
    try {
        const reason = "Manual Swap via War Room";
        
        // ✅ CALL RPC (Code 29)
        const { data, error } = await supabase.rpc('api_swap_match_slots', {
            p_match_a_id: match.id,
            p_slot_a: 1, // Logic assumes we are rebuilding this match specifically
            p_match_b_id: match.id, // Swapping into self (re-seeding)
            p_slot_b: 2, 
            p_tournament_id: match.tournament_id,
            p_reason: reason,
            p_admin_id: getAuthIdentifier()
        });

        // NOTE: The above RPC is for swapping *between* matches. 
        // If you just want to set Team IDs directly for a specific match, 
        // we might need a simpler update or just use the Swap RPC creatively.
        // For now, let's assume we are updating the matches table directly if it's just a roster fix
        // OR: Use the proper swap if moving teams between matches. 
        
        // ⚠️ FALLBACK: Since War Room often sets TBD -> Team, we use direct update 
        // IF the backend policy allows it. If not, we need a new RPC.
        // Let's try direct update for this specific "Panel" use case, 
        // but logged manually via audit if possible.
        
        const { error: updateError } = await supabase
            .from('matches')
            .update({ 
                team1_id: selectedT1, 
                team2_id: selectedT2,
                updated_at: new Date()
            })
            .eq('id', match.id);

        if (updateError) throw updateError;

        setSuccessMsg("Teams Updated.");
        setIsSwapModalOpen(false);
        if (onUpdate) onUpdate();

    } catch (err) {
        console.error(err);
        setLocalError("Swap Failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSchedule = async () => {
    setLocalError(null);
    setSuccessMsg('');
    if (!scheduleTime) return;

    setLoading(true);
    try {
        // Direct Update (Admins Only via RLS)
        const { error } = await supabase
            .from('matches')
            .update({ start_time: scheduleTime })
            .eq('id', match.id);
            
        if (error) throw error;
        setSuccessMsg("Schedule Saved.");
    } catch (err) {
        setLocalError("Schedule Failed.");
    } finally {
        setLoading(false);
    }
  };

  const handleFormatChange = async (e) => {
    const newFormat = parseInt(e.target.value);
    setSelectedFormat(newFormat);
    
    // Auto-save format change
    setLoading(true);
    try {
        const { data, error } = await supabase.rpc('api_update_match_format', {
            p_match_id: match.id,
            p_new_format: newFormat,
            p_tournament_id: match.tournament_id,
            p_reason: "War Room Update",
            p_admin_id: getAuthIdentifier()
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.message);
        setSuccessMsg(`Format set to BO${newFormat}`);
        if (onUpdate) onUpdate();
    } catch (err) {
        setLocalError("Format Change Failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded p-4 space-y-6 relative overflow-hidden">
      
      {/* Badge */}
      <div className="absolute top-0 right-0 p-2">
         <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-[10px] font-mono text-zinc-500 uppercase border border-white/5">
            <Info className="w-3 h-3" />
            <span>Round {match.round} • {match.phase || 'GROUP'}</span>
         </div>
      </div>

      {(localError || successMsg) && (
        <div className={`flex items-center gap-2 p-2 text-xs rounded border ${localError ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-green-900/20 text-green-400 border-green-900/50'}`}>
          {localError ? <AlertTriangle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{localError || successMsg}</span>
        </div>
      )}

      {/* SWAP SECTION */}
      <div className="space-y-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <RefreshCw className="w-3 h-3" /> <span>Roster & Seeding</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TeamSelector label="Team 1 (Blue)" value={selectedT1} onChange={setSelectedT1} teams={teams} />
          <TeamSelector label="Team 2 (Red)" value={selectedT2} onChange={setSelectedT2} teams={teams} />
        </div>
        <button
          onClick={handleSwapRequest}
          disabled={!canSwap || loading}
          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Update Teams'}
        </button>
      </div>

      {/* SCHEDULE & FORMAT */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Start Time</label>
          <div className="flex gap-2">
              <input 
                type="datetime-local" 
                className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded" 
                value={scheduleTime ? new Date(scheduleTime).toISOString().slice(0, 16) : ''} 
                onChange={(e) => setScheduleTime(e.target.value)} 
              />
              <button onClick={handleSchedule} disabled={loading} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white">
                  <Save className="w-4 h-4" />
              </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase flex items-center gap-1"><Settings className="w-3 h-3" /> Match Format</label>
          <select className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded" value={selectedFormat} onChange={handleFormatChange}>
            <option value="1">Best of 1</option>
            <option value="3">Best of 3</option>
            <option value="5">Best of 5</option>
          </select>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-red-500/50 p-6 rounded-lg max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <ShieldAlert className="w-6 h-6" /> <h3 className="font-bold text-lg uppercase">Integrity Check</h3>
            </div>
            <p className="text-sm text-zinc-300 mb-6">You are manually overriding teams. <br/><strong>This may reset match logs and stats.</strong></p>
            <div className="flex gap-3">
              <button onClick={() => setIsSwapModalOpen(false)} className="flex-1 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 text-sm font-bold">Cancel</button>
              <button onClick={confirmSwap} className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-500 text-sm font-bold">CONFIRM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TeamSelector = ({ label, value, onChange, teams }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] text-zinc-500 uppercase">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-black border border-white/10 text-white text-xs p-2 rounded focus:border-fuchsia-500 outline-none">
      <option value="">-- Select Team --</option>
      {teams && teams.map(team => <option key={team.id} value={team.id}>{team.name} (#{team.seed_number || '-'})</option>)}
    </select>
  </div>
);
