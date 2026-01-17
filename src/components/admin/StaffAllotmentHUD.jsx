/**
 * 👮 STAFF ALLOTMENT HUD: PERSONNEL COMMAND (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // CLEARANCE_LOCKED
 * -----------------------------------------
 * The centralized interface for managing staff hierarchy.
 * Enforces the 15-Tier Authority Matrix.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Search, UserPlus, AlertTriangle, CheckCircle, 
  Crown, Gavel, Mic, Activity, RefreshCw, X, Lock, Cpu, Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { ROLES, CLEARANCE, getClearanceLevel } from '../../lib/security/clearance';

// 🎨 ROLE BADGE DICTIONARY (Aligned to 15-Tier Vision)
const ROLE_CONFIG = {
  [ROLES.MASTER]: { color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', icon: Crown, label: 'SOVEREIGN' },
  [ROLES.CEO]: { color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/30', icon: Cpu, label: 'EXECUTIVE' },
  [ROLES.DIRECTOR]: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: Target, label: 'DIRECTOR' },
  [ROLES.SERVER_HEAD]: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: Cpu, label: 'INFRA HEAD' },
  [ROLES.ADMIN]: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: Shield, label: 'OPERATOR' },
  [ROLES.REFEREE]: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Gavel, label: 'MARSHAL' },
  [ROLES.CASTER]: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: Mic, label: 'TALENT' },
  default: { color: 'text-zinc-500', bg: 'bg-zinc-800/50', border: 'border-zinc-700', icon: Activity, label: 'STAFF' }
};

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.default;
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-sm border text-[8px] font-black uppercase tracking-[0.2em] shadow-lg transition-all duration-500",
      config.bg, config.border, config.color
    )}>
      <Icon size={10} className="animate-pulse" />
      <span>{config.label}</span>
    </div>
  );
};

export const StaffAllotmentHUD = () => {
  const { user, can } = useNexus();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState('');

  // 🛡️ SECURITY PROTOCOL 403
  if (!can('CAP_MANAGE_STAFF')) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center border border-red-500/20 bg-red-500/[0.02] rounded-sm">
        <Shield size={64} className="text-red-600 mb-6 animate-pulse opacity-20" />
        <h2 className="text-2xl font-display font-black uppercase italic text-red-500 tracking-tighter">Access Prohibited</h2>
        <p className="text-[10px] font-mono text-zinc-600 mt-4 uppercase tracking-[0.4em]">Neural Link Insufficient for Personnel Oversight</p>
      </div>
    );
  }

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      // Pull all entities with Level >= 30 (Streamers and above)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('role', 'in', `(${ROLES.GUEST},${ROLES.PLAYER},${ROLES.SPECTATOR})`) 
        .order('role', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      toast.error("ROSTER SYNC FAILURE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  // ⚔️ HIERARCHY LOGIC ENGINE
  const handleAssignment = async () => {
    if (!selectedUser || !targetRole) return;

    const myLevel = getClearanceLevel(user.role);
    const targetLevel = getClearanceLevel(targetRole);
    const subjectCurrentLevel = getClearanceLevel(selectedUser.role);

    // Sovereignty Check: You cannot promote someone to your level or higher, 
    // and you cannot demote someone who outranks or matches you.
    if (targetLevel >= myLevel || subjectCurrentLevel >= myLevel) {
      try{SoundNexus.play(CUES.UI_ERROR);}catch(e){}
      toast.error("PROTOCOL BREACH: INSUFFICIENT CLEARANCE OVER TARGET");
      return;
    }

    try {
      try{SoundNexus.play(CUES.UI_CLICK_HEAVY);}catch(e){}
      const { error } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Telemetry.log(EVENTS.ACTION, { 
        action: 'CLEARANCE_MODIFICATION', 
        target_id: selectedUser.id, 
        new_role: targetRole 
      }, user.id);

      toast.success("CLEARANCE UPDATED // UPLINK SYNCED");
      try{SoundNexus.play(CUES.UI_SUCCESS);}catch(e){}
      setSelectedUser(null);
      fetchStaff();
    } catch (err) {
      toast.error("COMMIT FAILED: " + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] border border-white/5 rounded-sm relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)]">
      
      {/* HUD HEADER */}
      <div className="p-8 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between backdrop-blur-3xl relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center justify-center rotate-45 shadow-neon">
            <Shield size={24} className="text-emerald-500 -rotate-45" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-none">Personnel Command</h2>
            <div className="flex items-center gap-3 mt-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon" />
                <p className="text-[9px] text-zinc-500 font-mono tracking-[0.4em] uppercase">
                    High-Value Entities: {staff.length} Units
                </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="SCAN CALLSIGN..." 
                    className="bg-black/60 border border-zinc-800 pl-10 pr-4 py-3 rounded-sm text-[10px] font-mono text-white w-64 outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={fetchStaff} className="p-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-zinc-600 hover:text-white transition-all">
                <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
        </div>
      </div>

      {/* REGISTRY LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {staff.filter(s => s.display_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((member, i) => (
          <motion.div 
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group flex items-center justify-between p-5 bg-zinc-900/20 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.01] transition-all rounded-sm"
          >
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 bg-black border border-zinc-800 rounded-sm flex items-center justify-center font-black text-zinc-700 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all duration-500 rotate-3">
                {member.display_name?.substring(0,2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-black text-white uppercase italic tracking-tight">{member.display_name}</h4>
                <div className="text-[8px] font-mono text-zinc-600 mt-1 uppercase tracking-[0.2em]">{member.id}</div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <RoleBadge role={member.role} />
              
              {/* AUTHORITY PROTECTION LAYER */}
              {getClearanceLevel(user.role) > getClearanceLevel(member.role) ? (
                <button 
                  onClick={() => { setSelectedUser(member); setTargetRole(member.role); try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} }}
                  className="px-6 py-2 bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-sm active:scale-95"
                >
                  Modify
                </button>
              ) : (
                <div className="px-6 py-2 opacity-10 cursor-not-allowed">
                    <Lock size={14} className="text-zinc-500" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ASSIGNMENT MODAL (OVERLAY) */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[#09090b] border border-white/10 p-10 rounded-sm shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500/50 animate-pulse" />
              <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors"><X size={24}/></button>
              
              <div className="mb-12 text-center">
                <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-sm border border-emerald-500/30 flex items-center justify-center mb-6 rotate-45 shadow-neon">
                  <Shield size={32} className="text-emerald-500 -rotate-45" />
                </div>
                <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">Modify Clearance</h3>
                <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-[0.5em] mt-3">Target_Unit: {selectedUser.display_name}</p>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-10">
                {Object.keys(ROLE_CONFIG).filter(r => r !== 'default').map(roleKey => {
                   const config = ROLE_CONFIG[roleKey];
                   const Icon = config.icon;
                   // You cannot assign a role equal to or higher than your own
                   const isIllegal = getClearanceLevel(roleKey) >= getClearanceLevel(user.role);

                   return (
                     <button
                       key={roleKey}
                       onClick={() => !isIllegal && setTargetRole(roleKey)}
                       disabled={isIllegal}
                       className={cn(
                         "w-full flex items-center justify-between p-4 border transition-all duration-300 rounded-sm group",
                         targetRole === roleKey 
                           ? "bg-white text-black border-white shadow-2xl" 
                           : isIllegal 
                             ? "bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed opacity-30 grayscale"
                             : "bg-black/40 border-zinc-800 text-zinc-500 hover:border-emerald-500/50 hover:text-emerald-500"
                       )}
                     >
                        <div className="flex items-center gap-4">
                          <Icon size={16} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{config.label}</span>
                        </div>
                        {isIllegal && <Lock size={12} />}
                        {targetRole === roleKey && <CheckCircle size={14} className="animate-bounce" />}
                     </button>
                   );
                })}
              </div>

              <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => { setTargetRole(ROLES.PLAYER); try{SoundNexus.play(CUES.WARNING);}catch(e){} }}
                    className={cn(
                        "w-full py-4 border rounded-sm text-[9px] font-black uppercase tracking-[0.3em] transition-all",
                        targetRole === ROLES.PLAYER ? "bg-red-600 border-red-500 text-white" : "border-red-900/30 text-red-900 hover:text-red-500"
                    )}
                  >
                    Revoke Staff Clearance (Demote to Player)
                  </button>
                  <button 
                    onClick={handleAssignment}
                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-sm transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
                  >
                    Execute Command
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
