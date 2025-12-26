import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { useAdminConsole } from '../../hooks/useAdminConsole'; // ✅ Use secure hook
import { Shield, Users as UsersIcon, Eye, EyeOff, UserPlus, Lock } from 'lucide-react';

export const StaffManagement = () => {
  const { execute, loading } = useAdminConsole();
  const [admins, setAdmins] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', pin: '', role: 'ADMIN' });
  const [showTeamPins, setShowTeamPins] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    // 🛡️ SECURITY: We ONLY select ID, Name, Role. NEVER the PIN (even hashed).
    const { data: adminData } = await supabase.from('app_admins').select('id, name, role');
    const { data: teamData } = await supabase.from('teams').select('id, name, access_code');
    setAdmins(adminData || []);
    setTeams(teamData || []);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (newAdmin.pin.length < 4) return alert("Security Policy: PIN must be 4+ chars");

    // 🛡️ SECURE CREATION VIA RPC
    const result = await execute('admin_create_staff', {
        p_name: newAdmin.name,
        p_pin: newAdmin.pin,
        p_role: newAdmin.role
    });

    if (result.success) {
        alert(`Staff Member ${newAdmin.name} authorized.`);
        setNewAdmin({ name: '', pin: '', role: 'ADMIN' });
        fetchData();
    } else {
        alert(`Authorization Failed: ${result.message}`);
    }
  };

  const toggleTeamPin = (id) => setShowTeamPins(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-8">
      {/* 1. SECURE ADD STAFF FORM */}
      <section className="bg-zinc-900 border border-fuchsia-500/20 p-6 rounded-lg shadow-lg">
        <h4 className="text-fuchsia-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase">
          <UserPlus size={16} /> Authorize New Operator
        </h4>
        <form onSubmit={handleCreateStaff} className="flex gap-4 items-end">
          <div className="flex-1 space-y-1">
             <label className="text-[10px] uppercase text-zinc-500 font-bold">Operator Name / ID</label>
             <input 
                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm focus:border-fuchsia-500 outline-none text-white"
                placeholder="e.g. 'SilentAdmin'"
                value={newAdmin.name}
                onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
             />
          </div>
          <div className="w-32 space-y-1">
             <label className="text-[10px] uppercase text-zinc-500 font-bold">Secure PIN</label>
             <input 
                type="password"
                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm focus:border-fuchsia-500 outline-none text-white"
                placeholder="****"
                value={newAdmin.pin}
                onChange={e => setNewAdmin({...newAdmin, pin: e.target.value})}
             />
          </div>
          <div className="w-40 space-y-1">
             <label className="text-[10px] uppercase text-zinc-500 font-bold">Role Authority</label>
             <select 
                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm focus:border-fuchsia-500 outline-none text-white"
                value={newAdmin.role}
                onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
             >
                <option value="ADMIN">ADMIN</option>
                <option value="REFEREE">REFEREE</option>
                <option value="OWNER">OWNER</option>
             </select>
          </div>
          <button 
             disabled={loading}
             className="bg-fuchsia-600 px-6 py-2 rounded text-xs font-bold uppercase hover:bg-fuchsia-500 transition-colors shadow-lg shadow-fuchsia-900/20 mb-[1px] text-white"
          >
            {loading ? 'Hashing...' : 'Grant Access'}
          </button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-2 font-mono flex items-center gap-1">
            <Lock size={10} /> PINs are hashed using bcrypt. They cannot be viewed after creation.
        </p>
      </section>

      {/* 2. STAFF LIST (No PINs Visible) */}
      <section>
        <h3 className="text-xl font-['Teko'] uppercase text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Active Staff
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map(admin => (
            <div key={admin.id} className="bg-zinc-900/50 p-4 rounded-lg border border-white/10 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{admin.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">{admin.role}</p>
              </div>
              <div className="text-xs text-zinc-600 italic tracking-widest">●●●●●●</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TEAM CODES (Still Visible) */}
      <section>
        <h3 className="text-xl font-['Teko'] uppercase text-blue-500 mb-4 flex items-center gap-2">
          <UsersIcon className="w-5 h-5" /> Team Captain Access
        </h3>
        <div className="bg-zinc-900/50 rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4">Team Name</th>
                <th className="p-4">Login Credential</th>
                <th className="p-4 text-right">Access Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teams.map(team => (
                <tr key={team.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-zinc-200">{team.name}</td>
                  <td className="p-4 text-zinc-500 font-mono text-xs">{(team.name || '').toLowerCase().replace(/\s+/g, '')}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => toggleTeamPin(team.id)} className="inline-flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5 hover:bg-zinc-800">
                      <code className="text-blue-400 font-mono text-xs">{showTeamPins[team.id] ? team.access_code : '••••••'}</code>
                      {showTeamPins[team.id] ? <EyeOff size={12}/> : <Eye size={12}/>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
