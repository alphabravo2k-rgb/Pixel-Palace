import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { ScrollText, RefreshCw, ShieldAlert } from 'lucide-react';
import { useCapabilities } from '../../auth/useCapabilities';
import { PERM_CAPABILITIES } from '../../lib/permissions.actions';

export const AdminAuditLog = () => {
  const { can } = useCapabilities();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canViewLogs = can(PERM_CAPABILITIES.VIEW_HIDDEN_DATA);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('id, created_at, operator_id, action_type, details, target')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error.message);
      setError('Error loading logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canViewLogs) fetchLogs();
  }, [canViewLogs, fetchLogs]);

  if (!canViewLogs) {
    return (
      <div className="p-8 text-center border border-red-900/50 bg-red-900/10 rounded flex flex-col items-center gap-2">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <span className="text-red-400 font-bold text-xs uppercase tracking-widest">Audit Access Denied</span>
      </div>
    );
  }

  const renderDetails = (log) => {
    let d = log.details || {};
    
    // 🛡️ SAFELY HANDLE HYBRID DATA (Strings vs Objects)
    try {
        if (typeof d === 'string') d = JSON.parse(d);
    } catch (e) {
        // If parsing fails, keep it as a string
    }

    const displayString = typeof d === 'object' ? JSON.stringify(d, null, 2) : String(d);

    return (
      <div className="space-y-1">
        {log.target && (
            <div className="text-fuchsia-400 text-[10px] font-mono font-bold uppercase mb-1">
                TARGET: {log.target}
            </div>
        )}
        <pre className="text-[10px] text-zinc-500 block max-w-xs overflow-x-auto font-mono bg-black/20 p-1 rounded">
            {displayString.substring(0, 200)}
        </pre>
      </div>
    );
  };

  return (
    <div className="w-full bg-zinc-900 border border-white/10 rounded-lg flex flex-col h-[600px]">
      <div className="p-4 border-b border-white/5 bg-zinc-950 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center border border-white/5">
                <ScrollText className="w-4 h-4 text-fuchsia-500" />
            </div>
            <div>
                <h3 className="font-['Teko'] text-xl uppercase text-white leading-none">Immutable Audit Trail</h3>
                <p className="text-[10px] text-zinc-500 font-mono">TRACKING LAST 50 OPERATIONS</p>
            </div>
        </div>
        <button onClick={fetchLogs} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 text-center text-red-500">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/40 text-zinc-500 font-mono text-[10px] uppercase sticky top-0 backdrop-blur-sm z-10">
            <tr>
              <th className="p-3 bg-zinc-950/90">Timestamp</th>
              <th className="p-3 bg-zinc-950/90">Operator</th>
              <th className="p-3 bg-zinc-950/90">Action</th>
              <th className="p-3 bg-zinc-950/90">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length === 0 ? (
                <tr><td colSpan="4" className="text-center text-zinc-600 py-12 italic">No records found.</td></tr>
            ) : (
                logs.map((log) => {
                const actionName = log.action_type || 'UNKNOWN';
                const isForce = actionName.includes('DELETE') || actionName.includes('KICK') || actionName.includes('FORCE');
                
                return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 text-zinc-500 text-xs whitespace-nowrap align-top">
                        {new Date(log.created_at).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td className="p-3 align-top">
                        <span className="font-mono text-xs text-fuchsia-400 bg-fuchsia-900/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20">
                            OP:{log.operator_id ? log.operator_id.substring(0, 6) : 'SYSTEM'}
                        </span>
                    </td>
                    <td className="p-3 align-top">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isForce ? 'bg-red-900/20 text-red-500 border-red-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                        {actionName.replace(/_/g, ' ')}
                        </span>
                    </td>
                    <td className="p-3 align-top text-zinc-300">{renderDetails(log)}</td>
                    </tr>
                );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
