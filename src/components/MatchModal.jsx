import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../ui/Components';
import VetoPanel from './VetoPanel'; 
import { useTournament } from '../tournament/useTournament';
import { isAdmin, isTeamCaptain } from '../tournament/permissions';
import { useSession } from '../auth/useSession';
import { MonitorPlay, Server, Calendar, Tv, Shield, Copy, AlertTriangle } from 'lucide-react';

const MatchModal = ({ match, onClose }) => {
  const { adminUpdateMatch, teams } = useTournament();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, admin, settings
  const [copyFeedback, setCopyFeedback] = useState({});

  // Local state for edits
  const [streamUrl, setStreamUrl] = useState(match?.stream_url || '');
  const [serverIp, setServerIp] = useState(match?.server_ip || '');
  const [gotvIp, setGotvIp] = useState(match?.gotv_ip || '');
  
  // Update local state when match changes
  useEffect(() => {
    if (match) {
        setStreamUrl(match.stream_url || '');
        setServerIp(match.server_ip || '');
        setGotvIp(match.gotv_ip || '');
    }
  }, [match]);

  if (!match) return null;

  const team1 = teams?.find(t => t.id === match.team1Id) || { name: 'Team 1' };
  const team2 = teams?.find(t => t.id === match.team2Id) || { name: 'Team 2' };

  // Permission Checks
  const userIsAdmin = isAdmin(session);
  const userIsCaptain1 = isTeamCaptain(session, match.team1Id);
  const userIsCaptain2 = isTeamCaptain(session, match.team2Id);
  const canSeeServerIp = userIsAdmin || (match.status === 'live' && (userIsCaptain1 || userIsCaptain2));
  
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(`connect ${text}`);
    setCopyFeedback({ ...copyFeedback, [key]: true });
    setTimeout(() => setCopyFeedback(prev => ({ ...prev, [key]: false })), 2000);
  };

  const handleUpdateDetails = async () => {
      setLoading(true);
      try {
          await adminUpdateMatch(match.id, {
              stream_url: streamUrl,
              server_ip: serverIp,
              gotv_ip: gotvIp
          });
          // Show success feedback if needed
      } catch (e) {
          alert("Update Failed: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleForceWin = async (winnerId) => {
    if (!confirm("Are you sure? This ends the match immediately.")) return;
    setLoading(true);
    try {
        await adminUpdateMatch(match.id, { 
            winnerId, 
            status: 'completed',
            'vetoState.phase': 'completed'
        });
        onClose();
    } catch (e) {
        alert("Admin Action Failed: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal isOpen={!!match} onClose={onClose} title="Match Control Center" maxWidth="max-w-5xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-[#0b0c0f] rounded-xl border border-zinc-800 overflow-hidden relative">
            {/* Background Gradient/Image could go here */}
            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/10 to-transparent pointer-events-none" />
            
            <div className="relative p-6 grid grid-cols-3 items-center">
                {/* Team 1 */}
                <div className="text-right">
                    <h2 className="text-3xl font-black text-white tracking-tight">{team1.name}</h2>
                    <div className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-widest">
                        Seed #{team1.seed_number || '?'}
                    </div>
                </div>

                {/* Score / VS */}
                <div className="flex flex-col items-center justify-center">
                    <div className="text-zinc-700 font-black text-4xl italic tracking-tighter opacity-50 select-none">VS</div>
                    <Badge color={match.status === 'live' ? 'green' : 'gray'}>
                        {match.status === 'live' ? 'LIVE NOW' : match.status}
                    </Badge>
                </div>

                {/* Team 2 */}
                <div className="text-left">
                    <h2 className="text-3xl font-black text-white tracking-tight">{team2.name}</h2>
                    <div className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-widest">
                        Seed #{team2.seed_number || '?'}
                    </div>
                </div>
            </div>
        </div>

        {/* Tab Navigation (Admin Only or if needed) */}
        {userIsAdmin && (
            <div className="flex gap-2 border-b border-zinc-800 pb-2">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Overview & Veto
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Server & Stream
                </button>
                <button 
                    onClick={() => setActiveTab('admin')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'admin' ? 'bg-red-900/20 text-red-400' : 'text-zinc-500 hover:text-red-400'}`}
                >
                    Admin Danger Zone
                </button>
            </div>
        )}

        {/* --- VIEW: OVERVIEW --- */}
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Veto Panel */}
                <VetoPanel match={match} />

                {/* Server Info (Visible to Players/Admins) */}
                {(canSeeServerIp || userIsAdmin) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Game Server */}
                        {match.server_ip && match.server_ip !== 'HIDDEN' ? (
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
                                    <div className="absolute inset-0 bg-green-900/90 flex items-center justify-center text-green-400 font-bold text-sm backdrop-blur-sm">
                                        COPIED!
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl opacity-75 flex flex-col items-center justify-center text-center">
                                <Shield className="w-6 h-6 text-zinc-600 mb-2" />
                                <span className="text-xs font-bold text-zinc-500 uppercase">Server IP Hidden</span>
                            </div>
                        )}

                        {/* GOTV (Public/Admin) */}
                        {match.gotv_ip && match.gotv_ip !== 'HIDDEN' && (
                            <div 
                                onClick={() => handleCopy(match.gotv_ip, 'gotv')}
                                className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-xl cursor-pointer group hover:bg-purple-900/20 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                                        <MonitorPlay className="w-4 h-4" /> GOTV (Spectator)
                                    </div>
                                    <Copy className="w-4 h-4 text-purple-500 opacity-50 group-hover:opacity-100" />
                                </div>
                                <code className="text-sm text-purple-100 font-mono block bg-black/40 p-2 rounded border border-purple-500/20">
                                    connect {match.gotv_ip}
                                </code>
                                {copyFeedback['gotv'] && (
                                    <div className="absolute inset-0 bg-purple-900/90 flex items-center justify-center text-purple-400 font-bold text-sm backdrop-blur-sm">
                                        COPIED!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* --- VIEW: SETTINGS (Admin) --- */}
        {activeTab === 'settings' && userIsAdmin && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Game Server IP</label>
                        <input 
                            className="w-full bg-[#0b0c0f] border border-zinc-700 rounded p-3 text-white focus:border-blue-500 outline-none font-mono text-sm"
                            value={serverIp}
                            onChange={(e) => setServerIp(e.target.value)}
                            placeholder="127.0.0.1:27015"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">GOTV IP</label>
                        <input 
                            className="w-full bg-[#0b0c0f] border border-zinc-700 rounded p-3 text-white focus:border-purple-500 outline-none font-mono text-sm"
                            value={gotvIp}
                            onChange={(e) => setGotvIp(e.target.value)}
                            placeholder="127.0.0.1:27020"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Stream URL</label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <Tv className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                <input 
                                    className="w-full bg-[#0b0c0f] border border-zinc-700 rounded p-3 pl-10 text-white focus:border-purple-500 outline-none"
                                    value={streamUrl}
                                    onChange={(e) => setStreamUrl(e.target.value)}
                                    placeholder="https://twitch.tv/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={handleUpdateDetails} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </div>
        )}

        {/* --- VIEW: ADMIN DANGER ZONE --- */}
        {activeTab === 'admin' && userIsAdmin && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-red-950/10 border border-red-900/30 p-6 rounded-xl">
                    <h4 className="text-red-400 font-bold text-sm uppercase flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4" /> Force Match Result
                    </h4>
                    <p className="text-zinc-500 text-xs mb-6 max-w-md">
                        Manually ending the match will override any current server state, lock the veto, and advance the bracket. This action is logged.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            variant="danger" 
                            className="h-12 text-sm uppercase tracking-wider"
                            onClick={() => handleForceWin(match.team1Id)}
                            disabled={loading}
                        >
                            Force Win: {team1.name}
                        </Button>
                        <Button 
                            variant="danger" 
                            className="h-12 text-sm uppercase tracking-wider"
                            onClick={() => handleForceWin(match.team2Id)}
                            disabled={loading}
                        >
                            Force Win: {team2.name}
                        </Button>
                    </div>
                </div>
                {/* Placeholder for future features like Reset Match */}
                <div className="text-center">
                    <p className="text-zinc-600 text-xs uppercase tracking-widest">More admin tools coming in Phase 1</p>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default MatchModal;
