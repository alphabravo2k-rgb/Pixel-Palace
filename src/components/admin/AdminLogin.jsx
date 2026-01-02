import React, { useState } from 'react';
import { useSession } from '../../auth/useSession';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Users, ArrowRight, Lock, AlertCircle, Loader2 } from 'lucide-react';

export const AdminLogin = () => {
  const { login: loginAdmin, loginCaptain } = useSession();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('CAPTAIN'); // 'CAPTAIN' or 'ADMIN'
  const [formData, setFormData] = useState({ email: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (mode === 'ADMIN') {
        result = await loginAdmin(formData.email, formData.password);
    } else {
        result = await loginCaptain(formData.code);
    }

    if (result.success) {
        if (mode === 'ADMIN') navigate('/admin/dashboard');
        else navigate('/dashboard');
    } else {
        setError(result.message || 'Authentication Failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-fuchsia-500/30">
       <div className="w-full max-w-md bg-[#0b0c0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-${mode === 'CAPTAIN' ? 'blue' : 'fuchsia'}-600/20 blur-[100px] rounded-full pointer-events-none transition-colors duration-500`} />

          <div className="flex border-b border-zinc-800 relative z-10">
             <button type="button" onClick={() => { setMode('CAPTAIN'); setError(''); }} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'CAPTAIN' ? 'bg-blue-600/10 text-blue-500 shadow-[inset_0_-2px_0_#3b82f6]' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}>Team Captain</button>
             <button type="button" onClick={() => { setMode('ADMIN'); setError(''); }} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'ADMIN' ? 'bg-fuchsia-600/10 text-fuchsia-500 shadow-[inset_0_-2px_0_#c026d3]' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}>Staff Access</button>
          </div>

          <div className="p-8 relative z-10">
             <div className="text-center mb-8">
                {mode === 'CAPTAIN' ? (
                    <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30 animate-in fade-in zoom-in"><Users className="w-8 h-8 text-blue-500" /></div>
                ) : (
                    <div className="w-16 h-16 bg-fuchsia-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/30 animate-in fade-in zoom-in"><Shield className="w-8 h-8 text-fuchsia-500" /></div>
                )}
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter font-['Teko'] text-3xl">{mode === 'CAPTAIN' ? 'Unit Uplink' : 'Command Auth'}</h1>
                <p className="text-xs text-zinc-500 font-mono mt-1">{mode === 'CAPTAIN' ? 'Enter Access Code to manage unit.' : 'Restricted area. Authorized personnel only.'}</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'CAPTAIN' ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="relative">
                            <input type="password" className="w-full bg-black border border-zinc-700 rounded p-4 text-center text-white font-mono tracking-[0.5em] text-xl focus:border-blue-500 outline-none placeholder:text-zinc-800" placeholder="••••••" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} autoFocus />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 w-4 h-4"/>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-3">
                        <input type="email" className="w-full bg-black border border-zinc-700 rounded p-3 text-sm text-white focus:border-fuchsia-500 outline-none" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <input type="password" className="w-full bg-black border border-zinc-700 rounded p-3 text-sm text-white focus:border-fuchsia-500 outline-none" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                )}

                {error && <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-bold text-center rounded flex items-center justify-center gap-2 animate-in fade-in"><AlertCircle size={14} /> {error}</div>}

                <button disabled={loading} className={`w-full py-4 rounded font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 mt-2 ${mode === 'CAPTAIN' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <>Enter System <ArrowRight size={14} /></>}
                </button>
             </form>
             {mode === 'ADMIN' && (
                 <div className="mt-6 pt-4 border-t border-white/5 text-center">
                    <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
                       Restricted Area // <Link to="/staff-register" className="text-zinc-500 hover:text-fuchsia-500 ml-1 underline decoration-dotted">Crew Enlistment</Link>
                    </p>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};
