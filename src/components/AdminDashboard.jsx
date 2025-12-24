import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminConsole } from '../../hooks/useAdminConsole';
import { HudPanel, SkewButton, BreathingLogo } from '../ui/Components'; 
import { LogOut, Key, UserPlus, MonitorPlay, Users, Search, Edit2, RotateCcw, RefreshCw, Trophy, Lock, Unlock, PlayCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '../../supabase/client';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'tournament'
  
  // Data Logic
  const { 
    adminProfile, tempPin, error, loading, result, // Added result for ops feedback
    login, createAdmin, changeMyPin,
    syncRegistrations, generateBracket // New Ops
  } = useAdminConsole();
  
  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Forms State
  const [newAdmin, setNewAdmin] = useState({ name: '', discordHandle: '', discordUser: '', faceitUser: '', faceitUrl: '' });
  const [changePinData, setChangePinData] = useState({ oldPin: '', newPin: '', securityToken: '' });
  const [successMsg, setSuccessMsg] = useState('');

  // Tournament State (New for Style 1)
  const [tournament, setTournament] = useState(null);
  // HARDCODED ID for now based on your SQL logs - replace/fetch dynamically later if needed
  const TOURNAMENT_ID = 'e42d6e9f-a84f-47b5-b26c-48b2cab0d5ca'; 

  // --- TOURNAMENT STATE FETCHING ---
  useEffect(() => {
    if (activeTab === 'tournament' && adminProfile) {
      fetchTournamentStatus();
    }
  }, [activeTab, adminProfile, result]); // Re-fetch on tab change or op success

  const fetchTournamentStatus = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', TOURNAMENT_ID)
      .single();
    if (data) setTournament(data);
  };

  const handleLogout = () => navigate('/'); 
  const handleLogin = (e) => { e.preventDefault(); login(pin); };

  const handleCreate = (e) => {
    e.preventDefault();
    createAdmin(pin, { 
      name: newAdmin.name, 
      discord: newAdmin.discordHandle, 
      discordUser: newAdmin.discordUser, 
      faceitUser: newAdmin.faceitUser, 
      faceitUrl: newAdmin.faceitUrl 
    });
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const success = await changeMyPin(
      changePinData.oldPin, 
      changePinData.newPin, 
      { discordHandle: adminProfile.discord_handle, faceitUser: adminProfile.faceit_username, faceitUrl: adminProfile.faceit_url }, 
      changePinData.securityToken
    );
    if (success) setSuccessMsg("Credentials Updated. Re-authentication required.");
  };

  const searchUsers = async (query) => {
    if(!query || query.length < 2) return;
    try {
        const { data, error } = await supabase.rpc('admin_search_users', { search_term: query, admin_pin: pin });
        if(!error) setSearchResults(data || []);
    } catch (e) { console.error("Search failed", e); }
  };

  // --- LOGIN SCREEN ---
  if (!adminProfile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans backdrop-blur-md">
         <HudPanel className="w-full max-w-md">
            <h2 className="mb-8 text-2xl font-black text-white tracking-widest text-center uppercase font-['Teko']">Admin Access</h2>
            <form onSubmit={handleLogin} className="space-y-6">
                <input type="password" value={pin} onChange={e=>setPin(e.target.value)} className="w-full bg-black/50 border border-zinc-700 text-white p-4 text-center text-2xl tracking-[0.5em] focus:border-fuchsia-500 outline-none font-mono placeholder-zinc-800" placeholder="••••" autoFocus />
                <SkewButton type="submit" disabled={loading} className="w-full">
                    {loading ? 'VERIFYING...' : 'AUTHORIZE'}
                </SkewButton>
            </form>
            {error && <div className="mt-6 text-center"><span className="text-red-500 text-xs font-bold uppercase bg-red-900/10 px-3 py-1 rounded border border-red-900/50">{error}</span></div>}
         </HudPanel>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 bg-black/40 border border-zinc-800 backdrop-blur-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)' }}>
          <div className="flex items-center gap-4">
            <BreathingLogo size="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase font-['Teko']">Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500">Console</span></h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                <span className="text-fuchsia-400 font-bold">{adminProfile.role}</span>
                <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                <span>{adminProfile.display_name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
              <button onClick={() => setActiveTab('overview')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-fuchsia-900/20 text-fuchsia-400 border border-fuchsia-500/50' : 'text-zinc-500 hover:text-white'}`}>Overview</button>
              <button onClick={() => setActiveTab('users')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-fuchsia-900/20 text-fuchsia-400 border border-fuchsia-500/50' : 'text-zinc-500 hover:text-white'}`}>User Database</button>
              <button onClick={() => setActiveTab('tournament')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'tournament' ? 'bg-fuchsia-900/20 text-fuchsia-400 border border-fuchsia-500/50' : 'text-zinc-500 hover:text-white'}`}>
                <MonitorPlay className="w-4 h-4" /> War Room
              </button>
              <div className="w-[1px] h-8 bg-zinc-800 mx-2"></div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-900 hover:text-red-500 text-xs font-bold uppercase tracking-widest"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* FEEDBACK AREA */}
        {(error || result) && (
             <div className={`p-4 rounded border ${error ? 'bg-red-900/20 border-red-500/50 text-red-200' : 'bg-emerald-900/20 border-emerald-500/50 text-emerald-200'} font-mono text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2`}>
                 {error ? <ShieldAlert className="w-5 h-5"/> : <Trophy className="w-5 h-5"/>}
                 <span>{error || result}</span>
             </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
            {/* CREATE ADMIN */}
            {adminProfile.can_create_admin && (
              <HudPanel>
                <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                  <UserPlus className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-widest font-['Teko']">New Officer Protocol</h2>
                </div>
                {tempPin && (
                  <div className="bg-emerald-900/10 border border-emerald-500/50 p-4 mb-6 text-center">
                    <p className="text-emerald-500 text-[10px] uppercase font-bold">Generated PIN</p>
                    <p className="text-3xl font-black text-white tracking-widest font-mono">{tempPin}</p>
                  </div>
                )}
                <form onSubmit={handleCreate} className="space-y-4">
                   <input className="w-full bg-black/40 border border-zinc-700 p-3 text-white text-xs focus:border-yellow-500 outline-none" placeholder="CALLSIGN (e.g. BRAVO)" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                   <div className="grid grid-cols-2 gap-4">
                      <input className="bg-black/40 border border-zinc-700 p-3 text-white text-xs focus:border-yellow-500 outline-none" placeholder="DISCORD ID" value={newAdmin.discordHandle} onChange={e => setNewAdmin({...newAdmin, discordHandle: e.target.value})} />
                      <input className="bg-black/40 border border-zinc-700 p-3 text-white text-xs focus:border-yellow-500 outline-none" placeholder="FACEIT USER" value={newAdmin.faceitUser} onChange={e => setNewAdmin({...newAdmin, faceitUser: e.target.value})} />
                   </div>
                   <SkewButton type="submit" disabled={loading} className="w-full mt-4">GENERATE KEYS</SkewButton>
                </form>
              </HudPanel>
            )}

            {/* SECURITY PANEL */}
            <HudPanel>
               <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                  <Key className="w-5 h-5 text-fuchsia-500" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-widest font-['Teko']">Security Clearance</h2>
               </div>
               {successMsg && <div className="bg-emerald-900/20 text-emerald-400 p-2 text-xs font-bold text-center mb-4">{successMsg}</div>}
               <form onSubmit={handleChangePin} className="space-y-4">
                  <input type="password" placeholder="CURRENT PIN" className="w-full bg-black/40 border border-zinc-700 p-3 text-white tracking-[0.3em] font-mono text-center focus:border-fuchsia-500 outline-none" onChange={e => setChangePinData({...changePinData, oldPin: e.target.value})} />
                  <input type="password" placeholder="NEW PIN" className="w-full bg-black/40 border border-zinc-700 p-3 text-white tracking-[0.3em] font-mono text-center focus:border-fuchsia-500 outline-none" onChange={e => setChangePinData({...changePinData, newPin: e.target.value})} />
                  <SkewButton type="submit" disabled={loading} className="w-full mt-4">UPDATE CREDENTIALS</SkewButton>
               </form>
            </HudPanel>
          </div>
        )}

        {/* USER DATABASE TAB */}
        {activeTab === 'users' && (
          <HudPanel className="animate-in fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white uppercase font-['Teko'] flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> Global User Index</h2>
                <div className="relative">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                   <input 
                     type="text" 
                     placeholder="SEARCH ID / NAME" 
                     className="bg-black/40 border border-zinc-700 pl-10 pr-4 py-2 rounded text-xs text-white focus:border-cyan-500 outline-none w-64 font-mono"
                     value={userSearch}
                     onChange={(e) => { setUserSearch(e.target.value); searchUsers(e.target.value); }}
                   />
                </div>
             </div>
             {/* ... Table omitted for brevity, keeping existing structure ... */}
             <div className="text-center text-zinc-500 text-xs p-8 italic">Search engine ready...</div>
          </HudPanel>
        )}

        {/* 🚨 TOURNAMENT OPS TAB (NEW STYLE 1 LOGIC) 🚨 */}
        {activeTab === 'tournament' && (
            <div className="animate-in fade-in space-y-8">
                
                {/* STATUS HEADER */}
                <div className="flex items-center justify-between p-4 border border-zinc-800 bg-black/40 backdrop-blur">
                    <div>
                        <h2 className="text-2xl font-black text-white font-['Teko'] uppercase">Tournament Lifecycle</h2>
                        <div className="text-zinc-500 text-xs font-mono">ID: {TOURNAMENT_ID}</div>
                    </div>
                    {tournament && (
                        <div className={`px-4 py-2 rounded font-mono font-bold text-sm tracking-widest border ${
                            tournament.status === 'active' ? 'bg-red-900/20 border-red-500 text-red-500' : 
                            tournament.status === 'seeding' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-500' :
                            'bg-blue-900/20 border-blue-500 text-blue-500'
                        }`}>
                            STATUS: {tournament.status.toUpperCase()}
                        </div>
                    )}
                </div>

                {tournament && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* PHASE 1: INGESTION */}
                        <HudPanel className={`${tournament.status === 'setup' ? 'border-blue-500/50' : 'opacity-50'}`}>
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <Unlock className={`w-5 h-5 ${tournament.status === 'setup' ? 'text-blue-500' : 'text-zinc-600'}`} />
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest font-['Teko']">Phase 1: Ingestion</h2>
                            </div>
                            <div className="bg-zinc-900/50 p-4 mb-4 rounded border border-zinc-800">
                                <h3 className="text-white font-bold text-sm mb-2">Sync Registrations</h3>
                                <p className="text-zinc-500 text-xs mb-4">Pull data from Sheets. Safe to run repeatedly in SETUP.</p>
                                <SkewButton 
                                    onClick={() => syncRegistrations(TOURNAMENT_ID)}
                                    disabled={loading || tournament.status !== 'setup'}
                                    className="w-full bg-blue-900/20 hover:bg-blue-900/40 border-blue-500/30"
                                >
                                    EXECUTE SYNC PROTOCOL
                                </SkewButton>
                            </div>
                        </HudPanel>

                        {/* PHASE 2: BRACKETING */}
                        <HudPanel className={`${['setup', 'seeding'].includes(tournament.status) ? 'border-yellow-500/50' : 'opacity-50'}`}>
                             <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <Trophy className={`w-5 h-5 ${['setup', 'seeding'].includes(tournament.status) ? 'text-yellow-500' : 'text-zinc-600'}`} />
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest font-['Teko']">Phase 2: Bracketing</h2>
                            </div>
                            <div className="bg-zinc-900/50 p-4 mb-4 rounded border border-zinc-800">
                                <h3 className="text-white font-bold text-sm mb-2">Generate Full Tree</h3>
                                <p className="text-zinc-500 text-xs mb-4">Locks seeds. Wipes matches. Creates structure.</p>
                                <SkewButton 
                                    onClick={() => generateBracket(TOURNAMENT_ID)}
                                    disabled={loading || !['setup', 'seeding'].includes(tournament.status)}
                                    className="w-full bg-yellow-900/20 hover:bg-yellow-900/40 border-yellow-500/30 text-yellow-500"
                                >
                                    FORCE GENERATION
                                </SkewButton>
                            </div>
                        </HudPanel>

                        {/* PHASE 3: ACTIVE */}
                        <HudPanel className={`lg:col-span-2 ${tournament.status === 'active' ? 'border-red-500/50' : 'opacity-50'}`}>
                             <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <PlayCircle className={`w-5 h-5 ${tournament.status === 'active' ? 'text-red-500' : 'text-zinc-600'}`} />
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest font-['Teko']">Phase 3: Live Operations</h2>
                            </div>
                             <div className="bg-zinc-900/50 p-8 rounded border border-zinc-800 text-center">
                                <Lock className="w-8 h-8 text-red-500 mx-auto mb-4" />
                                <h3 className="text-white font-bold mb-2">Structure Locked</h3>
                                <p className="text-zinc-500 text-sm">
                                    Global structural changes are disabled while tournament is ACTIVE.
                                    <br/>Use the Match Controls in the bracket view to manage live games.
                                </p>
                            </div>
                        </HudPanel>

                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
