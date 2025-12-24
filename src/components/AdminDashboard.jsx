import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminConsole } from '../../hooks/useAdminConsole';
import { AdminAuditLog } from './AdminAuditLog'; // Import the new component
import { HudPanel, SkewButton, BreathingLogo } from '../ui/Components'; 
import { LogOut, Key, UserPlus, MonitorPlay, Users, Search, RefreshCw, Trophy, Lock, Unlock, PlayCircle, ShieldAlert, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabase/client';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // Data Logic
  const { 
    adminProfile, tempPin, error, loading, result,
    login, createAdmin, changeMyPin,
    syncRegistrations, generateBracket, fetchTournaments 
  } = useAdminConsole();
  
  // UI State
  const [newAdmin, setNewAdmin] = useState({ name: '', discordHandle: '', discordUser: '', faceitUser: '', faceitUrl: '' });
  const [changePinData, setChangePinData] = useState({ oldPin: '', newPin: '', securityToken: '' });
  const [successMsg, setSuccessMsg] = useState('');

  // --- NEW: TOURNAMENT SELECTION STATE ---
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [tournamentData, setTournamentData] = useState(null);

  // Fetch list on mount (if authed)
  useEffect(() => {
    if (adminProfile) {
      loadTournamentList();
    }
  }, [adminProfile]);

  // Fetch specific tournament details when selection changes or actions happen
  useEffect(() => {
    if (selectedTournamentId) {
      fetchTournamentStatus();
    }
  }, [selectedTournamentId, result]);

  const loadTournamentList = async () => {
    const list = await fetchTournaments();
    setTournaments(list);
    // Auto-select the first one if available and nothing selected
    if (list.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(list[0].id);
    }
  };

  const fetchTournamentStatus = async () => {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', selectedTournamentId)
      .single();
    if (data) setTournamentData(data);
  };

  const handleLogout = () => navigate('/'); 
  const handleLogin = (e) => { e.preventDefault(); login(pin); };
  // ... handleCreate, handleChangePin (same as before) ...

  // --- LOGIN SCREEN (Same as before) ---
  if (!adminProfile) { /* ... keep existing login code ... */ 
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
        
        {/* HEADER (Same as before) */}
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
              <button onClick={() => setActiveTab('tournament')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'tournament' ? 'bg-fuchsia-900/20 text-fuchsia-400 border border-fuchsia-500/50' : 'text-zinc-500 hover:text-white'}`}>
                <MonitorPlay className="w-4 h-4" /> War Room
              </button>
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

        {/* OVERVIEW TAB (Hidden for brevity, same as before) */}
        {activeTab === 'overview' && (
           <div className="text-white text-center p-12 bg-zinc-900/30 rounded border border-zinc-800">
               <p>Identity Management Module Active</p>
           </div>
        )}

        {/* 🚨 WAR ROOM (TOURNAMENT OPS) 🚨 */}
        {activeTab === 'tournament' && (
            <div className="animate-in fade-in space-y-8">
                
                {/* 1. TOURNAMENT SELECTOR (KILL THE HARDCODE) */}
                <div className="flex items-center justify-between p-4 border border-zinc-800 bg-black/40 backdrop-blur rounded">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-zinc-800 rounded">
                            <Trophy className="w-6 h-6 text-fuchsia-500" />
                        </div>
                        <div>
                            <label className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Target Operation</label>
                            <div className="relative">
                                <select 
                                    value={selectedTournamentId} 
                                    onChange={(e) => setSelectedTournamentId(e.target.value)}
                                    className="appearance-none bg-zinc-900 border border-zinc-700 text-white px-4 py-2 pr-10 rounded font-mono text-sm focus:border-fuchsia-500 outline-none w-64"
                                >
                                    <option value="" disabled>SELECT TOURNAMENT</option>
                                    {tournaments.map(t => (
                                        <option key={t.id} value={t.id}>{t.name || t.id}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {tournamentData && (
                        <div className={`px-4 py-2 rounded font-mono font-bold text-sm tracking-widest border ${
                            tournamentData.status === 'active' ? 'bg-red-900/20 border-red-500 text-red-500' : 
                            tournamentData.status === 'seeding' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-500' :
                            'bg-blue-900/20 border-blue-500 text-blue-500'
                        }`}>
                            STATUS: {tournamentData.status.toUpperCase()}
                        </div>
                    )}
                </div>

                {tournamentData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* PHASE 1: INGESTION */}
                        <HudPanel className={`${tournamentData.status === 'setup' ? 'border-blue-500/50' : 'opacity-50'}`}>
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <Unlock className={`w-5 h-5 ${tournamentData.status === 'setup' ? 'text-blue-500' : 'text-zinc-600'}`} />
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest font-['Teko']">Phase 1: Ingestion</h2>
                            </div>
                            <div className="bg-zinc-900/50 p-4 mb-4 rounded border border-zinc-800">
                                <h3 className="text-white font-bold text-sm mb-2">Sync Registrations</h3>
                                <p className="text-zinc-500 text-xs mb-4">Pull data from Sheets. Safe to run repeatedly in SETUP.</p>
                                <SkewButton 
                                    onClick={() => syncRegistrations(selectedTournamentId)}
                                    disabled={loading || tournamentData.status !== 'setup'}
                                    className="w-full bg-blue-900/20 hover:bg-blue-900/40 border-blue-500/30"
                                >
                                    EXECUTE SYNC PROTOCOL
                                </SkewButton>
                            </div>
                        </HudPanel>

                        {/* PHASE 2: BRACKETING */}
                        <HudPanel className={`${['setup', 'seeding'].includes(tournamentData.status) ? 'border-yellow-500/50' : 'opacity-50'}`}>
                             <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <Trophy className={`w-5 h-5 ${['setup', 'seeding'].includes(tournamentData.status) ? 'text-yellow-500' : 'text-zinc-600'}`} />
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest font-['Teko']">Phase 2: Bracketing</h2>
                            </div>
                            <div className="bg-zinc-900/50 p-4 mb-4 rounded border border-zinc-800">
                                <h3 className="text-white font-bold text-sm mb-2">Generate Full Tree</h3>
                                <p className="text-zinc-500 text-xs mb-4">Locks seeds. Wipes matches. Creates structure.</p>
                                <SkewButton 
                                    onClick={() => generateBracket(selectedTournamentId)}
                                    disabled={loading || !['setup', 'seeding'].includes(tournamentData.status)}
                                    className="w-full bg-yellow-900/20 hover:bg-yellow-900/40 border-yellow-500/30 text-yellow-500"
                                >
                                    FORCE GENERATION
                                </SkewButton>
                            </div>
                        </HudPanel>

                        {/* AUDIT LOGS (NEW) */}
                        <div className="col-span-1 lg:col-span-2">
                             <AdminAuditLog /> 
                        </div>

                    </div>
                ) : (
                    <div className="p-12 text-center text-zinc-500 bg-zinc-900/20 rounded border border-zinc-800 border-dashed">
                        SELECT A TOURNAMENT TO INITIALIZE COMMAND PROTOCOLS
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
