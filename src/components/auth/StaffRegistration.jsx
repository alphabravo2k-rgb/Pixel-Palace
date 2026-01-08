import React, { useState } from 'react';
import { Shield, User, Mail, Lock, Gamepad, Link as LinkIcon, Save, Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';

/**
 * 📝 STAFF REGISTRATION: ENLISTMENT
 * ---------------------------------
 * STATUS: MASTERED (SCHEMA ALIGNED)
 * * PURPOSE:
 * Registers new users directly into the 'profiles' table with 'admin' role.
 * * NOTE:
 * In a real production app, you would gate this page or require an approval workflow.
 * For now, it auto-promotes to 'admin' for easier setup.
 */

export const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', discord: '', faceit: '', steam: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
            data: { 
                display_name: formData.fullName,
                full_name: formData.fullName 
            } 
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed. Please check your email.");

      // 2. Update Profile to 'admin'
      // Note: The Trigger automatically creates the profile as 'guest'. We must upgrade it.
      // Wait a moment for trigger to fire
      await new Promise(r => setTimeout(r, 1000));

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'admin', // Auto-promote for Staff Registration
          discord_handle: formData.discord,
          faceit_url: formData.faceit,
          steam_url: formData.steam
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast.success('ENLISTMENT SUCCESSFUL');
      SoundNexus.play(CUES.SUCCESS);
      setFormData({ email: '', password: '', fullName: '', discord: '', faceit: '', steam: '' });

    } catch (err) {
      console.error("Registration Error:", err);
      toast.error(err.message || "Enlistment Failed");
      SoundNexus.play(CUES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
      </div>

      <div className="max-w-2xl w-full bg-[#09090b] border border-white/10 rounded-sm shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-black/40 border-b border-white/5 p-8 text-center relative">
          <div className="w-16 h-16 bg-fuchsia-900/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/20">
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
                        <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded-sm pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="John Doe" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded-sm pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="agent@nexus.core" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Security Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                        <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded-sm pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="••••••••" />
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest border-b border-white/5 pb-1">Digital Identifiers</h3>
            <div className="space-y-4">
               <div className="relative">
                  <Gamepad className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                  <input required name="discord" value={formData.discord} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded-sm pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="Discord Handle (e.g. user#1234)" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                      <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                      <input name="faceit" value={formData.faceit} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded-sm pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="Faceit Profile URL" />
                  </div>
                  <div className="relative">
                      <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                      <input name="steam" value={formData.steam} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-sm rounded-sm pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none placeholder:text-zinc-700" placeholder="Steam Profile URL" />
                  </div>
               </div>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest rounded-sm transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4 hover:shadow-fuchsia-500/20">
            {loading ? <span className="animate-pulse">PROCESSING...</span> : <><Save size={18} /> SUBMIT ENLISTMENT</>}
          </button>

        </form>
      </div>
    </div>
  );
};
