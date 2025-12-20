import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminConsole } from '../hooks/useAdminConsole';
import { LogOut, ShieldCheck, Key, UserPlus, Fingerprint, Gamepad2, Link, MonitorPlay } from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const { adminProfile, tempPin, error, loading, login, createAdmin, changeMyPin } = useAdminConsole();
  
  // Forms
  const [newAdmin, setNewAdmin] = useState({ 
    name: '', 
    discordHandle: '', 
    discordUser: '',   
    faceitUser: '', 
    faceitUrl: '' 
  });
  
  const [changePinData, setChangePinData] = useState({ oldPin: '', newPin: '', securityToken: '' });
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-Login
  useEffect(() => {
    if (location.state?.pin && !adminProfile) {
      setPin(location.state.pin);
      login(location.state.pin);
    }
  }, [location.state, adminProfile, login]);

  const handleLogout = () => {
    navigate('/'); 
  };

  const goToBracket = () => {
    navigate('/'); // Navigate to bracket but keep session (if configured)
  };

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
      { 
        discordHandle: adminProfile.discord_handle,
        faceitUser: adminProfile.faceit_username,
        faceitUrl: adminProfile.faceit_url 
      },
      changePinData.securityToken
    );
    if (success) setSuccessMsg("PIN Updated. Please Re-Login.");
  };

  // LOGIN STATE
  if (!adminProfile) {
    return (
      <div className="min-h-screen bg-slate-950/95 flex items-center justify-center p-4 font-mono backdrop-blur-sm">
         <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md">
            <h2 className="mb-6 text-xl font-bold text-white tracking-wider text-center">SYSTEM ACCESS</h2>
            <input type="password" value={pin} onChange={e=>setPin(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-4 text-center tracking-[0.2em] rounded mb-6 focus:border-blue-500 outline-none" placeholder="ENTER PIN" />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded uppercase tracking-widest text-sm">Authenticate</button>
            {error && <p className="text-red-500 mt-4 text-center text-sm">{error}</p>}
         </form>
      </div>
    );
  }

  // DASHBOARD STATE
  return (
    <div className="min-h-screen bg-slate-950/95 flex items-start justify-center p-4 md:p-12 font-mono overflow-y-auto">
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-slate-950 border-b border-slate-800 p-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">ADMIN <span className="text-blue-500">CONSOLE</span></h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="uppercase tracking-widest">{adminProfile.role}</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span className="text-white font-bold">{adminProfile.display_name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             {/* WAR ROOM BUTTON - Goes to Bracket */}
             <button onClick={goToBracket} className="flex items-center gap-2 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg transition-all text-xs uppercase tracking-widest font-bold group">
                <MonitorPlay className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Enter War Room
             </button>

             <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/30 hover:text-red-400 hover:border-red-900/50 border border-slate-700 text-slate-400 px-4 py-2 rounded-lg transition-all text-xs uppercase tracking-widest font-bold">
                <LogOut className="w-4 h-4" />
                Logout
             </button>
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* LEFT: CREATE ADMIN (Owner Only) */}
          {adminProfile.can_create_admin && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                <UserPlus className="w-4 h-4 text-yellow-500" />
                <h2 className="text-sm font-bold text-yellow-500 uppercase tracking-widest">Register New Officer</h2>
              </div>
              
              {tempPin && (
                <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-xl text-center mb-6">
                  <p className="text-green-400 text-[10px] uppercase tracking-widest mb-2">Credentials Generated</p>
                  <p className="text-3xl font-black text-white tracking-widest select-all bg-green-950/50 inline-block px-4 py-2 rounded border border-green-900/50">{tempPin}</p>
                  <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">Copy and distribute securely</p>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> System Display Name</label>
                    <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none" placeholder="e.g. Bravo" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Discord Handle</label>
                        <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none text-xs" placeholder="bravo.gg" value={newAdmin.discordHandle} onChange={e => setNewAdmin({...newAdmin, discordHandle: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Discord Name</label>
                        <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none text-xs" placeholder=".bravo" value={newAdmin.discordUser} onChange={e => setNewAdmin({...newAdmin, discordUser: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> Faceit Username</label>
                        <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none text-xs" placeholder="Optional" value={newAdmin.faceitUser} onChange={e => setNewAdmin({...newAdmin, faceitUser: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><Link className="w-3 h-3" /> Faceit URL</label>
                        <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none text-xs" placeholder="Optional" value={newAdmin.faceitUrl} onChange={e => setNewAdmin({...newAdmin, faceitUrl: e.target.value})} />
                    </div>
                 </div>

                 <button disabled={loading} className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-4 rounded-lg uppercase tracking-widest text-xs shadow-lg transition-all">Generate Admin Keys</button>
              </form>
            </div>
          )}

          {/* RIGHT: CHANGE PIN */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                <Key className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Update Credentials</h2>
             </div>

             {successMsg && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded text-xs text-center">{successMsg}</div>}
             
             <form onSubmit={handleChangePin} className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] uppercase text-slate-500 tracking-widest">Current PIN</label>
                   <input type="password" className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white tracking-widest focus:border-blue-500 outline-none" onChange={e => setChangePinData({...changePinData, oldPin: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] uppercase text-slate-500 tracking-widest">New PIN</label>
                   <input type="password" className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white tracking-widest focus:border-blue-500 outline-none" onChange={e => setChangePinData({...changePinData, newPin: e.target.value})} />
                </div>
                
                {/* OWNER SECURITY CHECK - STEALTH MODE */}
                {adminProfile.role === 'OWNER' && (
                   <div className="pt-4 border-t border-slate-800 animate-in fade-in duration-500">
                      <label className="text-[10px] text-red-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Identity Verification
                      </label>
                      <input 
                        type="password" 
                        placeholder="Security Token" 
                        className="w-full bg-red-950/20 border border-red-900/50 p-3 rounded text-red-200 text-center tracking-widest placeholder-red-900/50 focus:border-red-500 outline-none transition-all" 
                        onChange={e => setChangePinData({...changePinData, securityToken: e.target.value})} 
                      />
                   </div>
                )}
                
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-lg uppercase tracking-widest text-xs mt-4 shadow-lg">Confirm Updates</button>
             </form>
             {error && <p className="text-red-500 mt-4 text-xs text-center border border-red-900/50 bg-red-900/10 p-2 rounded">{error}</p>}
          </div>

        </div>
      </div>
    </div>
  );
};
import { MessageSquare } from 'lucide-react'; 

export default AdminDashboard;
