/**
 * ⚡ GOD MODE: SOVEREIGN COMMAND (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: RESTRICTED // LEVEL_100_ONLY
 * -----------------------------------------
 * Absolute authority over the digital spire.
 * Bypasses standard logical gates.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, AlertOctagon, Database, Power, 
  Fingerprint, RefreshCw, Zap, ShieldAlert,
  Terminal, Radio, Cpu, HardDrive
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { ROLES } from '../../lib/security/clearance';

// 🛑 SUB-COMPONENT: NUCLEAR INITIATOR
const NuclearSwitch = ({ label, action, onActivate, loading, dangerZone = true }) => {
  const [armed, setArmed] = useState(false);

  const handleToggle = () => {
    if (!armed) {
      try{SoundNexus.play(CUES.UI_CLICK_HEAVY);}catch(e){}
      setArmed(true);
    } else {
      onActivate();
      setArmed(false);
    }
  };

  return (
    <div className={cn(
      "p-8 border rounded-sm flex items-center justify-between group transition-all duration-500",
      armed ? "bg-red-600/10 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]" : "bg-zinc-900/20 border-white/5 hover:border-white/10"
    )}>
      <div className="flex items-center gap-6">
        <div className={cn(
          "w-14 h-14 rounded-sm flex items-center justify-center border transition-all duration-700 rotate-45",
          armed ? "bg-red-600 border-red-400 shadow-neon-red" : "bg-black border-zinc-800"
        )}>
          {loading ? (
            <RefreshCw className="animate-spin text-white -rotate-45" size={20} />
          ) : (
            <Skull className={cn("transition-all -rotate-45", armed ? "text-white animate-pulse" : "text-zinc-800")} size={24} />
          )}
        </div>
        <div className="space-y-1">
          <h4 className="text-white font-display font-black uppercase italic tracking-wider text-lg">{label}</h4>
          <p className={cn("text-[9px] font-mono uppercase tracking-[0.3em]", armed ? "text-red-500 animate-flicker" : "text-zinc-600")}>
            {armed ? "Protocol Armed // Critical Execution Pending" : action}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "px-10 py-4 rounded-sm font-black uppercase italic tracking-[0.4em] text-[10px] transition-all duration-500 active:scale-95",
          armed 
            ? "bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]" 
            : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white hover:border-red-600"
        )}
      >
        {armed ? 'Commit' : 'Arm'}
      </button>
    </div>
  );
};

export const GodMode = () => {
  const { user, can } = useNexus();
  const [authSequence, setAuthSequence] = useState('IDLE'); // IDLE, SCANNING, GRANTED
  const [systemState, setSystemState] = useState('NOMINAL');
  const [loading, setLoading] = useState(false);

  // 🧬 SOVEREIGN HANDSHAKE
  useEffect(() => {
    if (!can('CAP_ACCESS_GOD_MODE')) return;

    const initialize = async () => {
      setAuthSequence('SCANNING');
      try{SoundNexus.play(CUES.UI_POWER_UP);}catch(e){}
      await new Promise(r => setTimeout(r, 2500));
      setAuthSequence('GRANTED');
      try{SoundNexus.play(CUES.UI_SUCCESS);}catch(e){}
      Telemetry.log(EVENTS.SECURITY, { action: 'GOD_MODE_UNLOCKED' }, user.id);
    };
    initialize();
  }, [can, user.id]);

  // 🛡️ CONTAINMENT PROTOCOL
  if (!can('CAP_ACCESS_GOD_MODE')) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020202] text-red-600 font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-red-950/5 animate-pulse" />
        <ShieldAlert size={120} className="mb-10 animate-bounce opacity-40" />
        <h1 className="text-6xl font-black uppercase tracking-[0.5em] mb-6">Unauthorized</h1>
        <div className="bg-red-600 text-black px-6 py-2 text-xs font-black uppercase tracking-[0.2em]">Sovereign Breach Detected</div>
        <p className="mt-10 text-[10px] text-red-900 uppercase tracking-[0.8em]">Incident_Logged_To_Kernel</p>
      </div>
    );
  }

  // 🔍 BIO-SYNC VIEW
  if (authSequence !== 'GRANTED') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center z-10"
        >
          <Fingerprint size={100} className="text-fuchsia-600 mx-auto mb-10 animate-pulse" />
          <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">Biometric Uplink</h2>
          <p className="text-[10px] font-mono text-zinc-600 mt-4 uppercase tracking-[0.8em] animate-flicker">
            Reading_Sovereign_Hash_Sequence...
          </p>
          <div className="mt-12 w-80 h-[2px] bg-zinc-900 mx-auto rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-1/2 h-full bg-fuchsia-500 shadow-neon" 
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // ☢️ NUCLEAR EXECUTION
  const executeSovereignOrder = async (rpcName, params = {}) => {
    const confirmation = window.prompt(`☢️ ABSOLUTE AUTHORITY OVERRIDE ☢️\n\nAction: ${rpcName}\nType "TERMINATE" to confirm global data destruction.`);
    
    if (confirmation !== "TERMINATE") {
      toast.error("SEQUENCE ABORTED: HASH MISMATCH");
      try{SoundNexus.play(CUES.UI_ERROR);}catch(e){}
      return;
    }

    setLoading(true);
    try {
      try{SoundNexus.play(CUES.UI_CLICK_HEAVY);}catch(e){}
      const { error } = await supabase.rpc(rpcName, params);
      if (error) throw error;

      Telemetry.log(EVENTS.SYSTEM, { action: `SOVEREIGN_ORDER_${rpcName.toUpperCase()}` }, user.id);
      toast.success("SYSTEM GEOMETRY PURGED");
      try{SoundNexus.play(CUES.UI_POWER_DOWN);}catch(e){}
    } catch (err) {
      toast.error("KERNEL REJECTION: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] border border-red-900/30 rounded-sm relative overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)]">
      
      {/* SOVEREIGN HUD HEADER */}
      <div className="p-10 border-b border-white/5 bg-red-950/10 flex items-center justify-between backdrop-blur-3xl relative z-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-red-600/10 border border-red-600/30 rounded-sm flex items-center justify-center rotate-45 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
            <AlertOctagon size={40} className="text-red-500 animate-pulse -rotate-45" />
          </div>
          <div>
            <h2 className="text-5xl font-display font-black text-white uppercase italic tracking-tighter leading-none">God Mode</h2>
            <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-neon", systemState === 'NOMINAL' ? "bg-emerald-500" : "bg-red-500")} />
                    <p className="text-[10px] text-zinc-500 font-mono tracking-[0.5em] uppercase">Spire_State: {systemState}</p>
                </div>
                <div className="w-px h-3 bg-zinc-800" />
                <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.3em]">Master Clearance Level 100</p>
            </div>
          </div>
        </div>
        
        <button 
            onClick={() => setSystemState(s => s === 'NOMINAL' ? 'LOCKDOWN' : 'NOMINAL')}
            className={cn(
                "p-6 border rounded-sm transition-all duration-700 active:scale-90 group shadow-2xl",
                systemState === 'NOMINAL' ? "bg-zinc-900 border-zinc-800 text-zinc-700 hover:text-white" : "bg-red-600 border-red-400 text-white shadow-red-600/40"
            )}
        >
            <Power size={32} className={cn("group-hover:scale-110 transition-transform", systemState === 'LOCKDOWN' && "animate-pulse")} />
        </button>
      </div>

      {/* CORE CONTROL GRID */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-12 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-7xl mx-auto">
            
            {/* ☢️ TIER 1: DATA PURGE */}
            <div className="space-y-8 bg-zinc-900/20 p-10 border border-white/5 rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Database size={100} /></div>
                <div className="flex items-center gap-5 mb-10 border-l-4 border-red-600 pl-6">
                    <Terminal className="text-red-500" size={24} />
                    <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tight">Geometry Destruction</h3>
                </div>
                
                <NuclearSwitch 
                    label="Purge Combat History" 
                    action="Irreversibly wipes all matches. Retains team registry." 
                    onActivate={() => executeSovereignOrder('admin_purge_matches')}
                    loading={loading}
                />
                
                <NuclearSwitch 
                    label="Reset Global Ledger" 
                    action="Wipes financial history. Recalibrates treasury to zero." 
                    onActivate={() => executeSovereignOrder('admin_reset_financials')}
                    loading={loading}
                />

                <NuclearSwitch 
                    label="Sovereign Reset" 
                    action="Total destruction: Wipes Teams, Brackets, and Assets." 
                    onActivate={() => executeSovereignOrder('admin_total_nuke')}
                    loading={loading}
                />
            </div>

            {/* 🛠️ TIER 2: SYSTEM OVERRIDES */}
            <div className="space-y-8 bg-zinc-900/20 p-10 border border-white/5 rounded-sm">
                <div className="flex items-center gap-5 mb-10 border-l-4 border-fuchsia-600 pl-6">
                    <Cpu className="text-fuchsia-500" size={24} />
                    <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tight">System Variables</h3>
                </div>

                <div className="p-8 bg-black/40 border border-white/5 rounded-sm group hover:border-fuchsia-500/30 transition-all duration-500 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Registration Gate</span>
                            <p className="text-[9px] text-zinc-600 font-mono">Control global new-user access</p>
                        </div>
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-neon animate-pulse" />
                    </div>
                    <button className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-sm">
                        Toggle Entry Lockdown
                    </button>
                </div>

                <div className="p-8 bg-black/40 border border-white/5 rounded-sm group hover:border-amber-500/30 transition-all duration-500 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Sovereign Broadcast</span>
                            <p className="text-[9px] text-zinc-600 font-mono">Inject global system-wide notification</p>
                        </div>
                        <Radio size={16} className="text-amber-500" />
                    </div>
                    <textarea 
                        placeholder="SOVEREIGN_MESSAGE_INPUT..." 
                        className="w-full bg-zinc-950 border border-zinc-900 p-5 text-xs text-white font-mono uppercase focus:border-amber-500 outline-none mb-6 min-h-[100px] transition-all" 
                    />
                    <button className="w-full py-4 bg-amber-600/10 border border-amber-600/30 text-amber-600 hover:bg-amber-600 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-sm shadow-xl active:scale-95">
                        Broadcast_Protocol
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER DIAGNOSTICS */}
      <div className="p-6 bg-black/80 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-zinc-800 uppercase tracking-[0.5em] relative z-20">
          <div className="flex items-center gap-4">
              <HardDrive size={14} />
              <span>Direct_RPC_Channel: Active</span>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse shadow-neon-red" />
                <span>Protocol: 066</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-neon" />
                <span>Latency: 2ms</span>
              </div>
          </div>
      </div>
    </div>
  );
};
