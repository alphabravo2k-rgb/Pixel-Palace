import React, { useState } from 'react';
import { useSession } from '../../auth/useSession';
import { useNavigate } from 'react-router-dom'; // Assuming react-router
import { Shield, Users, ArrowRight, Lock } from 'lucide-react';

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

    let result;
    if (mode === 'ADMIN') {
        result = await loginAdmin(formData.email, formData.password);
    } else {
        result = await loginCaptain(formData.code);
    }

    if (result.success) {
        // Redirect based on role
        if (mode === 'ADMIN') navigate('/admin/dashboard');
        else navigate('/dashboard'); // Captain Dashboard
    } else {
        setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
       <div className="w-full max-w-md bg-[#0b0c0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header Toggle */}
          <div className="flex border-b border-zinc-800">
             <button 
                onClick={() => setMode('CAPTAIN')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${mode === 'CAPTAIN' ? 'bg-blue-600/10 text-blue-500' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
                Team Captain
             </button>
             <button 
                onClick={() => setMode('ADMIN')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${mode === 'ADMIN' ? 'bg-fuchsia-600/10 text-fuchsia-500' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
                Staff Access
             </button>
          </div>

          <div className="p-8">
             <div className="text-center mb-8">
                {mode === 'CAPTAIN' ? (
                    <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-fuchsia-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/30">
                        <Shield className="w-8 h-8 text-fuchsia-500" />
                    </div>
                )}
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {mode === 'CAPTAIN' ? 'Unit Login' : 'Command Uplink'}
                </h1>
                <p className="text-xs text-zinc-500 font-mono mt-2">
                    {mode === 'CAPTAIN' ? 'Enter your Access Code to manage your team.' : 'Restricted area. Authorized personnel only.'}
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'CAPTAIN' ? (
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Access Code</label>
                        <input 
                           type="password" 
                           className="w-full bg-black border border-zinc-700 rounded p-3 text-center text-white font-mono tracking-[0.5em] text-lg focus:border-blue-500 outline-none"
                           placeholder="••••••"
                           value={formData.code}
                           onChange={e => setFormData({...formData, code: e.target.value})}
                        />
                    </div>
                ) : (
                    <>
                        <input 
                           type="email" 
                           className="w-full bg-black border border-zinc-700 rounded p-3 text-sm text-white focus:border-fuchsia-500 outline-none mb-3"
                           placeholder="Operator Email"
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <input 
                           type="password" 
                           className="w-full bg-black border border-zinc-700 rounded p-3 text-sm text-white focus:border-fuchsia-500 outline-none"
                           placeholder="Password"
                           value={formData.password}
                           onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </>
                )}

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-bold text-center rounded">
                        {error}
                    </div>
                )}

                <button 
                    disabled={loading}
                    className={`w-full py-4 rounded font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2
                    ${mode === 'CAPTAIN' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Authenticating...' : (
                        <>
                           Enter System <ArrowRight size={14} />
                        </>
                    )}
                </button>
             </form>
          </div>
       </div>
    </div>
  );
};
