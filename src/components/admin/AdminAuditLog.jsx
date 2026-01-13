import React, { useEffect, useState } from 'react';
import { ScrollText, RefreshCw, Activity, ShieldAlert, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

/**
 * 📜 ADMIN AUDIT LOG: GLOBAL OVERSIGHT
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // REAL-TIME SYNCED
 * PURPOSE: Displays a live feed of all strategic decisions (Vetoes/Picks) across the event.
 */
export const AdminAuditLog = ({ className, limit = 50 }) => {
  const { can } = useNexus();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 🛡️ SECURITY: Verify Level 90+ Clearance
  const canView = can('CAP_VIEW_ADMIN_DASHBOARD');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Primary Audit Trail: Tracking every strategic decision in the ecosystem
      const { data, error } = await supabase
        .from('match_vetoes')
        .select(`
            *,
            match:matches(match_position, status),
            team:teams(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      Telemetry.log(EVENTS.ERROR, { subsystem: 'AUDIT_LOG', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canView) return;
    fetchLogs();

    // 📡 REAL-TIME SUBSCRIPTION: "Global Event Listener"
    const channel = supabase.channel('global-audit-vortex')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'match_vetoes' 
        }, () => {
            fetchLogs(); // Sync relations and update feed
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, [canView]);

  if (!canView) return (
    <div className="p-4 bg-red-900/10 border border-red-500/50 rounded flex items-center gap-3 text-red-500 text-xs font-mono">
        <ShieldAlert className="w-4 h-4" /> ACCESS DENIED: INSUFFICIENT CLEARANCE
    </div>
  );

  return (
    <div className={cn("bg-[#09090b] border border-zinc-800 rounded-lg flex flex-col shadow-2xl overflow-hidden h-full", className)}>
      
      {/* 🧩 TACTICAL HEADER */}
      <div className="p-3 border-b border-white/5 bg-zinc-900/30 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-fuchsia-500" />
            <h3 className="font-display text-xs font-black uppercase text-white tracking-[0.2em]">Global Audit Stream</h3>
        </div>
        <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"/> Link: Active
            </span>
            <button onClick={fetchLogs} disabled={loading} className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-all active:scale-95">
                <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            </button>
        </div>
      </div>

      {/* 📜 THE LOG VORTEX */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 p-0">
        <div className="divide-y divide-white/5">
            {logs.length === 0 ? (
                <div className="p-12 text-center text-zinc-700 text-[10px] font-mono italic flex flex-col items-center gap-3 opacity-50">
                    <Activity className="w-8 h-8 opacity-20 animate-pulse"/>
                    SCANNING FOR TACTICAL DATA...
                </div>
            ) : (
                logs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-fuchsia-500/[0.03] transition-all text-xs border-l-2 border-transparent hover:border-fuchsia-500 group relative">
                        {/* Time Signature */}
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                                "font-black font-mono text-[9px] uppercase px-2 py-0.5 rounded-sm border",
                                log.type === 'BAN' 
                                    ? "text-red-400 bg-red-950/40 border-red-500/20" 
                                    : "text-emerald-400 bg-emerald-950/40 border-emerald-500/20"
                            )}>
                                {log.type === 'BAN' ? '🚫 BANNED' : '✅ PICKED'}
                            </span>
                            <span className="text-[9px] text-zinc-600 font-mono group-hover:text-zinc-400">
                                {format(new Date(log.created_at), 'HH:mm:ss:SSS')}
                            </span>
                        </div>
                        
                        {/* Action Details */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-zinc-100 font-bold tracking-tight">{log.team?.name}</span>
                            <span className="text-zinc-600 text-[9px] uppercase font-mono tracking-widest italic">Targeted</span>
                            <span className="text-fuchsia-400 font-mono font-bold bg-fuchsia-500/10 px-1 rounded">{log.map_name}</span>
                        </div>

                        {/* Match Metadata */}
                        <div className="mt-2 flex items-center gap-3 text-[9px] text-zinc-600 font-mono">
                            <span className="flex items-center gap-1">
                                <ScrollText className="w-3 h-3" /> Match ID #{log.match?.match_position}
                            </span>
                            <span className={cn(
                                "uppercase px-1 rounded-sm",
                                log.match?.status === 'live' ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-500"
                            )}>
                                [{log.match?.status}]
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
