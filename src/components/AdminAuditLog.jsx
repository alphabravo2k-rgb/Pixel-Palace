import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { FileText, RefreshCw } from 'lucide-react';

export const AdminAuditLog = ({ limit = 50 }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (data) setLogs(data);
    if (error) console.error("Audit Log Error:", error);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between p-3 bg-black/50 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-400">
          <FileText className="w-4 h-4" />
          <span className="uppercase font-bold tracking-wider">System Audit Trail</span>
        </div>
        <button onClick={fetchLogs} disabled={loading} className="hover:text-white text-zinc-500">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-zinc-600 sticky top-0">
            <tr><th className="p-3">TIME</th><th className="p-3">ADMIN</th><th className="p-3">ACTION</th><th className="p-3">DETAILS</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5">
                <td className="p-3 text-zinc-500">{new Date(log.created_at).toLocaleTimeString()}</td>
                <td className="p-3 text-fuchsia-400">{log.admin_identifier || 'SYSTEM'}</td>
                <td className="p-3"><span className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">{log.action_type}</span></td>
                <td className="p-3 text-zinc-400 break-all">{JSON.stringify(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
