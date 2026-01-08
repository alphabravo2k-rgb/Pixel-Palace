import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Lock, Map as MapIcon, Clock, Swords, Trophy, Server, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexusStore } from '../../store/useNexusStore';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { can } from '../../lib/security/engine';
import { PERMISSIONS } from '../../lib/security/permissions';

// SUB-SYSTEMS
import { VetoPanel } from '../VetoPanel'; // ✅ Corrected Import

/**
 * 🏟️ MATCH ROOM: THE BATTLEFIELD
 * ------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * UPGRADES:
 * 1. VETO SYNC: Using the unified <VetoPanel>.
 * 2. 8D AUDIO: Sound feedback on critical events (Dispute, Copy).
 * 3. SECURITY: Role-based view logic.
 */

// Inline Team Card for Layout
const TeamCard = ({ team, score, isWinner }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={cn(
      "flex flex-col p-8 bg-[#09090b] border rounded-lg shadow-xl relative overflow-hidden transition-all duration-500",
      isWinner ? "border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.1)]" : "border-[#27272a] hover:border-fuchsia-500/30"
  )}>
    {/* Background Logo Watermark */}
    {team?.logo_url && (
        <img src={team.logo_url} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.03] grayscale pointer-events-none" />
    )}

    {isWinner && <div className="absolute top-4 right-4 text-yellow-500 animate-pulse"><Trophy size={24} /></div>}

    <div className="relative z-10 flex flex-col items-center text-center">
        <div className={cn(
            "w-24 h-24 mb-4 bg-black rounded-full flex items-center justify-center border shadow-inner",
            isWinner ? "border-yellow-500/30" : "border-white/10"
        )}>
             {team?.logo_url ? <img src={team.logo_url} className="w-14 h-14 object-contain" /> : <Shield className="w-8 h-8 text-zinc-700" />}
        </div>

        <div className="text-2xl font-display font-black uppercase tracking-tighter text-white leading-none mb-2">
            {team?.name || 'TBD'}
        </div>
        
        <div className="text-6xl font-display font-black text-zinc-800 select-none">
            {score ?? 0}
        </div>
    </div>
  </motion.div>
);

export const MatchRoom = ({ matchId }) => {
  const { session, profile } = useNexusStore();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputing, setIsDisputing] = useState(false);

  // Permission Check
  // Note: 'session' in store might be different structure than 'useSession' hook. 
  // Ideally use the hook if component wrapped in provider, or store if global.
  // Using store here for consistency.
  
  const canManage = can(PERMISSIONS.MANAGE_MATCH, { role: profile?.role }); 
  const isParticipant = (match?.team1_id === profile?.team_id || match?.team2_id === profile?.team_id);

  const fetchMatch = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`*, team1:team1_id(name, logo_url), team2:team2_id(name, logo_url)`)
      .eq('id', matchId)
      .single();
      
    if (!error) setMatch(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatch();
    const subscription = supabase
      .channel(`match_room_${matchId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, (payload) => {
        setMatch(prev => ({ ...prev, ...payload.new })); 
        fetchMatch(); // Refresh relations
        SoundNexus.play(CUES.NOTIFICATION);
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [matchId]);

  const handleDispute = async () => {
    if (!disputeReason) return;
    SoundNexus.play(CUES.DISPUTE_TRIGGER);
    try {
        const { error } = await supabase.from('matches').update({ status: 'disputed', admin_notes: `[DISPUTE]: ${disputeReason}` }).eq('id', matchId);
        if (error) throw error;
        setIsDisputing(false);
        setDisputeReason("");
        toast.error("DISPUTE FILED. MATCH LOCKED.");
    } catch (err) { toast.error("FAILED TO FILE DISPUTE."); }
  };

  const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
      SoundNexus.play(CUES.UI_CLICK);
      toast.success("COPIED TO CLIPBOARD");
  };

  if (loading) return <div className="h-screen bg-bg flex items-center justify-center text-zinc-500 animate-pulse font-mono">ESTABLISHING UPLINK...</div>;
  if (!match) return <div className="h-screen bg-bg flex items-center justify-center text-red-500 font-mono">MATCH NOT FOUND</div>;

  // LOCKED STATE
  if (match.is_locked || match.status === 'disputed') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-12 bg-red-950/20 border border-red-500/20 rounded-lg text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-12 h-12 text-red-500" /></div>
            <h2 className="text-4xl font-display font-black text-white uppercase tracking-wide">Match Locked</h2>
            <p className="text-red-300 font-mono mt-4 mb-8 text-sm uppercase tracking-widest">
              An integrity lock is active. <br/> Reason: <span className="text-white font-bold">{match.admin_notes || 'Pending Review'}</span>
            </p>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-white p-6 md:p-12 overflow-x-hidden">
      
      {/* MATCH HEADER */}
      <div className="text-center mb-12 flex flex-col items-center">
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
             <Clock size={12} /> Match ID: {match.match_position} • Round {match.round_number}
         </div>
         <h1 className="text-6xl md:text-8xl font-display font-black text-zinc-800 italic uppercase tracking-tighter leading-none select-none">BATTLEFIELD</h1>
         <div className="mt-4 px-3 py-1 rounded bg-fuchsia-900/20 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest">
            Best of {match.best_of || 1}
         </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* TEAM 1 */}
        <TeamCard team={match.team1} score={match.score_team1} isWinner={match.winner_id === match.team1_id} />

        {/* CENTER CONTROL */}
        <div className="space-y-6">
            
            {/* SERVER INFO (Secure Display) */}
            {match.status === 'live' && (isParticipant || canManage) && match.server_ip && (
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4"
                >
                    <h3 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Server size={14}/> Server Credentials</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-emerald-500/10 cursor-pointer hover:bg-black/60" onClick={() => handleCopy(`connect ${match.server_ip}`)}>
                            <span className="text-xs font-mono text-white">connect {match.server_ip}</span>
                            <Copy size={12} className="text-zinc-500"/>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* VETO / MAP DISPLAY */}
            {match.status === 'veto' ? (
                <div className="bg-[#09090b] border border-zinc-800 rounded-lg p-6 shadow-xl">
                    {/* Unified Veto Panel */}
                    <VetoPanel match={match} myTeamId={profile?.team_id} />
                </div>
            ) : (
                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                    {match.status === 'live' ? (
                        <>
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse"><Swords className="w-8 h-8 text-red-500" /></div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Match Live</h3>
                            <p className="text-zinc-500 text-xs mt-2 font-mono">GLHF</p>
                        </>
                    ) : match.status === 'completed' ? (
                        <>
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4"><Trophy className="w-8 h-8 text-yellow-500" /></div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Match Completed</h3>
                            <p className="text-zinc-500 text-xs mt-2 font-mono">GG WP</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4"><MapIcon className="w-8 h-8 text-zinc-600" /></div>
                            <h3 className="text-zinc-400 font-bold uppercase tracking-wider">Awaiting Veto</h3>
                            <p className="text-zinc-600 text-xs mt-2 font-mono uppercase">Waiting for captains...</p>
                        </>
                    )}
                </div>
            )}

            {/* ACTION BAR */}
            {(canManage || isParticipant) && !['completed'].includes(match.status) && (
                <div className="grid grid-cols-2 gap-3">
                   {canManage && (
                       <button 
                          className="p-4 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 rounded border font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
                          onClick={() => { SoundNexus.play(CUES.UI_CLICK); toast.success("READY CHECK SENT"); }}
                       >
                          <CheckCircle size={16} /> Ready Check
                       </button>
                   )}
                   <button 
                      onClick={() => setIsDisputing(!isDisputing)}
                      className="p-4 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 text-red-500 rounded font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
                   >
                      <AlertTriangle size={16} /> Dispute
                   </button>
                </div>
            )}

            {/* DISPUTE FORM */}
            <AnimatePresence>
                {isDisputing && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 bg-[#18181b] border border-red-500/50 rounded-lg shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                        <h4 className="text-red-500 font-bold uppercase text-xs tracking-widest mb-4">File Official Dispute</h4>
                        <textarea 
                            className="w-full bg-black border border-zinc-800 rounded p-4 text-sm text-white mb-4 focus:border-red-500 outline-none font-mono"
                            placeholder="Describe the issue..." rows={4}
                            value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDisputing(false)} className="px-4 py-2 text-xs text-zinc-500 hover:text-white transition-colors uppercase font-bold">Cancel</button>
                            <button onClick={handleDispute} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded uppercase tracking-widest transition-colors shadow-lg shadow-red-900/20">Lock Match</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* TEAM 2 */}
        <TeamCard team={match.team2} score={match.score_team2} isWinner={match.winner_id === match.team2_id} />

      </div>
    </div>
  );
};
