import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { useCapabilities } from '../../auth/useCapabilities';
import { Shield, AlertTriangle, CheckCircle, Lock, Map as MapIcon, MessageSquare } from 'lucide-react';
import { RestrictedButton } from '../common/RestrictedButton';

export const MatchRoom = ({ matchId }) => {
  const { session } = useSession();
  const { can } = useCapabilities();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputing, setIsDisputing] = useState(false);

  // 1. REAL-TIME SUBSCRIPTION
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
        setMatch(payload.new); // Instant update on change
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [matchId]);

  const fetchMatch = async () => {
    const { data } = await supabase.from('matches').select('*').eq('id', matchId).single();
    setMatch(data);
    setLoading(false);
  };

  const handleDispute = async () => {
    if (!disputeReason) return;
    
    // Call the Secure SQL Function we built in Block 56
    const { error } = await supabase.rpc('api_file_dispute', {
      p_match_id: matchId,
      p_team_id: session.identity.team_id, // Assuming session has this context
      p_reason: disputeReason
    });

    if (error) {
      alert("Error filing dispute: " + error.message);
    } else {
      setIsDisputing(false);
    }
  };

  if (loading) return <div className="text-zinc-500 animate-pulse p-10 text-center">Loading Match Data...</div>;

  if (!match) return <div className="text-red-500 text-center">Match not found.</div>;

  // 🔒 LOCKED STATE (Dispute Active)
  if (match.is_locked) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8 bg-red-950/20 border border-red-500/50 rounded-lg text-center animate-in fade-in">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-['Teko'] text-white uppercase">Match Locked</h2>
        <p className="text-red-300 font-mono mt-2 mb-6">
          An integrity lock is active. Reason: <span className="text-white font-bold">"{match.locked_reason}"</span>
        </p>
        <div className="inline-block px-4 py-2 bg-red-500/10 rounded border border-red-500/20 text-xs text-red-400">
          Waiting for Admin Resolution...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
      
      {/* LEFT: Team A */}
      <TeamCard name={match.team1_name || 'Team 1'} isReady={match.team1_ready} />

      {/* CENTER: The Action Board */}
      <div className="space-y-6">
        
        {/* Status Header */}
        <div className="text-center">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
            {match.round_name || 'Tournament Match'}
          </div>
          <div className="text-4xl font-['Teko'] font-bold text-white">
             {match.team1_score} - {match.team2_score}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-full text-xs text-fuchsia-400 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
            {match.state || 'SCHEDULED'}
          </div>
        </div>

        {/* VETO BOARD (Placeholder for Veto Logic) */}
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
           <MapIcon className="w-8 h-8 text-zinc-700 mb-2" />
           <h3 className="text-zinc-400 font-bold">Map Veto Phase</h3>
           <p className="text-zinc-600 text-xs mt-1 max-w-[200px]">
             Waiting for captains to ban maps. Current Map Pool: Dust2, Mirage, Inferno.
           </p>
           {/* Example Veto Action Button */}
           <RestrictedButton
              action="MATCH:VETO"
              resourceId={matchId}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded"
           >
             Ban Map (Demo)
           </RestrictedButton>
        </div>

        {/* INTEGRITY TOOLS (The "Standard" Features) */}
        <div className="grid grid-cols-2 gap-2">
           <RestrictedButton 
              action="MATCH:CHECK_IN" 
              resourceId={matchId}
              className="p-3 bg-green-900/20 border border-green-500/30 hover:bg-green-900/40 text-green-400 font-bold uppercase text-xs rounded flex items-center justify-center gap-2"
           >
             <CheckCircle className="w-4 h-4" /> Ready Up
           </RestrictedButton>

           <button 
              onClick={() => setIsDisputing(!isDisputing)}
              className="p-3 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-400 font-bold uppercase text-xs rounded flex items-center justify-center gap-2"
           >
             <AlertTriangle className="w-4 h-4" /> Report Issue
           </button>
        </div>

        {/* DISPUTE FORM */}
        {isDisputing && (
          <div className="p-4 bg-black/40 border border-red-500/50 rounded-lg animate-in slide-in-from-top-2">
            <textarea 
              className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white mb-2"
              placeholder="Describe the issue (Cheating, Server Crash, Toxicity)..."
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsDisputing(false)} className="px-3 py-1 text-xs text-zinc-400">Cancel</button>
              <RestrictedButton 
                action="MATCH:DISPUTE"
                resourceId={matchId}
                onClick={handleDispute}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded"
              >
                File Dispute & Lock Match
              </RestrictedButton>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: Team B */}
      <TeamCard name={match.team2_name || 'Team 2'} isReady={match.team2_ready} align="right" />
    </div>
  );
};

// Sub-component for Team Display
const TeamCard = ({ name, isReady, align = "left" }) => (
  <div className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"} p-6 bg-zinc-900/50 border border-white/5 rounded-lg`}>
    <Shield className={`w-12 h-12 mb-4 ${isReady ? 'text-green-500' : 'text-zinc-700'}`} />
    <h3 className="text-2xl font-bold font-['Teko'] uppercase tracking-wide">{name}</h3>
    <span className={`text-xs font-mono uppercase mt-1 px-2 py-0.5 rounded ${isReady ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
      {isReady ? 'READY' : 'NOT READY'}
    </span>
  </div>
);
