import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const AdminRosterReview = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTruth = async () => {
      // Direct SQL fetch - No helpers, no translation layer
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          id, 
          name, 
          region_iso2,
          players (
            id, display_name, role, is_captain, is_substitute, faceit_url, discord_handle
          )
        `)
        .order('name');
      
      if (!error) setData(teams || []);
      setLoading(false);
    };
    fetchTruth();
  }, []);

  if (loading) return <div className="p-8 text-white font-mono">LOADING CORE TRUTH...</div>;

  return (
    <div className="p-8 bg-[#060709] min-h-screen font-mono text-xs">
      <h1 className="text-2xl font-bold text-white mb-6 uppercase flex items-center gap-3">
        <Shield className="text-fuchsia-500" /> Roster Audit Log
      </h1>
      
      <div className="grid gap-6">
        {data.map(team => (
          <div key={team.id} className="bg-[#0b0c0f] border border-zinc-800 p-4 rounded">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
              <h2 className="text-lg font-bold text-white uppercase">{team.name}</h2>
              <span className="text-zinc-500">{team.region_iso2}</span>
            </div>
            
            <table className="w-full text-left text-zinc-400">
              <thead>
                <tr className="uppercase tracking-widest border-b border-zinc-800">
                  <th className="py-2">Role</th>
                  <th>Display Name</th>
                  <th>Discord</th>
                  <th>Faceit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.players?.sort((a,b) => (a.is_captain ? -1 : 1)).map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-white/5">
                    <td className="py-2">
                      {p.is_captain && <span className="text-blue-400 font-bold">CAPTAIN</span>}
                      {p.is_substitute && <span className="text-yellow-500 font-bold">SUB</span>}
                      {!p.is_captain && !p.is_substitute && "PLAYER"}
                    </td>
                    <td className="text-white">{p.display_name}</td>
                    <td>{p.discord_handle || <span className="text-red-900">MISSING</span>}</td>
                    <td>{p.faceit_url ? <CheckCircle className="w-3 h-3 text-emerald-500"/> : <XCircle className="w-3 h-3 text-red-500"/>}</td>
                    <td>
                      {(p.is_captain && p.role !== 'CAPTAIN') ? <ShieldAlert className="w-4 h-4 text-red-500" title="ROLE MISMATCH"/> : "OK"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRosterReview;
