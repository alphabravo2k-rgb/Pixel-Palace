import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useTournament } from '../tournament/useTournament'; // ✅ Fixes Scope
import { Shield, ShieldAlert, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const AdminRosterReview = () => {
  const { selectedTournamentId } = useTournament(); // ✅ Context Context Context
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTruth = async () => {
    if (!selectedTournamentId) return;

    setLoading(true);
    // 🛡️ SCOPED FETCH
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
      .eq('tournament_id', selectedTournamentId) // ✅ No global leakage
      .order('name');
    
    if (!error) setData(teams || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTruth();
  }, [selectedTournamentId]);

  if (!selectedTournamentId) return <div className="p-8 text-zinc-500 italic">Select a tournament to audit rosters.</div>;
  if (loading) return <div className="p-8 text-zinc-500 font-mono text-xs animate-pulse">LOADING CORE TRUTH...</div>;

  return (
    <div className="p-8 bg-[#060709] min-h-screen font-mono text-xs">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white uppercase flex items-center gap-3">
          <Shield className="text-fuchsia-500" /> Roster Audit Log
        </h1>
        <button 
          onClick={fetchTruth} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-bold uppercase transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      
      <div className="grid gap-6">
        {data.map(team => (
          <div key={team.id} className="bg-[#0b0c0f] border border-zinc-800 p-4 rounded shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">{team.name}</h2>
              <span className="text-zinc-500 font-bold bg-zinc-900 px-2 py-1 rounded">{team.region_iso2 || 'N/A'}</span>
            </div>
            
            <table className="w-full text-left text-zinc-400">
              <thead>
                <tr className="uppercase tracking-widest border-b border-zinc-800 text-[10px] text-zinc-600">
                  <th className="py-2">Role</th>
                  <th>Display Name</th>
                  <th>Discord</th>
                  <th>Faceit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.players?.sort((a,b) => (a.is_captain ? -1 : 1)).map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                    <td className="py-2">
                      {p.is_captain && <span className="text-blue-400 font-bold bg-blue-900/20 px-1 rounded">CAPTAIN</span>}
                      {p.is_substitute && <span className="text-yellow-500 font-bold bg-yellow-900/20 px-1 rounded">SUB</span>}
                      {!p.is_captain && !p.is_substitute && <span className="text-zinc-600">PLAYER</span>}
                    </td>
                    <td className="text-zinc-300 font-bold">{p.display_name}</td>
                    <td>{p.discord_handle || <span className="text-red-900 font-bold opacity-50">MISSING</span>}</td>
                    <td>{p.faceit_url ? <CheckCircle className="w-3 h-3 text-emerald-500"/> : <XCircle className="w-3 h-3 text-red-900 opacity-50"/>}</td>
                    <td>
                      {(p.is_captain && p.role !== 'CAPTAIN') ? <ShieldAlert className="w-4 h-4 text-red-500" title="ROLE MISMATCH"/> : <span className="text-emerald-900">OK</span>}
                    </td>
                  </tr>
                ))}
                {(!team.players || team.players.length === 0) && (
                   <tr>
                      <td colSpan="5" className="py-4 text-center text-red-900 font-bold uppercase tracking-widest">
                        ⚠️ No Players Registered
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRosterReview;
