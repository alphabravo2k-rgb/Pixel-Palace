import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Shield, Lock, RefreshCw, Crown, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
import { ROLES } from '../../lib/roles';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { Button } from '../../ui/Components';

// --- 🔒 SECURITY CONFIRMATION MODAL ---
const SecurityClearanceModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    try {
        // Double-check credentials before allowing sensitive action
        const { data: { user } } = await supabase.auth.getUser();
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password
        });

        if (signInError) throw new Error("Clearance Denied: Invalid Credentials");
        
        await onConfirm();
        onClose();
        setPassword(''); 
    } catch (err) {
        setError(err.message);
    } finally {
        setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-red-950/20 border border-red-500/50 w-full max-w-md p-6 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        
        <div className="flex items-center gap-3 mb-4 text-red-500 border-b border-red-500/30 pb-4">
          <div className="p-2 bg-red-500/20 rounded-full">
             <Lock className="w-6 h-6" />
          </div>
          <div>
              <h2 className="text-lg font-black uppercase tracking-tighter leading-none">Security Clearance</h2>
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">Level 5 Authorization Required</span>
          </div>
        </div>
        
        <p className="text-zinc-300 text-sm mb-6 font-mono leading-relaxed">
            High-level permission change detected. Please re-enter your command password to authorize this promotion sequence.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            autoFocus 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-red-900/50 text-white p-3 rounded focus:border-red-500 outline-none transition-all placeholder:text-zinc-700"
            placeholder="ENTER PASSWORD"
          />
          
          {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase bg-red-500/10 p-2 rounded border border-red-500/20">
                  <AlertTriangle size={12} /> {error}
              </div>
          )}
          
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-500 hover:text-white text-xs font-bold uppercase transition-colors">Cancel</button>
            <button disabled={verifying} type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded shadow-lg shadow-red-900/20 flex items-center gap-2">
              {verifying ? <RefreshCw className="animate-spin w-3 h-3" /> : <Lock size={12} />}
              {verifying ? 'VERIFYING...' : 'AUTHORIZE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 🛡️ MAIN COMPONENT ---
export const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null); // { userId, newRole }

  const fetchStaff = async () => {
    setLoading(true);
    const { data } = await supabase
        .from('app_admins')
        .select('*')
        .order('created_at', { ascending: false });
    setStaff(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const initiatePromotion = (userId, newRole) => {
    setPendingAction({ userId, newRole });
  };

  const executePromotion = async () => {
    if (!pendingAction) return;
    
    // ✅ SECURE RPC CALL (Backend Validation)
    const { data, error } = await supabase.rpc('admin_promote_staff', {
        p_target_id: pendingAction.userId,
        p_new_role: pendingAction.newRole
    });

    if (error || !data.success) {
      toast.error("Promotion Failed: " + (error?.message || data?.message));
    } else {
      toast.success("Staff Member Promoted Successfully");
      fetchStaff(); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in p-6">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
            <h1 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">
                STAFF <span className="text-fuchsia-500">HIERARCHY</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1 flex items-center gap-2">
                <Terminal size={10} /> MANAGE PRIVILEGES & ACCESS LEVELS
            </p>
        </div>
        <button onClick={fetchStaff} className="p-2 bg-zinc-900 border border-zinc-800 hover:border-white/20 text-white rounded transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-4">
        {staff.map(member => (
          <div key={member.id} className="bg-bg-panel border border-tactical p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-fuchsia-500/30 transition-all hover:shadow-lg">
            
            {/* Identity Info */}
            <div className="flex items-center gap-4 w-full md:w-1/3">
              <div className={cn(
                  "w-12 h-12 rounded flex items-center justify-center text-lg font-bold border",
                  member.role === ROLES.OWNER ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : 
                  member.role === ROLES.ADMIN ? "bg-red-500/10 text-red-500 border-red-500/30" : 
                  "bg-zinc-800 text-zinc-500 border-zinc-700"
              )}>
                {member.role === ROLES.OWNER ? <Crown size={20} /> : <Shield size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                    {member.full_name} 
                    {member.role === ROLES.OWNER && <Crown size={12} className="text-yellow-500"/>}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">{member.email}</p>
                <div className="flex gap-2 mt-1 text-[9px] text-zinc-600 font-mono uppercase">
                   {member.discord_handle && <span>• {member.discord_handle}</span>}
                </div>
              </div>
            </div>

            {/* Links Display */}
            <div className="flex gap-2 w-full md:w-1/3 justify-center">
               {member.steam_link && <a href={member.steam_link} target="_blank" rel="noreferrer" className="text-[9px] bg-[#171a21]/50 text-blue-400 px-2 py-1 rounded border border-blue-900/30 hover:bg-blue-900/40 transition-colors uppercase font-bold">Steam</a>}
               {member.faceit_link && <a href={member.faceit_link} target="_blank" rel="noreferrer" className="text-[9px] bg-[#ff5500]/10 text-orange-500 px-2 py-1 rounded border border-orange-900/30 hover:bg-orange-900/40 transition-colors uppercase font-bold">Faceit</a>}
            </div>

            {/* Role Control */}
            <div className="w-full md:w-1/3 flex justify-end">
              <div className="relative group/select">
                  <select 
                    value={member.role}
                    onChange={(e) => initiatePromotion(member.id, e.target.value)}
                    className={cn(
                        "bg-black border text-xs font-bold uppercase py-2 pl-4 pr-8 rounded outline-none cursor-pointer transition-all appearance-none",
                        member.role === ROLES.OWNER ? "border-yellow-600/50 text-yellow-500" :
                        member.role === ROLES.ADMIN ? "border-red-600/50 text-red-500" :
                        member.role === ROLES.REFEREE ? "border-blue-600/50 text-blue-500" :
                        "border-zinc-700 text-zinc-500"
                    )}
                  >
                    <option value={ROLES.OWNER}>Owner (God Mode)</option>
                    <option value={ROLES.ADMIN}>Admin (Command)</option>
                    <option value={ROLES.REFEREE}>Referee (Control)</option>
                    <option value={ROLES.CREW}>Crew (Restricted)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
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
