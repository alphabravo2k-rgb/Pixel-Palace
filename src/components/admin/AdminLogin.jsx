/**
 * 🛡️ ADMIN LOGIN: COMMAND ACCESS GATEWAY
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // TACTICAL OVERLAY
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Loader2, Lock, Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { useSession } from '../../auth/useSession';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const AdminLogin = () => {
  const { loginAdmin, isAuthenticated } = useSession();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // 🛰️ AUTO-DIVERT: If already authorized, move to bridge
  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);

    const startLog = Telemetry.time('admin_auth_attempt');

    try {
      const result = await loginAdmin(formData.email, formData.password);
      
      if (result.success) {
        SoundNexus.play(CUES.UI_SUCCESS);
        toast.success("COMMAND ACCESS GRANTED", {
          style: { background: '#09090b', color: '#ef4444', border: '1px solid #ef444450' }
        });
        startLog.end(result.user?.id);
        navigate('/admin/dashboard');
      } else {
        throw new Error(result.message || 'Identity Verification Failed');
      }
    } catch (err) {
      SoundNexus.play(CUES.UI_ERROR);
      Telemetry.log(EVENTS.AUTH, { type: 'FAILURE', email: formData.email });
      toast.error(err.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 🌌 BACKGROUND VORTEX */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="w-full max-w-md bg-[#09090b] border border-red-500/20 rounded-sm shadow-[0_0_80px_rgba(239,68,68,0.05)] relative z-10 overflow-hidden">
          
          {/* SCANLINE EFFECT */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-20" />

          <div className="p-10 relative z-30">
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-red-500/10 rounded-sm flex items-center justify-center mx-auto mb-6 border border-red-500/30 rotate-45 group transition-all duration-700 hover:rotate-[225deg]">
                   <Shield className="-rotate-45 text-red-500 w-10 h-10 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
                <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
                  Sovereign <span className="text-red-600">Auth</span>
                </h1>
                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.5em] mt-3">High-Clearance Interface</p>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                   <div className="group">
                       <label className="text-[9px] uppercase font-black text-zinc-500 mb-2 block tracking-widest group-focus-within:text-red-500 transition-colors">
                         Officer Credential
                       </label>
                       <div className="relative">
                        <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-red-500" />
                        <input 
                          type="email" 
                          className="w-full bg-black/50 border border-zinc-800 rounded-sm py-4 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all font-mono" 
                          placeholder="IDENT_USER@NODE" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                          required 
                        />
                       </div>
                   </div>

                   <div className="group">
                       <label className="text-[9px] uppercase font-black text-zinc-500 mb-2 block tracking-widest group-focus-within:text-red-500 transition-colors">
                         Security Cypher
                       </label>
                       <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-red-500" />
                        <input 
                          type="password" 
                          className="w-full bg-black/50 border border-zinc-800 rounded-sm py-4 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all font-mono" 
                          placeholder="••••••••••••" 
                          value={formData.password} 
                          onChange={e => setFormData({...formData, password: e.target.value})} 
                          required 
                        />
                       </div>
                   </div>
                </div>

                <button 
                  disabled={loading} 
                  className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-sm shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden"
                >
                   {loading ? (
                     <Loader2 className="animate-spin w-5 h-5 text-white" />
                   ) : (
                     <>
                        <span className="relative z-10">Initialize Uplink</span>
                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                     </>
                   )}
                </button>
             </form>
          </div>

          <div className="bg-white/[0.02] p-4 text-center border-t border-white/5">
               <Link to="/login" className="text-[9px] text-zinc-600 hover:text-red-500 transition-all uppercase font-black tracking-widest">
                 Public Sector -> Civilian Portal
               </Link>
          </div>
      </div>
    </div>
  );
};
