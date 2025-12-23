import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ⚠️ DEPENDENCY ALERT: This hook contains the actual logic
import { useAdminConsole } from '../hooks/useAdminConsole'; 
import { LogOut, ShieldCheck, Key, UserPlus, MonitorPlay } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  
  // Data comes from here. If this hook has mocks, the Dashboard has mocks.
  const { adminProfile, tempPin, error, loading, login, createAdmin, changeMyPin } = useAdminConsole();
  
  // Forms State
  const [newAdmin, setNewAdmin] = useState({ name: '', discordHandle: '', discordUser: '', faceitUser: '', faceitUrl: '' });
  const [changePinData, setChangePinData] = useState({ oldPin: '', newPin: '', securityToken: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogout = () => navigate('/'); 
  const goToBracket = () => navigate('/');
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

  // 1. LOGIN SCREEN (If not authenticated)
  if (!adminProfile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans">
         <div className="bg-[#0a0a0c] p-10 rounded-xl border border-zinc-800 shadow-2xl w-full max-w-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600" />
            <h2 className="mb-8 text-2xl font-black text-white tracking-widest text-center uppercase">Admin Access</h2>
            <form onSubmit={handleLogin} className="space-y-6">
                <input type="password" value={pin} onChange={e=>setPin(e.target.value)} className="w-full bg-black/50 border border-zinc-700 text-white p-4 text-center text-2xl tracking-[0.5em] rounded focus:border-fuchsia-500 outline-none transition-all placeholder-zinc-800 font-mono" placeholder="••••" autoFocus />
                <button disabled={loading} className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold p-4 rounded uppercase tracking-widest text-sm shadow-lg shadow-fuchsia-900/20 transition-all">{loading ? 'Verifying...' : 'Authorize'}</button>
            </form>
            {error && <div className="mt-6 text-center"><span className="text-red-500 text-xs font-bold uppercase bg-red-900/10 px-3 py-1 rounded border border-red-900/50">{error}</span></div>}
         </div>
      </div>
    );
  }

  // 2. DASHBOARD (If authenticated)
  return (
    <div className="min-h-screen bg-[#060709] p-4 md:p-12 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-6xl mx-auto bg-[#0b0c0f]/95 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* HEADER */}
        <header className="bg-black/40 border-b border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-fuchsia-900/20 rounded-lg border border-fuchsia-500/20">
              <ShieldCheck className="w-8 h-8 text-fuchsia-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500">Console</span></h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                <span className="text-fuchsia-400 font-bold">{adminProfile.role}</span>
                <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                <span>{adminProfile.display_name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
              <button onClick={goToBracket} className="flex items-center gap-2 bg-emerald-900/10 hover:bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all group">
                <MonitorPlay className="w-4 h-4 group-hover:scale-110 transition-transform" /> War Room
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-zinc-800 hover:bg-red-900/20 hover:text-red-400 border border-transparent hover:border-red-900/50 text-zinc-400 px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all">
                <LogOut className="w-4 h-4" /> Logout
              </button>
          </div>
        </header>

        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* CREATE ADMIN PANEL */}
          {adminProfile.can_create_admin && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <UserPlus className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">New Officer Protocol</h2>
              </div>
              
              {tempPin && (
                <div className="bg-emerald-900/10 border border-emerald-500/50 p-6 rounded-xl text-center mb-6 animate-in fade-in">
                  <p className="text-emerald-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Access Granted</p>
                  <p className="text-4xl font-black text-white tracking-widest select-all font-mono">{tempPin}</p>
                  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-wide">Copy Immediately - One Time View</p>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                 <div className="group">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 block group-focus-within:text-yellow-500 transition-colors">Callsign</label>
                    <input className="w-full bg-black/40 border border-zinc-700 p-3 rounded text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-800" placeholder="e.g. BRAVO" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 block">Discord ID</label>
                        <input className="w-full bg-black/40 border border-zinc-700 p-3 rounded text-white focus:border-yellow-500 outline-none text-xs" placeholder="bravo.gg" value={newAdmin.discordHandle} onChange={e => setNewAdmin({...newAdmin, discordHandle: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 block">Faceit User</label>
                        <input className="w-full bg-black/40 border border-zinc-700 p-3 rounded text-white focus:border-yellow-500 outline-none text-xs" placeholder="bravo1337" value={newAdmin.faceitUser} onChange={e => setNewAdmin({...newAdmin, faceitUser: e.target.value})} />
                    </div>
                 </div>
                 <button disabled={loading} className="w-full mt-4 bg-yellow-600 hover:bg-yellow-500 text-black font-black p-4 rounded uppercase tracking-widest text-xs shadow-lg transition-all">Generate Keys</button>
              </form>
            </div>
          )}

          {/* SECURITY PANEL */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <Key className="w-5 h-5 text-fuchsia-500" />
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Security Clearance</h2>
             </div>

             {successMsg && <div className="bg-emerald-900/20 border border-emerald-500/50 text-emerald-400 p-4 rounded text-xs font-bold text-center uppercase tracking-wide">{successMsg}</div>}
             
             <form onSubmit={handleChangePin} className="space-y-4">
                <div>
                   <label className="text-[10px] uppercase text-zinc-500 tracking-widest mb-1 block">Current PIN</label>
                   <input type="password" className="w-full bg-black/40 border border-zinc-700 p-3 rounded text-white tracking-[0.5em] focus:border-fuchsia-500 outline-none font-mono" onChange={e => setChangePinData({...changePinData, oldPin: e.target.value})} />
                </div>
                <div>
                   <label className="text-[10px] uppercase text-zinc-500 tracking-widest mb-1 block">New PIN</label>
                   <input type="password" className="w-full bg-black/40 border border-zinc-700 p-3 rounded text-white tracking-[0.5em] focus:border-fuchsia-500 outline-none font-mono" onChange={e => setChangePinData({...changePinData, newPin: e.target.value})} />
                </div>
                
                {adminProfile.role === 'OWNER' && (
                   <div className="pt-4 border-t border-white/10 animate-in fade-in">
                      <label className="text-[10px] text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2 font-bold">
                        <ShieldCheck className="w-3 h-3" /> Master Override Token
                      </label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full bg-red-950/10 border border-red-900/50 p-3 rounded text-red-200 text-center tracking-widest placeholder-red-900/30 focus:border-red-500 outline-none transition-all font-mono" 
                        onChange={e => setChangePinData({...changePinData, securityToken: e.target.value})} 
                      />
                   </div>
                )}
                
                <button disabled={loading} className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold p-4 rounded uppercase tracking-widest text-xs mt-4 shadow-lg">Update Credentials</button>
             </form>
             {error && <p className="text-red-500 mt-4 text-xs text-center font-bold uppercase tracking-wide bg-red-900/10 p-2 rounded border border-red-900/30">{error}</p>}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
