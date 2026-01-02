import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Search, RefreshCw, Shield, Edit3, X, Trash2, Key, Users } from 'lucide-react';
import StatsCard from '../../components/StatsCard'; // ✅ Import the Stats Card

// --- HELPERS ---
const ROLE_WEIGHT = { 'CAPTAIN': 1, 'PLAYER': 2, 'SUBSTITUTE': 3 };
const getRoleWeight = (role) => ROLE_WEIGHT[role?.toUpperCase()] || 99;

const generateAccessCode = (teamName) => {
  const clean = teamName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (clean.substring(0, 3) || 'TEAM').padEnd(3, 'X');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
};

const getRegionFlag = (regionCode) => {
  if (!regionCode) return null;
  const code = regionCode.toUpperCase();
  const maps = { 'PAK': 'pk', 'PK': 'pk', 'IND': 'in', 'IN': 'in', 'IRN': 'ir', 'IR': 'ir', 'UAE': 'ae', 'SA': 'sa', 'UK': 'gb', 'US': 'us' };
  const isoCode = maps[code];
  if (isoCode) return <img src={`https://flagcdn.com/24x18/${isoCode}.png`} alt={code} className="h-3 w-4 object-cover rounded-[2px] opacity-80" />;
  return <span className="text-[9px] font-black bg-zinc-800 text-zinc-400 px-1 rounded border border-zinc-700">{code.substring(0, 2)}</span>;
};

// --- TEAM CARD COMPONENT ---
const TeamCard = ({ team, onEdit }) => (
  <div className="group relative bg-[#0b0c0f] border border-zinc-800 hover:border-zinc-600 flex flex-col h-full transition-all duration-300 rounded-xl overflow-hidden">
    <div className="p-3 bg-zinc-900/50 border-b border-white/5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded border border-zinc-800 flex items-center justify-center p-1">
          {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name} /> : <Shield className="w-5 h-5 text-zinc-700"/>}
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase italic tracking-tighter truncate max-w-[140px]">{team.name}</h3>
          <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono bg-zinc-800 px-1.5 rounded text-zinc-400 border border-zinc-700">{team.access_code || 'NO CODE'}</span>
              {team.seed_number && <span className="text-[10px] text-zinc-500 font-mono">SEED #{team.seed_number}</span>}
              <span className="flex items-center" title={team.region}>{getRegionFlag(team.region)}</span>
          </div>
        </div>
      </div>
      <button onClick={() => onEdit(team)} className="p-2 bg-zinc-900 hover:bg-white/10 text-zinc-500 hover:text-white rounded border border-zinc-800 transition-colors"><Edit3 size={14} /></button>
    </div>
    <div className="p-2 space-y-1">
      {team.members.slice(0, 5).map(m => (
         <div key={m.id} className="flex justify-between items-center px-2 py-1 text-xs text-zinc-400">
            <span className={m.role === 'CAPTAIN' ? 'text-fuchsia-400 font-bold' : ''}>{m.username}</span>
            <span className="text-[9px] uppercase opacity-50">{m.role}</span>
         </div>
      ))}
    </div>
  </div>
);

// --- EDIT MODAL COMPONENT ---
const EditTeamModal = ({ team, onClose, onRefresh }) => {
  const [meta, setMeta] = useState({
    name: team?.name || '', logo_url: team?.logo_url || '', region: team?.region || 'PAK',
    seed_number: team?.seed_number || 0, access_code: team?.access_code || ''
  });
  const [members, setMembers] = useState(
      team?.members.map(m => ({
          username: m.username, role: m.role, discord: m.discord_handle || '', steam: m.steam_url || '', faceit: m.faceit_url || ''
      })) || []
  );
  const [saving, setSaving] = useState(false);
  const isCreate = !team;

  const handleAdd = () => setMembers([...members, { username: 'New Player', role: 'PLAYER', discord: '', steam: '' }]);
  const updateMember = (idx, field, val) => {
      const newMembers = [...members];
      newMembers[idx][field] = val;
      setMembers(newMembers);
  };
  const removeMember = (idx) => setMembers(members.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      // ✅ ATOMIC TRANSACTION via RPC
      const { data, error } = await supabase.rpc('admin_upsert_team', {
          p_team_id: team?.id || null,
          p_name: meta.name,
          p_logo_url: meta.logo_url,
          p_region: meta.region,
          p_seed_number: parseInt(meta.seed_number),
          p_access_code: meta.access_code,
          p_members: members // Sends the whole array at once
      });

      if (error || !data.success) throw new Error(error?.message || data?.message);
      
      onRefresh();
      onClose();
    } catch(e) {
      alert("Save Failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b0c0f] border border-zinc-700 w-full max-w-5xl rounded-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between">
           <h2 className="text-xl font-black text-white uppercase italic">{isCreate ? 'NEW SQUAD' : 'EDIT UNIT'}</h2>
           <button onClick={onClose}><X className="text-zinc-400 hover:text-white" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
           {/* Meta Fields */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold">Team Name</label>
                      <input value={meta.name} onChange={e=>setMeta({...meta, name:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-sm" placeholder="e.g. Navi" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold">Logo URL</label>
                      <input value={meta.logo_url} onChange={e=>setMeta({...meta, logo_url:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-sm" placeholder="https://..." />
                  </div>
              </div>
              <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold">Access Code (Auto-Generated)</label>
                      <input value={meta.access_code} onChange={e=>setMeta({...meta, access_code:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-yellow-500 font-mono rounded text-sm" placeholder="TEAM-1234" />
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-1 flex-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold">Seed #</label>
                        <input value={meta.seed_number} type="number" onChange={e=>setMeta({...meta, seed_number:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-sm" placeholder="0" />
                    </div>
                     <div className="space-y-1 flex-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold">Region</label>
                        <input value={meta.region} onChange={e=>setMeta({...meta, region:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-sm" placeholder="PAK" />
                    </div>
                  </div>
              </div>
           </div>

           {/* Roster Editor */}
           <div className="space-y-2 border-t border-zinc-800 pt-4">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2"><Users size={14}/> Active Roster</h3>
                  <button onClick={handleAdd} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white font-bold uppercase transition-colors">Add Operator</button>
              </div>
              
              {members.map((m, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row gap-2 items-center bg-zinc-900/50 p-3 rounded border border-zinc-800">
                    <div className="flex-1 w-full flex gap-2">
                        <input value={m.username} onChange={e => updateMember(idx, 'username', e.target.value)} className="bg-black border border-zinc-700 p-2 text-white rounded text-xs flex-1" placeholder="Username" />
                        <select value={m.role} onChange={e => updateMember(idx, 'role', e.target.value)} className="bg-black border border-zinc-700 p-2 text-white rounded text-xs uppercase font-bold">
                            <option>CAPTAIN</option><option>PLAYER</option><option>SUBSTITUTE</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full flex gap-2">
                        <input value={m.steam} onChange={e => updateMember(idx, 'steam', e.target.value)} className="bg-black border border-zinc-700 p-2 text-zinc-300 rounded text-xs w-full" placeholder="Steam URL" />
                        <input value={m.discord} onChange={e => updateMember(idx, 'discord', e.target.value)} className="bg-black border border-zinc-700 p-2 text-zinc-300 rounded text-xs w-full" placeholder="Discord ID" />
                    </div>
                    <button onClick={() => removeMember(idx)} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-900/20 rounded"><Trash2 size={14}/></button>
                 </div>
              ))}
           </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-900/50">
           <button onClick={onClose} className="px-4 py-2 text-zinc-400 text-xs font-bold uppercase hover:text-white">Cancel</button>
           <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase rounded shadow-lg transition-all">
              {saving ? 'Processing...' : 'Save Changes'}
           </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN VIEW COMPONENT ---
export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editTeam, setEditTeam] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    // ✅ CRITICAL: Fetches ALL profile fields so the Edit Modal isn't empty
    const { data } = await supabase.from('teams').select(`
        *, 
        team_members(
            id, role, 
            global_identities(display_name, discord_handle, steam_url, faceit_url)
        )
    `).order('name');
    
    if(data) {
        setTeams(data.map(t => ({
            ...t, 
            members: t.team_members.map(tm => ({
                id: tm.id,
                role: tm.role,
                username: tm.global_identities?.display_name,
                discord_handle: tm.global_identities?.discord_handle,
                steam_url: tm.global_identities?.steam_url,
                faceit_url: tm.global_identities?.faceit_url
            })).sort((a,b)=>getRoleWeight(a.role)-getRoleWeight(b.role))
        })));
    }
    setLoading(false);
  };

  const handleGenCodes = async () => {
    if(!window.confirm("Generate codes for teams missing them?")) return;
    setGenerating(true);
    for(const t of teams) {
       if(!t.access_code) await supabase.from('teams').update({ access_code: generateAccessCode(t.name) }).eq('id', t.id);
    }
    await fetchTeams();
    setGenerating(false);
  }

  useEffect(() => { fetchTeams(); }, []);
  
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // ✅ ADDED STATS CALCULATION
  const totalPlayers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const readyTeams = teams.filter(t => t.members.length >= 5).length;

  return (
    <div className="space-y-6 animate-in fade-in">
       {/* ✅ ADDED STATS HEADER */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Teams" value={teams.length} type="teams" />
          <StatsCard title="Active Operators" value={totalPlayers} type="players" />
          <StatsCard title="Combat Ready" value={readyTeams} type="active" />
       </div>

       <div className="flex justify-between items-end border-b border-white/10 pb-4">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">ROSTER <span className="text-fuchsia-500">COMMAND</span></h1>
          <div className="flex items-center gap-3">
             <button onClick={handleGenCodes} disabled={generating} className="px-3 py-2 bg-yellow-600/10 text-yellow-500 border border-yellow-600/30 rounded text-xs font-bold uppercase flex gap-2">{generating ? <RefreshCw className="animate-spin w-3 h-3"/> : <Key size={14}/>} Gen Codes</button>
             <button onClick={() => setEditTeam(null)} className="px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-xs font-bold uppercase">+ New Team</button>
             <button onClick={fetchTeams} className="p-2 bg-zinc-900 border border-zinc-800 text-white rounded"><RefreshCw size={14}/></button>
             <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" /><input type="text" placeholder="FIND UNIT..." className="bg-black border border-zinc-800 text-white pl-9 pr-3 py-2 rounded text-xs font-mono focus:border-fuchsia-500 outline-none w-48" onChange={e => setSearchTerm(e.target.value)}/></div>
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
          {filteredTeams.map(t => <TeamCard key={t.id} team={t} onEdit={setEditTeam} />)}
       </div>
       
       {editTeam !== undefined && (
         <EditTeamModal 
            team={editTeam} 
            onClose={() => setEditTeam(undefined)} 
            onRefresh={fetchTeams} 
         />
       )}
    </div>
  );
};
