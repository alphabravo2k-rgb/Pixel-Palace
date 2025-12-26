import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { Shield, Key, Users as UsersIcon, Eye, EyeOff } from 'lucide-react';

export const StaffManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showPins, setShowPins] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: adminData } = await supabase.from('app_admins').select('*');
    const { data: teamData } = await supabase.from('teams').select('id, name, access_code');
    setAdmins(adminData || []);
    setTeams(teamData || []);
  };

  const togglePin = (id) => {
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      {/* ADMIN SECTION */}
      <section>
        <h3 className="text-xl font-['Teko'] uppercase text-fuchsia-500 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Executive Staff
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map(admin => (
            <div key={admin.id} className="bg-zinc-900 p-4 rounded border border-white/10 flex justify-between items-center">
              <div>
                <p className="font-bold">{admin.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">{admin.role}</p>
              </div>
              <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded border border-white/5">
                <code className="text-fuchsia-400 font-mono">
                  {showPins[admin.id] ? admin.pin_code : '••••••'}
                </code>
                <button onClick={() => togglePin(admin.id)} className="text-zinc-500 hover:text-white">
                  {showPins[admin.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAMS SECTION */}
      <section>
        <h3 className="text-xl font-['Teko'] uppercase text-blue-500 mb-4 flex items-center gap-2">
          <UsersIcon className="w-5 h-5" /> Team Captain Access
        </h3>
        <div className="bg-zinc-900 rounded border border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Team Name</th>
                <th className="p-4">Login (Discord ID)</th>
                <th className="p-4 text-right">Access Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teams.map(team => (
                <tr key={team.id} className="hover:bg-white/5">
                  <td className="p-4 font-bold">{team.name}</td>
                  <td className="p-4 text-zinc-500 font-mono">{team.name.toLowerCase().replace(/\s/g, '')}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2 bg-black/40 px-2 py-1 rounded">
                       <code className="text-blue-400 font-mono">
                        {showPins[team.id] ? team.access_code : '••••••'}
                       </code>
                       <button onClick={() => togglePin(team.id)} className="text-zinc-600">
                        {showPins[team.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                       </button>
                    </div>
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
