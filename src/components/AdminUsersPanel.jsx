import React, { useState } from 'react';
import { ShieldAlert, UserPlus } from 'lucide-react';
import { useAdminConsole } from '../hooks/useAdminConsole';

/**
 * 🧩 Architecture Fix: AdminUsersPanel
 * Separated to handle User/Security management.
 * * 🔐 Security:
 * - This is the ONLY place where re-auth (PIN) might be requested 
 * for sensitive actions like "Create Admin".
 */
export const AdminUsersPanel = () => {
  const { createAdmin, loading, error } = useAdminConsole();
  const [form, setForm] = useState({ name: '', discord: '', faceitUser: '', authPin: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 🔐 Security: We pass the PIN only for this specific high-stakes action.
    // It is NOT stored in session.
    await createAdmin(form.authPin, { 
      name: form.name, 
      discord: form.discord, 
      faceitUser: form.faceitUser 
    });
    // Clear sensitive input immediately
    setForm(prev => ({ ...prev, authPin: '' }));
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-6 h-6 text-red-500" />
        <h3 className="font-['Teko'] text-2xl uppercase tracking-wide text-white">
          Security & Access
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-xs bg-red-900/20 p-2 rounded">{error}</div>}
        
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Admin Name" 
            className="bg-black border border-white/10 p-2 rounded text-white text-sm"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Discord ID" 
            className="bg-black border border-white/10 p-2 rounded text-white text-sm"
            value={form.discord}
            onChange={e => setForm({...form, discord: e.target.value})}
          />
        </div>

        {/* 🔐 RE-AUTH FIELD: Explicitly requested for this action */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <label className="block text-xs text-zinc-500 uppercase mb-1">Confirm with PIN</label>
          <div className="flex gap-4">
            <input 
              type="password" 
              placeholder="Enter your PIN to authorize" 
              className="bg-red-900/10 border border-red-500/30 p-2 rounded text-white text-sm flex-1"
              value={form.authPin}
              onChange={e => setForm({...form, authPin: e.target.value})}
            />
            <button 
              type="submit" 
              disabled={loading || !form.authPin}
              className="bg-white text-black font-bold uppercase px-6 py-2 rounded hover:bg-zinc-200 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Promote
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
