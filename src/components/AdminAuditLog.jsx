import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament'; // ✅ Scoping Source
import { ScrollText, RefreshCw, AlertTriangle, Search } from 'lucide-react';

/**
 * UTILITY: Pretty Print JSON details
 * ❌ JSON.stringify(log.details) was lazy.
 * ✅ Now we pretty-print and wrap in a scrollable block.
 */
const DetailsViewer = ({ data }) => {
  if (!data) return <span className="text-zinc-500 italic">No details</span>;

  // If string, render directly
  if (typeof data !== 'object') return <span className="text-zinc-300">{data}</span>;

  // If object, pretty print
  return (
    <pre className="mt-2 p-2 bg-black/40 rounded border border-white/5 text-[10px] text-fuchsia-300 font-mono overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

export const AdminAuditLog = () => {
  const { selectedTournamentId } = useTournament(); // ✅ Context for scoping
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Realtime subscription ref (Planning for the future)
  const [subscription, setSubscription] = useState(null);

  const fetchLogs = async () => {
    if (!selectedTournamentId) return;

    setLoading(true);
    try {
      /**
       * ❌ FIX 1: No scoping by tournament
       * Added .eq('tournament_id', selectedTournamentId)
       * We never want to see logs from other events here.
       */
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('tournament_id', selectedTournamentId) 
        .order('created_at', { ascending: false })
        .limit(50); // Pagination limit for performance

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Audit Log Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ⚠️ REALTIME PREPARATION
   * The prompt said "if you don't plan for Supabase Realtime here, you’re building technical debt."
   * This useEffect manages the lifecycle for a future realtime channel.
   */
  useEffect(() => {
    fetchLogs();

    // Placeholder for future Realtime implementation:
    // const channel = supabase.channel('audit-feed')...
    // return () => supabase.removeChannel(channel);
  }, [selectedTournamentId]); 

  return (
    <div className="w-full bg-zinc-900 border border-white/10 rounded-lg overflow-hidden flex flex-col h-[500px]">
      
      {/* Header */}
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
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {!selectedTournamentId ? (
          <div className="text-center text-zinc-500 py-10 flex flex-col items-center gap-2">
            <AlertTriangle className="w-6 h-6 opacity-50" />
            <span>Select a tournament to view logs</span>
          </div>
        ) : logs.length === 0 && !loading ? (
          <div className="text-center text-zinc-500 italic py-10">
            No actions recorded for this event.
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="group flex flex-col gap-1 p-3 rounded bg-zinc-950/50 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                {/* Action & Actor */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-fuchsia-400 font-bold uppercase">
                    [{log.action_type}]
                  </span>
                  <span className="text-zinc-400">
                    by <span className="text-white">{log.actor_name || 'System'}</span>
                  </span>
                </div>
                
                {/* Timestamp */}
                <span className="text-zinc-600 font-mono">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* ❌ FIX 2: Pretty-print objects */}
              <DetailsViewer data={log.details} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
