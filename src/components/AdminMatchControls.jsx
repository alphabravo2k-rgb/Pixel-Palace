import React, { useState } from 'react';
import { useAdminConsole } from '../hooks/useAdminConsole'; // ✅ Using the robust hook
import { RefreshCw, Clock, ShieldAlert, Settings, Save, ArrowRightLeft } from 'lucide-react';

export const AdminMatchControls = ({ match, teams, onUpdate }) => {
  const { execute, loading } = useAdminConsole();
  
  // Local State for Selection
  const [selectedT1, setSelectedT1] = useState(match?.team1?.id || '');
  const [selectedT2, setSelectedT2] = useState(match?.team2?.id || '');
  const [scheduleTime, setScheduleTime] = useState(match?.start_time || '');
  const [selectedFormat, setSelectedFormat] = useState(match?.best_of || 1);

  // Modal State
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. ADVISORY CHECK (Backend has final say)
  const isLocked = ['live', 'completed'].includes(match.status);

  // --- ACTIONS ---

  const handleSwapRequest = async () => {
    if (reason.length < 5) {
        setLocalError("Audit Reason requires at least 5 characters.");
        return;
    }
    
    // 2. SINGLE AUTHORITY PATH: No direct DB updates. Only RPC.
    const result = await execute('api_set_match_teams', {
      p_match_id: match.id,
      p_team1_id: selectedT1,
      p_team2_id: selectedT2,
      p_reason: reason // ✅ Mandatory
    });

    if (result.success) {
      setIsSwapModalOpen(false);
      setSuccessMsg("Teams Swapped Successfully");
      setReason('');
      if (onUpdate) onUpdate();
    } else {
      setLocalError(result.message);
    }
  };

  const handleSchedule = async () => {
    // Ideally this should also be an RPC, but for now we keep the direct update 
    // IF and ONLY IF it's not a integrity-critical logic change. 
    // Note: Scheduling is safer than Roster Swaps, so direct update is acceptable for now.
    const result = await execute('api_update_match_schedule', { // You'll need this RPC eventually
        p_match_id: match.id,
        p_start_time: scheduleTime
    });
    // Fallback to direct update if you haven't made the schedule RPC yet
    // But wrapping it in execute() ensures we handle auth/loading correctly.
  };

  const handleFormatChange = async (e) => {
    const newFormat = parseInt(e.target.value);
    setSelectedFormat(newFormat);

    const result = await execute('admin_update_match_format', {
        p_match_id: match.id,
        p_best_of: newFormat
    });

    if (result.success) {
        setSuccessMsg(`Format set to BO${newFormat}`);
        if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded p-4 space-y-6 relative overflow-hidden">
      
      {(localError || successMsg) && (
        <div className={`flex items-center gap-2 p-2 text-xs rounded border ${localError ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-green-900/20 text-green-400 border-green-900/50'}`}>
          {localError ? <ShieldAlert className="w-4 h-4" /> : <Save className="w-4 h-4" />}
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
          onClick={() => setIsSwapModalOpen(true)}
          disabled={isLocked || loading}
          className={`
            w-full py-2 text-xs font-bold uppercase rounded transition-colors flex items-center justify-center gap-2
            ${isLocked 
                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'}
          `}
        >
          {loading ? 'Processing...' : isLocked ? 'Locked (Live Match)' : <><ArrowRightLeft size={14}/> Request Team Swap</>}
        </button>
      </div>

      {/* SCHEDULE & FORMAT */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Start Time</label>
          <input 
            type="datetime-local" 
            className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded focus:border-fuchsia-500 outline-none" 
            value={scheduleTime ? new Date(scheduleTime).toISOString().slice(0, 16) : ''} 
            onChange={(e) => setScheduleTime(e.target.value)} 
          />
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

      {/* 🛡️ INTEGRITY MODAL */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-white/10 p-6 rounded-lg max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-fuchsia-500 border-b border-white/10 pb-4">
              <ShieldAlert className="w-6 h-6" /> 
              <div>
                 <h3 className="font-bold text-lg uppercase leading-none">Integrity Check</h3>
                 <p className="text-[10px] text-zinc-500 font-mono">MODIFYING MATCH {match.id.substring(0,8)}</p>
              </div>
            </div>
            
            <p className="text-sm text-zinc-300 mb-4 bg-blue-900/10 border border-blue-500/20 p-3 rounded">
                You are requesting to manually set the teams for this match. This action will be audited.
            </p>

            <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Required Justification</label>
            <textarea
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this swap necessary?"
                className="w-full bg-black border border-white/10 p-3 rounded text-sm h-24 mb-4 focus:border-fuchsia-500 outline-none"
            />

            <div className="flex gap-3">
              <button onClick={() => setIsSwapModalOpen(false)} className="flex-1 py-3 bg-zinc-800 text-white rounded hover:bg-zinc-700 text-xs font-bold uppercase">Cancel</button>
              <button 
                onClick={handleSwapRequest} 
                disabled={reason.length < 5 || loading}
                className="flex-1 py-3 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-500 text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Swap
              </button>
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
