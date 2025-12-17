import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../ui/Components';
import VetoPanel from './VetoPanel'; 
import { useTournament } from '../tournament/useTournament';
import { isAdmin, isTeamCaptain } from '../tournament/permissions';
import { useSession } from '../auth/useSession';
import { MonitorPlay, Server, Tv, Shield, Copy, AlertTriangle, Play, Pause, RotateCcw, Edit3, History, User, Lock, Activity, Map, X } from 'lucide-react';

const MatchModal = ({ match, onClose }) => {
  const { adminUpdateMatch, fetchMatchTimeline, teams } = useTournament();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [copyFeedback, setCopyFeedback] = useState({});
  const [timeline, setTimeline] = useState([]);

  // Local state for edits
  const [streamUrl, setStreamUrl] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [gotvIp, setGotvIp] = useState('');
  const [manualScore, setManualScore] = useState('');
  
  useEffect(() => {
    if (match) {
        setStreamUrl(match.stream_url || '');
        setServerIp(match.server_ip || '');
        setGotvIp(match.gotv_ip || '');
        setManualScore(match.score || ''); 
        
        if (activeTab === 'timeline') {
            fetchMatchTimeline(match.id).then(setTimeline);
        }
    }
  }, [match, activeTab]);

  if (!match) return null;

  // Use team names/logos from normalized match object
  const t1Name = match.team1Name || 'TBD';
  const t2Name = match.team2Name || 'TBD';
  const t1Logo = match.team1Logo;
  const t2Logo = match.team2Logo;
  const matchIdShort = (match.id || '').toString().split('-')[0].toUpperCase();

  // Permission Checks
  const userIsAdmin = isAdmin(session);
  const userIsCaptain = isTeamCaptain(session, match.team1Id) || isTeamCaptain(session, match.team2Id);
  const isMatchLive = match.status === 'live';
  const canSeeServerIp = userIsAdmin || (isMatchLive && userIsCaptain);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(`connect ${text}`);
    setCopyFeedback({ ...copyFeedback, [key]: true });
    setTimeout(() => setCopyFeedback(prev => ({ ...prev, [key]: false })), 2000);
  };

  const handleUpdate = async (updates) => {
     setLoading(true);
     try {
         await adminUpdateMatch(match.id, updates);
         fetchMatchTimeline(match.id).then(setTimeline);
     } catch (e) {
         alert("Update Failed: " + e.message);
     } finally {
         setLoading(false);
     }
  };

  const saveSettings = () => handleUpdate({ stream_url: streamUrl, server_ip: serverIp, gotv_ip: gotvIp, score: manualScore });
  const setMatchState = (newState) => handleUpdate({ status: newState });
  const handleForceWin = async (winnerId) => {
    if (!confirm("Are you sure? This ends the match immediately.")) return;
    handleUpdate({ winnerId, status: 'completed', 'vetoState.phase': 'completed' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-[#0b0c0f] border border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 98% 100%, 0 100%)' }}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#15191f]/80">
          <div className="flex items-center gap-4">
             <Activity className="w-5 h-5 text-[#ff5500]" />
             <div>
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">TACTICAL_INTEL // {matchIdShort}</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{match.status}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>

        {/* CONTENT SCROLL */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* SCOREBOARD */}
            <div className="flex items-center justify-between gap-8 py-4 bg-black/20 rounded-xl border border-zinc-800/50 p-6">
                <div className="flex-1 text-center space-y-3">
                    <div className="w-20 h-20 mx-auto bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-sm">
                        {t1Logo ? <img src={t1Logo} className="w-12 h-12 object-contain" /> : <Shield className="w-8 h-8 text-zinc-800" />}
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-widest">{t1Name}</p>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-5xl font-mono font-black text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{match.score || '0-0'}</span>
                    <div className="px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-2">VS</div>
                </div>
                <div className="flex-1 text-center space-y-3">
                    <div className="w-20 h-20 mx-auto bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-sm">
                        {t2Logo ? <img src={t2Logo} className="w-12 h-12 object-contain" /> : <Shield className="w-8 h-8 text-zinc-800" />}
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-widest">{t2Name}</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex border-b border-zinc-800">
                <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#ff5500] text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>Overview</button>
                <button onClick={() => setActiveTab('timeline')} className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-[#ff5500] text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>Timeline</button>
                {userIsAdmin && <button onClick={() => setActiveTab('admin')} className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'admin' ? 'border-red-500 text-red-500' : 'border-transparent text-zinc-600 hover:text-red-400'}`}>Admin</button>}
            </div>

            {/* OVERVIEW CONTENT */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {canSeeServerIp ? (
                            <div onClick={() => handleCopy(serverIp, 'server')} className="bg-[#15191f] p-4 border border-green-900/30 rounded-sm cursor-pointer group hover:bg-green-900/10 transition-colors">
                                <p className="text-[9px] font-mono text-green-500 uppercase mb-2 tracking-[0.2em] flex items-center gap-2"><Server className="w-3 h-3" /> Game Server</p>
                                <code className="text-xs text-green-100 font-mono block bg-black/40 p-2 rounded border border-green-500/20">{serverIp || 'IP_PENDING'}</code>
                                {copyFeedback['server'] && <span className="text-[10px] text-green-400 font-bold block mt-1">COPIED</span>}
                            </div>
                        ) : (
                            <div className="bg-[#15191f] p-4 border border-zinc-800 rounded-sm opacity-50 flex items-center justify-center gap-2 text-zinc-500 font-mono text-xs uppercase">
                                <Lock className="w-4 h-4" /> Secure Server Info
                            </div>
                        )}
                        <div className="bg-[#15191f] p-4 border border-zinc-800 rounded-sm">
                             <p className="text-[9px] font-mono text-zinc-500 uppercase mb-2 tracking-[0.2em] flex items-center gap-2"><Tv className="w-3 h-3" /> Broadcast</p>
                             <span className="text-xs font-bold text-white uppercase tracking-widest">{streamUrl ? 'LINK_ACTIVE' : 'OFFLINE'}</span>
                        </div>
                    </div>
                    <VetoPanel match={match} />
                </div>
            )}

            {/* TIMELINE CONTENT */}
            {activeTab === 'timeline' && (
                <div className="bg-[#0b0c0f] border border-zinc-800 rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-3 font-mono text-xs">
                    {timeline.length === 0 ? <p className="text-zinc-600 italic">No events recorded.</p> : timeline.map(e => (
                        <div key={e.id} className="flex gap-4 border-b border-zinc-800/50 pb-2">
                            <span className="text-zinc-500">{new Date(e.created_at).toLocaleTimeString()}</span>
                            <span className="text-zinc-300">{e.action_type}</span>
                            <span className="text-[#ff5500]">{e.performed_by}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ADMIN CONTENT */}
            {activeTab === 'admin' && userIsAdmin && (
                <div className="space-y-4 bg-red-950/10 p-6 rounded-xl border border-red-900/30">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">Danger Zone</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <input className="bg-[#0b0c0f] border border-zinc-700 p-2 text-white text-xs font-mono" value={manualScore} onChange={e => setManualScore(e.target.value)} placeholder="Score (13-0)" />
                        <input className="bg-[#0b0c0f] border border-zinc-700 p-2 text-white text-xs font-mono" value={serverIp} onChange={e => setServerIp(e.target.value)} placeholder="Server IP" />
                        <Button variant="primary" onClick={saveSettings} disabled={loading}>Update Match Data</Button>
                        <Button variant="danger" onClick={() => handleForceWin(match.team1Id)}>Force Win T1</Button>
                    </div>
                </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex justify-end">
           <button onClick={onClose} className="px-8 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-[0.3em] border border-zinc-700 transition-all">CLOSE_PANEL</button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
