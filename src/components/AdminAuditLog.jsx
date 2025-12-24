import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, RefreshCw, User, Clock, Activity } from 'lucide-react';

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

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
      {/* HEADER */}
      <div className="flex items-center justify-between p-3 bg-black/50 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-400">
          <FileText className="w-4 h-4" />
          <span className="uppercase font-bold tracking-wider">System Audit Trail</span>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="hover:text-white text-zinc-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* LOG LIST */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-zinc-600 sticky top-0">
            <tr>
              <th className="p-3 font-normal">TIMESTAMP</th>
              <th className="p-3 font-normal">ADMIN</th>
              <th className="p-3 font-normal">ACTION</th>
              <th className="p-3 font-normal">DETAILS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-zinc-600 italic">No activity recorded.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 text-zinc-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 text-fuchsia-400 font-bold">
                    {log.admin_identifier || 'SYSTEM'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                      log.action_type.includes('SWAP') ? 'bg-orange-900/20 text-orange-400 border-orange-500/30' :
                      log.action_type.includes('GENERATE') ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30' :
                      log.action_type.includes('SYNC') ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' :
                      'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400 break-all">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
