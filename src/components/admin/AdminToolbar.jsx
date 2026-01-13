/**
 * 🛠️ ADMIN TOOLBAR: SOVEREIGN OVERRIDE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // ATOMIC
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Lock, RefreshCw, Layout, Trash2, Radio } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { useSession } from '../../auth/useSession';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const AdminToolbar = () => {
  const { user, theme, isAdmin, isOwner } = useNexus();
  const { logout } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🛡️ SECURITY GATE: Level 90+ Clearance Required (Owner/Admin)
  if (!isAdmin) return null;

  const handleLogout = async () => {
    SoundNexus.play(CUES.UI_POWER_DOWN);
    Telemetry.log(EVENTS.AUTH, { action: 'SECURE_DISCONNECT' });
    await logout();
    navigate('/login');
  };

  /**
   * ⚡ TACTICAL GENERATION: BRACKET INITIALIZATION
   */
  const handleGenerateBracket = async () => {
    const confirmText = "GENERATE";
    const input = window.prompt(`⚠️ CRITICAL OVERRIDE: GENERATE BRACKET\n\nThis will:\n1. Lock all rosters\n2. Purge existing matches\n3. Construct tournament geometry\n\nType "${confirmText}" to execute:`);
    
    if (input !== confirmText) return;
    
    setLoading(true);
    SoundNexus.play(CUES.DISPUTE_TRIGGER); 
    const toastId = toast.loading("CONSTRUCTING TOURNAMENT GEOMETRY...");
    
    try {
        const { error } = await supabase.rpc('admin_generate_bracket');
        if (error) throw error;
        
        Telemetry.log(EVENTS.ACTION, { action: 'GENERATE_BRACKET' });
        toast.success("TOURNAMENT STRUCTURE ONLINE", { id: toastId });
        SoundNexus.play(CUES.UI_SUCCESS);
        
        // Refresh to load new reality
        setTimeout(() => window.location.reload(), 1500); 
    } catch (e) {
        toast.error("GENERATION FAILED: " + e.message, { id: toastId });
        SoundNexus.play(CUES.UI_ERROR);
    } finally {
        setLoading(false);
    }
  };

  /**
   * ☢️ NUCLEAR OPTION: SYSTEM PURGE
   */
  const handleSystemPurge = async () => {
    const confirmText = "PURGE SYSTEM";
    const input = window.prompt(`☢️ WARNING: TABULA RASA PROTOCOL\n\nThis will ERASE ALL:\n- Teams & Rosters\n- Matches & Vetoes\n- Analytics & Logs\n\nType "${confirmText}" to confirm:`);
    
    if (input !== confirmText) return;
    
    setLoading(true);
    SoundNexus.play(CUES.UI_POWER_DOWN);
    
    try {
        // Fallback to manual delete if RPC is missing
        const { error } = await supabase.rpc('admin_purge_system');
        
        if (error) {
             console.warn("RPC Failed, attempting manual purge...");
             await supabase.from('matches').delete().neq('id', 0);
             await supabase.from('teams').delete().neq('id', 0);
        }

        Telemetry.log(EVENTS.ERROR, { action: 'SYSTEM_PURGE', level: 'CRITICAL' });
        toast.success("SYSTEM PURGED. REALITY RESET.");
        SoundNexus.play(CUES.UI_SUCCESS);
        setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
        toast.error("PURGE ABORTED: " + e.message);
        SoundNexus.play(CUES.UI_ERROR);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-12 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* LEFT: Identity & Status */}
      <div className="flex items-center gap-5">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-sm border shadow-2xl transition-all duration-500", 
          theme.bg, theme.border, theme.color
        )}>
          <Lock className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{user?.role} Mode</span>
        </div>
        
        <div className="flex items-center gap-3">
            <Radio size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                Uplink: <span className="text-zinc-300">Secure</span>
            </span>
        </div>
      </div>

      {/* CENTER: God Mode Tools */}
      <div className="hidden lg:flex items-center gap-3">
         <button 
            onClick={handleGenerateBracket} 
            disabled={loading}
            className="group px-4 py-1.5 bg-zinc-900/50 hover:bg-fuchsia-600 border border-white/10 hover:border-fuchsia-500 rounded-sm text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all flex items-center gap-2"
         >
            <Layout size={12} className="group-hover:rotate-90 transition-transform duration-500" /> Construct Bracket
         </button>
         
         {isOwner && (
             <button 
                onClick={handleSystemPurge} 
                disabled={loading}
                className="px-4 py-1.5 bg-red-950/10 hover:bg-red-600 border border-red-900/20 hover:border-red-500 rounded-sm text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-white transition-all flex items-center gap-2"
             >
                <Trash2 size={12}/> Tabula Rasa
             </button>
         )}
      </div>

      {/* RIGHT: Profile & Exit */}
      <div className="flex items-center gap-6">
        {loading && (
          <div className="flex items-center gap-2 text-[9px] text-fuchsia-500 font-black animate-pulse uppercase tracking-widest">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Syncing...
          </div>
        )}
        
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/admin/profile')}>
          <div className="w-7 h-7 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-fuchsia-500 transition-colors">
             <User className="w-3.5 h-3.5 text-zinc-500 group-hover:text-fuchsia-500" />
          </div>
          <div className="hidden xl:block">
            <p className="text-[9px] font-black text-white uppercase tracking-tighter leading-none">{user?.username}</p>
            <p className="text-[7px] font-mono text-zinc-600 uppercase mt-1">Level {user?.clearance}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
          title="Secure Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
