/**
 * ⚡ PIXEL PALACE: UNIFIED AUTHENTICATION
 * FILE: src/components/auth/UnifiedLogin.jsx
 * -----------------------------------------
 * VERSION: 2050.5.0 (MASTER OMNI)
 * DATE: 2026-01-22
 * STATUS: OPERATIONAL // OMNI-GATE
 * -----------------------------------------
 * DESCRIPTION:
 * The single-door entry point for all users (Sovereigns, Admins, Captains).
 * Routes users dynamically based on their clearance level.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { useSession } from '../../auth/useSession';
import { SoundNexus, CUES } from '../../lib/soundNexus';

export const UnifiedLogin = () => {
  const { loginUnified } = useSession(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleOmniAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { SoundNexus.play(CUES.UI_CLICK_HEAVY); } catch(e) {}

    try {
      // 1. SINGLE PIPELINE AUTHENTICATION
      const { user, error } = await loginUnified(formData.email, formData.password);
      
      if (error) throw error;

      // 2. CLEARANCE RESOLUTION
      const clearance = user?.user_metadata?.clearance_level || 0; // Default to Guest
      
      try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e) {}
      
      // 3. DYNAMIC ROUTING (THE "ONE GATE" LOGIC)
      if (clearance >= 100) {
        toast.success("WELCOME, SOVEREIGN.", {
            icon: <ShieldCheck className="text-fuchsia-500" />,
            style: { background: '#09090b', color: '#e879f9', border: '1px solid #e879f9' }
        });
        navigate('/admin/god-mode');
      } else if (clearance >= 50) {
        toast.success("WELCOME, OFFICIAL.", {
            style: { background: '#09090b', color: '#f472b6', border: '1px solid #f472b6' }
        });
        navigate('/admin/dashboard');
      } else {
        toast.success("WELCOME, COMPETITOR.", {
            style: { background: '#09090b', color: '#10b981', border: '1px solid #10b981' }
        });
        navigate('/dashboard');
      }

    } catch (err) {
      try { SoundNexus.play(CUES.UI_ERROR); } catch(e) {}
      toast.error(err.message.toUpperCase(), {
        style: { background: '#09090b', color: '#ef4444', border: '1px solid #ef4444' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
       
       {/* 🌌 ATMOSPHERE */}
       <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-800/10 blur-[100px] rounded-full" />
         <div className="scanlines" />
       </div>

       <div className="w-full max-w-md bg-[#09090b] border border-white/10 p-12 relative overflow-hidden shadow-2xl rounded-sm z-10">
          {/* HEADER */}
          <div className="text-center mb-12">
              <div className="w-20 h-20 bg-zinc-900/50 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                 <Fingerprint className="w-10 h-10 text-zinc-500 animate-pulse" strokeWidth={1} />
              </div>
              <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter">
                Pixel Palace <span className="text-zinc-600">Omni-Gate</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="h-[1px] w-8 bg-zinc-800" />
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.4em]">One Platform. One Gate.</p>
                <div className="h-[1px] w-8 bg-zinc-800" />
              </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleOmniAuth} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Identity String</label>
                 <input 
                   type="email" 
                   required
                   className="w-full bg-black border border-zinc-800 p-4 text-xs text-white font-mono focus:border-white/20 outline-none transition-all rounded-sm placeholder:text-zinc-800"
                   placeholder="USER@PIXELPALACE.GG"
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Security Token</label>
                 <input 
                   type="password" 
                   required
                   className="w-full bg-black border border-zinc-800 p-4 text-xs text-white font-mono focus:border-white/20 outline-none transition-all rounded-sm placeholder:text-zinc-800"
                   placeholder="••••••••••••"
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                 />
              </div>

              <button 
                 disabled={loading}
                 className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] mt-8 hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 rounded-sm active:scale-95 disabled:opacity-50"
              >
                 {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <>Access System <ArrowRight size={14} /></>}
              </button>
          </form>

          {/* FOOTER */}
          <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
             <span>Secure Connection</span>
             <span>V4.0.0</span>
          </div>
       </div>
    </div>
  );
};
