import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client'; // ✅ CORRECT IMPORT

export default function AdminAuditLog({ matchId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!matchId) return;
    fetchLogs();
  }, [matchId]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('target_id', matchId)
      .order('created_at', { ascending: false });

    if (!error) setLogs(data);
    setLoading(false);
  };

  if (loading) return <div className="text-xs text-gray-400 mt-2">Loading logs...</div>;
  if (logs.length === 0) return null;

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Admin Audit Trail</h4>
      <div className="bg-gray-900 rounded p-2 max-h-40 overflow-y-auto text-xs font-mono text-gray-300">
        {logs.map((log) => (
          <div key={log.id} className="mb-1 border-b border-gray-800 pb-1 last:border-0">
            <span className="text-blue-400">[{new Date(log.created_at).toLocaleTimeString()}]</span>
            <span className="text-yellow-500 font-bold mx-2">{log.action_type}</span>
            <div className="text-gray-500 pl-4 whitespace-pre-wrap">
              {JSON.stringify(log.metadata, null, 2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
