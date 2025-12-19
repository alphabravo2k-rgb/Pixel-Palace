import React, { useEffect, useCallback, memo } from 'react';
import { X, Shield, Activity, Hammer } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { can, isAdmin, MATCH_STATUS } from '../tournament/permissions';
import { PERM_ACTIONS } from '../lib/constants';
import VetoPanel from './VetoPanel';

const TacticalBadge = ({ children, status }) => {
  const configs = {
    [MATCH_STATUS.LIVE]: 'bg-red-900/20 text-red-500 border-red-500/50 animate-pulse',
    [MATCH_STATUS.VETO]: 'bg-orange-900/20 text-orange-500 border-orange-500/50',
    [MATCH_STATUS.COMPLETED]: 'bg-zinc-800 text-zinc-500 border-zinc-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-tighter border ${configs[status] || 'border-zinc-700 text-zinc-400'}`}>
      {children}
    </span>
  );
};

const MatchModal = ({ match, onClose }) => {
  const { session } = useSession();

  const fetchMatchTimeline = useCallback(async () => {
    if (!match?.id) return;
    await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', match.id)
      .order('created_at', { ascending: false });
  }, [match?.id]);

  useEffect(() => {
    fetchMatchTimeline();
    const channel = supabase
      .channel(`match_ops_${match?.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events', filter: `match_id=eq.${match?.id}` }, fetchMatchTimeline)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [match?.id, fetchMatchTimeline]);

  if (!match) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const canSeeIP = can(PERM_ACTIONS.VIEW_SERVER_IP, session, { match });
  const isOperator = isAdmin(session);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="w-full max-w-4xl bg-[#0b0c0f] border border-zinc-800 shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 97% 100%, 0 100%)' }}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-[#15191f]/50">
          <div className="flex items-center gap-4">
            <Activity className="text-[#ff5500] w-5 h-5" />
            <div>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                OPS_CORE // MATCH_{match.id.slice(0, 4)}
              </h2>
              <div className="flex gap-2 mt-1">
                <TacticalBadge status={match.status}>{match.status}</TacticalBadge>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/40 p-8 border border-zinc-800/50 rounded-sm">
            <h3 className="text-2xl font-black text-white uppercase text-center md:text-right">{match.team1_name}</h3>
            <div className="text-6xl font-mono font-black italic text-white text-center">{match.score || '0 - 0'}</div>
            <h3 className="text-2xl font-black text-white uppercase text-center md:text-left">{match.team2_name}</h3>
          </div>

          <VetoPanel match={match} />

          {canSeeIP && match.server_ip ? (
            <div className="bg-emerald-950/10 border border-emerald-500/30 p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <button 
                onClick={() => handleCopy(`connect ${match.server_ip}; password ${match.server_password}`)}
                className="w-full bg-black/60 p-4 rounded border border-emerald-900/50 text-left"
              >
                <code className="text-emerald-400 font-mono text-sm break-all leading-relaxed">
                  connect {match.server_ip}; password {match.server_password}
                </code>
              </button>
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800 p-6 flex flex-col items-center gap-3 opacity-50">
              <Shield size={24} className="text-zinc-700" />
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">Connection Uplink Offline</p>
            </div>
          )}

          {isOperator && (
            <div className="border-2 border-red-900/30 bg-red-950/5 p-6 rounded-sm space-y-4">
              <h4 className="text-red-500 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Hammer size={14} /> System Override Console
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button className="bg-zinc-900 border border-zinc-700 p-2 text-[9px] font-black text-white hover:bg-white hover:text-black transition-all">FORCE_LIVE</button>
                <button className="bg-red-600 border border-red-500 p-2 text-[9px] font-black text-white">TERM_MATCH</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MatchModal);
