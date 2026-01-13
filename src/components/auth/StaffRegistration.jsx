/**
 * 📝 STAFF REGISTRATION: ENLISTMENT
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // AUTHORIZED
 */

import React, { useState } from 'react';
import { Shield, User, Mail, Lock, Gamepad, Link as LinkIcon, Save, Terminal, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', discord: '', faceit: '', steam: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  /**
   * ⚡ ENLISTMENT PROTOCOL
   * Executes a two-stage commit: Auth creation followed by Profile escalation.
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);

    try {
      // 1. PHASE ONE: Auth Creation
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
      if (!authData.user) throw new Error("ENLISTMENT FAILED: Check Identity Format");

      // 2. PHASE TWO: Escalation Delay
      // We allow the DB Trigger 1500ms to initialize the profile row.
      const toastId = toast.loading("INITIALIZING CLEARANCE...");
      await new Promise(r => setTimeout(r, 1500));

      // 3. PHASE THREE: Escalation to Admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'admin', 
          discord_handle: formData.discord,
          faceit_url: formData.faceit,
          steam_url: formData.steam,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // 🛰️ TELEMETRY: Log new agent onboarding
      Telemetry.log(EVENTS.AUTH, { action: 'STAFF_ENLISTED', email: formData.email }, authData.user.id);

      toast.success('ENLISTMENT SUCCESSFUL // CLEARANCE GRANTED', { id: toastId });
      SoundNexus.play(CUES.UI_SUCCESS);
      
      // Clear for next agent
      setFormData({ email: '', password: '', fullName: '', discord: '', faceit: '', steam: '' });

    } catch (err) {
      console.error("Enlistment Error:", err);
      toast.error(err.message.toUpperCase());
      SoundNexus.play(CUES.UI_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* 🧩 ATMOSPHERIC GRID */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-500/10 via-transparent to-transparent" />
      </div>

      <div className="max-w-2xl w-full bg-[#09090b] border border-zinc-800 rounded-sm shadow-2xl relative z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* SCANLINES */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-20" />

        {/* HEADER */}
        <div className="bg-zinc-900/30 border-b border-white/5 p-10 text-center relative">
          <div className="w-20 h-20 bg-fuchsia-500/10 rounded-sm flex items-center justify-center mx-auto mb-6 border border-fuchsia-500/30 rotate-45 group">
             <Shield className="w-10 h-10 text-fuchsia-500 -rotate-45 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
          </div>
          <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
            Staff <span className="text-fuchsia-600">Enlistment</span>
          </h1>
          <p className="text-zinc-600 text-[9px] font-black mt-4 tracking-[0.5em] uppercase flex items-center justify-center gap-2">
            <Terminal size={12} className="text-fuchsia-500" /> Authorized Personnel Uplink
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-10 space-y-8 bg-black/20">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Cpu size={14} className="text-fuchsia-500" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Identity Authentication</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Full Legal Name</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-fuchsia-500 transition-colors" />
                        <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-xs font-mono rounded-sm pl-10 pr-4 py-4 focus:border-fuchsia-500 outline-none transition-all" placeholder="IDENT_NAME" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Command Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-fuchsia-500 transition-colors" />
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-xs font-mono rounded-sm pl-10 pr-4 py-4 focus:border-fuchsia-500 outline-none transition-all" placeholder="AGENT@NODE.CORE" />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Security Cypher</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-fuchsia-500 transition-colors" />
                        <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-xs font-mono rounded-sm pl-10 pr-4 py-4 focus:border-fuchsia-500 outline-none transition-all" placeholder="••••••••••••" />
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
                <LinkIcon size={14} className="text-fuchsia-500" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Network Identifiers</h3>
            </div>
            
            <div className="space-y-4">
               <div className="relative group">
                  <Gamepad className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-fuchsia-500 transition-colors" />
                  <input required name="discord" value={formData.discord} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-xs font-mono rounded-sm pl-10 pr-4 py-4 focus:border-fuchsia-500 outline-none transition-all" placeholder="DISCORD_TAG#0000" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-fuchsia-500 transition-colors" />
                      <input name="faceit" value={formData.faceit} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-[10px] font-mono rounded-sm pl-10 pr-4 py-3 focus:border-fuchsia-500 outline-none transition-all" placeholder="FACEIT_LINK" />
                  </div>
                  <div className="relative group">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-fuchsia-500 transition-colors" />
                      <input name="steam" value={formData.steam} onChange={handleChange} className="w-full bg-black border border-zinc-800 text-white text-[10px] font-mono rounded-sm pl-10 pr-4 py-3 focus:border-fuchsia-500 outline-none transition-all" placeholder="STEAM_LINK" />
                  </div>
               </div>
            </div>
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full py-5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-sm transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 mt-6 active:scale-95 shadow-fuchsia-600/20"
          >
            {loading ? (
                <span className="animate-pulse flex items-center gap-2">Establishing Uplink...</span>
            ) : (
                <>Commit Enlistment <Save size={18} /></>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
