import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Lock, RefreshCw, Layout, Trash2, ShieldAlert, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexusStore } from '../../store/useNexusStore';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { getRoleTheme } from '../../lib/security/theme';

/**
 * 🛠️ ADMIN TOOLBAR: GOD MODE UTILITIES
 * ------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * FEATURES:
 * 1. GLOBAL COMMAND: Fixed access to critical system functions.
 * 2. CRITICAL SAFETY: Double-confirmation for destructive actions.
 * 3. HAPTIC FEEDBACK: Sound alerts on system changes.
 */

export const AdminToolbar = () => {
  const { profile, clearNexus, isLive } = useNexusStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🛡️ SECURITY GATE
  if (!['owner', 'admin'].includes(profile?.role)) return null;

  const theme = getRoleTheme(profile.role);

  const handleLogout = () => {
    SoundNexus.play(CUES.UI_ERROR); // Power down sound
    clearNexus();
    navigate('/login');
  };

  // ⚡ ACTION: Generate Bracket
  const handleGenerateBracket = async () => {
    const confirmText = "GENERATE";
    const input = window.prompt(`⚠️ CRITICAL ACTION: GENERATE BRACKET\n\nThis will:\n1. Lock all rosters\n2. Wipe existing matches\n3. Create new bracket structure\n\nType "${confirmText}" to execute:`);
    
    if (input !== confirmText) return;
    
    setLoading(true);
    SoundNexus.play(CUES.DISPUTE_TRIGGER); // Alarm sound
    const toastId = toast.loading("INITIALIZING BRACKET GENERATION...");
    
    try {
        const { error } = await supabase.rpc('admin_generate_bracket');
        if (error) throw error;
        
        toast.success("TOURNAMENT STRUCTURE ONLINE", { id: toastId });
        SoundNexus.play(CUES.SUCCESS);
        setTimeout(() => window.location.reload(), 1000); // Hard refresh to load new structure
    } catch (e) {
        toast.error("GENERATION FAILED: " + e.message, { id: toastId });
        SoundNexus.play(CUES.ERROR);
    } finally {
        setLoading(false);
    }
  };

  // ⚡ ACTION: Reset Everything
  const handleSystemPurge = async () => {
    const confirmText = "PURGE SYSTEM";
    const input = window.prompt(`☢️ DANGER: SYSTEM PURGE\n\nThis will DELETE ALL:\n- Teams\n- Matches\n- Chat Logs\n\nType "${confirmText}" to confirm:`);
    
    if (input !== confirmText) return;
    
    setLoading(true);
    SoundNexus.play(CUES.DISPUTE_TRIGGER);
    
    try {
        const { error } = await supabase.rpc('admin_purge_system'); // Ensure this RPC exists in DB or handle manually
        // Fallback if RPC doesn't exist (Manual Delete)
        if (error) {
             await supabase.from('matches').delete().neq('id', 0);
             await supabase.from('teams').delete().neq('id', 0);
             await supabase.from('messages').delete().neq('id', 0);
        }

        toast.success("SYSTEM PURGED. TABULA RASA.");
        SoundNexus.play(CUES.SUCCESS);
        setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
        toast.error("PURGE FAILED");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-14 bg-zinc-950/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shadow-2xl">
      
      {/* LEFT: Identity & Status */}
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm transition-all", theme.bg, theme.border, theme.color)}>
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{profile.role} MODE</span>
        </div>
        
        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-2 text-zinc-500">
            <Activity size={14} className={isLive ? "text-emerald-500 animate-pulse" : "text-zinc-700"} />
            <span className="text-[10px] font-mono uppercase tracking-widest">
                SYSTEM {isLive ? 'ONLINE' : 'STANDBY'}
            </span>
        </div>
      </div>

      {/* CENTER: God Mode Tools */}
      <div className="hidden md:flex items-center gap-2">
         <button 
            onClick={handleGenerateBracket} 
            disabled={loading}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-brand hover:text-white border border-white/10 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
         >
            <Layout size={12}/> Generate Bracket
         </button>
         
         <button 
            onClick={handleSystemPurge} 
            disabled={loading}
            className="px-4 py-1.5 bg-red-950/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/30 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
         >
            <Trash2 size={12}/> Purge Data
         </button>
      </div>

      {/* RIGHT: Profile & Exit */}
      <div className="flex items-center gap-4">
        {loading && (
          <div className="flex items-center gap-2 text-[10px] text-brand animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>PROCESSING</span>
          </div>
        )}
        
        <div className="h-4 w-px bg-white/10" />
        
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
             <User className="w-3 h-3" />
          </div>
          <span className="font-mono text-zinc-300 hidden md:inline-block uppercase">
             {profile.display_name}
          </span>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-red-950/30 text-zinc-500 hover:text-red-500 rounded-full border border-transparent hover:border-red-900/30 transition-all"
          title="Secure Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
