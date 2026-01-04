import React, { useState } from 'react';
import { useSession } from '../../auth/useSession';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Loader2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminLogin = () => {
  const { loginAdmin } = useSession();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const result = await loginAdmin(formData.email, formData.password);

        if (result.success) {
            toast.success("Command Access Granted");
            navigate('/admin/dashboard');
        } else {
            throw new Error(result.message || 'Access Denied');
        }
    } catch (err) {
        setError(err.message);
        toast.error("Authentication Failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-900 to-black opacity-50" />

        <div className="w-full max-w-md bg-[#0b0c0f] border border-red-900/30 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.1)] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
           
           <div className="p-8">
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-inner">
                    <Shield className="text-red-500 w-8 h-8" />
                 </div>
                 <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
                    COMMAND <span className="text-red-500">AUTH</span>
                 </h1>
                 <p className="text-red-400/60 text-xs font-mono mt-2 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Lock size={10} /> RESTRICTED AREA // STAFF ONLY
                 </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                 
                 <div className="space-y-4">
                    <div className="group">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block group-focus-within:text-red-500 transition-colors">Officer Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-red-500 outline-none transition-all placeholder:text-zinc-700" 
                            placeholder="admin@pixelpalace.gg" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            required
                        />
                    </div>
                    
                    <div className="group">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block group-focus-within:text-red-500 transition-colors">Secure Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-red-500 outline-none transition-all placeholder:text-zinc-700" 
                            placeholder="••••••••••••" 
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            required
                        />
                    </div>
                 </div>

                 {error && (
                     <div className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 text-xs font-bold text-center uppercase flex items-center justify-center gap-2 animate-in shake">
                        <AlertCircle size={14} /> {error}
                     </div>
                 )}

                 <div className="flex justify-end">
                    <Link to="/admin/recover" className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors uppercase font-bold tracking-wider">
                        Lost Credentials?
                    </Link>
                 </div>

                 <button 
                    disabled={loading} 
                    className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold uppercase text-xs tracking-widest rounded shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                 >
                    {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <>ESTABLISH UPLINK <ArrowRight size={14} /></>}
                 </button>
              </form>
           </div>
           
           <div className="bg-black/50 p-3 text-center border-t border-white/5">
                <Link to="/login" className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-mono">
                    Not Staff? Go to Player Portal
                </Link>
           </div>
        </div>
    </div>
  );
};
