import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Shield, Lock, Search, AlertTriangle, CheckCircle, RefreshCw, Crown } from 'lucide-react';

// --- CONFIRMATION MODAL ---
const SecurityClearanceModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    // Verify current user's password without logging out
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    });

    if (signInError) {
      setError("Incorrect Password. Clearance Denied.");
      setVerifying(false);
    } else {
      // Success! Proceed with action
      await onConfirm();
      setVerifying(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-[#0b0c0f] border border-red-900 w-full max-w-md p-6 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <Lock className="w-6 h-6" />
          <h2 className="text-lg font-black uppercase tracking-tighter">Security Clearance Required</h2>
        </div>
        <p className="text-zinc-400 text-sm mb-6">High-level permission change detected. Please re-enter your credentials to authorize this promotion.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:border-red-500 outline-none"
            placeholder="Enter Your Password"
          />
          {error && <div className="text-red-500 text-xs font-bold uppercase">{error}</div>}
          
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-500 hover:text-white text-xs font-bold uppercase">Cancel</button>
            <button disabled={verifying} type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded shadow-lg">
              {verifying ? 'Verifying...' : 'Authorize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
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
    try {
      const { error } = await supabase
        .from('app_admins')
        .update({ role: pendingAction.newRole })
        .eq('id', pendingAction.userId);
        
      if (error) throw error;
      fetchStaff(); // Refresh list
    } catch (err) {
      alert("Promotion Failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">STAFF <span className="text-fuchsia-500">HIERARCHY</span></h1>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest">Manage Privileges & Access Levels</p>
        </div>
        <button onClick={fetchStaff} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"><RefreshCw size={14}/></button>
      </div>

      <div className="grid gap-4">
        {staff.map(member => (
          <div key={member.id} className="bg-[#0b0c0f] border border-zinc-800 p-4 rounded flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-zinc-600 transition-colors">
            
            {/* Identity Info */}
            <div className="flex items-center gap-4 w-full md:w-1/3">
              <div className={`w-10 h-10 rounded flex items-center justify-center text-lg font-bold ${member.role === 'OWNER' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-500'}`}>
                {member.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {member.full_name} 
                  {member.role === 'OWNER' && <Crown size={12} className="text-yellow-500"/>}
                </h3>
                <p className="text-xs text-zinc-500">{member.email}</p>
                <div className="flex gap-2 mt-1 text-[10px] text-zinc-600 font-mono">
                   {member.phone_number && <span>{member.phone_number}</span>}
                   {member.discord_handle && <span>• {member.discord_handle}</span>}
                </div>
              </div>
            </div>

            {/* Links Display */}
            <div className="flex gap-2 w-full md:w-1/3 justify-center">
               {member.steam_link && <a href={member.steam_link} target="_blank" className="text-[10px] bg-blue-900/20 text-blue-400 px-2 py-1 rounded border border-blue-900/50 hover:bg-blue-900/40">Steam</a>}
               {member.faceit_link && <a href={member.faceit_link} target="_blank" className="text-[10px] bg-orange-900/20 text-orange-400 px-2 py-1 rounded border border-orange-900/50 hover:bg-orange-900/40">Faceit</a>}
               {member.steam_trade_link && <a href={member.steam_trade_link} target="_blank" className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700 hover:text-white">Trade</a>}
            </div>

            {/* Role Control */}
            <div className="w-full md:w-1/3 flex justify-end">
              <select 
                value={member.role}
                onChange={(e) => initiatePromotion(member.id, e.target.value)}
                className={`bg-black border text-xs font-bold uppercase py-2 px-4 rounded outline-none cursor-pointer transition-colors ${
                  member.role === 'OWNER' ? 'border-yellow-600 text-yellow-500' :
                  member.role === 'ADMIN' ? 'border-red-600 text-red-500' :
                  member.role === 'REFEREE' ? 'border-blue-600 text-blue-500' :
                  'border-zinc-700 text-zinc-500'
                }`}
              >
                <option value="OWNER">Owner (God Mode)</option>
                <option value="ADMIN">Admin (High Command)</option>
                <option value="REFEREE">Referee (Match Control)</option>
                <option value="CREW">Crew (Restricted)</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      <SecurityClearanceModal 
        isOpen={!!pendingAction} 
        onClose={() => setPendingAction(null)} 
        onConfirm={executePromotion} 
      />
    </div>
  );
};
