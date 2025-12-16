import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../ui/Components';
import VetoPanel from './VetoPanel'; 
import { useTournament } from '../tournament/useTournament';
import { isAdmin, isTeamCaptain } from '../tournament/permissions';
import { useSession } from '../auth/useSession';
import { MonitorPlay, Server, Tv, Shield, Copy, AlertTriangle, Play, Pause, RotateCcw, Edit3, History, User, AlertOctagon, Lock } from 'lucide-react';

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
        
        // Fetch Timeline on open if tab is timeline
        if (activeTab === 'timeline') {
             fetchMatchTimeline(match.id).then(setTimeline);
        }
    }
  }, [match, activeTab]);

  if (!match) return null;

  // Use team names from match object (populated by useTournament)
  // Fallback to searching teams list if match object is stale
  const t1Name = match.team1Name || teams.find(t => t.id === match.team1Id)?.name || 'TBD';
  const t2Name = match.team2Name || teams.find(t => t.id === match.team2Id)?.name || 'TBD';
  
  // Seeds
  const t1Seed = teams.find(t => t.id === match.team1Id)?.seed_number || '?';
  const t2Seed = teams.find(t => t.id === match.team2Id)?.seed_number || '?';

  // Permission & Role Checks
  const userIsAdmin = isAdmin(session);
  const userIsCaptain1 = isTeamCaptain(session, match.team1Id);
  const userIsCaptain2 = isTeamCaptain(session, match.team2Id);
  const userIsCaptain = userIsCaptain1 || userIsCaptain2;
  
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
          // Refresh timeline after action
          fetchMatchTimeline(match.id).then(setTimeline);
      } catch (e) {
          alert("Update Failed: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  const saveSettings = () => handleUpdate({ 
      stream_url: streamUrl, 
      server_ip: serverIp, 
      gotv_ip: gotvIp,
      score: manualScore
  });

  const setMatchState = (newState) => {
      if (newState === 'live' && !serverIp && !confirm("Server IP is empty. Start match anyway?")) return;
      handleUpdate({ status: newState });
  };

  const handleForceWin = async (winnerId) => {
    if (!confirm("Are you sure? This ends the match immediately.")) return;
    handleUpdate({ 
        winnerId, 
        status: 'completed',
        'vetoState.phase': 'completed'
    });
    onClose();
  };

  // Timeline Renderer
  const renderTimeline = () => (
      <div className="space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4" /> Audit Log (Immutable)
          </h4>
          <div className="bg-[#0b0c0f] border border-zinc-800 rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-3">
              {timeline.length === 0 ? (
                  <p className="text-zinc-600 text-xs italic">No events recorded yet.</p>
              ) : (
                  timeline.map((event) => (
                      <div key={event.id} className="flex gap-3 text-sm border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                          <div className="flex-col min-w-[60px]">
                              <span className="text-zinc-500 text-[10px] font-mono block">
                                  {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                          </div>
                          <div>
                              <div className="text-zinc-300 font-medium">
                                  {event.action_type.replace(/_/g, ' ')}
                              </div>
                              <div className="text-zinc-500 text-xs flex items-center gap-1">
                                  <User className="w-3 h-3" /> 
                                  <span className="text-fuchsia-400 font-bold">
                                      {event.performed_by || 'System'}
                                  </span>
                                  {event.actor_role && <span className="bg-zinc-800 px-1 rounded text-[9px]">{event.actor_role}</span>}
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
  );

  return (
    <Modal isOpen={!!match} onClose={onClose} title="Match Room" maxWidth="max-w-5xl">
      <div className="space-y-6">
        
        {/* HEADER */}
        <div className="bg-[#0b0c0f] rounded-xl border border-zinc-800 overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/10 to-transparent pointer-events-none" />
            <div className="relative p-6 grid grid-cols-3 items-center">
                <div className="text-right">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">{t1Name}</h2>
                    <div className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-widest">Seed #{t1Seed}</div>
                </div>
                <div className="flex flex-col items-center justify-center space-y-2">
                    {match.score ? (
                        <div className="text-4xl font-mono font-bold text-white tracking-widest">{match.score}</div>
                    ) : (
                        <div className="text-zinc-700 font-black text-4xl italic tracking-tighter opacity-50 select-none">VS</div>
                    )}
                    <Badge color={match.status === 'live' ? 'green' : match.status === 'completed' ? 'gray' : 'yellow'}>
                        {match.status === 'live' ? 'LIVE NOW' : match.status.toUpperCase()}
                    </Badge>
                </div>
                <div className="text-left">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">{t2Name}</h2>
                    <div className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-widest">Seed #{t2Seed}</div>
                </div>
            </div>
            {/* Identity Banner */}
            <div className="bg-black/40 px-4 py-1 flex justify-center items-center border-t border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Viewing as: <span className={userIsAdmin ? "text-red-400 font-bold" : "text-zinc-300"}>
                        {session.isAuthenticated ? session.role : "SPECTATOR"}
                    </span>
                </span>
            </div>
        </div>

        {/* NAVIGATION - Role Aware */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Match & Veto
            </button>
            <button 
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'timeline' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                History & Logs
            </button>
            
            {/* Admin Only Tabs */}
            {userIsAdmin && (
                <>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Settings
                    </button>
                    <button 
                        onClick={() => setActiveTab('admin')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'admin' ? 'bg-red-900/20 text-red-400' : 'text-zinc-500 hover:text-red-400'}`}
                    >
                        Danger Zone
                    </button>
                </>
            )}
        </div>

        {/* --- VIEW: OVERVIEW --- */}
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* SERVER INFO - Strict Logic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Server IP: Only shown to Admins or Captains WHEN LIVE */}
                    {canSeeServerIp ? (
                        match.server_ip && match.server_ip !== 'HIDDEN' ? (
                            <div 
                                onClick={() => handleCopy(match.server_ip, 'server')}
                                className="bg-green-900/10 border border-green-500/30 p-4 rounded-xl cursor-pointer group hover:bg-green-900/20 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold text-green-400 uppercase flex items-center gap-2">
                                        <Server className="w-4 h-4" /> Game Server
                                    </div>
                                    <Copy className="w-4 h-4 text-green-500 opacity-50 group-hover:opacity-100" />
                                </div>
                                <code className="text-sm text-green-100 font-mono block bg-black/40 p-2 rounded border border-green-500/20">
                                    connect {match.server_ip}
                                </code>
                                {copyFeedback['server'] && (
                                    <div className="absolute inset-0 bg-green-900/90 flex items-center justify-center text-green-400 font-bold text-sm backdrop-blur-sm">COPIED!</div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl opacity-75 flex flex-col items-center justify-center text-center">
                                <Shield className="w-6 h-6 text-zinc-600 mb-2" />
                                <span className="text-xs font-bold text-zinc-500 uppercase">IP Pending</span>
                            </div>
                        )
                    ) : userIsCaptain ? (
                        // Locked State for Captains
                        <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                            <Lock className="w-6 h-6 text-yellow-500 opacity-50" />
                            <span className="text-xs font-bold text-yellow-500 uppercase">IP Locked</span>
                            <p className="text-[10px] text-zinc-500">Visible when match is LIVE</p>
                        </div>
                    ) : (
                        // Hidden for Spectators
                        <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex items-center justify-center">
                            <span className="text-xs font-bold text-zinc-600 uppercase">Server Hidden</span>
                        </div>
                    )}

                    {/* GOTV - Public */}
                    {match.gotv_ip && match.gotv_ip !== 'HIDDEN' && (
                        <div 
                            onClick={() => handleCopy(match.gotv_ip, 'gotv')}
                            className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-xl cursor-pointer group hover:bg-purple-900/20 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                                    <MonitorPlay className="w-4 h-4" /> GOTV
                                </div>
                                <Copy className="w-4 h-4 text-purple-500 opacity-50 group-hover:opacity-100" />
                            </div>
                            <code className="text-sm text-purple-100 font-mono block bg-black/40 p-2 rounded border border-purple-500/20">
                                connect {match.gotv_ip}
                            </code>
                            {copyFeedback['gotv'] && (
                                <div className="absolute inset-0 bg-purple-900/90 flex items-center justify-center text-purple-400 font-bold text-sm backdrop-blur-sm">COPIED!</div>
                            )}
                        </div>
                    )}
                </div>

                <VetoPanel match={match} />
            </div>
        )}

        {/* --- TAB: TIMELINE (Trust Center) --- */}
        {activeTab === 'timeline' && renderTimeline()}

        {/* --- ADMIN TABS (Hidden from Captains) --- */}
        {activeTab === 'settings' && userIsAdmin && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Match Lifecycle</h4>
                    <div className="flex gap-3">
                        <Button 
                            onClick={() => setMatchState('live')}
                            className={`flex-1 flex items-center justify-center gap-2 ${match.status === 'live' ? 'bg-green-600' : 'bg-zinc-800'}`}
                            disabled={match.status === 'live' || loading}
                        >
                            <Play className="w-4 h-4" /> Start Match (Reveal IP)
                        </Button>
                        <Button 
                            onClick={() => setMatchState('paused')}
                            className="bg-yellow-900/30 text-yellow-500 border border-yellow-900/50 hover:bg-yellow-900/50"
                            disabled={loading}
                        >
                            <Pause className="w-4 h-4" /> Pause
                        </Button>
                        <Button 
                            onClick={() => setMatchState('scheduled')}
                            variant="ghost"
                            className="text-zinc-500 hover:text-white"
                            disabled={loading}
                        >
                            <RotateCcw className="w-4 h-4" /> Reset
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Server IP (Secret)</label>
                        <input className="w-full bg-[#0b0c0f] border border-zinc-700 rounded p-3 text-white focus:border-blue-500 outline-none font-mono text-sm"
                            value={serverIp} onChange={(e) => setServerIp(e.target.value)} placeholder="127.0.0.1:27015" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">GOTV IP (Public)</label>
                        <input className="w-full bg-[#0b0c0f] border border-zinc-700 rounded p-3 text-white focus:border-purple-500 outline-none font-mono text-sm"
                            value={gotvIp} onChange={(e) => setGotvIp(e.target.value)} placeholder="127.0.0.1:27020" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Manual Score</label>
                        <div className="relative">
                            <Edit3 className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <input className="w-full bg-[#0b0c0f] border border-zinc-700 rounded p-3 pl-10 text-white focus:border-green-500 outline-none font-mono"
                                value={manualScore} onChange={(e) => setManualScore(e.target.value)} placeholder="e.g. 13 - 9" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Stream URL</label>
                        <div className="relative">
                            <Tv className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <input className="w-full bg-[#0b0c0f] border border-zinc-700 rounded p-3 pl-10 text-white focus:border-purple-500 outline-none"
                                value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://twitch.tv/..." />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <Button onClick={saveSettings} disabled={loading}>Save Changes</Button>
                </div>
            </div>
        )}

        {activeTab === 'admin' && userIsAdmin && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-red-950/10 border border-red-900/30 p-6 rounded-xl">
                    <h4 className="text-red-400 font-bold text-sm uppercase flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4" /> Force Result
                    </h4>
                    <p className="text-zinc-500 text-xs mb-6 max-w-md">
                        Manually ending the match will lock the veto and advance the bracket. This is logged in the Timeline.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="danger" className="h-12" onClick={() => handleForceWin(match.team1Id)} disabled={loading}>
                            Win: {team1.name}
                        </Button>
                        <Button variant="danger" className="h-12" onClick={() => handleForceWin(match.team2Id)} disabled={loading}>
                            Win: {team2.name}
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default MatchModal;
