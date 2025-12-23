import { useState, useEffect } from 'react';
import { useMatchAdmin } from '../hooks/useMatchAdmin';
import { supabase } from '../supabase/client'; 

export default function AdminMatchControls({ match, adminUser }) {
  // ⚠️ dependency: ensure useMatchAdmin.js is also updated to use real Supabase calls!
  const { swapTeams, scheduleMatch, startMatch, loadingAction, error } = useMatchAdmin();
  
  const [allTeams, setAllTeams] = useState([]);
  const [fetchingTeams, setFetchingTeams] = useState(false);
  const [showSwap, setShowSwap] = useState(false);

  // Form States
  const [selectedT1, setSelectedT1] = useState(match?.team1_id || '');
  const [selectedT2, setSelectedT2] = useState(match?.team2_id || '');
  // Safe date slicing
  const [scheduleTime, setScheduleTime] = useState(
    match?.start_time ? new Date(match.start_time).toISOString().slice(0, 16) : ''
  );

  // 1. SAFE FETCH: Scoped to Tournament
  useEffect(() => {
    if (showSwap && match?.tournament_id) {
      const fetchTeams = async () => {
        setFetchingTeams(true);
        const { data } = await supabase
          .from('teams')
          .select('id, name')
          .eq('tournament_id', match.tournament_id)
          .in('status', ['approved', 'active', 'REGISTERED']) 
          .order('name');
        
        if (data) setAllTeams(data);
        setFetchingTeams(false);
      };
      fetchTeams();
    }
  }, [showSwap, match?.tournament_id]);

  if (!adminUser) return null; 

  const isPending = match.state === 'pending';
  const isRound1or2 = match.round <= 2;

  return (
    <div className="p-4 border border-red-500/30 bg-red-950/10 rounded mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-red-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Admin Zone
        </h3>
        {loadingAction && <span className="text-[10px] font-mono text-blue-400 animate-pulse">Running: {loadingAction}...</span>}
      </div>
      
      {error && <div className="text-red-400 text-xs mb-3 font-mono bg-red-900/20 p-2 border border-red-500/50 rounded">{error}</div>}

      <div className="flex gap-2 flex-wrap items-end">
        
        {/* 🚦 START BUTTON */}
        {isPending && (
          <button 
            onClick={() => startMatch(match.id, adminUser.id)}
            disabled={loadingAction === 'start' || !match.team1_id || !match.team2_id}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loadingAction === 'start' ? 'Starting...' : 'GO LIVE'}
          </button>
        )}

        {/* 🔄 SWAP TOGGLE */}
        {isPending && isRound1or2 && (
          <button 
            onClick={() => setShowSwap(!showSwap)}
            disabled={loadingAction !== null}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded uppercase tracking-wider disabled:opacity-50 transition-all"
          >
            {showSwap ? 'Cancel Swap' : 'Manage Teams'}
          </button>
        )}

        {/* ⏰ SCHEDULE PICKER */}
        {isPending && (
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded border border-zinc-700">
            <input 
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-300 focus:ring-0 p-1 font-mono"
            />
            <button 
              onClick={() => scheduleMatch(match.id, new Date(scheduleTime).toISOString(), adminUser.id)}
              disabled={loadingAction === 'schedule'}
              className="px-3 py-1 bg-zinc-700 text-white text-[10px] font-bold uppercase rounded hover:bg-zinc-600 disabled:opacity-50 transition-all"
            >
              {loadingAction === 'schedule' ? 'Saving...' : 'Set'}
            </button>
          </div>
        )}
      </div>

      {/* 🔽 SWAP DROPDOWN PANEL */}
      {showSwap && (
        <div className="mt-4 p-4 bg-[#0b0c0f] border border-zinc-800 rounded shadow-xl animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] text-yellow-500 mb-3 font-mono uppercase">⚠️ Warning: This action logs to audit trail.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Team 1</label>
              <select 
                value={selectedT1} 
                onChange={(e) => setSelectedT1(e.target.value)}
                className="w-full bg-black border border-zinc-700 text-zinc-300 p-2 rounded text-xs focus:border-blue-500 outline-none"
                disabled={fetchingTeams}
              >
                <option value="">{fetchingTeams ? "Loading..." : "-- Empty Slot --"}</option>
                {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Team 2</label>
              <select 
                value={selectedT2} 
                onChange={(e) => setSelectedT2(e.target.value)}
                className="w-full bg-black border border-zinc-700 text-zinc-300 p-2 rounded text-xs focus:border-blue-500 outline-none"
                disabled={fetchingTeams}
              >
                <option value="">{fetchingTeams ? "Loading..." : "-- Empty Slot --"}</option>
                {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <button 
            onClick={() => swapTeams(match.id, selectedT1, selectedT2, adminUser.id)}
            disabled={loadingAction === 'swap'}
            className="mt-4 w-full bg-red-600/90 text-white text-xs font-bold py-3 rounded hover:bg-red-600 disabled:opacity-50 uppercase tracking-widest transition-all"
          >
            {loadingAction === 'swap' ? 'PROCESSING SWAP...' : 'CONFIRM SWAP'}
          </button>
        </div>
      )}
    </div>
  );
}
