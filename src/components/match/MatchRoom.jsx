import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { useCapabilities } from '../../auth/useCapabilities';
import { Shield, AlertTriangle, CheckCircle, Lock, Map as MapIcon, RefreshCw, MessageSquare } from 'lucide-react';
import { PERM_CAPABILITIES } from '../../lib/permissions.actions';
import { VetoPanel } from '../VetoPanel'; // ✅ IMPORTS VETO PANEL

// Simple Team Card Component (Inline for stability)
const TeamCard = ({ name, isReady, align = 'left' }) => (
  <div className={`flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start text-left'} p-6 bg-zinc-900/50 rounded-lg border border-white/5`}>
    <div className="text-xl font-bold font-['Teko'] uppercase tracking-wider text-white">{name}</div>
    <div className={`mt-2 text-xs font-bold uppercase px-2 py-1 rounded ${isReady ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
        {isReady ? 'READY' : 'PREPARING'}
    </div>
  </div>
);

export const MatchRoom = ({ matchId }) => {
  const { session } = useSession();
  const { can } = useCapabilities();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputing, setIsDisputing] = useState(false);

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
        fetchMatch(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [matchId]);

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

  const handleDispute = async () => {
    if (!disputeReason) return;
    
    // Note: RPC api_file_dispute must exist on backend
    const { error } = await supabase.rpc('api_file_dispute', {
      p_match_id: matchId,
      p_reason: disputeReason
    });

    if (error) {
      alert("Error filing dispute: " + error.message);
    } else {
      setIsDisputing(false);
      setDisputeReason("");
      alert("Dispute filed. Admin notified.");
    }
  };

  if (loading) return <div className="text-zinc-500 animate-pulse p-10 text-center flex justify-center"><RefreshCw className="animate-spin" /></div>;

  if (!match) return <div className="text-red-500 text-center p-10">Match data unavailable.</div>;

  const canManage = can(PERM_CAPABILITIES.MANAGE_MATCH, match);

  if (match.is_locked) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8 bg-red-950/20 border border-red-500/50 rounded-lg text-center animate-in fade-in">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-['Teko'] text-white uppercase tracking-wide">Match Locked</h2>
        <p className="text-red-300 font-mono mt-2 mb-6">
          An integrity lock is active. Reason: <span className="text-white font-bold">"{match.locked_reason || 'Administrative Hold'}"</span>
        </p>
        <div className="inline-block px-4 py-2 bg-red-500/10 rounded border border-red-500/20 text-xs text-red-400 font-bold uppercase tracking-wider">
          Waiting for Admin Resolution...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white animate-in slide-in-from-bottom-4">
      <TeamCard name={match.team1?.name || 'TBD'} isReady={false} />

      <div className="space-y-6">
        <div className="text-center">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
            Match #{match.match_no}
          </div>
          <div className="text-5xl font-['Teko'] font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
             {match.team1_score} <span className="text-zinc-600 px-2">-</span> {match.team2_score}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-full text-xs text-fuchsia-400 mt-2 font-bold tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
            {match.status?.toUpperCase() || 'SCHEDULED'}
          </div>
        </div>

        {/* VETO SECTION */}
        {match.status === 'veto' ? (
            <VetoPanel match={match} />
        ) : (
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent pointer-events-none" />
                <MapIcon className="w-8 h-8 text-zinc-700 mb-2 relative z-10" />
                <h3 className="text-zinc-400 font-bold relative z-10">Map Veto Phase</h3>
                <p className="text-zinc-600 text-xs mt-1 max-w-[200px] relative z-10">
                Waiting for captains to initialize ban phase.
                </p>

                {/* START VETO BUTTON - Only visible if allowed */}
                {canManage && (
                    <button 
                        className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded border border-white/5 hover:border-white/20 transition-all relative z-10"
                        // Add handler to trigger state change to 'veto' if needed
                    >
                    Start Veto
                    </button>
                )}
            </div>
        )}

        <div className="grid grid-cols-2 gap-2">
           {canManage ? (
               <button className="p-3 bg-green-900/20 border border-green-500/30 hover:bg-green-900/40 text-green-400 font-bold uppercase text-xs rounded flex items-center justify-center gap-2 transition-colors">
                 <CheckCircle className="w-4 h-4" /> Ready Up
               </button>
           ) : (
               <div className="p-3 bg-zinc-900/50 border border-zinc-800 text-zinc-600 font-bold uppercase text-xs rounded flex items-center justify-center gap-2 cursor-not-allowed">
                 <CheckCircle className="w-4 h-4" /> Not Ready
               </div>
           )}

           <button 
             onClick={() => setIsDisputing(!isDisputing)}
             className="p-3 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-400 font-bold uppercase text-xs rounded flex items-center justify-center gap-2 transition-colors"
           >
             <AlertTriangle className="w-4 h-4" /> Report Issue
           </button>
        </div>

        {isDisputing && (
          <div className="p-4 bg-black/60 backdrop-blur-md border border-red-500/50 rounded-lg animate-in slide-in-from-top-2 shadow-2xl">
            <h4 className="text-red-400 font-bold uppercase text-xs mb-2">File Official Dispute</h4>
            <textarea 
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white mb-3 focus:border-red-500 outline-none"
              placeholder="Describe the issue (Cheating, Server Crash, Toxicity)..."
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsDisputing(false)} className="px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors">Cancel</button>

              <button 
                onClick={handleDispute}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded uppercase tracking-wider transition-colors shadow-lg shadow-red-900/20"
              >
                File Dispute & Lock Match
              </button>
            </div>
          </div>
        )}
      </div>

      <TeamCard name={match.team2?.name || 'TBD'} isReady={false} align="right" />
    </div>
  );
};
