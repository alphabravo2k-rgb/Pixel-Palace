import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { ScrollText, RefreshCw, ShieldAlert, FileJson, Terminal, Activity } from 'lucide-react';
import { useSession } from '../../auth/useSession';
import { ROLES } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export const AdminAuditLog = () => {
  const { session } = useSession();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🛡️ SECURITY: Only Admins/Owners can view logs
  const canViewLogs = [ROLES.OWNER, ROLES.ADMIN].includes(session?.role);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Logs + Attempt to join with app_admins to get the name
      // Note: This relies on a Foreign Key existing. If not, it falls back gracefully.
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select(`
            id, created_at, operator_id, action_type, details, target,
            app_admins:operator_id ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error.message);
      // Fallback fetch if the join failed
      const { data } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 REAL-TIME SUBSCRIPTION
  useEffect(() => {
    if (!canViewLogs) return;

    fetchLogs();

    // Listen for ANY new log entry from ANY component
    const channel = supabase.channel('audit-live')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'admin_audit_logs' }, 
            (payload) => {
                // Prepend the new log instantly
                setLogs(prev => [payload.new, ...prev]);
            }
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, [canViewLogs, fetchLogs]);

  if (!canViewLogs) {
    return (
      <div className="p-12 text-center border border-red-900/50 bg-red-950/10 rounded-lg flex flex-col items-center gap-4 animate-in fade-in">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
            <h3 className="text-red-500 font-black text-xl uppercase tracking-widest">Restricted Access</h3>
            <p className="text-red-400/60 text-xs font-mono mt-1">Audit Clearance Level 5 Required</p>
        </div>
      </div>
    );
  }

  const renderDetails = (log) => {
    let d = log.details || {};
    
    // 🛡️ SAFELY HANDLE DATA TYPES (JSONB vs Text)
    try {
        if (typeof d === 'string') d = JSON.parse(d);
    } catch (e) {
        // Keep as string if parse fails
    }

    const isObj = typeof d === 'object' && d !== null;
    const displayString = isObj ? JSON.stringify(d, null, 2) : String(d);

    return (
      <div className="space-y-1.5 w-full">
        {log.target && (
            <div className="flex items-center gap-2">
                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 rounded uppercase font-bold tracking-wider">TARGET</span>
                <span className="text-zinc-300 text-xs font-mono truncate max-w-[200px]" title={log.target}>{log.target}</span>
            </div>
        )}
        <div className="relative group">
            <pre className="text-[10px] text-brand-glow/80 font-mono bg-black/40 border border-white/5 p-2 rounded overflow-x-auto whitespace-pre-wrap max-h-32 custom-scrollbar">
                {displayString}
            </pre>
            {isObj && <FileJson size={10} className="absolute top-2 right-2 text-zinc-600 opacity-50" />}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#0b0c0f] border border-zinc-800 rounded-lg flex flex-col h-[600px] shadow-lg animate-in fade-in">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center border border-white/5">
                <ScrollText className="w-4 h-4 text-fuchsia-500" />
            </div>
            <div>
                <h3 className="font-display text-xl font-black uppercase text-white leading-none tracking-wide">Immutable Audit Trail</h3>
                <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                    <Activity size={10} className="text-green-500 animate-pulse" /> LIVE FEED // ENCRYPTED
                </p>
            </div>
        </div>
        <button 
            onClick={fetchLogs} 
            disabled={loading}
            className="p-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded transition-colors border border-transparent hover:border-white/10"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-fuchsia-500")} />
        </button>
      </div>

      {error && (
        <div className="p-4 text-center text-red-500 bg-red-950/20 text-xs font-bold uppercase border-b border-red-900/20">{error}</div>
      )}

      {/* Table Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-zinc-950/90 text-zinc-500 font-mono text-[10px] uppercase sticky top-0 backdrop-blur-md z-10 shadow-sm">
            <tr>
              <th className="p-3 border-b border-white/5 w-40">Timestamp</th>
              <th className="p-3 border-b border-white/5 w-32">Operator</th>
              <th className="p-3 border-b border-white/5 w-48">Action</th>
              <th className="p-3 border-b border-white/5">Payload Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length === 0 ? (
                <tr><td colSpan="4" className="text-center text-zinc-600 py-20 italic font-mono uppercase tracking-widest">No audit records found.</td></tr>
            ) : (
                logs.map((log) => {
                const actionName = log.action_type || 'UNKNOWN';
                
                // Color coding actions
                const isDestructive = ['DELETE', 'KICK', 'BAN', 'FORCE', 'RESET'].some(k => actionName.includes(k));
                const isAuth = ['LOGIN', 'REGISTER', 'PROMOTE'].some(k => actionName.includes(k));
                const isUpdate = ['UPDATE', 'SWAP', 'CHANGE'].some(k => actionName.includes(k));
                
                // Resolving Operator Name
                const operatorName = log.app_admins?.full_name || 'System / Unlinked';
                const operatorDisplay = log.operator_id ? operatorName : 'SYSTEM';

                return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4 text-zinc-500 text-xs whitespace-nowrap align-top font-mono">
                            {format(new Date(log.created_at), 'MMM dd HH:mm:ss')}
                            <span className="block text-[9px] opacity-50">{format(new Date(log.created_at), 'yyyy')}</span>
                        </td>
                        
                        <td className="p-4 align-top">
                            <span className="font-mono text-[10px] text-fuchsia-300 bg-fuchsia-900/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20 whitespace-nowrap" title={log.operator_id}>
                                {operatorDisplay}
                            </span>
                        </td>
                        
                        <td className="p-4 align-top">
                            <span className={cn(
                                "px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border shadow-sm block w-fit",
                                isDestructive ? "bg-red-950/40 text-red-500 border-red-500/30" : 
                                isAuth ? "bg-blue-950/40 text-blue-400 border-blue-500/30" :
                                isUpdate ? "bg-yellow-950/40 text-yellow-500 border-yellow-500/30" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                            )}>
                                {actionName.replace(/_/g, ' ')}
                            </span>
                        </td>
                        
                        <td className="p-4 align-top text-zinc-300">
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
