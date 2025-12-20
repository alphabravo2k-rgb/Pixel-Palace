import React, { useState } from 'react';
import { useAdminConsole } from '../hooks/useAdminConsole';

export default function AdminDashboard() {
  const [pin, setPin] = useState('');
  const { adminProfile, tempPin, error, loading, login, createAdmin } = useAdminConsole();
  const [newAdmin, setNewAdmin] = useState({ name: '', discord: '', discordUser: '', faceitUser: '', faceitUrl: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    login(pin);
  };

  if (!adminProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono">
         <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md">
            <h2 className="mb-6 text-xl font-bold text-white tracking-wider text-center">SYSTEM ACCESS</h2>
            <input 
              type="password" 
              value={pin} 
              onChange={e=>setPin(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 text-white p-4 text-center tracking-[1em] rounded mb-6 focus:border-blue-500 outline-none transition-colors" 
              placeholder="••••" 
              maxLength={4}
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded transition-colors uppercase tracking-widest text-sm">
              Authenticate
            </button>
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

        {adminProfile.can_create_admin && (
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800">
            <h2 className="text-lg font-bold mb-6 text-yellow-500 uppercase tracking-widest border-b border-slate-800 pb-2">Create New Admin</h2>
            
            {tempPin && (
              <div className="bg-green-900/20 border border-green-500/50 p-6 mb-8 rounded text-center animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-green-400 text-xs uppercase tracking-widest mb-2">Credentials Generated</p>
                <p className="text-4xl font-black text-white tracking-widest select-all bg-green-950/50 inline-block px-4 py-2 rounded">{tempPin}</p>
                <p className="text-xs text-slate-500 mt-2">Copy immediately. This will verify identity on first login.</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); createAdmin(pin, newAdmin); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-widest">Display Name</label>
                <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none" 
                  placeholder="e.g. Bravo" onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-widest">Discord Handle</label>
                <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none" 
                  placeholder="e.g. bravo.gg" onChange={e => setNewAdmin({...newAdmin, discord: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-widest">Discord Username</label>
                <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none" 
                  placeholder="e.g. .bravo" onChange={e => setNewAdmin({...newAdmin, discordUser: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-widest">Faceit User (Optional)</label>
                <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none" 
                  placeholder="Username" onChange={e => setNewAdmin({...newAdmin, faceitUser: e.target.value})} />
              </div>
              
              <button disabled={loading} className="col-span-1 md:col-span-2 mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-4 rounded transition-all uppercase tracking-widest text-sm shadow-lg hover:shadow-yellow-900/20">
                {loading ? 'Generating keys...' : 'Generate Admin Keys'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
