import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { ScrollText, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

export const AdminAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    // Fetch logs - ordering by most recent first
    const { data } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    setLogs(data || []);
    setLoading(false);
  };

  // 🛡️ SMART PARSER: Turns raw JSON into human-readable context
  const renderDetails = (log) => {
    const d = log.details || {};
    // Fallback: Check 'reason' column first, then inside details JSON
    const reason = log.reason || d.reason; 

    return (
      <div className="space-y-1">
        {/* 1. The "Why" (Mandatory for Force Actions) */}
        {reason && (
          <div className="text-amber-500 text-[10px] font-mono uppercase border-l-2 border-amber-500/50 pl-2 mb-1 flex items-center gap-2">
            <span className="font-bold">REASON:</span> {reason}
          </div>
        )}

        {/* 2. The "What" (Diff View) */}
        {d.old_role && d.new_role && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="line-through opacity-50">{d.old_role}</span>
            <ArrowRight size={10} className="text-zinc-600" />
            <span className="text-white font-bold">{d.new_role}</span>
          </div>
        )}

        {d.match_id && (
            <span className="text-[10px] text-zinc-500 font-mono block">Match: {d.match_id.substring(0,8)}</span>
        )}

        {/* Fallback for generic details if specific views don't match */}
        {Object.keys(d).length > 0 && !d.old_role && !d.match_id && !d.reason && (
           <code className="text-[10px] text-zinc-600 block max-w-xs truncate font-mono">
             {JSON.stringify(d)}
           </code>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-zinc-900 border border-white/10 rounded-lg flex flex-col h-[600px]">
      {/* Header */}
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

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/40 text-zinc-500 font-mono text-[10px] uppercase sticky top-0 backdrop-blur-sm z-10">
            <tr>
              <th className="p-3 bg-zinc-950/90">Timestamp</th>
              <th className="p-3 bg-zinc-950/90">Operator</th>
              <th className="p-3 bg-zinc-950/90">Action Class</th>
              <th className="p-3 bg-zinc-950/90">Context & Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center text-zinc-600 py-12 italic">No audit records found yet.</td>
                </tr>
            ) : (
                logs.map((log) => {
                // Determine styling based on action severity
                const actionName = log.action_name || log.action; // Fallback support
                const isForce = actionName?.includes('FORCE') || actionName?.includes('KICK');
                const isSync = actionName?.includes('SYNC');
                
                return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 text-zinc-500 text-xs whitespace-nowrap align-top">
                        {new Date(log.created_at).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    
                    {/* 🕵️ OPERATOR FINGERPRINT */}
                    <td className="p-3 align-top">
                        <span className="font-mono text-xs text-fuchsia-400 bg-fuchsia-900/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20">
                            OP:{log.admin_id ? log.admin_id.substring(0, 6) : 'SYSTEM'}
                        </span>
                    </td>

                    {/* ACTION BADGE */}
                    <td className="p-3 align-top">
                        <span className={`
                        px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                        ${isForce 
                            ? 'bg-red-900/20 text-red-500 border-red-500/30' 
                            : isSync 
                                ? 'bg-blue-900/20 text-blue-400 border-blue-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'}
                        `}>
                        {actionName?.replace(/_/g, ' ') || 'UNKNOWN'}
                        </span>
                    </td>

                    {/* CONTEXT */}
                    <td className="p-3 align-top text-zinc-300">
                        {renderDetails(log)}
                    </td>
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
