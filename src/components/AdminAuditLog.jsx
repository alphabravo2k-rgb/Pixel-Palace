import React, { useEffect, useState } from 'react';
// ✅ UP ONE LEVEL IMPORTS
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { ScrollText, RefreshCw, Activity, AlertTriangle } from 'lucide-react';

export const AdminAuditLog = () => {
  const { selectedTournamentId } = useTournament();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    if (!selectedTournamentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('tournament_id', selectedTournamentId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Logs Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedTournamentId]);

  return (
    <div className="w-full bg-zinc-900 border border-white/10 rounded-lg flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/5 bg-zinc-950 flex justify-between items-center">
        <h3 className="font-['Teko'] text-xl uppercase text-zinc-200 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-fuchsia-500" /> Audit Log
        </h3>
        <button onClick={fetchLogs} className="p-2 hover:bg-white/5 rounded-full">
          <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.length === 0 ? (
          <div className="text-center text-zinc-500 py-10 italic">No logs found.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-3 bg-black/20 rounded border border-white/5 flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-fuchsia-400 font-mono uppercase">[{log.action_type}]</span>
                <span className="text-zinc-500">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono break-all">
                {JSON.stringify(log.details)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
