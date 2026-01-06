import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ArrowRight, Command, Terminal, Loader2, Activity, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx'; 

// ✅ SAFE IMPORTS
import { useSession } from '../../auth/useSession';
import { ROLES } from '../../lib/roles';
import { NexusManual } from '../guide/NexusManual'; // 📘 INTEGRATED MANUAL

/**
 * 🔐 PIXEL PALACE: UNIFIED AUTH TERMINAL
 * -------------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * FEATURES:
 * 1. DUAL-PROTOCOL: Unit (Captain) vs Command (Admin) modes.
 * 2. INTEL ACCESS: Integrated Guest Manual for onboarding.
 * 3. SECURE HANDSHAKE: Validates credentials against Supabase.
 */

export const UnifiedLogin = () => {
  const { loginAdmin, loginCaptain } = useSession();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('CAPTAIN'); // 'CAPTAIN' | 'ADMIN'
  const [formData, setFormData] = useState({ email: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false); // 📘 MANUAL STATE

  // 🔄 MODE SWITCHER
  const toggleMode = (newMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    setFormData({ email: '', password: '', code: '' });
  };

  // 🚀 LOGIN LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      // 1. EXECUTE STRATEGY
      if (mode === 'ADMIN') {
        result = await loginAdmin(formData.email, formData.password);
      } else {
        result = await loginCaptain(formData.code);
      }

      if (!result.success) throw new Error(result.message);

      // 2. SUCCESS FEEDBACK
      toast.success(`UPLINK ESTABLISHED: Welcome, ${mode === 'ADMIN' ? 'Commander' : 'Operator'}.`, {
        icon: '🔓',
        style: { border: '1px solid #10b981', color: '#10b981' }
      });

      // 3. ROUTING
      const userRole = result.role || 'player';
      const staffRoles = [ROLES.OWNER, ROLES.ADMIN, ROLES.REFEREE];

      if (staffRoles.includes(userRole)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      toast.error(err.message || "ACCESS DENIED", {
        icon: '🚫',
        style: { border: '1px solid #ef4444', color: '#ef4444' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
       
       {/* 1. ATMOSPHERIC LAYERS */}
       <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="scanlines opacity-[0.3]" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-brand)/0.05),transparent)]" />
       </div>

       <div className="w-full max-w-md bg-bg-panel border border-white/5 rounded-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500">
          
          {/* PROTOCOL TABS */}
          <div className="flex border-b border-white/5 bg-black/60 backdrop-blur-md">
             <button 
                onClick={() => toggleMode('CAPTAIN')}
                className={clsx(
                  "flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group",
                  mode === 'CAPTAIN' ? 'text-brand bg-brand/5' : 'text-zinc-600 hover:text-zinc-400'
                )}
             >
                {mode === 'CAPTAIN' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand animate-in slide-in-from-left duration-300" />}
                <span className="flex items-center justify-center gap-3">
                   <Users size={14} className={clsx(mode === 'CAPTAIN' && "animate-pulse")} /> 
                   UNIT PROTOCOL
                </span>
             </button>
             <button 
                onClick={() => toggleMode('ADMIN')}
                className={clsx(
                  "flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group",
                  mode === 'ADMIN' ? 'text-fuchsia-500 bg-fuchsia-500/5' : 'text-zinc-600 hover:text-zinc-400'
                )}
             >
                {mode === 'ADMIN' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-fuchsia-500 animate-in slide-in-from-right duration-300" />}
                <span className="flex items-center justify-center gap-3">
                   <Shield size={14} className={clsx(mode === 'ADMIN' && "animate-pulse")} /> 
                   COMMAND PROTOCOL
                </span>
             </button>
          </div>

          <div className="p-10 pb-6">
              {/* TERMINAL HEADER */}
              <div className="text-center mb-10">
                 <div className={clsx(
                   "w-20 h-20 rounded-sm flex items-center justify-center mx-auto mb-6 border-2 transition-all duration-700",
                   mode === 'CAPTAIN' ? 'bg-brand/5 border-brand/20 shadow-[0_0_20px_rgba(var(--color-brand)/0.2)]' : 'bg-fuchsia-900/5 border-fuchsia-500/20 shadow-[0_0_20px_rgba(217,70,239,0.2)]'
                 )}>
                    {mode === 'CAPTAIN' ? <Command className="w-8 h-8 text-brand" /> : <Terminal className="w-8 h-8 text-fuchsia-500" />}
                 </div>
                 
                 <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
                    {mode === 'CAPTAIN' ? 'SQUAD LOGIN' : 'OVERSEER LINK'}
                 </h1>
                 <p className="text-[9px] text-zinc-600 font-black font-mono mt-4 uppercase tracking-[0.3em]">
                    {mode === 'CAPTAIN' ? 'Establishing direct team-to-server uplink' : 'Clearance Level 60+ credentials required'}
                 </p>
              </div>

              {/* DATA ENTRY FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">
                 {mode === 'CAPTAIN' ? (
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Access Token</label>
                       <input 
                          type="password" 
                          className="w-full bg-black border border-white/10 rounded-sm p-5 text-center text-white font-mono tracking-[1em] text-2xl focus:border-brand focus:ring-1 focus:ring-brand/30 outline-none transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-sans placeholder:text-zinc-800"
                          placeholder="ENTER CODE"
                          maxLength={6}
                          value={formData.code}
                          onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          autoFocus
                       />
                    </div>
                 ) : (
                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Officer Identity</label>
                          <input 
                             type="email" 
                             className="w-full bg-black border border-white/10 rounded-sm p-4 text-xs font-black text-white focus:border-fuchsia-500 outline-none transition-all placeholder:text-zinc-800"
                             placeholder="admin@nexus.core"
                             value={formData.email}
                             onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Security Key</label>
                            <input 
                               type="password" 
                               className="w-full bg-black border border-white/10 rounded-sm p-4 text-xs font-black text-white focus:border-fuchsia-500 outline-none transition-all placeholder:text-zinc-800"
                               placeholder="****************"
                               value={formData.password}
                               onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                       </div>
                    </div>
                 )}

                 {/* HANDSHAKE BUTTON */}
                 <button 
                    disabled={loading}
                    className={clsx(
                      "w-full py-5 rounded-sm font-black uppercase italic tracking-[0.2em] text-sm transition-all duration-300 flex items-center justify-center gap-3 mt-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale",
                      mode === 'CAPTAIN' ? 'bg-brand text-white shadow-[0_0_15px_rgba(var(--color-brand)/0.4)] hover:bg-brand-glow' : 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)] hover:bg-fuchsia-500'
                    )}
                 >
                    {loading ? (
                      <div className="flex items-center gap-3">
                         <Loader2 className="w-5 h-5 animate-spin" />
                         <span className="animate-pulse">Handshake Active...</span>
                      </div>
                    ) : (
                      <>INITIATE LINK <ArrowRight size={18} /></>
                    )}
                 </button>
              </form>
          </div>

          {/* STATUS FOOTER */}
          <div className="p-4 bg-black/80 flex items-center justify-between border-t border-white/5">
              <button 
                onClick={() => setShowManual(true)}
                className="flex items-center gap-2 text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest hover:text-white transition-colors group"
              >
                 <BookOpen size={12} className="group-hover:text-brand transition-colors" />
                 <span>Public Archives</span>
              </button>

              <div className="flex items-center gap-3">
                 <Activity size={10} className="text-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-black font-mono text-zinc-800 uppercase tracking-[0.2em]">
                   v4.1.0-GENESIS
                 </span>
              </div>
          </div>
       </div>

       {/* 📘 MANUAL MODAL */}
       <NexusManual role="guest" isOpen={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
};
