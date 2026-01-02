import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Search, RefreshCw, Shield, Crown, Edit3, Save, X, Trash2, Plus, 
  Globe, Hash, Link as LinkIcon, Key, BarChart2 
} from 'lucide-react';

// --- CONFIG ---
const ROLE_WEIGHT = { 'CAPTAIN': 1, 'PLAYER': 2, 'SUBSTITUTE': 3 };
const getRoleWeight = (role) => ROLE_WEIGHT[role?.toUpperCase()] || 99;

// --- ASSETS ---
const getRegionFlag = (regionCode) => {
  if (!regionCode) return null;
  const code = regionCode.toUpperCase();
  const maps = { 'PAK': 'pk', 'PK': 'pk', 'IND': 'in', 'IN': 'in', 'IRN': 'ir', 'IR': 'ir', 'UAE': 'ae', 'SA': 'sa', 'UK': 'gb', 'US': 'us' };
  const isoCode = maps[code];
  if (isoCode) return <img src={`https://flagcdn.com/24x18/${isoCode}.png`} alt={code} className="h-3 w-4 object-cover rounded-[2px] opacity-80" />;
  return <span className="text-[9px] font-black bg-zinc-800 text-zinc-400 px-1 rounded border border-zinc-700">{code.substring(0, 2)}</span>;
};

// Social Icons (SVG)
const Icons = {
  Faceit: ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 2.6l-1.9-.3c-2.9-.4-5.2.3-6.8 1.9-.3.3-.6.6-.9 1L12.9 2h-1L10.3 3.6 2.6 13.9l.6 2.2 1.9.6 1.9-2.6.3-.3.3-.6c1.6-3.2 4.5-4.5 7.4-4.2l3.6.3 3.5-3.6 1.9-3.1zM2.6 21.4l1.9.3c2.9.4 5.2-.3 6.8-1.9.3-.3.6-.6.9-1L13.7 17h1l1.6-1.6 7.7-10.3-.6-2.2-1.9-.6-1.9 2.6-.3.3-.3.6c-1.6 3.2-4.5 4.5-7.4 4.2l-3.6-.3L4.5 13.3 2.6 16.4v5z" /></svg>),
  Steam: ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.979 0C5.66 0 .473 4.904.035 11.12l4.477 6.577 3.32-1.38c.75.526 1.642.85 2.61.88l1.64 4.793c.123.007.245.01.37.01 6.627 0 12-5.373 12-12S19.105 0 11.979 0zm.066 3.99c2.56 0 4.636 2.076 4.636 4.637 0 2.56-2.076 4.637-4.636 4.637-2.56 0-4.637-2.077-4.637-4.637 0-2.56 2.077-4.637 4.637-4.637zm-2.922 8.78c-.76.012-1.48.196-2.12.513l-3.32-1.325c-.29-.115-.595-.195-.913-.23.23-.01.46-.017.693-.017 1.83 0 3.51.64 4.866 1.71-.383-.236-.787-.43-1.206-.59V12.77zm1.87 3.21c-.37-.02-.733-.09-1.08-.205l-1.61 4.707c-.432-.132-.843-.302-1.23-.507l1.71-4.996c.66.425 1.433.682 2.27.682.022 0 .044-.002.066-.002l-.127.32z" /></svg>),
  Discord: ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>)
};

const SocialLink = ({ href, handle, type }) => {
  const Icon = Icons[type];
  if (!href && !handle) return <div className="p-1.5 opacity-10"><Icon className="w-3 h-3 grayscale"/></div>;
  const link = href || (type === 'Discord' ? `https://discord.com/users/${handle}` : '#');
  const colors = type === 'Faceit' ? 'text-[#ff5500]' : type === 'Steam' ? 'text-blue-400' : 'text-[#5865F2]';
  return <a href={link} target="_blank" rel="noreferrer" className={`p-1.5 hover:bg-white/10 rounded transition-all ${colors}`}><Icon className="w-3 h-3"/></a>;
};

// --- TEAM CARD ---
const TeamCard = ({ team, onEdit }) => {
  const playerCount = team.members.length;
  const totalElo = team.members.reduce((acc, curr) => acc + (curr.elo || 1000), 0);
  const avgElo = playerCount > 0 ? Math.round(totalElo / playerCount) : 1000;

  return (
    <div className="group relative bg-[#0b0c0f] border border-zinc-800 hover:border-zinc-600 flex flex-col h-full transition-all duration-300 rounded-xl overflow-hidden">
      <div className="p-3 bg-zinc-900/50 border-b border-white/5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded border border-zinc-800 flex items-center justify-center p-1 relative overflow-hidden">
            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" /> : <Shield className="w-5 h-5 text-zinc-700"/>}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase italic tracking-tighter truncate max-w-[140px]">{team.name}</h3>
            <div className="flex gap-2 text-[9px] font-mono tracking-widest text-zinc-500 items-center mt-0.5">
               <span className="flex items-center" title={team.region}>{getRegionFlag(team.region)}</span>
               <span className="bg-zinc-900 px-1 rounded border border-zinc-800">{team.seed_number ? `#${team.seed_number}` : 'TBD'}</span>
               <span className="text-orange-400 flex items-center gap-1"><BarChart2 size={8}/> {avgElo}</span>
               <span className="text-yellow-500 font-mono pl-1">{team.access_code}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onEdit(team)} className="p-2 bg-zinc-900 hover:bg-white/10 text-zinc-500 hover:text-white rounded border border-zinc-800 transition-colors"><Edit3 size={12} /></button>
      </div>

      <div className="flex-grow bg-zinc-900/10 p-1 space-y-0.5">
        {team.members.slice(0, 5).map((m, idx) => (
           <div key={m.id} className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2.5 overflow-hidden">
                 {m.role === 'CAPTAIN' ? <Crown size={12} className="text-fuchsia-500 shrink-0"/> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0"/>}
                 <div className="flex flex-col truncate">
                    <span className={`text-[11px] font-bold truncate leading-none ${m.role === 'CAPTAIN' ? 'text-white' : 'text-zinc-400'}`}>{m.username}</span>
                    <span className="text-[8px] font-mono text-zinc-600 leading-tight mt-0.5"><span className="text-orange-500/60">{m.elo}</span> ELO</span>
                 </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                 <SocialLink href={m.steam_url} type="Steam"/>
                 <SocialLink href={m.faceit_url} type="Faceit"/>
                 <SocialLink href={null} handle={m.discord} type="Discord"/>
              </div>
           </div>
        ))}
        {team.members.length === 0 && <div className="text-center py-4 text-[10px] text-zinc-600 uppercase">Roster Empty</div>}
      </div>
    </div>
  );
};

// --- EDIT MODAL ---
const EditTeamModal = ({ team, onClose, onRefresh }) => {
  const [meta, setMeta] = useState({
    name: team?.name || '', logo_url: team?.logo_url || '', region: team?.region || 'PAK',
    seed_number: team?.seed_number || 0, discord_channel_url: team?.discord_channel_url || '', access_code: team?.access_code || ''
  });
  const [members, setMembers] = useState(team?.members || []);
  const [saving, setSaving] = useState(false);
  const isCreate = !team;

  const handleAdd = () => setMembers([...members, { id: `temp-${Date.now()}`, isNew: true, role: 'PLAYER', username: 'New Player', elo: 1000 }]);
  const updateMember = (id, f, v) => setMembers(prev => prev.map(m => m.id === id ? { ...m, [f]: v } : m));

  const handleDelete = async (id, isNew) => {
    if (isNew) { setMembers(prev => prev.filter(m => m.id !== id)); return; }
    if(!window.confirm("Remove?")) return;
    try { await supabase.from('team_members').delete().eq('id', id); setMembers(prev => prev.filter(m => m.id !== id)); } catch(e) {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let teamId = team?.id;
      const payload = { ...meta, tournament_id: team?.tournament_id }; 
      if (isCreate) {
         const { data, error } = await supabase.from('teams').insert(payload).select('id').single();
         if(error) throw error; teamId = data.id;
      } else {
         await supabase.from('teams').update(payload).eq('id', teamId);
      }
      for (const m of members) {
        const idPayload = { display_name: m.username, steam_url: m.steam_url, faceit_url: m.faceit_url, discord_handle: m.discord, faceit_elo: m.elo };
        if (m.isNew) {
            const { data: idData } = await supabase.from('global_identities').insert(idPayload).select('id').single();
            await supabase.from('team_members').insert({ team_id: teamId, global_id: idData.id, role: m.role });
        } else {
            await supabase.from('team_members').update({ role: m.role }).eq('id', m.id);
            await supabase.from('global_identities').update(idPayload).eq('id', m.global_id);
        }
      }
      onRefresh(); onClose();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0b0c0f] border border-zinc-700 w-full max-w-6xl rounded-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex justify-between"><h2 className="text-white font-black">{isCreate ? 'NEW TEAM' : 'EDIT TEAM'}</h2><button onClick={onClose}><X className="text-white"/></button></div>
        <div className="p-6 overflow-y-auto space-y-6">
           <div className="grid grid-cols-2 gap-4">
               <input value={meta.name} onChange={e=>setMeta({...meta, name:e.target.value})} className="bg-black border border-zinc-700 p-2 text-white text-sm" placeholder="Team Name"/>
               <input value={meta.logo_url} onChange={e=>setMeta({...meta, logo_url:e.target.value})} className="bg-black border border-zinc-700 p-2 text-white text-sm" placeholder="Logo URL"/>
               <input value={meta.access_code} onChange={e=>setMeta({...meta, access_code:e.target.value})} className="bg-black border border-zinc-700 p-2 text-yellow-500 font-mono text-sm" placeholder="Access Code"/>
               <input value={meta.seed_number} type="number" onChange={e=>setMeta({...meta, seed_number:e.target.value})} className="bg-black border border-zinc-700 p-2 text-white text-sm" placeholder="Seed Rank"/>
           </div>
           <div className="space-y-2">
               <div className="flex justify-between text-white font-bold text-xs uppercase"><span>Roster</span><button onClick={handleAdd} className="bg-blue-600 px-2 rounded">Add</button></div>
               {members.map(m => (
                   <div key={m.id} className="grid grid-cols-12 gap-2">
                       <input value={m.username} onChange={e=>updateMember(m.id,'username',e.target.value)} className="col-span-3 bg-black border border-zinc-700 text-white text-xs p-1" placeholder="Name"/>
                       <select value={m.role} onChange={e=>updateMember(m.id,'role',e.target.value)} className="col-span-2 bg-black border border-zinc-700 text-white text-xs p-1"><option>CAPTAIN</option><option>PLAYER</option></select>
                       <input value={m.elo} onChange={e=>updateMember(m.id,'elo',e.target.value)} className="col-span-1 bg-black border border-zinc-700 text-white text-xs p-1" placeholder="ELO"/>
                       <input value={m.steam_url} onChange={e=>updateMember(m.id,'steam_url',e.target.value)} className="col-span-2 bg-black border border-zinc-700 text-white text-xs p-1" placeholder="Steam"/>
                       <input value={m.faceit_url} onChange={e=>updateMember(m.id,'faceit_url',e.target.value)} className="col-span-2 bg-black border border-zinc-700 text-white text-xs p-1" placeholder="Faceit"/>
                       <button onClick={()=>handleDelete(m.id, m.isNew)} className="col-span-1 text-red-500"><Trash2 size={12}/></button>
                   </div>
               ))}
           </div>
        </div>
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-white text-black text-xs font-bold uppercase">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [editTeam, setEditTeam] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select(`*, team_members(id, role, global_identities(*))`).order('name');
    if(data) setTeams(data.map(t => ({...t, members: t.team_members.map(tm => ({...tm, ...tm.global_identities, username: tm.global_identities?.display_name})).sort((a,b)=>getRoleWeight(a.role)-getRoleWeight(b.role))})));
  };

  useEffect(() => { fetchTeams(); }, []);
  
  const generateCodes = async () => {
     if(!confirm("Overwrite codes?")) return;
     setGenerating(true);
     for(const t of teams) {
         if(!t.access_code) {
             const code = t.name.substring(0,3).toUpperCase().padEnd(3,'X') + '-' + Math.floor(1000 + Math.random()*9000);
             await supabase.from('teams').update({ access_code: code }).eq('id', t.id);
         }
     }
     await fetchTeams();
     setGenerating(false);
  };

  const filtered = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-end border-b border-white/10 pb-4">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">ROSTER <span className="text-fuchsia-500">COMMAND</span></h1>
          <div className="flex gap-2">
             <button onClick={generateCodes} disabled={generating} className="px-3 py-2 bg-yellow-600/10 text-yellow-500 border border-yellow-600/30 rounded text-xs font-bold uppercase flex gap-2">{generating ? <RefreshCw className="animate-spin w-3 h-3"/> : <Key size={14}/>} Codes</button>
             <button onClick={fetchTeams} className="p-2 bg-zinc-900 border border-zinc-800 text-white rounded"><RefreshCw size={14}/></button>
             <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" /><input type="text" placeholder="FIND..." className="bg-black border border-zinc-800 text-white pl-9 pr-3 py-2 rounded text-xs font-mono focus:border-fuchsia-500 outline-none w-48" onChange={e => setSearchTerm(e.target.value)}/></div>
          </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
          {filtered.map(t => <TeamCard key={t.id} team={t} onEdit={setEditTeam} />)}
       </div>
       {editTeam !== undefined && <EditTeamModal team={Object.keys(editTeam).length ? editTeam : null} onClose={()=>setEditTeam(undefined)} onRefresh={fetchTeams} />}
    </div>
  );
};
