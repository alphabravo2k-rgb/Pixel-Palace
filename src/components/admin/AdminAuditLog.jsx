import React, { useEffect, useState } from 'react';
import { ScrollText, RefreshCw, Activity, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexusStore } from '../../store/useNexusStore';

/**
 * 📜 ADMIN AUDIT LOG: GLOBAL OVERSIGHT
 * ------------------------------------
 * STATUS: MASTERED (SCHEMA ALIGNED)
 * * PURPOSE:
 * Displays a global feed of all Veto/Pick actions across the tournament.
 * Acts as the primary "Pulse" of the event.
 */

export const AdminAuditLog = ({ className, limit = 50 }) => {
  const { role } = useNexusStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 🛡️ SECURITY: Only Admins/Owners
  const canView = ['owner', 'admin'].includes(role);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // We use 'match_vetoes' as our primary audit trail for now
      const { data, error } = await supabase
        .from('match_vetoes')
        .select(`
            *,
            match:matches(match_position),
            team:teams(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Audit Sync Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canView) return;
    fetchLogs();

    const channel = supabase.channel('global-audit')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_vetoes' }, (payload) => {
            fetchLogs(); // Refresh to get relations
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, [canView]);

  if (!canView) return null;

  return (
    <div className={cn("bg-[#0b0c0f] border border-zinc-800 rounded-lg flex flex-col shadow-lg overflow-hidden h-full", className)}>
      
      {/* Header */}
      <div className="p-3 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-fuchsia-500" />
            <h3 className="font-display text-sm font-black uppercase text-white tracking-wide">Global Event Stream</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Live
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
                <div className="p-8 text-center text-zinc-700 text-xs font-mono italic flex flex-col items-center gap-2">
                    <Activity className="w-6 h-6 opacity-20"/>
                    No tactical events recorded.
                </div>
            ) : (
                logs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-white/[0.02] transition-colors text-xs border-l-2 border-transparent hover:border-fuchsia-500/50 group">
                        <div className="flex justify-between items-start mb-1">
                            <span className={cn(
                                "font-bold font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-sm border",
                                log.type === 'BAN' 
                                    ? "text-red-400 bg-red-900/10 border-red-900/30" 
                                    : "text-emerald-400 bg-emerald-900/10 border-emerald-900/30"
                            )}>
                                {log.type}
                            </span>
                            <span className="text-[9px] text-zinc-600 font-mono">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-zinc-300 font-bold">{log.team?.name || 'Unknown Unit'}</span>
                            <span className="text-zinc-600 text-[10px] uppercase tracking-wider">selected</span>
                            <span className="text-white font-mono">{log.map_name}</span>
                        </div>

                        <div className="mt-1 text-[9px] text-zinc-600 font-mono">
                            Match #{log.match?.match_position || '??'}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
