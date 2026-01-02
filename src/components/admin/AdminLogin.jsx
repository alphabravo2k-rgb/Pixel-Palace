import React, { useState } from 'react';
import { useSession } from '../../auth/useSession';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Users, ArrowRight, Lock, AlertCircle, Loader2 } from 'lucide-react';

// ✅ THIS IS THE NAMED EXPORT THE ROUTER IS LOOKING FOR
export const AdminLogin = () => {
  const { loginAdmin, loginCaptain } = useSession();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('CAPTAIN');
  const [formData, setFormData] = useState({ email: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    try {
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
    } catch (err) {
        setError('Connection Error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-fuchsia-500/30">
       <div className="w-full max-w-md bg-[#0b0c0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="flex border-b border-zinc-800 relative z-10">
             <button type="button" onClick={() => setMode('CAPTAIN')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${mode === 'CAPTAIN' ? 'bg-blue-600/10 text-blue-500' : 'text-zinc-600'}`}>Team Captain</button>
             <button type="button" onClick={() => setMode('ADMIN')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${mode === 'ADMIN' ? 'bg-fuchsia-600/10 text-fuchsia-500' : 'text-zinc-600'}`}>Staff Access</button>
          </div>

          <div className="p-8 relative z-10">
             <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter text-center mb-8 font-['Teko']">{mode === 'CAPTAIN' ? 'Unit Uplink' : 'Command Auth'}</h1>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'CAPTAIN' ? (
                    <input type="password" className="w-full bg-black border border-zinc-700 rounded p-4 text-center text-white font-mono text-xl focus:border-blue-500 outline-none" placeholder="••••••" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                ) : (
                    <>
                        <input type="email" className="w-full bg-black border border-zinc-700 rounded p-3 text-sm text-white focus:border-fuchsia-500 outline-none" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <input type="password" className="w-full bg-black border border-zinc-700 rounded p-3 text-sm text-white focus:border-fuchsia-500 outline-none" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </>
                )}

                {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}

                <button disabled={loading} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs rounded flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <>Enter System <ArrowRight size={14} /></>}
                </button>
             </form>
          </div>
       </div>
    </div>
  );
};
