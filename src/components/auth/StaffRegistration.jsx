import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { Shield, User, Mail, Lock, Gamepad, Link as LinkIcon, Save, Terminal } from 'lucide-react';
import { ROLES } from '../../lib/roles';
import { toast } from 'react-hot-toast';

export const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', discord: '', faceit: '', steam: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName } }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed. Please check your email.");

      // 2. Create Admin Profile
      const { error: profileError } = await supabase
        .from('app_admins')
        .insert({
          auth_user_id: authData.user.id,
          email: formData.email,       
          full_name: formData.fullName, 
          role: ROLES.CREW, // Default to lowest rank for safety
          discord_handle: formData.discord,
          faceit_link: formData.faceit,
          steam_link: formData.steam
        });

      if (profileError) throw profileError;

      // 3. Log to Audit Trail (Using Auth ID as Operator)
      await supabase.from('admin_audit_logs').insert({
        operator_id: authData.user.id,
        action_type: 'STAFF_REGISTRATION',
        target: formData.fullName,
        details: { email: formData.email, role: ROLES.CREW }
      });

      toast.success('Enlistment Successful! Pending manual clearance.');
      setFormData({ email: '', password: '', fullName: '', discord: '', faceit: '', steam: '' });

    } catch (err) {
      console.error("Registration Error:", err);
      toast.error(err.message || "Enlistment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-2xl w-full bg-[#09090b] border border-zinc-800 rounded-lg shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-black/40 border-b border-white/5 p-8 text-center relative">
          <div className="w-16 h-16 bg-fuchsia-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/30">
             <Shield className="w-8 h-8 text-fuchsia-500" />
          </div>
          <h1 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase">
            STAFF <span className="text-fuchsia-500">ENLISTMENT</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-mono mt-2 tracking-widest uppercase flex items-center justify-center gap-2">
            <Terminal size={10} /> Secure Channel // Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest border-b border-white/5 pb-1">Legal Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                        <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="John Doe" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="agent@pixelpalace.gg" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Security Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                        <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="••••••••" />
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest border-b border-white/5 pb-1">Digital Identifiers</h3>
            <div className="space-y-4">
               <div className="relative">
                  <Gamepad className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                  <input required name="discord" value={formData.discord} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="Discord Handle (e.g. user#1234)" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                     <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                     <input name="faceit" value={formData.faceit} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="Faceit Profile URL" />
                  </div>
                  <div className="relative">
                     <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                     <input name="steam" value={formData.steam} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="Steam Profile URL" />
                  </div>
               </div>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest rounded transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
            {loading ? <span className="animate-pulse">PROCESSING...</span> : <><Save size={18} /> SUBMIT ENLISTMENT</>}
          </button>

        </form>
      </div>
    </div>
  );
};
