import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { X, Clock, AlertTriangle, Shield, Copy, Server, RefreshCw } from 'lucide-react';
import { VetoController } from './match/VetoController';
import { RestrictedButton } from './common/RestrictedButton'; 
import { PERM_CAPABILITIES } from '../lib/permissions.actions';
import { cn, copyToClipboard } from '../lib/utils';
import { toast } from 'react-hot-toast';

const TeamCard = ({ team, isWinner, score }) => (
  <div className={cn(
      "flex flex-col items-center gap-4 p-6 rounded-lg border transition-all duration-300 w-1/3",
      isWinner 
        ? "bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
        : "bg-zinc-900 border-zinc-800"
  )}>
    <div className="relative">
        <div className={cn(
            "w-20 h-20 bg-black rounded-full flex items-center justify-center border-2 overflow-hidden",
            isWinner ? "border-emerald-500" : "border-white/10"
        )}>
            {team?.logo_url ? <img src={team.logo_url} className="w-14 h-14 object-contain" alt={team.name} /> : <Shield className="w-10 h-10 text-zinc-700" />}
        </div>
        {isWinner && <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">WIN</div>}
    </div>
    <div className="text-center">
        <div className={cn("font-display font-bold uppercase text-xl leading-none", isWinner ? "text-emerald-400" : "text-white")}>
            {team?.name || 'TBD'}
        </div>
        <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
            {team?.seed_number ? `SEED #${team.seed_number}` : 'UNRANKED'}
        </div>
    </div>
    <div className="font-display font-black text-4xl text-white">
        {score || 0}
    </div>
  </div>
);

export const MatchModal = ({ match: initialMatch, isOpen, onClose }) => {
  const { session } = useSession();
  const [matchData, setMatchData] = useState(initialMatch); // Local state for real-time updates

  // 1. REAL-TIME LISTENER
  // This ensures that when Admin clicks "BO5", the Captain sees it instantly.
  useEffect(() => {
    if (!isOpen || !initialMatch?.id) return;

    // A. Fetch latest data immediately on open
    const fetchLatest = async () => {
        const { data } = await supabase
            .from('matches')
            .select(`*, team1:team1_id(*), team2:team2_id(*)`)
            .eq('id', initialMatch.id)
            .single();
        if (data) setMatchData(data);
    };
    fetchLatest();

    // B. Subscribe to live changes
    const sub = supabase.channel(`match-live-${initialMatch.id}`)
        .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${initialMatch.id}` }, 
            (payload) => {
                // Merge new data with existing structure to preserve team objects if not included in payload
                setMatchData(prev => ({ ...prev, ...payload.new }));
                // Re-fetch full data to ensure relations (team names) don't break
                fetchLatest();
            }
        )
        .subscribe();

    return () => supabase.removeChannel(sub);
  }, [initialMatch?.id, isOpen]);

  if (!isOpen || !matchData) return null;

  // Identity Check
  const myTeamId = session?.identity?.team_id || session?.team_id; 
  const isParticipant = (myTeamId === matchData.team1_id || myTeamId === matchData.team2_id);
  const isPlayerActionable = !matchData.is_locked && ['scheduled', 'veto', 'live'].includes(matchData.status);
  const showSensitiveInfo = isParticipant || session?.role === 'ADMIN';

  const handleCopy = (text, label) => {
      if (!text) return;
      copyToClipboard(text);
      toast.success(`${label} Copied!`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-[url('/grid-pattern.svg')]">
          <div>
            <div className="flex items-center gap-2 text-fuchsia-500 font-bold uppercase tracking-widest text-xs mb-1">
              <Clock className="w-3 h-3" /> Match #{matchData.match_no} • Round {matchData.round}
            </div>
            <h2 className="text-4xl font-display text-white uppercase italic tracking-wide">
              {matchData.status} PHASE
            </h2>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setMatchData({...matchData})} className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-colors" title="Force Refresh">
                <RefreshCw className="w-6 h-6" />
             </button>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X className="w-8 h-8" />
             </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-black">
          
          <div className="flex justify-between items-center gap-4 mb-12 max-w-3xl mx-auto">
            <TeamCard team={matchData.team1} isWinner={matchData.winner_id === matchData.team1_id} score={matchData.team1_score} />
            <div className="flex flex-col items-center animate-in zoom-in">
                <span className="text-6xl font-display font-black text-zinc-800 italic select-none">VS</span>
                {/* DYNAMIC BEST OF LABEL */}
                <span className="text-[10px] font-mono text-zinc-600 uppercase border border-zinc-800 px-2 py-0.5 rounded mt-2 bg-zinc-900">
                    {`Best of ${matchData.best_of || 1}`}
                </span>
            </div>
            <TeamCard team={matchData.team2} isWinner={matchData.winner_id === matchData.team2_id} score={matchData.team2_score} />
          </div>

          {/* SERVER INFO (Live Only) */}
          {matchData.status === 'live' && showSensitiveInfo && (
              <div className="mb-8 p-6 bg-fuchsia-900/5 border border-fuchsia-500/20 rounded-lg animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-4 text-fuchsia-400 font-bold uppercase tracking-widest text-sm italic">
                      <Server className="w-4 h-4" /> Operational Connection Commands
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-black/40 p-4 rounded border border-white/5 flex justify-between items-center group cursor-pointer hover:border-fuchsia-500/50 transition-colors" onClick={() => handleCopy(matchData.server_ip, 'IP')}>
                          <div>
                              <div className="text-[9px] text-zinc-500 font-mono uppercase">Connect String</div>
                              <div className="text-emerald-400 font-mono text-xs mt-1">{matchData.server_ip || 'Waiting for deploy...'}</div>
                          </div>
                          <Copy className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                      </div>
                      <div className="bg-black/40 p-4 rounded border border-white/5 flex justify-between items-center group cursor-pointer hover:border-fuchsia-500/50 transition-colors" onClick={() => handleCopy(matchData.server_pass, 'Password')}>
                          <div>
                              <div className="text-[9px] text-zinc-500 font-mono uppercase">Server Password</div>
                              <div className="text-white font-mono text-xs mt-1 filter blur-[4px] group-hover:blur-none transition-all duration-300">
                                  {matchData.server_pass || '••••••••'}
                              </div>
                          </div>
                          <Copy className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                      </div>
                  </div>
              </div>
          )}

          {/* ACTIVE GAMEPLAY */}
          {isParticipant && isPlayerActionable && (
             <div className="space-y-8">
                {/* Ready Check */}
                {matchData.status === 'scheduled' && (
                    <div className="bg-fuchsia-900/10 border border-fuchsia-500/20 p-6 rounded-lg text-center">
                        <h3 className="text-fuchsia-400 font-bold uppercase tracking-widest text-sm mb-4">Captain Command Link</h3>
                        <div className="flex justify-center gap-4">
                            <RestrictedButton action={PERM_CAPABILITIES.ACT_AS_CAPTAIN} context={matchData} className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase rounded text-sm transition-all shadow-lg shadow-fuchsia-900/20" onClick={() => alert("Ready Check: Coming in v1.1")}>
                                Ready Check
                            </RestrictedButton>
                        </div>
                    </div>
                )}
                {/* Veto UI - Pass the LIVE matchData */}
                {matchData.status === 'veto' && (
                    <div className="border-t border-zinc-800 pt-8 animate-in slide-in-from-bottom-2">
                        <h3 className="text-center text-fuchsia-500 font-black text-xs uppercase tracking-[0.3em] mb-8 flex items-center justify-center gap-3 italic">
                            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"/> Veto Protocol Active
                        </h3>
                        <VetoController match={matchData} />
                    </div>
                )}
             </div>
          )}

          {/* LOCK STATE */}
          {matchData.is_locked && (
             <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg text-center flex items-center justify-center gap-2 text-red-500 font-bold mt-8 uppercase tracking-widest text-[10px]">
                <AlertTriangle size={14} /> This match has been locked by tournament directors.
             </div>
          )}

          {!isParticipant && <div className="text-center text-zinc-500 font-mono text-xs mt-12 border-t border-white/5 pt-4">SPECTATOR MODE // READ ONLY ACCESS</div>}
        </div>
      </div>
    </div>
  );
};
