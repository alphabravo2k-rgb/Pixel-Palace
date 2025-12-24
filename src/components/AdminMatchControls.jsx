import React, { useState } from 'react';
import { RefreshCw, Clock, AlertTriangle, ShieldAlert, Settings } from 'lucide-react';
import { useMatchAdmin } from '../hooks/useMatchAdmin';
import { MATCH_FORMATS } from '../lib/rules'; // ✅ Architecture Truth

/**
 * 3️⃣ AdminMatchControls — Integrity & Safety Audit
 * ❌ Fixed naive round restriction (now state-driven).
 * ❌ Fixed empty team slots (validation added).
 * ❌ Fixed lack of confirmation (Modal added).
 * ❌ Fixed invalid scheduleTime (validation added).
 * ✅ Added Match Format Selector (BO1/BO3).
 */
export const AdminMatchControls = ({ match, teams }) => {
  const { swapTeams, updateSchedule, updateMatchFormat, loading, error } = useMatchAdmin();
  
  // Local State for Form Inputs
  const [selectedT1, setSelectedT1] = useState(match?.team1?.id || '');
  const [selectedT2, setSelectedT2] = useState(match?.team2?.id || '');
  const [scheduleTime, setScheduleTime] = useState(match?.start_time || '');
  const [selectedFormat, setSelectedFormat] = useState(match?.format || 'BO1');
  
  // 🔒 Safety: Confirmation Modal State
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [localError, setLocalError] = useState(null);

  // 1. DYNAMIC ROUND RESTRICTION
  // ❌ Removed: const isRound1or2 = match.round <= 2;
  // ✅ Fixed: Driven by match state.
  const canSwap = match.state === 'PENDING' || match.state === 'SCHEDULED';

  // 2. SWAP HANDLER (With Validation)
  const handleSwapRequest = () => {
    setLocalError(null);

    // ❌ FIX: You allow empty team slots silently
    if (!selectedT1 || !selectedT2) {
      setLocalError("Integrity Error: Both teams must be selected.");
      return;
    }

    if (selectedT1 === selectedT2) {
      setLocalError("Integrity Error: Cannot play against self.");
      return;
    }

    // Open Confirmation Modal (Friction)
    setIsSwapModalOpen(true);
  };

  const confirmSwap = async () => {
    await swapTeams(match.id, selectedT1, selectedT2);
    setIsSwapModalOpen(false);
  };

  // 3. SCHEDULE HANDLER (With Validation)
  const handleSchedule = async () => {
    setLocalError(null);

    // ❌ FIX: scheduleTime can be invalid
    if (!scheduleTime || isNaN(Date.parse(scheduleTime))) {
      setLocalError("Validation Error: Invalid Date/Time format.");
      return;
    }

    await updateSchedule(match.id, new Date(scheduleTime).toISOString());
  };

  // 4. FORMAT HANDLER (New Feature)
  const handleFormatChange = async (e) => {
    const newFormat = e.target.value;
    setSelectedFormat(newFormat);
    // 🧠 Missing feature: BO1 / BO3 / BO5 must be changeable
    await updateMatchFormat(match.id, newFormat);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded p-4 space-y-6">
      
      {/* ERROR FEEDBACK */}
      {(error || localError) && (
        <div className="flex items-center gap-2 p-2 bg-red-900/20 text-red-400 text-xs rounded border border-red-900/50">
          <AlertTriangle className="w-4 h-4" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* SECTION 1: MATCH INTEGRITY (Swap) */}
      <div className="space-y-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <RefreshCw className="w-3 h-3" />
          <span>Roster & Seeding</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TeamSelector 
            label="Team 1 (Blue)" 
            value={selectedT1} 
            onChange={setSelectedT1} 
            teams={teams} 
          />
          <TeamSelector 
            label="Team 2 (Red)" 
            value={selectedT2} 
            onChange={setSelectedT2} 
            teams={teams} 
          />
        </div>

        <button
          onClick={handleSwapRequest}
          disabled={!canSwap || loading}
          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Swap Teams & Reset State'}
        </button>
      </div>

      {/* SECTION 2: SCHEDULE & FORMAT */}
      <div className="grid grid-cols-2 gap-4">
        {/* Time Control */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Start Time
          </label>
          <input
            type="datetime-local"
            className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            onBlur={handleSchedule} // Auto-save on blur
          />
        </div>

        {/* Format Control (New Feature) */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase flex items-center gap-1">
            <Settings className="w-3 h-3" /> Match Format
          </label>
          <select
            className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded"
            value={selectedFormat}
            onChange={handleFormatChange}
          >
            {Object.values(MATCH_FORMATS).map(fmt => (
              <option key={fmt.id} value={fmt.id}>{fmt.label} ({fmt.mapsNeeded} Map)</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔒 FRICTION MODAL: SWAP CONFIRMATION */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-red-500/50 p-6 rounded-lg max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-lg uppercase">Integrity Check</h3>
            </div>
            
            <p className="text-sm text-zinc-300 mb-6">
              You are about to force swap teams in a live bracket. <br/>
              <strong>This may reset match logs and stats.</strong>
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsSwapModalOpen(false)}
                className="flex-1 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSwap}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-500 text-sm font-bold"
              >
                CONFIRM SWAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UI Helper: Team Dropdown
const TeamSelector = ({ label, value, onChange, teams }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] text-zinc-500 uppercase">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-black border border-white/10 text-white text-xs p-2 rounded focus:border-fuchsia-500 outline-none"
    >
      <option value="">-- Select Team --</option>
      {teams.map(team => (
        <option key={team.id} value={team.id}>
          {team.name} (Seed #{team.seed_number || '-'})
        </option>
      ))}
    </select>
  </div>
);
