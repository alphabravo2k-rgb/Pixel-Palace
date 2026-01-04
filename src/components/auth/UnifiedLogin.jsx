import React, { useState } from 'react';
import { useSession } from '../../auth/useSession';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ArrowRight, Lock, Command, Terminal } from 'lucide-react';
import { ROLES } from '../../lib/roles';
import { toast } from 'react-hot-toast';

export const UnifiedLogin = () => {
  const { loginAdmin, loginCaptain } = useSession();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('CAPTAIN'); // 'CAPTAIN' or 'ADMIN'
  const [formData, setFormData] = useState({ email: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        let result;
        
        // 1. EXECUTE LOGIN STRATEGY
        if (mode === 'ADMIN') {
            result = await loginAdmin(formData.email, formData.password);
        } else {
            result = await loginCaptain(formData.code);
        }

        if (!result.success) {
            throw new Error(result.message || "Authentication Failed");
        }

        // 2. ROUTING LOGIC
        // Check the role returned from the session or result
        const userRole = result.role || 'player';
        
        toast.success(`Welcome back, ${mode === 'ADMIN' ? 'Commander' : 'Operator'}.`);

        if ([ROLES.OWNER, ROLES.ADMIN].includes(userRole)) {
            navigate('/admin/dashboard');
        } else {
            navigate('/dashboard');
        }

    } catch (err) {
        setError(err.message);
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Ambience */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />

       <div className="w-full max-w-md bg-bg-panel border border-tactical rounded-lg shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
          
          {/* HEADER TOGGLE */}
          <div className="flex border-b border-white/5 bg-black/40">
             <button 
                onClick={() => { setMode('CAPTAIN'); setError(''); }}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${mode === 'CAPTAIN' ? 'text-brand-glow bg-brand/5' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
                {mode === 'CAPTAIN' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand animate-in slide-in-from-left duration-300" />}
                <span className="flex items-center justify-center gap-2"><Users size={14}/> Unit Access</span>
             </button>
             <button 
                onClick={() => { setMode('ADMIN'); setError(''); }}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${mode === 'ADMIN' ? 'text-fuchsia-400 bg-fuchsia-500/5' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
                {mode === 'ADMIN' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-fuchsia-500 animate-in slide-in-from-right duration-300" />}
                <span className="flex items-center justify-center gap-2"><Shield size={14}/> Command Link</span>
             </button>
          </div>

          <div className="p-8">
             {/* ICON & TITLE */}
             <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border transition-all duration-500 ${mode === 'CAPTAIN' ? 'bg-brand/10 border-brand/30' : 'bg-fuchsia-900/10 border-fuchsia-500/30'}`}>
                    {mode === 'CAPTAIN' ? <Command className="w-8 h-8 text-brand" /> : <Terminal className="w-8 h-8 text-fuchsia-500" />}
                </div>
                
                <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
                    {mode === 'CAPTAIN' ? 'Unit Login' : 'Admin Uplink'}
                </h1>
                <p className="text-xs text-zinc-500 font-mono mt-2 uppercase tracking-wide">
                    {mode === 'CAPTAIN' ? 'Enter Access Code to sync with squad.' : 'Restricted. Authorized Personnel Only.'}
                </p>
             </div>

             {/* FORM */}
             <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'CAPTAIN' ? (
                    <div className="relative group">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block group-focus-within:text-brand transition-colors">Access Code</label>
                        <input 
                           type="password" 
                           className="w-full bg-black border border-zinc-800 rounded p-4 text-center text-white font-mono tracking-[0.5em] text-lg focus:border-brand outline-none transition-all focus:shadow-[0_0_20px_rgba(var(--color-brand)/0.2)]"
                           placeholder="••••••"
                           value={formData.code}
                           onChange={e => setFormData({...formData, code: e.target.value})}
                           autoFocus
                        />
                    </div>
                ) : (
                    <>
                        <div className="space-y-1 group">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block group-focus-within:text-fuchsia-500 transition-colors">Officer Email</label>
                            <input 
                               type="email" 
                               className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-fuchsia-500 outline-none transition-all"
                               placeholder="admin@pixelpalace.gg"
                               value={formData.email}
                               onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1 group">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase block group-focus-within:text-fuchsia-500 transition-colors">Password</label>
                             <input 
                                type="password" 
                                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-fuchsia-500 outline-none transition-all"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                             />
                        </div>
                    </>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="p-3 bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-bold text-center rounded animate-in shake">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                {/* SUBMIT BUTTON */}
                <button 
                    disabled={loading}
                    className={`w-full py-4 rounded font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 mt-6 shadow-lg hover:scale-[1.02] active:scale-[0.98]
                    ${mode === 'CAPTAIN' ? 'bg-brand hover:bg-brand-glow text-white shadow-brand/20' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-900/20'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'AUTHENTICATING...' : (
                        <>
                            INITIALIZE CONNECTION <ArrowRight size={14} />
                        </>
                    )}
                </button>
             </form>
          </div>
       </div>
       
       <div className="absolute bottom-6 text-zinc-700 text-[10px] font-mono uppercase tracking-widest">
            SECURE CONNECTION v3.0 // ENCRYPTED
       </div>
    </div>
  );
};
