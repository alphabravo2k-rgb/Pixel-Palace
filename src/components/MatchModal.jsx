import React, { useState, useEffect, memo } from 'react';
import { Modal, Button, Badge } from '../ui/Components';
import VetoPanel from './VetoPanel'; // Import the unified component
import { useTournament } from '../tournament/useTournament';
import { isAdmin } from '../tournament/permissions';
import { useSession } from '../auth/useSession';
import { Server, Tv, History, ShieldAlert, Play, Pause, RotateCcw, Copy, Check, X, Activity } from 'lucide-react';

const MatchModal = ({ match, onClose }) => {
  const { adminUpdateMatch, teams } = useTournament(); 
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(null);

  if (!match) return null;

  const userIsAdmin = isAdmin(session);
  const isLive = match.status === 'live';

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleForceWin = async (winnerId) => {
    if(!confirm("CONFIRM: Force win this match? This cannot be undone.")) return;
    await adminUpdateMatch(match.id, { winnerId, status: 'completed', 'vetoState.phase': 'complete' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="w-full max-w-5xl bg-[#0b0c0f] border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 98% 100%, 0 100%)' }}
      >
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-[#15191f]/50">
          <div className="flex items-center gap-4">
            <Activity className={`w-5 h-5 ${isLive ? 'text-emerald-500 animate-pulse' : 'text-zinc-500'}`} />
            <div>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase font-['Teko']">
                OPS_CORE // MATCH_{match.id.toString().slice(0, 4)}
              </h2>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-tighter border ${isLive ? 'border-emerald-500/50 text-emerald-500 bg-emerald-900/20' : 'border-zinc-700 text-zinc-500 bg-zinc-900'}`}>
                   {match.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* SCOREBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/40 p-8 border border-zinc-800/50 rounded-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
             <h3 className="text-3xl font-black text-white uppercase text-center md:text-right font-['Teko'] tracking-tight relative z-10">{match.team1Name}</h3>
             <div className="text-6xl font-mono font-black italic text-white text-center tracking-widest relative z-10 drop-shadow-2xl">{match.score || 'VS'}</div>
             <h3 className="text-3xl font-black text-white uppercase text-center md:text-left font-['Teko'] tracking-tight relative z-10">{match.team2Name}</h3>
          </div>

          {/* VETO PANEL (Embedded Mode) */}
          <VetoPanel match={match} />

          {/* SERVER DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {match.server_ip && match.server_ip !== 'HIDDEN' ? (
                <div onClick={() => handleCopy(`connect ${match.server_ip}`, 'ip')} className="bg-emerald-950/10 border border-emerald-500/30 p-6 relative overflow-hidden group cursor-pointer hover:bg-emerald-900/20 transition-all rounded">
                   <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-2"><Server className="w-4 h-4" /> Game Server</span>
                      {copied === 'ip' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-500 opacity-50 group-hover:opacity-100" />}
                   </div>
                   <code className="text-emerald-100 font-mono text-sm break-all leading-relaxed">connect {match.server_ip}</code>
                </div>
             ) : (
                <div className="bg-zinc-900/20 border border-zinc-800 p-6 flex flex-col items-center justify-center gap-2 rounded opacity-60">
                   <ShieldAlert className="w-6 h-6 text-zinc-600" />
                   <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Server Intel Locked</span>
                </div>
             )}

             {match.stream_url && (
                <div className="bg-purple-900/10 border border-purple-500/30 p-6 rounded relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-400 font-bold text-xs uppercase flex items-center gap-2"><Tv className="w-4 h-4" /> Broadcast</span>
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   </div>
                   <a href={match.stream_url} target="_blank" rel="noreferrer" className="text-purple-100 font-mono text-sm hover:underline truncate block">{match.stream_url}</a>
                </div>
             )}
          </div>

          {/* ADMIN TOOLS */}
          {userIsAdmin && (
             <div className="border-t border-zinc-800 pt-6 mt-6">
                <h4 className="text-red-500 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                   <ShieldAlert size={14} /> System Override Console
                </h4>
                <div className="flex gap-4">
                   <Button variant="danger" onClick={() => handleForceWin(match.team1Id)}>Force Win: {match.team1Name}</Button>
                   <Button variant="danger" onClick={() => handleForceWin(match.team2Id)}>Force Win: {match.team2Name}</Button>
                   <Button onClick={() => adminUpdateMatch(match.id, { status: 'live' })} disabled={isLive} className="ml-auto bg-emerald-600 hover:bg-emerald-500"><Play className="w-4 h-4 mr-2" /> Start Match</Button>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default memo(MatchModal);
