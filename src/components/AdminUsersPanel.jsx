import React, { useState } from 'react';
import { ShieldAlert, UserPlus, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';

export const AdminUsersPanel = () => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [form, setForm] = useState({ 
    name: '', 
    discord: '', 
    newPin: '',
    role: 'ADMIN' // Default
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Permission Check
    if (session.role !== 'OWNER') {
        setError("Only the OWNER can promote new admins.");
        return;
    }

    if (!form.newPin || form.newPin.length < 4) {
        setError("PIN must be at least 4 chars.");
        return;
    }

    setLoading(true);
    try {
        // ✅ Direct DB Insert (Allowed by RLS for OWNER)
        const { error: dbError } = await supabase
            .from('admin_profiles')
            .insert({
                display_name: form.name,
                discord_handle: form.discord,
                pin_code: form.newPin,
                role: form.role,
                can_manage_ops: true, // Defaulting permissions for now
                can_manage_money: false
            });

        if (dbError) throw dbError;

        setSuccess(`Created Admin: ${form.name}`);
        setForm({ name: '', discord: '', newPin: '', role: 'ADMIN' });

    } catch (err) {
        console.error(err);
        if (err.code === '23505') setError("PIN Code already exists. Choose another.");
        else setError("Failed to create admin.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-6 h-6 text-red-500" />
        <h3 className="font-['Teko'] text-2xl uppercase tracking-wide text-white">Security & Access</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-xs bg-red-900/20 p-2 rounded">{error}</div>}
        {success && <div className="text-green-500 text-xs bg-green-900/20 p-2 rounded flex items-center gap-2"><CheckCircle className="w-4 h-4"/> {success}</div>}
        
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Display Name" 
            className="bg-black border border-white/10 p-2 rounded text-white text-sm" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required
          />
          <input 
            type="text" 
            placeholder="Discord ID (Optional)" 
            className="bg-black border border-white/10 p-2 rounded text-white text-sm" 
            value={form.discord} 
            onChange={e => setForm({...form, discord: e.target.value})} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
             <select 
                className="bg-black border border-white/10 p-2 rounded text-white text-sm"
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value})}
             >
                 <option value="ADMIN">ADMIN</option>
                 <option value="REFEREE">REFEREE</option>
             </select>
             
             <input 
                type="text" 
                placeholder="Assign PIN Code" 
                className="bg-black border border-white/10 p-2 rounded text-white text-sm font-mono tracking-widest" 
                value={form.newPin} 
                onChange={e => setForm({...form, newPin: e.target.value})} 
                required
              />
        </div>

        <div className="border-t border-white/10 pt-4 mt-4 flex justify-end">
            <button 
                type="submit" 
                disabled={loading || session.role !== 'OWNER'} 
                className="bg-white text-black font-bold uppercase px-6 py-2 rounded hover:bg-zinc-200 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 inline mr-2" /> Grant Access
            </button>
        </div>
      </form>
      
      {session.role !== 'OWNER' && (
          <p className="mt-4 text-xs text-zinc-500 italic text-center">Only the Owner can manage staff access.</p>
      )}
    </div>
  );
};
