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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const result = await loginAdmin(formData.email, formData.password);
        if (result.success) {
            toast.success("Command Access Granted");
            navigate('/admin/dashboard');
        } else {
            throw new Error(result.message || 'Access Denied');
        }
    } catch (err) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-[#0b0c0f] border border-red-900/30 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.1)] relative z-10 animate-in zoom-in-95">
           <div className="p-8">
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <Shield className="text-red-500 w-8 h-8" />
                 </div>
                 <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">COMMAND <span className="text-red-500">AUTH</span></h1>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Officer Email</label>
                        <input type="email" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-red-500 outline-none" placeholder="admin@pixelpalace.gg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Secure Password</label>
                        <input type="password" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-red-500 outline-none" placeholder="••••••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                    </div>
                 </div>

                 <button disabled={loading} className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold uppercase text-xs tracking-widest rounded shadow-lg flex items-center justify-center gap-2 transition-all">
                    {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <>ESTABLISH UPLINK <ArrowRight size={14} /></>}
                 </button>
              </form>
           </div>
           <div className="bg-black/50 p-3 text-center border-t border-white/5">
                <Link to="/login" className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-mono">Not Staff? Go to Player Portal</Link>
           </div>
        </div>
    </div>
  );
};
