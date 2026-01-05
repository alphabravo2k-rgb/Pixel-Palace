import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { ScrollText, Clock, User, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export const MatchActivityLog = ({ matchId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load
  const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
            .from('match_logs')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        setLogs(data || []);
      } catch (e) {
        console.error("Log Fetch Error:", e);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchLogs();

    // 2. Real-time Subscription
    const sub = supabase.channel(`match-logs-${matchId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_logs', filter: `match_id=eq.${matchId}` }, payload => {
            setLogs(prev => [payload.new, ...prev]);
        })
        .subscribe();

    return () => supabase.removeChannel(sub);
  }, [matchId]);

  return (
    <div className="flex flex-col h-full bg-[#050505] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ScrollText size={14} className="text-zinc-400"/>
                <span className="text-xs font-bold uppercase text-zinc-300">Operations Timeline</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600">{logs.length} EVENTS</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {loading && <div className="text-center text-[10px] text-zinc-600 py-4 animate-pulse">SYNCING LOGS...</div>}
            
            {!loading && logs.length === 0 ? (
                <div className="text-center text-[10px] text-zinc-600 py-4 uppercase tracking-widest flex flex-col items-center gap-2">
                    <ShieldAlert size={16} className="opacity-20"/>
                    No activity recorded
                </div>
            ) : (
                logs.map(log => (
                    <div key={log.id} className="flex gap-3 p-2 rounded bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-xs group">
                        <div className="flex flex-col items-center gap-1 min-w-[35px]">
                            <span className="text-[9px] font-mono text-zinc-500">{format(new Date(log.created_at), 'HH:mm')}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${log.actor_name === 'Admin' ? 'bg-red-900/20 text-red-400' : 'bg-fuchsia-900/20 text-fuchsia-400'}`}>
                                    {log.actor_name}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{log.action_type?.replace('_', ' ')}</span>
                            </div>
                            <div className="text-zinc-300 text-[11px] leading-tight">
                                {log.action_type.includes('VETO') 
                                    ? <span>Selected <span className="text-white font-bold">{log.details?.map}</span></span>
                                    : <span className="font-mono text-[10px] opacity-70 break-all">{JSON.stringify(log.details)}</span>
                                }
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
