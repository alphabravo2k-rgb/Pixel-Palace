import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament';
import { ScrollText, RefreshCw, AlertTriangle } from 'lucide-react';

const DetailsViewer = ({ data }) => {
  if (!data) return <span className="text-zinc-500 italic">No details</span>;
  
  // SAFEGUARD: Ensure we don't crash on non-objects
  let displayContent = data;
  if (typeof data === 'object') {
      try {
          displayContent = JSON.stringify(data, null, 2);
      } catch (e) {
          displayContent = "Invalid Data";
      }
  }

  return (
    <pre className="mt-2 p-2 bg-black/40 rounded border border-white/5 text-[10px] text-fuchsia-300 font-mono overflow-x-auto whitespace-pre-wrap">
      {displayContent}
    </pre>
  );
};

export const AdminAuditLog = () => {
  const { selectedTournamentId } = useTournament();
  const [logs, setLogs] = useState([]); // ✅ Initialize as empty array
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    if (!selectedTournamentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // ✅ SAFEGUARD: Ensure data is an array
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Audit Log Fetch Error:', err);
      setLogs([]); // Reset on error to prevent map() crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedTournamentId]);

  return (
    <div className="w-full bg-zinc-900 border border-white/10 rounded-lg overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/5 bg-zinc-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-fuchsia-500" />
          <h3 className="font-['Teko'] text-xl uppercase tracking-wider text-zinc-200">
            System Audit Log
          </h3>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700">
        {!selectedTournamentId ? (
          <div className="text-center text-zinc-500 py-10 flex flex-col items-center gap-2">
            <AlertTriangle className="w-6 h-6 opacity-50" />
            <span>Select a tournament to view logs</span>
          </div>
        ) : logs.length === 0 && !loading ? (
          <div className="text-center text-zinc-500 italic py-10">No actions recorded.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id || Math.random()} className="flex flex-col gap-1 p-3 rounded bg-zinc-950/50 border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-fuchsia-400 font-bold uppercase">[{log.action_type || 'UNKNOWN'}]</span>
                  <span className="text-zinc-400">by <span className="text-white">{log.admin_identifier || 'System'}</span></span>
                </div>
                <span className="text-zinc-600 font-mono">
                  {log.created_at ? new Date(log.created_at).toLocaleTimeString() : '-'}
                </span>
              </div>
              <DetailsViewer data={log.details} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
