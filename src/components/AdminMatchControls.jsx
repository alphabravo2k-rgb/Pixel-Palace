import { useState, useEffect } from 'react';
import { useMatchAdmin } from '../hooks/useMatchAdmin';
import { supabase } from '../supabase/client'; // ✅ CORRECT IMPORT

export default function AdminMatchControls({ match, adminUser }) {
  const { swapTeams, scheduleMatch, startMatch, loadingAction, error } = useMatchAdmin();
  const [allTeams, setAllTeams] = useState([]);
  const [showSwap, setShowSwap] = useState(false);

  // Form States
  const [selectedT1, setSelectedT1] = useState(match.team1_id);
  const [selectedT2, setSelectedT2] = useState(match.team2_id);
  const [scheduleTime, setScheduleTime] = useState(match.start_time ? match.start_time.slice(0, 16) : '');

  // 1. SAFE FETCH: Scoped to Tournament
  useEffect(() => {
    if (showSwap && match.tournament_id) {
      const fetchTeams = async () => {
        const { data } = await supabase
          .from('teams')
          .select('id, name')
          .eq('tournament_id', match.tournament_id)
          .in('status', ['approved', 'active', 'REGISTERED']) 
          .order('name');
        setAllTeams(data || []);
      };
      fetchTeams();
    }
  }, [showSwap, match.tournament_id]);

  if (!adminUser) return null; 

  const isPending = match.state === 'pending';
  const isRound1or2 = match.round <= 2;

  return (
    <div className="p-4 border border-red-500 bg-red-50 rounded mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-red-800 font-bold text-xs uppercase">Admin Zone</h3>
        {loadingAction && <span className="text-xs font-mono text-blue-600 animate-pulse">Running: {loadingAction}...</span>}
      </div>
      
      {error && <div className="text-red-600 text-sm mb-2 font-mono bg-white p-1 border border-red-200">{error}</div>}

      <div className="flex gap-2 flex-wrap items-end">
        
        {/* 🚦 START BUTTON */}
        {isPending && (
          <button 
            onClick={() => startMatch(match.id, adminUser.id)}
            disabled={loadingAction === 'start' || !match.team1_id || !match.team2_id}
            className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === 'start' ? 'Starting...' : 'GO LIVE'}
          </button>
        )}

        {/* 🔄 SWAP TOGGLE */}
        {isPending && isRound1or2 && (
          <button 
            onClick={() => setShowSwap(!showSwap)}
            disabled={loadingAction !== null}
            className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {showSwap ? 'Cancel Swap' : 'Manage Teams'}
          </button>
        )}

        {/* ⏰ SCHEDULE PICKER */}
        {isPending && (
          <div className="flex items-center gap-2 bg-white p-1 rounded border">
            <input 
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="border-none text-sm focus:ring-0 p-1"
            />
            <button 
              onClick={() => scheduleMatch(match.id, new Date(scheduleTime).toISOString(), adminUser.id)}
              disabled={loadingAction === 'schedule'}
              className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {loadingAction === 'schedule' ? 'Saving...' : 'Set'}
            </button>
          </div>
        )}
      </div>

      {/* 🔽 SWAP DROPDOWN PANEL */}
      {showSwap && (
        <div className="mt-4 p-3 bg-white border rounded shadow-sm">
          <p className="text-xs text-gray-500 mb-2 font-mono">⚠️ Action logged. Affects seeding.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700">Team 1</label>
              <select 
                value={selectedT1 || ''} 
                onChange={(e) => setSelectedT1(e.target.value)}
                className="w-full border p-1 rounded text-sm mt-1"
              >
                <option value="">-- Empty Slot --</option>
                {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700">Team 2</label>
              <select 
                value={selectedT2 || ''} 
                onChange={(e) => setSelectedT2(e.target.value)}
                className="w-full border p-1 rounded text-sm mt-1"
              >
                <option value="">-- Empty Slot --</option>
                {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <button 
            onClick={() => swapTeams(match.id, selectedT1, selectedT2, adminUser.id)}
            disabled={loadingAction === 'swap'}
            className="mt-3 w-full bg-red-600 text-white text-sm font-bold py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loadingAction === 'swap' ? 'PROCESSING SWAP...' : 'CONFIRM SWAP'}
          </button>
        </div>
      )}
    </div>
  );
}ss
