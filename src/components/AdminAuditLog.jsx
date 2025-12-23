import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export default function AdminAuditLog({ matchId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    
    // 🛡️ RACE CONDITION FIX: Abort flag
    let isMounted = true;

    const fetchLogs = async () => {
      setLoading(true); // Reset loading on ID change
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('target_id', matchId)
        .order('created_at', { ascending: false });

      // Only update if component is still mounted and ID hasn't changed
      if (isMounted) {
        if (!error && data) setLogs(data);
        setLoading(false);
      }
    };

    fetchLogs();

    const channel = supabase
      .channel(`audit-${matchId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'admin_audit_logs', 
          filter: `target_id=eq.${matchId}` 
        },
        (payload) => {
          if (isMounted) {
            setLogs((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false; // Cancel updates for this ID
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  if (loading) return <div className="text-[10px] text-zinc-500 mt-2 font-mono animate-pulse">Syncing Audit Trail...</div>;
  if (logs.length === 0) return null;

  return (
    <div className="mt-6 border-t border-zinc-800 pt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Audit Feed</h4>
      </div>
      
      <div className="bg-black/40 rounded border border-zinc-800/50 p-2 max-h-40 overflow-y-auto font-mono custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="mb-2 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0 text-[10px]">
            <div className="flex justify-between items-center text-zinc-600 mb-0.5">
               <span className="text-emerald-500/80">[{new Date(log.created_at).toLocaleTimeString()}]</span>
               <span className="text-zinc-500 font-bold">{log.action_type}</span>
            </div>
            <div className="text-zinc-400 whitespace-pre-wrap break-all pl-2 border-l-2 border-zinc-800 ml-1">
              {typeof log.metadata === 'object' 
                ? JSON.stringify(log.metadata, null, 2).replace(/[{}"]/g, '') 
                : log.metadata}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
