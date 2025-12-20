import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminConsole } from '../hooks/useAdminConsole';

const AdminDashboard = () => {
  const location = useLocation();
  const [pin, setPin] = useState('');
  const { adminProfile, tempPin, error, loading, login, createAdmin, changeMyPin } = useAdminConsole();
  
  // Forms
  const [newAdmin, setNewAdmin] = useState({ name: '', discord: '', discordUser: '', faceitUser: '', faceitUrl: '' });
  const [changePinData, setChangePinData] = useState({ oldPin: '', newPin: '', securityToken: '' });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (location.state?.pin && !adminProfile) {
      setPin(location.state.pin);
      login(location.state.pin);
    }
  }, [location.state, adminProfile, login]);

  const handleLogin = (e) => { e.preventDefault(); login(pin); };

  const handleChangePin = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const success = await changeMyPin(
      changePinData.oldPin, 
      changePinData.newPin, 
      { discordHandle: adminProfile.discord_handle }, // Keep existing profile data
      changePinData.securityToken
    );
    if (success) setSuccessMsg("PIN Updated Successfully. Please re-login.");
  };

  if (!adminProfile) {
    return ( /* ... Login View (Same as before) ... */ 
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono">
         <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md">
            <h2 className="mb-6 text-xl font-bold text-white tracking-wider text-center">SYSTEM ACCESS</h2>
            <input type="password" value={pin} onChange={e=>setPin(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-4 text-center tracking-[1em] rounded mb-6 focus:border-blue-500 outline-none" placeholder="••••" maxLength={4} />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded uppercase tracking-widest text-sm">Authenticate</button>
            {error && <p className="text-red-500 mt-4 text-center text-sm">{error}</p>}
         </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold tracking-tight">ADMIN <span className="text-blue-500">CONSOLE</span></h1>
          <div className="text-right">
            <div className="font-bold text-slate-200">{adminProfile.display_name}</div>
            <div className="text-xs text-blue-400 uppercase tracking-widest">{adminProfile.role}</div>
          </div>
        </header>

        {/* OWNER TOOLS: CREATE ADMIN */}
        {adminProfile.can_create_admin && (
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 mb-8">
            <h2 className="text-lg font-bold mb-6 text-yellow-500 uppercase tracking-widest border-b border-slate-800 pb-2">Create New Admin</h2>
            {/* ... (Same Create Form as before) ... */}
             {tempPin && (
              <div className="bg-green-900/20 border border-green-500/50 p-6 mb-8 rounded text-center">
                <p className="text-green-400 text-xs uppercase tracking-widest mb-2">Credentials Generated</p>
                <p className="text-4xl font-black text-white tracking-widest select-all bg-green-950/50 inline-block px-4 py-2 rounded">{tempPin}</p>
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); createAdmin(pin, newAdmin); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white" placeholder="Display Name" onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
               <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white" placeholder="Discord Handle" onChange={e => setNewAdmin({...newAdmin, discord: e.target.value})} />
               <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white" placeholder="Discord Username" onChange={e => setNewAdmin({...newAdmin, discordUser: e.target.value})} />
               <button className="col-span-2 bg-yellow-600 hover:bg-yellow-700 p-4 rounded font-bold uppercase tracking-widest">Generate Admin Keys</button>
            </form>
          </div>
        )}

        {/* OWNER TOOLS: CHANGE PIN */}
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800">
           <h2 className="text-lg font-bold mb-6 text-blue-500 uppercase tracking-widest border-b border-slate-800 pb-2">Change My PIN</h2>
           {successMsg && <p className="text-green-400 mb-4">{successMsg}</p>}
           
           <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
              <input 
                type="password" placeholder="Current PIN" maxLength={4}
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white text-center tracking-[0.5em]" 
                onChange={e => setChangePinData({...changePinData, oldPin: e.target.value})} 
              />
              <input 
                type="password" placeholder="New PIN" maxLength={4}
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white text-center tracking-[0.5em]" 
                onChange={e => setChangePinData({...changePinData, newPin: e.target.value})} 
              />
              
              {/* SECURITY CHECK FOR OWNER ONLY */}
              {adminProfile.role === 'OWNER' && (
                 <div className="pt-4 border-t border-slate-800">
                    <label className="text-xs text-red-500 uppercase tracking-widest block mb-2">Secure Command Key Required</label>
                    <input 
                      type="text" placeholder="Identity Verification Token" 
                      className="w-full bg-red-950/20 border border-red-900/50 p-3 rounded text-red-200 text-center tracking-widest placeholder-red-800" 
                      onChange={e => setChangePinData({...changePinData, securityToken: e.target.value})} 
                    />
                 </div>
              )}
              
              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded uppercase tracking-widest text-sm mt-4">
                {loading ? 'Updating...' : 'Update Credentials'}
              </button>
           </form>
           {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
