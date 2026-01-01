import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { Shield, User, Mail, Lock, Gamepad, Link as LinkIcon, Save, AlertTriangle, CheckCircle } from 'lucide-react';

export const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    discord: '',
    faceit: '',
    steam: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      // 1. Create Auth User (Secure Password)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName } // Metadata
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed. Please check your email.");

      // 2. Create Admin Profile (Default Role: CREW)
      // Removed: phone_number, steam_trade_link
      const { error: profileError } = await supabase
        .from('app_admins')
        .insert({
          auth_user_id: authData.user.id,
          email: formData.email,
          role: 'CREW', // Default low-level role
          full_name: formData.fullName,
          discord_handle: formData.discord,
          faceit_link: formData.faceit,
          steam_link: formData.steam
        });

      if (profileError) throw profileError;

      setStatus({ type: 'success', msg: 'Registration Successful! Account pending activation.' });
      setFormData({ email: '', password: '', fullName: '', discord: '', faceit: '', steam: '' });

    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0b0c0f] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600"></div>
        <div className="mb-8 text-center">
          <Shield className="w-12 h-12 text-fuchsia-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">STAFF <span className="text-fuchsia-500">ENLISTMENT</span></h1>
          <p className="text-zinc-500 text-xs font-mono mt-2">SECURE CHANNEL // AUTHORIZED PERSONNEL ONLY</p>
        </div>

        {status.msg && (
          <div className={`mb-6 p-4 rounded border flex items-center gap-3 ${status.type === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
            {status.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
            <span className="text-sm font-bold uppercase">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Identity Section */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
              <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" placeholder="John Doe" />
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" placeholder="agent@pixelpalace.gg" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" placeholder="••••••••" />
              </div>
            </div>
          </div>

          {/* Gaming Links */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-bold text-fuchsia-500 uppercase tracking-widest">Digital Identifiers</h3>
            <div className="grid grid-cols-1 gap-4">
               <div className="relative">
                  <Gamepad className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                  <input required name="discord" value={formData.discord} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" placeholder="Discord Handle (e.g. user#1234)" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    <input name="faceit" value={formData.faceit} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" placeholder="Faceit Profile URL (Optional)" />
                 </div>
                 <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    <input name="steam" value={formData.steam} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" placeholder="Steam Profile URL (Optional)" />
                 </div>
               </div>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(192,38,211,0.4)] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? 'Processing...' : <span><Save size={18} className="inline mr-2"/> Submit for Clearance</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
