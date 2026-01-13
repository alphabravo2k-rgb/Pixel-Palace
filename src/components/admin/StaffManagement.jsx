/**
 * 👑 STAFF MANAGEMENT: HIERARCHY CONTROL
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // RE-AUTH REQUIRED
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Shield, Lock, RefreshCw, Crown, AlertTriangle, Terminal, Cpu, UserPlus } from 'lucide-react';
import { ROLES } from '../../lib/roles';
import { useNexus } from '../../hooks/useNexus';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// --- 🔒 SECURITY CLEARANCE GATE ---
const SecurityClearanceModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');
    SoundNexus.play(CUES.UI_CLICK);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password
        });

        if (signInError) throw new Error("ACCESS DENIED: INVALID MASTER PASSWORD");
        
        await onConfirm();
        onClose();
        setPassword(''); 
    } catch (err) {
        setError(err.message.toUpperCase());
        SoundNexus.play(CUES.UI_ERROR);
    } finally {
        setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-[#09090b] border border-red-500/30 w-full max-w-md p-10 rounded-sm shadow-[0_0_100px_rgba(239,68,68,0.1)] relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />

        <div className="flex items-center gap-4 mb-8 text-red-500 border-b border-white/5 pb-6">
          <Lock className="w-8 h-8 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white leading-none">Command Verification</h2>
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-red-500 mt-2 block">Level 90 Authorization Required</span>
          </div>
        </div>
        
        <p className="text-zinc-500 text-[11px] mb-8 font-mono leading-relaxed uppercase tracking-tight">
            CRITICAL HIERARCHY SHIFT DETECTED. RE-AUTHENTICATE COMMANDER IDENTITY TO COMMIT PERMISSION CHANGES TO THE NEXUS.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password" 
            autoFocus 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-800 text-white p-4 rounded-sm focus:border-red-600 outline-none transition-all placeholder:text-zinc-800 font-mono text-sm"
            placeholder="MASTER_PASSWORD"
          />
          
          {error && (
              <div className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase bg-red-500/5 p-3 rounded-sm border border-red-500/20">
                  <AlertTriangle size={14} /> {error}
              </div>
          )}
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Abort</button>
            <button disabled={verifying} type="submit" className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95">
              {verifying ? <RefreshCw className="animate-spin w-4 h-4" /> : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 🛡️ MAIN COMPONENT ---
export const StaffManagement = () => {
  const { user, can } = useNexus();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    const { data } = await supabase
        .from('app_admins')
        .select('*')
        .order('role', { ascending: false });
    setStaff(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const initiatePromotion = (userId, newRole) => {
    if (!can('CAP_MANAGE_STAFF')) {
        return toast.error("ACCESS DENIED: INSUFFICIENT CLEARANCE");
    }
    setPendingAction({ userId, newRole });
    SoundNexus.play(CUES.UI_CLICK);
  };

  const executePromotion = async () => {
    if (!pendingAction) return;
    
    try {
        const { data, error } = await supabase.rpc('admin_promote_staff', {
            p_target_id: pendingAction.userId,
            p_new_role: pendingAction.newRole
        });

        if (error || !data.success) throw new Error(error?.message || data?.message);

        Telemetry.log(EVENTS.ACTION, { action: 'STAFF_PROMOTION', target: pendingAction.userId, role: pendingAction.newRole }, user.id);
        SoundNexus.play(CUES.UI_SUCCESS);
        toast.success("STAFF HIERARCHY RECONFIGURED");
        fetchStaff(); 
    } catch (err) {
        toast.error("COMMIT FAILED: " + err.message);
        SoundNexus.play(CUES.UI_ERROR);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-2">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
            <h1 className="text-5xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
                Sovereign <span className="text-fuchsia-500">Hierarchy</span>
            </h1>
            <p className="text-[9px] text-zinc-600 font-mono tracking-[0.4em] mt-3 flex items-center gap-2 uppercase">
                <Cpu size={12} className="text-fuchsia-500" /> Kernel Clearance Management
            </p>
        </div>
        <div className="flex gap-4">
             <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-all">
                <UserPlus size={12} /> Invite Agent
             </button>
             <button onClick={fetchStaff} className="p-2.5 bg-zinc-900 border border-white/5 hover:border-fuchsia-500/50 text-white rounded-sm transition-all shadow-xl">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             </button>
        </div>
      </div>

      {/* STAFF FEED */}
      <div className="grid gap-3">
        {staff.map(member => (
          <div key={member.id} className="bg-[#09090b] border border-white/5 p-5 rounded-sm flex flex-col lg:flex-row items-center justify-between gap-6 group hover:border-fuchsia-500/20 transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/0 to-fuchsia-500/[0.02] translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
            
            {/* Identity Group */}
            <div className="flex items-center gap-5 w-full lg:w-1/3 relative z-10">
              <div className={cn(
                  "w-14 h-14 rounded-sm flex items-center justify-center border transition-all duration-500",
                  member.role === ROLES.OWNER ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : 
                  member.role === ROLES.ADMIN ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : 
                  "bg-zinc-900 text-zinc-600 border-zinc-800"
              )}>
                {member.role === ROLES.OWNER ? <Crown size={24} /> : <Shield size={24} />}
              </div>
              <div>
                <h3 className="text-base font-display font-black text-white flex items-center gap-2 uppercase italic tracking-tight">
                    {member.full_name || 'Anonymous Operative'} 
                    {member.role === ROLES.OWNER && <Crown size={12} className="text-yellow-500 fill-current"/>}
                </h3>
                <p className="text-[10px] text-zinc-600 font-mono uppercase mt-1 tracking-widest">{member.discord_handle || 'NO_COMMS_LINK'}</p>
              </div>
            </div>

            {/* Tactical Links */}
            <div className="flex gap-2 w-full lg:w-1/3 justify-center relative z-10">
               {member.steam_link && <a href={member.steam_link} target="_blank" rel="noreferrer" className="text-[8px] bg-zinc-900 text-blue-400 px-3 py-1.5 rounded-sm border border-blue-900/20 hover:border-blue-500 transition-all font-black uppercase tracking-widest">Signal: Steam</a>}
               {member.faceit_link && <a href={member.faceit_link} target="_blank" rel="noreferrer" className="text-[8px] bg-zinc-900 text-orange-500 px-3 py-1.5 rounded-sm border border-orange-900/20 hover:border-orange-500 transition-all font-black uppercase tracking-widest">Signal: Faceit</a>}
            </div>

            {/* Clearance Logic */}
            <div className="w-full lg:w-1/4 flex justify-end relative z-10">
              <div className="relative w-full lg:w-auto">
                  <select 
                    value={member.role}
                    onChange={(e) => initiatePromotion(member.id, e.target.value)}
                    disabled={member.role === ROLES.OWNER && user.role !== ROLES.OWNER}
                    className={cn(
                        "w-full lg:w-48 bg-black border text-[10px] font-black uppercase tracking-widest py-3 pl-4 pr-10 rounded-sm outline-none cursor-pointer transition-all appearance-none",
                        member.role === ROLES.OWNER ? "border-yellow-600 text-yellow-500" :
                        member.role === ROLES.ADMIN ? "border-red-600 text-red-500" :
                        "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                    )}
                  >
                    <option value={ROLES.OWNER}>Clearance 100: Owner</option>
                    <option value={ROLES.ADMIN}>Clearance 90: Admin</option>
                    <option value={ROLES.REFEREE}>Clearance 60: Referee</option>
                    <option value={ROLES.CREW}>Clearance 40: Crew</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-white">▼</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SecurityClearanceModal 
        isOpen={!!pendingAction} 
        onClose={() => setPendingAction(null)} 
        onConfirm={executePromotion} 
      />
    </div>
  );
};
