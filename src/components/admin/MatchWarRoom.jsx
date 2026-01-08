import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Activity, RefreshCw, AlertTriangle, Monitor, ArrowLeft, Trophy, Skull } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { AdminMatchControls } from './AdminMatchControls';
import { MatchActivityLog } from '../match/MatchActivityLog'; 
import { SoundNexus, CUES } from '../../lib/soundNexus';

/**
 * ⚔️ MATCH WAR ROOM: TACTICAL COMMAND
 * -----------------------------------
 * STATUS: MASTERED (LOGIC MERGED)
 * * FEATURES:
 * 1. FORCE WIN: Added termination protocols from your draft.
 * 2. NO STUBS: Uses real 'MatchActivityLog' and 'AdminMatchControls'.
 * 3. LIVE INTEL: Real-time updates for Server IP and Status.
 */

export const MatchWarRoom = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. DATA UPLINK
  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, team1:team1_id(name), team2:team2_id(name)')
        .eq('id', matchId)
        .single();

      if (error) throw error;
      setMatch(data);
    } catch (e) {
      toast.error("WAR ROOM LINK FAILED");
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    const channel = supabase.channel(`war-room-${matchId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, (payload) => {
            setMatch(prev => ({ ...prev, ...payload.new }));
            SoundNexus.play(CUES.NOTIFICATION);
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
  }, [matchId]);

  // 2. CRITICAL ACTION: FORCE WIN
  const handleForceWin = async (winnerId, teamName) => {
      SoundNexus.play(CUES.DISPUTE_TRIGGER);
      
      const confirmText = "TERMINATE";
      const input = window.prompt(`⚠️ EXECUTING TERMINATION PROTOCOL\n\nForce win for [${teamName}]?\nThis will END the match and ADVANCE the bracket.\n\nType "${confirmText}" to confirm:`);
      
      if (input !== confirmText) return;
      
      setSaving(true);
      
      try {
          // A. Update Match
          const { error } = await supabase.from('matches').update({
              winner_id: winnerId,
              status: 'completed',
              team1_score: winnerId === match.team1_id ? 1 : 0,
              team2_score: winnerId === match.team2_id ? 1 : 0,
              is_locked: true // Lock it down
          }).eq('id', matchId);

          if (error) throw error;

          // B. Advance Bracket (RPC)
          await supabase.rpc('advance_bracket', { p_match_id: matchId });
          
          SoundNexus.play(CUES.SUCCESS);
          toast.success(`VICTORY ASSIGNED: ${teamName}`);
          fetchMatch();
      } catch (e) {
          toast.error("TERMINATION FAILED: " + e.message);
          SoundNexus.play(CUES.ERROR);
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-zinc-500 font-mono animate-pulse">INITIALIZING WAR ROOM...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between border-b border-white/5 pb-6">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 bg-zinc-900 border border-zinc-800 rounded-sm hover:border-white/20 hover:text-white text-zinc-500 transition-all">
                <ArrowLeft size={18} />
            </button>
            <div>
                <h1 className="text-3xl font-display font-black uppercase italic tracking-tighter flex items-center gap-3">
                    <Shield className="text-brand" size={28} />
                    War Room <span className="text-zinc-700">::</span> Match #{match.match_position || '00'}
                </h1>
                <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                    <Activity size={12} className={match.status === 'live' ? "text-red-500 animate-pulse" : "text-zinc-600"} />
                    Status: <span className="text-white">{match.status}</span>
                </div>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
             {match.status === 'disputed' && (
                 <div className="px-4 py-2 bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-bold uppercase rounded-sm flex items-center gap-2 animate-pulse">
                     <AlertTriangle size={14} /> Dispute Active
                 </div>
             )}
             <button onClick={fetchMatch} className="p-2 hover:bg-white/5 rounded-sm text-zinc-500 hover:text-white">
                 <RefreshCw size={18} />
             </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: CONTROLS & SQUADS */}
          <div className="space-y-6">
              
              {/* SQUAD CONTROLS (FORCE WIN) */}
              <div className="bg-zinc-900 border border-white/10 rounded-sm p-5">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
                      <Skull size={14} /> Termination Protocol
                  </div>
                  <div className="space-y-3">
                      {/* TEAM 1 */}
                      <div className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-sm">
                          <span className="font-display font-black text-white italic">{match.team1?.name || 'TBD'}</span>
                          <button 
                            onClick={() => handleForceWin(match.team1_id, match.team1?.name)}
                            disabled={!match.team1_id || saving}
                            className="px-3 py-1 bg-red-900/20 text-red-500 border border-red-900/30 rounded-sm text-[9px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                          >
                             Force Win
                          </button>
                      </div>
                      
                      {/* TEAM 2 */}
                      <div className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-sm">
                          <span className="font-display font-black text-white italic">{match.team2?.name || 'TBD'}</span>
                          <button 
                            onClick={() => handleForceWin(match.team2_id, match.team2?.name)}
                            disabled={!match.team2_id || saving}
                            className="px-3 py-1 bg-red-900/20 text-red-500 border border-red-900/30 rounded-sm text-[9px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                          >
                             Force Win
                          </button>
                      </div>
                  </div>
              </div>

              {/* STANDARD CONTROLS (Swap/Reset) */}
              <AdminMatchControls match={match} onUpdate={fetchMatch} />
              
              {/* SERVER INFO */}
              <div className="bg-zinc-900 border border-white/10 rounded-sm p-5">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
                      <Monitor size={14} /> Server Uplink
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">IP Address</span>
                          <span className="font-mono text-white">{match.server_ip || 'NOT ASSIGNED'}</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: LOGS */}
          <div className="lg:col-span-2 h-[600px]">
              <MatchActivityLog matchId={match.id} />
          </div>

      </div>
    </div>
  );
};
