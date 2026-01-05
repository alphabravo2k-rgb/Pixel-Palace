import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { ScrollText, RefreshCw, ShieldAlert, FileJson, Terminal, Activity } from 'lucide-react';
import { useSession } from '../../auth/useSession';
import { ROLES } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export const AdminAuditLog = ({ className, limit = 100 }) => {
  const { session } = useSession();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 🛡️ SECURITY: Only Admins/Owners can view
  const canViewLogs = [ROLES.OWNER, ROLES.ADMIN].includes(session?.role);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Logs with Operator Name (Joined)
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select(`
            id, created_at, operator_id, action_type, details, target,
            app_admins:operator_id ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Audit Log Sync Error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // 🔄 REAL-TIME DATABASE LISTENER
  useEffect(() => {
    if (!canViewLogs) return;

    fetchLogs();

    const channel = supabase.channel('audit-trail-live')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'admin_audit_logs' }, 
            (payload) => {
                // Optimistically prepend new log (Name lookup might be delayed, handled by UI)
                setLogs(prev => [payload.new, ...prev]);
            }
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, [canViewLogs, fetchLogs]);

  if (!canViewLogs) return null;

  const renderDetails = (log) => {
    let d = log.details || {};
    try { if (typeof d === 'string') d = JSON.parse(d); } catch (e) {}
    const isObj = typeof d === 'object' && d !== null;
    const displayString = isObj ? JSON.stringify(d, null, 2) : String(d);

    return (
      <div className="space-y-1 w-full max-w-full overflow-hidden">
        {log.target && (
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 rounded uppercase font-bold tracking-wider">TARGET</span>
                <span className="text-zinc-300 text-[10px] font-mono truncate">{log.target}</span>
            </div>
        )}
        <div className="relative group">
            <pre className="text-[9px] text-zinc-500 font-mono bg-black/20 border border-white/5 p-1.5 rounded overflow-x-auto whitespace-pre-wrap max-h-20 custom-scrollbar">
                {displayString}
            </pre>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("bg-[#0b0c0f] border border-zinc-800 rounded-lg flex flex-col shadow-lg overflow-hidden", className)}>
      
      {/* Header */}
      <div className="p-3 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-fuchsia-500" />
            <h3 className="font-display text-sm font-black uppercase text-white tracking-wide">Live Audit Feed</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Connected
            </span>
            <button onClick={fetchLogs} disabled={loading} className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-colors">
                <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 p-0">
        <div className="divide-y divide-white/5">
            {logs.length === 0 ? (
                <div className="p-8 text-center text-zinc-700 text-xs font-mono italic">Secure logs empty.</div>
            ) : (
                logs.map((log) => {
                    const action = log.action_type || 'UNKNOWN';
                    // Color Logic
                    const isBad = ['DELETE','BAN','KICK','FORCE'].some(k => action.includes(k));
                    const isAuth = ['LOGIN','REGISTER'].some(k => action.includes(k));
                    const isEdit = ['UPDATE','CHANGE'].some(k => action.includes(k));
                    
                    const colorClass = isBad ? "text-red-400" : isAuth ? "text-blue-400" : isEdit ? "text-yellow-400" : "text-zinc-400";
                    const operatorName = log.app_admins?.full_name || 'System';

                    return (
                        <div key={log.id} className="p-3 hover:bg-white/[0.02] transition-colors text-xs border-l-2 border-transparent hover:border-fuchsia-500/50">
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn("font-bold font-mono text-[10px] uppercase", colorClass)}>{action.replace(/_/g, ' ')}</span>
                                <span className="text-[9px] text-zinc-600 font-mono">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-500">OP</div>
                                <span className="text-zinc-400 text-[10px]">{operatorName}</span>
                            </div>
                            {renderDetails(log)}
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
};
