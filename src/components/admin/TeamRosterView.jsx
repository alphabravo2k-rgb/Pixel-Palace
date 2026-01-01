import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Search, RefreshCw, Shield, Crown, 
  Edit3, Save, X, Trash2, Plus, Globe, Hash, 
  MessageCircle, BarChart2, AlertTriangle, Link as LinkIcon, Key
} from 'lucide-react';

// --- CONFIGURATION ---
const ROLE_WEIGHT = { 'CAPTAIN': 1, 'PLAYER': 2, 'SUBSTITUTE': 3 };
const getRoleWeight = (role) => ROLE_WEIGHT[role?.toUpperCase()] || 99;

const generateAccessCode = (teamName) => {
  const cleanName = teamName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (cleanName.substring(0, 3) || 'TEAM').padEnd(3, 'X');
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${numbers}`;
};

// --- COMPONENTS ---
const getRegionFlag = (regionCode) => {
  if (!regionCode) return null;
  const code = regionCode.toUpperCase();
  const maps = { 'PAK': 'pk', 'PK': 'pk', 'IND': 'in', 'IN': 'in', 'IRN': 'ir', 'IR': 'ir', 'UAE': 'ae', 'SA': 'sa', 'UK': 'gb', 'US': 'us' };
  const isoCode = maps[code];
  if (isoCode) return <img src={`https://flagcdn.com/24x18/${isoCode}.png`} alt={code} className="h-3 w-4 object-cover rounded-[2px] opacity-80" />;
  return <span className="text-[9px] font-black bg-zinc-800 text-zinc-400 px-1 rounded border border-zinc-700">{code.substring(0, 2)}</span>;
};

const TeamCard = ({ team, onEdit }) => {
  const playerCount = team.members.length;
  
  return (
    <div className="group relative bg-[#0b0c0f] border border-zinc-800 hover:border-zinc-600 flex flex-col h-full transition-all duration-300 rounded-xl overflow-hidden">
      <div className="p-3 bg-zinc-900/50 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded border border-zinc-800 flex items-center justify-center p-1">
            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name}/> : <Shield className="w-5 h-5 text-zinc-700"/>}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase italic tracking-tighter truncate max-w-[140px]">{team.name}</h3>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono bg-zinc-800 px-1.5 rounded text-zinc-400 border border-zinc-700">
                   {team.access_code || 'NO CODE'}
                </span>
                {team.seed_number && <span className="text-[10px] text-zinc-500 font-mono">SEED #{team.seed_number}</span>}
                <span className="flex items-center" title={team.region}>{getRegionFlag(team.region)}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onEdit(team)} className="p-2 bg-zinc-900 hover:bg-white/10 text-zinc-500 hover:text-white rounded border border-zinc-800 transition-colors">
            <Edit3 size={14} />
        </button>
      </div>

      <div className="p-2 space-y-1">
        {team.members.slice(0, 5).map(m => (
           <div key={m.id} className="flex justify-between items-center px-2 py-1 text-xs text-zinc-400">
              <span className={m.role === 'CAPTAIN' ? 'text-fuchsia-400 font-bold' : ''}>{m.username}</span>
              <span className="text-[9px] uppercase opacity-50">{m.role}</span>
           </div>
        ))}
        {team.members.length === 0 && <div className="text-center py-4 text-[10px] text-zinc-600 uppercase">Roster Empty</div>}
      </div>
    </div>
  );
};

// --- EDIT MODAL (Defined inside same file) ---
const EditTeamModal = ({ team, onClose, onRefresh, tournamentId }) => {
  const [meta, setMeta] = useState({
    name: team?.name || '',
    logo_url: team?.logo_url || '',
    region: team?.region || 'PAK',
    seed_number: team?.seed_number || 0,
    discord_channel_url: team?.discord_channel_url || '',
    access_code: team?.access_code || '' 
  });

  const [members, setMembers] = useState(team?.members || []);
  const [saving, setSaving] = useState(false);
  const isCreateMode = !team;

  const handleAddPlayer = () => {
    setMembers(prev => [...prev, {
        id: `temp-${Date.now()}`, isNew: true,
        role: 'PLAYER', username: 'New Operator',
        steam_url: '', faceit_url: '', discord: '', elo: 1000
    }]);
  };

  const updateMember = (id, field, value) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleDeleteMember = async (memberId, isNew) => {
    if (isNew) { setMembers(prev => prev.filter(m => m.id !== memberId)); return; }
    if(!window.confirm("Remove this player?")) return;
    try { await supabase.from('team_members').delete().eq('id', memberId); setMembers(prev => prev.filter(m => m.id !== memberId)); } catch (err) { alert("Failed to delete"); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let teamId = team?.id;
      const teamData = { 
          tournament_id: tournamentId, 
          name: meta.name, 
          logo_url: meta.logo_url, 
          region: meta.region, 
          seed_number: meta.seed_number,
          discord_channel_url: meta.discord_channel_url,
          access_code: meta.access_code 
      };

      if (isCreateMode) {
        const { data, error } = await supabase.from('teams').insert(teamData).select('id').single();
        if (error) throw error;
        teamId = data.id;
      } else {
        const { error } = await supabase.from('teams').update(teamData).eq('id', teamId);
        if (error) throw error;
      }

      for (const m of members) {
        const identityPayload = {
            display_name: m.username, 
            steam_url: m.steam_url || null,
            faceit_url: m.faceit_url || null, 
            discord_handle: m.discord || null, 
            faceit_elo: parseInt(m.elo) || 1000
        };

        if (m.isNew) {
            const { data: idData, error: idErr } = await supabase.from('global_identities').insert(identityPayload).select('id').single();
            if (idErr) throw idErr;
            const { error: linkErr } = await supabase.from('team_members').insert({ team_id: teamId, global_id: idData.id, role: m.role });
            if (linkErr) throw linkErr;
        } else {
            await supabase.from('team_members').update({ role: m.role }).eq('id', m.id);
            await supabase.from('global_identities').update(identityPayload).eq('id', m.global_id);
        }
      }
      onRefresh(); onClose();
    } catch (err) { 
        alert("Error saving: " + err.message); 
    } finally { 
        setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0b0c0f] border border-zinc-700 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{isCreateMode ? 'ESTABLISH NEW SQUAD' : 'EDIT UNIT DATA'}</h2>
                <p className="text-xs text-zinc-500 font-mono">DATABASE WRITE ACCESS GRANTED</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400"><X size={20}/></button>
          </div>

          <div className="grid grid-cols-12 gap-6">
             <div className="col-span-12 md:col-span-2 flex items-center justify-center">
                <div className="w-24 h-24 bg-black rounded-lg border border-zinc-700 flex items-center justify-center overflow-hidden">
                    {meta.logo_url ? <img src={meta.logo_url} className="w-full h-full object-contain p-2"/> : <Shield className="text-zinc-700 w-10 h-10"/>}
                </div>
             </div>
             <div className="col-span-12 md:col-span-10 grid grid-cols-2 gap-4">
                <div className="col-span-1">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Squad Name</label>
                   <input type="text" value={meta.name} onChange={e => setMeta({...meta, name: e.target.value})} className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-fuchsia-500 outline-none"/>
                </div>
                <div className="col-span-1">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Access Code</label>
                   <input type="text" value={meta.access_code} onChange={e => setMeta({...meta, access_code: e.target.value})} className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-yellow-500 font-mono focus:border-yellow-500 outline-none"/>
                </div>
                {/* ... other inputs ... */}
             </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#0b0c0f]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
             <h3 className="text-xs font-bold text-white uppercase tracking-widest">Active Roster</h3>
             <button onClick={handleAddPlayer} className="flex items-center gap-2 px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-[10px] font-bold uppercase transition-all"><Plus size={12}/> Add Operator</button>
          </div>
          <div className="space-y-2">
            {members.map(m => (
               <div key={m.id} className="grid grid-cols-12 gap-3 items-end p-3 rounded border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700">
               <div className="col-span-3">
                   <input type="text" value={m.username} onChange={(e) => updateMember(m.id, 'username', e.target.value)} className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-fuchsia-500 outline-none font-bold"/>
               </div>
               <div className="col-span-2">
                   <select value={m.role} onChange={(e) => updateMember(m.id, 'role', e.target.value)} className="w-full text-[10px] font-bold px-2 py-2 rounded border outline-none bg-zinc-950 text-zinc-300 border-zinc-700 focus:border-fuchsia-500">
                   <option value="CAPTAIN">CAPTAIN</option>
                   <option value="PLAYER">PLAYER</option>
                   <option value="SUBSTITUTE">SUBSTITUTE</option>
                   </select>
               </div>
               <div className="col-span-1 flex justify-end pb-1">
                   <button onClick={() => handleDeleteMember(m.id, m.isNew)} className="p-1.5 bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"><Trash2 size={14} /></button>
               </div>
               </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-end gap-3">
           <button onClick={onClose} className="px-6 py-2 text-xs font-bold uppercase text-zinc-400 hover:text-white transition-colors">Cancel</button>
           <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded transition-all disabled:opacity-50">
               {saving ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
               {saving ? 'Saving...' : 'Save Unit'}
           </button>
        </div>
      </div>
    </div>
  );
};

export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeam, setEditingTeam] = useState(undefined);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('teams')
        .select(`id, name, logo_url, access_code, seed_number, region, discord_channel_url, team_members (id, role, global_identities (display_name, discord_handle, steam_url, faceit_url, faceit_elo))`)
        .order('name', { ascending: true });

      if (error) throw error;
      const formatted = data.map(team => ({
        ...team,
        members: team.team_members.map(tm => ({
          id: tm.id,
          global_id: tm.global_identities?.id,
          role: tm.role?.toUpperCase(),
          username: tm.global_identities?.display_name || 'Unknown',
          discord: tm.global_identities?.discord_handle,
          steam_url: tm.global_identities?.steam_url,
          faceit_url: tm.global_identities?.faceit_url,
          elo: tm.global_identities?.faceit_elo || 1000
        })).sort((a, b) => getRoleWeight(a.role) - getRoleWeight(b.role))
      }));
      setTeams(formatted);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleGenerateCodes = async () => {
    if(!window.confirm("Overwrite access codes for all teams missing them?")) return;
    setGenerating(true);
    let updatedCount = 0;
    for (const team of teams) {
        if (!team.access_code) {
            const newCode = generateAccessCode(team.name);
            await supabase.from('teams').update({ access_code: newCode }).eq('id', team.id);
            updatedCount++;
        }
    }
    alert(`Generated credentials for ${updatedCount} teams.`);
    fetchTeams();
    setGenerating(false);
  };

  useEffect(() => { fetchTeams(); }, []);
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
         <div><h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">ROSTER <span className="text-fuchsia-500">COMMAND</span></h1></div>
         <div className="flex items-center gap-3">
             <button onClick={handleGenerateCodes} disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 rounded text-xs font-bold uppercase transition-all">
                {generating ? <RefreshCw className="animate-spin w-4 h-4"/> : <Key size={14}/>}
                {generating ? "Generating..." : "Generate Codes"}
             </button>
             <button onClick={fetchTeams} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 text-zinc-400 hover:text-white"><RefreshCw size={16}/></button>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" /><input type="text" placeholder="FIND UNIT..." className="bg-black border border-zinc-800 text-white pl-9 pr-3 py-2 rounded text-xs font-mono focus:border-fuchsia-500 outline-none w-48" onChange={e => setSearchTerm(e.target.value)}/></div>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-12">
        {filteredTeams.map(team => (<TeamCard key={team.id} team={team} onEdit={setEditingTeam} />))}
      </div>
      {editingTeam !== undefined && <EditTeamModal team={Object.keys(editingTeam).length === 0 ? null : editingTeam} onClose={() => setEditingTeam(undefined)} onRefresh={fetchTeams} tournamentId={null} />}
    </div>
  );
};
