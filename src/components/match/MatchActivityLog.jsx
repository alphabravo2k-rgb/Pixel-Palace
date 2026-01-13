/**
 * 📜 MATCH ACTIVITY LOG: TACTICAL TIMELINE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // REAL-TIME SYNCED
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Clock, ShieldAlert, Ban, CheckCircle, Zap } from 'lucide-react';
import { format } from 'date-fns';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { cn } from '../../lib/utils';

export const MatchActivityLog = ({ matchId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * 📡 INTEL RETRIEVAL
   * Fetches the veto/pick history for the current match sector.
   */
  const fetchLogs = useCallback(async () => {
      try {
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
        Telemetry.log(EVENTS.ERROR, { subsystem: 'ACTIVITY_LOG', matchId, error: e.message });
      } finally {
        setLoading(false);
      }
  }, [matchId]);

  useEffect(() => {
    fetchLogs();

    // ⚡ REAL-TIME SUBSCRIPTION: "Postgres Change Listener"
    const channel = supabase.channel(`match_intel:${matchId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'match_vetoes', 
          filter: `match_id=eq.${matchId}` 
        }, () => {
            fetchLogs(); // Sync new record + team relations
            try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, [matchId, fetchLogs]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-white/5 rounded-sm overflow-hidden shadow-2xl relative">
        
        {/* SCANLINE ATMOSPHERE */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

        {/* HEADER */}
        <div className="p-4 border-b border-white/5 bg-zinc-900/30 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <ScrollText size={16} className="text-fuchsia-500"/>
                <span className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Tactical Feed</span>
            </div>
            <div className="flex items-center gap-2">
                <Zap size={10} className="text-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{logs.length} Operations</span>
            </div>
        </div>
        
        {/* LOG STREAM */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative z-10">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40 grayscale">
                    <div className="w-8 h-8 border border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Decoding Uplink...</span>
                </div>
            ) : logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 gap-3 opacity-20">
                    <ShieldAlert size={24} className="text-zinc-500"/>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em]">Radar Silence</p>
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {logs.map((log, i) => (
                        <motion.div 
                            key={log.id}
                            initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex gap-4 p-3 rounded-sm bg-black/40 border border-white/5 hover:border-fuchsia-500/30 transition-all group relative overflow-hidden"
                        >
                            {/* Action Gradient Decorator */}
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-[1px] opacity-30",
                                log.type === 'BAN' ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                            )} />

                            {/* Timestamp */}
                            <div className="flex flex-col items-center min-w-[40px] pt-1 border-r border-white/5 pr-2">
                                <span className="text-[9px] font-mono font-black text-zinc-700 group-hover:text-zinc-400 transition-colors">
                                  {format(new Date(log.created_at), 'HH:mm')}
                                </span>
                            </div>

                            {/* Content Block */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className={cn(
                                          "font-black text-[8px] uppercase px-2 py-0.5 rounded-sm border italic tracking-tighter",
                                          log.type === 'BAN' 
                                              ? 'bg-red-950/20 text-red-500 border-red-500/20' 
                                              : 'bg-emerald-950/20 text-emerald-500 border-emerald-500/20'
                                      )}>
                                          {log.type === 'BAN' ? '🚫 VETOED' : '✅ SECURED'}
                                      </span>
                                      <span className="text-[10px] font-display font-black text-white uppercase italic tracking-tighter group-hover:text-fuchsia-400 transition-colors">
                                          {log.team?.name || 'CENTRAL_CMD'}
                                      </span>
                                    </div>
                                    <Clock size={10} className="text-zinc-800 group-hover:text-zinc-600" />
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-white/5 rounded-sm">
                                      {log.type === 'BAN' ? <Ban size={12} className="text-red-600/50"/> : <CheckCircle size={12} className="text-emerald-500/50"/>}
                                    </div>
                                    <span className="font-mono text-zinc-300 text-[11px] uppercase tracking-widest">{log.map_name}</span>
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
