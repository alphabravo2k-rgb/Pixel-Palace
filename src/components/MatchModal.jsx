import React, { useEffect, useState, useCallback, memo } from 'react';
import { X, Clock, Shield, Trophy, Activity, Server, Copy, AlertTriangle, Hammer } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
import { can, isAdmin, MATCH_STATUS } from '../tournament/permissions';
import { PERM_ACTIONS } from '../lib/constants';
import VetoPanel from './VetoPanel';

// --- SUB-COMPONENT: ACTIONABLE BADGE ---
const TacticalBadge = ({ children, status }) => {
  const configs = {
    [MATCH_STATUS.LIVE]: 'bg-red-900/20 text-red-500 border-red-500/50 animate-pulse',
    [MATCH_STATUS.VETO]: 'bg-orange-900/20 text-orange-500 border-orange-500/50',
    [MATCH_STATUS.COMPLETED]: 'bg-zinc-800 text-zinc-500 border-zinc-700',
    'default': 'bg-blue-900/20 text-blue-500 border-blue-500/50'
  };
  return (
    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-tighter border ${configs[status] || configs.default}`}>
      {children}
    </span>
  );
};

const MatchModal = ({ match, onClose }) => {
  const { session } = useSession();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const fetchMatchTimeline = useCallback(async () => {
    if (!match?.id) return;
    const { data } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', match.id)
      .order('created_at', { ascending: false });
    setTimeline(data || []);
  }, [match?.id]);

  useEffect(() => {
    fetchMatchTimeline();
    // Real-time subscription to match events
    const channel = supabase
      .channel(`match_ops_${match?.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events', filter: `match_id=eq.${match?.id}` }, fetchMatchTimeline)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [match?.id, fetchMatchTimeline]);

  if (!match) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // --- PERMISSION CHECKS ---
  const canSeeIP = can(PERM_ACTIONS.VIEW_SERVER_IP, session, { match });
  const isOperator = isAdmin(session);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="w-full max-w-4xl bg-[#0b0c0f] border border-zinc-800 shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 97% 100%, 0 100%)' }}
      >
        {/* TOP BAR: IDENTITY & STATUS */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-[#15191f]/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#ff5500]/10 flex items-center justify-center border border-[#ff5500]/30">
              <Activity className="text-[#ff5500] w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                OPS_CORE // MATCH_{match.id.slice(0, 4)}
              </h2>
              <div className="flex gap-2 mt-1">
                <TacticalBadge status={match.status}>{match.status}</TacticalBadge>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{match.format || 'BO1'} ENGAGEMENT</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-zinc-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT GRID: SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* 1. SCOREBOARD SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/40 p-8 border border-zinc-800/50 rounded-sm">
            <div className="text-center md:text-right space-y-2 order-1">
              <h3 className="text-2xl font-black text-white uppercase truncate">{match.team1_name}</h3>
              <p className="text-[#ff5500] font-mono text-xs font-bold tracking-[0.3em]">ALPHA_LEAD</p>
            </div>
            <div className="flex flex-col items-center gap-2 order-2">
              <span className="text-6xl font-mono font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {match.score || '0 - 0'}
              </span>
              <div className="h-px w-20 bg-zinc-800" />
            </div>
            <div className="text-center md:text-left space-y-2 order-3">
              <h3 className="text-2xl font-black text-white uppercase truncate">{match.team2_name}</h3>
              <p className="text-[#ff5500] font-mono text-xs font-bold tracking-[0.3em]">BRAVO_LEAD</p>
            </div>
          </div>

          {/* 2. VETO SYSTEM INTERFACE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
              < Hammer size={14} />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Map Veto Sequence</span>
            </div>
            <VetoPanel match={match} />
          </div>

          {/* 3. CLASSIFIED DATA (The Law of Visibility) */}
          {canSeeIP && match.server_ip ? (
            <div className="bg-emerald-950/10 border border-emerald-500/30 p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-emerald-500 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Server size={14} /> Connection Uplink Established
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1 italic">Click terminal to copy string</p>
                </div>
                {copyFeedback && <span className="text-emerald-400 text-[10px] font-mono font-bold animate-bounce">STR_COPIED</span>}
              </div>
              <button 
                onClick={() => handleCopy(`connect ${match.server_ip}; password ${match.server_password}`)}
                className="w-full bg-black/60 p-4 rounded border border-emerald-900/50 hover:border-emerald-500/50 transition-all text-left group"
              >
                <code className="text-emerald-400 font-mono text-sm break-all leading-relaxed">
                  connect {match.server_ip}; password {match.server_password}
                </code>
              </button>
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800 p-6 flex flex-col items-center gap-3 opacity-50">
              <Shield size={24} className="text-zinc-700" />
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">
                {match.status === MATCH_STATUS.LIVE 
                  ? "Connection Data Restricted: Authenticate as Captain" 
                  : "Uplink Offline: Awaiting Match Initialization"}
              </p>
            </div>
          )}

          {/* 4. ADMIN GOD MODE (The Law of Admin Sovereignty) */}
          {isOperator && (
            <div className="border-2 border-red-900/30 bg-red-950/5 p-6 rounded-sm space-y-4">
              <h4 className="text-red-500 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Hammer size={14} /> System Override Console
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button className="bg-zinc-900 border border-zinc-700 p-2 text-[9px] font-black text-white hover:bg-white hover:text-black transition-all">FORCE_LIVE</button>
                <button className="bg-zinc-900 border border-zinc-700 p-2 text-[9px] font-black text-white hover:bg-white hover:text-black transition-all">RESET_VETO</button>
                <button className="bg-red-600 border border-red-500 p-2 text-[9px] font-black text-white hover:bg-red-500 transition-all">TERM_MATCH</button>
                <button className="bg-zinc-900 border border-zinc-700 p-2 text-[9px] font-black text-white hover:bg-white hover:text-black transition-all">EDIT_SCORES</button>
              </div>
            </div>
          )}

          {/* 5. TACTICAL FEED (Mobile Optimized) */}
          <div className="space-y-4 pb-12">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
              <Clock size={14} />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Deployment History</span>
            </div>
            <div className="space-y-3">
              {timeline.length > 0 ? (
                timeline.map((event) => (
                  <div key={event.id} className="flex gap-4 items-start group">
                    <span className="text-zinc-600 font-mono text-[9px] min-w-[70px] pt-1 italic">
                      {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1 border-l border-zinc-800 pl-4 py-1 group-hover:border-[#ff5500] transition-colors">
                      <p className="text-xs text-zinc-300 font-mono tracking-tight uppercase">{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-700 font-mono text-[10px] uppercase italic">Initializing telemetry data...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MatchModal);
