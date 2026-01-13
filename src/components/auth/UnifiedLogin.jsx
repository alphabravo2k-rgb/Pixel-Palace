/**
 * 🔐 UNIFIED AUTH TERMINAL: GENESIS OMNI
 * VERSION: 2050.5.0
 * STATUS: SECURED // DUAL-PROTOCOL
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, ArrowRight, Command, Terminal, 
  Loader2, Activity, BookOpen, Fingerprint 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils'; 

// MASTER CORE
import { useSession } from '../../auth/useSession';
import { useNexus } from '../../hooks/useNexus';
import { ROLES } from '../../lib/roles';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { NexusManual } from '../guide/NexusManual';

export const UnifiedLogin = () => {
  const { loginAdmin, loginCaptain, isAuthenticated } = useSession();
  const { user } = useNexus(); // Use 'user' object from useNexus hook
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('CAPTAIN'); // 'CAPTAIN' | 'ADMIN'
  const [formData, setFormData] = useState({ email: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // 🛰️ AUTO-DIVERT: If session exists, push to respective HUD
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check clearance level from user object provided by useNexus
      const path = (user.clearance || 0) >= 60 ? '/admin/dashboard' : '/dashboard';
      navigate(path);
    }
  }, [isAuthenticated, user, navigate]);

  const toggleMode = (newMode) => {
    if (mode === newMode) return;
    SoundNexus.play(CUES.UI_CLICK);
    setMode(newMode);
    setFormData({ email: '', password: '', code: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK_HEAVY);

    try {
      let result;
      const startLog = Telemetry.time('auth_handshake');

      if (mode === 'ADMIN') {
        result = await loginAdmin(formData.email, formData.password);
      } else {
        result = await loginCaptain(formData.code);
      }

      if (!result.success) throw new Error(result.message);

      // SUCCESS PROTOCOL
      SoundNexus.play(CUES.UI_SUCCESS);
      startLog.end(result.user?.id);
      
      toast.success(`UPLINK ESTABLISHED: WELCOME ${mode}`, {
        style: { background: '#09090b', color: mode === 'ADMIN' ? '#f472b6' : '#10b981', border: '1px solid #ffffff10' }
      });

      // Route based on role metadata
      const staffRoles = [ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE];
      navigate(staffRoles.includes(result.role) ? '/admin/dashboard' : '/dashboard');

    } catch (err) {
      SoundNexus.play(CUES.UI_ERROR);
      Telemetry.log(EVENTS.AUTH, { type: 'FAILURE', mode, error: err.message });
      toast.error(err.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
       
       {/* 🌌 BACKGROUND VORTEX */}
       <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 blur-[120px] rounded-full animate-pulse" />
         <div className="scanlines" />
       </div>

       <div className="w-full max-w-md bg-[#09090b] border border-white/5 rounded-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500">
          
          {/* TAB NAVIGATION */}
          <div className="flex border-b border-white/5 bg-black/40 backdrop-blur-xl">
             <button 
                onClick={() => toggleMode('CAPTAIN')}
                className={cn(
                  "flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group",
                  mode === 'CAPTAIN' ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-600 hover:text-zinc-400'
                )}
             >
                <span className="flex items-center justify-center gap-3">
                   <Command size={14} className={cn(mode === 'CAPTAIN' && "animate-pulse")} /> 
                   UNIT
                </span>
                {mode === 'CAPTAIN' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
             </button>
             <button 
                onClick={() => toggleMode('ADMIN')}
                className={cn(
                  "flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group",
                  mode === 'ADMIN' ? 'text-fuchsia-500 bg-fuchsia-500/5' : 'text-zinc-600 hover:text-zinc-400'
                )}
             >
                <span className="flex items-center justify-center gap-3">
                   <Shield size={14} className={cn(mode === 'ADMIN' && "animate-pulse")} /> 
                   COMMAND
                </span>
                {mode === 'ADMIN' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-fuchsia-500 shadow-[0_0_10px_#f472b6]" />}
             </button>
          </div>

          <div className="p-10">
              <div className="text-center mb-10">
                  <div className={cn(
                    "w-20 h-20 rounded-sm flex items-center justify-center mx-auto mb-6 border transition-all duration-700 rotate-45 group",
                    mode === 'CAPTAIN' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-fuchsia-500/10 border-fuchsia-500/30 shadow-[0_0_30px_rgba(244,114,182,0.1)]'
                  )}>
                     {mode === 'CAPTAIN' ? <Fingerprint className="-rotate-45 w-10 h-10 text-emerald-500" /> : <Terminal className="-rotate-45 w-10 h-10 text-fuchsia-500" />}
                  </div>
                  
                  <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
                    {mode === 'CAPTAIN' ? 'Operator' : 'Overseer'} <span className={mode === 'CAPTAIN' ? 'text-emerald-500' : 'text-fuchsia-500'}>Link</span>
                  </h1>
                  <p className="text-[9px] text-zinc-600 font-black font-mono mt-4 uppercase tracking-[0.4em]">
                    Establish high-fidelity uplink to Nexus Node
                  </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                  {mode === 'CAPTAIN' ? (
                     <div className="space-y-3">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Team Access Cypher</label>
                        <input 
                           type="password" 
                           className="w-full bg-black border border-zinc-800 rounded-sm p-5 text-center text-white font-mono tracking-[1em] text-3xl focus:border-emerald-500 outline-none transition-all placeholder:tracking-normal placeholder:text-[10px] placeholder:text-zinc-800"
                           placeholder="000-000"
                           maxLength={7}
                           value={formData.code}
                           onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                           autoFocus
                        />
                     </div>
                  ) : (
                     <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Agent Identifier</label>
                           <input 
                              type="email" 
                              className="w-full bg-black border border-zinc-800 rounded-sm p-4 text-xs font-mono text-white focus:border-fuchsia-500 outline-none transition-all"
                              placeholder="IDENT_USER@NODE"
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Security Key</label>
                             <input 
                                type="password" 
                                className="w-full bg-black border border-zinc-800 rounded-sm p-4 text-xs font-mono text-white focus:border-fuchsia-500 outline-none transition-all"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                             />
                        </div>
                     </div>
                  )}

                  {/* HANDSHAKE BUTTON */}
                  <button 
                     disabled={loading}
                     className={cn(
                       "w-full py-5 rounded-sm font-black uppercase tracking-[0.4em] text-[11px] transition-all duration-500 flex items-center justify-center gap-3 mt-10 active:scale-95 group",
                       mode === 'CAPTAIN' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/20'
                     )}
                  >
                     {loading ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                     ) : (
                       <>Initialize Uplink <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                     )}
                  </button>
              </form>
          </div>

          {/* SYSTEM FOOTER */}
          <div className="p-4 bg-white/[0.02] flex items-center justify-between border-t border-white/5">
              <button 
                onClick={() => setShowManual(true)}
                className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-all group"
              >
                 <BookOpen size={12} className="group-hover:text-emerald-500" />
                 Platform Manual
              </button>

              <div className="flex items-center gap-3">
                 <Activity size={10} className="text-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-tighter">
                   NXS-OS_V5.0
                 </span>
              </div>
          </div>
       </div>

       <NexusManual role="guest" isOpen={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
};
