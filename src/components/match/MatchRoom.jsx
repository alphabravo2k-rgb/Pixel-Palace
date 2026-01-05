import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { PERMISSIONS } from '../../lib/roles';
import { can } from '../../lib/permissions';
import { Shield, AlertTriangle, CheckCircle, Lock, Map as MapIcon, RefreshCw, Clock, Swords } from 'lucide-react';
// 🚨 CRITICAL FIX: Use the Master Veto Controller (not VetoPanel)
import { VetoController } from './VetoController'; 
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

// Inline Team Card for Layout
const TeamCard = ({ team, isReady, align = 'left', score }) => (
  <div className={cn(
      "flex flex-col p-8 bg-[#09090b] border border-[#27272a] rounded-lg shadow-xl relative overflow-hidden transition-all duration-300 hover:border-fuchsia-500/30",
      align === 'right' ? 'items-end text-right' : 'items-start text-left'
  )}>
    {/* Background Logo Watermark */}
    {team?.logo_url && (
        <img src={team.logo_url} className={cn(
            "absolute top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.03] grayscale pointer-events-none",
            align === 'right' ? '-left-12' : '-right-12'
        )} />
    )}

    <div className="relative z-10 w-20 h-20 mb-4 bg-black rounded-full flex items-center justify-center border border-white/10 shadow-inner">
         {team?.logo_url ? <img src={team.logo_url} className="w-12 h-12 object-contain" /> : <Shield className="w-8 h-8 text-zinc-700" />}
    </div>

    <div className="text-3xl font-display font-black uppercase tracking-tighter text-white relative z-10 leading-none">
        {team?.name || 'TBD'}
    </div>
    
    <div className="text-6xl font-display font-black text-zinc-800 mt-2 select-none relative z-10">
        {score ?? '-'}
    </div>

    <div className={cn(
        "mt-4 text-[10px] font-bold uppercase px-3 py-1 rounded border font-mono tracking-widest relative z-10",
        isReady ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"
    )}>
        {isReady ? 'READY' : 'PREPARING'}
    </div>
  </div>
);

export const MatchRoom = ({ matchId }) => {
  const { session } = useSession();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputing, setIsDisputing] = useState(false);

  // Permission Check
  const canManage = can(PERMISSIONS.MANAGE_MATCH, session, match);

  const fetchMatch = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team1:team1_id(name, logo_url),
        team2:team2_id(name, logo_url)
      `)
      .eq('id', matchId)
      .single();
      
    if (!error) setMatch(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatch();

    const subscription = supabase
      .channel(`match_room_${matchId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'matches', 
        filter: `id=eq.${matchId}` 
      }, (payload) => {
        // Optimistic update for speed
        setMatch(prev => ({ ...prev, ...payload.new })); 
        // Full fetch to ensure relations (team names) remain intact
        fetchMatch(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [matchId]);

  const handleDispute = async () => {
    if (!disputeReason) return;
    
    try {
        const { error } = await supabase
            .from('matches')
            .update({ 
                status: 'disputed', 
                admin_notes: `[DISPUTE FILED]: ${disputeReason}` 
            })
            .eq('id', matchId);

        if (error) throw error;

        setIsDisputing(false);
        setDisputeReason("");
        toast.error("Dispute Filed. Match Locked.");
    } catch (err) {
        toast.error("Failed to file dispute.");
    }
  };

  if (loading) return <div className="h-screen bg-bg flex items-center justify-center text-zinc-500 animate-pulse font-mono">ESTABLISHING UPLINK...</div>;
  if (!match) return <div className="h-screen bg-bg flex items-center justify-center text-red-500 font-mono">MATCH NOT FOUND</div>;

  // LOCKED STATE
  if (match.is_locked || match.status === 'disputed') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-12 bg-red-950/20 border border-red-500/20 rounded-lg text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-4xl font-display font-black text-white uppercase tracking-wide">Match Locked</h2>
            <p className="text-red-300 font-mono mt-4 mb-8 text-sm uppercase tracking-widest">
              An integrity lock is active. <br/>
              Reason: <span className="text-white font-bold">{match.admin_notes || 'Pending Admin Review'}</span>
            </p>
            <div className="inline-block px-6 py-3 bg-red-500/10 rounded border border-red-500/20 text-xs text-red-400 font-bold uppercase tracking-widest animate-pulse">
              Awaiting Resolution...
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-white p-6 md:p-12">
      
      {/* MATCH HEADER */}
      <div className="text-center mb-12 flex flex-col items-center">
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
             <Clock size={12} /> Match ID: {match.match_no} • Round {match.round}
         </div>
         <h1 className="text-6xl md:text-8xl font-display font-black text-zinc-800 italic uppercase tracking-tighter leading-none select-none">
             BATTLEFIELD
         </h1>
         {/* DYNAMIC FORMAT BADGE */}
         <div className="mt-4 px-3 py-1 rounded bg-fuchsia-900/20 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest">
            Best of {match.best_of || 1}
         </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* TEAM 1 */}
        <TeamCard team={match.team1} isReady={false} score={match.team1_score} />

        {/* CENTER CONTROL */}
        <div className="space-y-6">
            
            {/* VETO / MAP DISPLAY */}
            {match.status === 'veto' ? (
                <div className="bg-[#09090b] border border-zinc-800 rounded-lg p-6 shadow-xl animate-in fade-in">
                    {/* ✅ BRIDGE FIXED: Using the Master VetoController */}
                    <VetoController match={match} onUpdate={fetchMatch} />
                </div>
            ) : (
                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-12 flex flex-col items-center justify-center text-center">
                    {match.status === 'live' ? (
                        <>
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                <Swords className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Match Live</h3>
                            <p className="text-zinc-500 text-xs mt-2 font-mono">GLHF</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <MapIcon className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-zinc-400 font-bold uppercase tracking-wider">Awaiting Veto</h3>
                            <p className="text-zinc-600 text-xs mt-2 font-mono uppercase">Waiting for captains...</p>
                        </>
                    )}
                </div>
            )}

            {/* ACTION BAR */}
            <div className="grid grid-cols-2 gap-3">
               <button 
                  disabled={!canManage}
                  className={cn(
                      "p-4 rounded border font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all",
                      canManage 
                        ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                  )}
                  onClick={() => toast.success("Ready Check Sent")}
               >
                  <CheckCircle size={16} /> Ready Check
               </button>

               <button 
                  onClick={() => setIsDisputing(!isDisputing)}
                  className="p-4 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 text-red-500 rounded font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
               >
                  <AlertTriangle size={16} /> Dispute
               </button>
            </div>

            {/* DISPUTE FORM */}
            {isDisputing && (
                <div className="p-6 bg-[#18181b] border border-red-500/50 rounded-lg animate-in slide-in-from-top-2 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                    <h4 className="text-red-500 font-bold uppercase text-xs tracking-widest mb-4">File Official Dispute</h4>
                    <textarea 
                        className="w-full bg-black border border-zinc-800 rounded p-4 text-sm text-white mb-4 focus:border-red-500 outline-none font-mono"
                        placeholder="Describe the issue (Cheating, Server Crash, Toxicity)..."
                        rows={4}
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsDisputing(false)} className="px-4 py-2 text-xs text-zinc-500 hover:text-white transition-colors uppercase font-bold">Cancel</button>
                        <button 
                            onClick={handleDispute}
                            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded uppercase tracking-widest transition-colors shadow-lg shadow-red-900/20"
                        >
                            Lock Match
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* TEAM 2 */}
        <TeamCard team={match.team2} isReady={false} score={match.team2_score} align="right" />

      </div>
    </div>
  );
};
