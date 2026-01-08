import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Clock, User, ShieldAlert, Map as MapIcon, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';

/**
 * 📜 MATCH ACTIVITY LOG: TACTICAL TIMELINE
 * ----------------------------------------
 * STATUS: MASTERED (SCHEMA ALIGNED)
 * * PURPOSE:
 * Visualizes the 'match_vetoes' table as a live feed.
 * * FIXES:
 * 1. SCHEMA: Switched from 'match_logs' (non-existent) to 'match_vetoes'.
 * 2. PHYSICS: List items animate in.
 */

export const MatchActivityLog = ({ matchId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load
  const fetchLogs = async () => {
      try {
        // ✅ FIXED: Querying 'match_vetoes' instead of 'match_logs'
        const { data, error } = await supabase
            .from('match_vetoes')
            .select(`
                *,
                team:teams(name)
            `)
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
    const sub = supabase.channel(`activity-${matchId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_vetoes', filter: `match_id=eq.${matchId}` }, (payload) => {
            fetchLogs(); // Re-fetch to get the joined Team Name
            SoundNexus.play(CUES.UI_CLICK);
        })
        .subscribe();

    return () => supabase.removeChannel(sub);
  }, [matchId]);

  return (
    <div className="flex flex-col h-full bg-[#050505] border border-zinc-800 rounded-sm overflow-hidden">
        
        {/* HEADER */}
        <div className="p-3 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ScrollText size={14} className="text-zinc-400"/>
                <span className="text-xs font-black uppercase text-zinc-300 tracking-widest">Tactical Timeline</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600">{logs.length} EVENTS</span>
        </div>
        
        {/* FEED */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {loading && <div className="text-center text-[10px] text-zinc-600 py-4 animate-pulse font-mono">SYNCING UPLINK...</div>}
            
            {!loading && logs.length === 0 ? (
                <div className="text-center text-[10px] text-zinc-600 py-8 uppercase tracking-widest flex flex-col items-center gap-2">
                    <ShieldAlert size={16} className="opacity-20"/>
                    No activity recorded
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {logs.map((log, i) => (
                        <motion.div 
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex gap-3 p-2 rounded-sm bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-xs group"
                        >
                            {/* Time */}
                            <div className="flex flex-col items-center gap-1 min-w-[35px] pt-1">
                                <span className="text-[9px] font-mono text-zinc-600">{format(new Date(log.created_at), 'HH:mm')}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-black text-[9px] uppercase px-1.5 py-0.5 rounded-sm border ${
                                        log.type === 'BAN' 
                                            ? 'bg-red-900/20 text-red-500 border-red-900/30' 
                                            : 'bg-emerald-900/20 text-emerald-500 border-emerald-900/30'
                                    }`}>
                                        {log.type}
                                    </span>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                        {log.team?.name || 'SYSTEM'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                                    {log.type === 'BAN' ? <Ban size={10} className="text-red-500"/> : <CheckCircle size={10} className="text-emerald-500"/>}
                                    <span className="font-mono text-white">{log.map_name}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>
    </div>
  );
};
