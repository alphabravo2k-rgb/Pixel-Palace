import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Search, RefreshCw, Shield, Crown, 
  Edit3, Save, X, Trash2, Plus, Globe, Hash, 
  MessageCircle, BarChart2, Check, ExternalLink, AlertCircle, AlertTriangle
} from 'lucide-react';

// --- CONFIGURATION ---
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

const Icons = {
  Faceit: ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 2.6l-1.9-.3c-2.9-.4-5.2.3-6.8 1.9-.3.3-.6.6-.9 1L12.9 2h-1L10.3 3.6 2.6 13.9l.6 2.2 1.9.6 1.9-2.6.3-.3.3-.6c1.6-3.2 4.5-4.5 7.4-4.2l3.6.3 3.5-3.6 1.9-3.1zM2.6 21.4l1.9.3c2.9.4 5.2-.3 6.8-1.9.3-.3.6-.6.9-1L13.7 17h1l1.6-1.6 7.7-10.3-.6-2.2-1.9-.6-1.9 2.6-.3.3-.3.6c-1.6 3.2-4.5 4.5-7.4 4.2l-3.6-.3L4.5 13.3 2.6 16.4v5z" /></svg>),
  Steam: ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.979 0C5.66 0 .473 4.904.035 11.12l4.477 6.577 3.32-1.38c.75.526 1.642.85 2.61.88l1.64 4.793c.123.007.245.01.37.01 6.627 0 12-5.373 12-12S19.105 0 11.979 0zm.066 3.99c2.56 0 4.636 2.076 4.636 4.637 0 2.56-2.076 4.637-4.636 4.637-2.56 0-4.637-2.077-4.637-4.637 0-2.56 2.077-4.637 4.637-4.637zm-2.922 8.78c-.76.012-1.48.196-2.12.513l-3.32-1.325c-.29-.115-.595-.195-.913-.23.23-.01.46-.017.693-.017 1.83 0 3.51.64 4.866 1.71-.383-.236-.787-.43-1.206-.59V12.77zm1.87 3.21c-.37-.02-.733-.09-1.08-.205l-1.61 4.707c-.432-.132-.843-.302-1.23-.507l1.71-4.996c.66.425 1.433.682 2.27.682.022 0 .044-.002.066-.002l-.127.32z"/></svg>),
  Discord: ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>)
};

// --- SOCIAL LINK COMPONENT (UPDATED: ALWAYS LINK, NO COPY) ---
const SocialLink = ({ href, handle, type }) => {
  const Icon = Icons[type];
  
  // Construct URL
  let targetUrl = href;
  
  if (type === 'Discord' && !targetUrl && handle) {
      // If we only have a handle, assume it's an ID or try to link to it
      // Note: connecting to "bravo.gg" directly is tricky without an ID, but we will try the standard format
      targetUrl = `https://discord.com/users/${handle}`;
  }

  if (!targetUrl) {
    return (
        <div className="p-1.5 opacity-10 cursor-not-allowed" title={`${type} Not Linked`}>
            <Icon className="w-3 h-3 grayscale" />
        </div>
    );
  }

  const colors = type === 'Faceit' ? 'text-[#ff5500] hover:bg-[#ff5500]/10 hover:border-[#ff5500]/30' : type === 'Steam' ? 'text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/30' : 'text-[#5865F2] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/30';

  return (
    <a 
        href={targetUrl} 
        target="_blank" 
        rel="noreferrer" 
        className={`p-1.5 rounded border border-transparent transition-all ${colors} group relative`}
        onClick={(e) => e.stopPropagation()}
        title={`Open ${type} Profile`}
    >
      <Icon className="w-3 h-3" />
    </a>
  );
};

// --- TEAM CARD (VIEW MODE) ---
const TeamCard = ({ team, onEdit }) => {
  const playerCount = team.members.length;
  const totalElo = team.members.reduce((acc, curr) => acc + (curr.elo || 1000), 0);
  const avgElo = playerCount > 0 ? Math.round(totalElo / playerCount) : 1000;

  let statusColor = "border-zinc-800 hover:border-zinc-600";
  let statusBadge = <span className="text-zinc-600">READY</span>;
  
  if (playerCount < 5) {
      statusColor = "border-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.1)]";
      statusBadge = <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={8}/> INCOMPLETE</span>;
  } else if (playerCount > 6) {
      statusColor = "border-yellow-600/50";
      statusBadge = <span className="text-yellow-500 font-bold">OVER LIMIT</span>;
  }

  return (
    <div className={`group relative bg-[#0b0c0f] border ${statusColor} flex flex-col h-full overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-zinc-900 to-black border-b border-white/5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded border border-zinc-800 flex items-center justify-center p-1 relative overflow-hidden shadow-inner">
            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name}/> : <Shield className="w-5 h-5 text-zinc-700"/>}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase italic tracking-tighter truncate max-w-[140px] leading-tight">{team.name}</h3>
            <div className="flex gap-2 text-[9px] font-mono tracking-widest text-zinc-500 items-center mt-0.5">
               <span className="flex items-center" title={team.region}>{getRegionFlag(team.region)}</span>
               <span className="bg-zinc-900 px-1 rounded border border-zinc-800">{team.seed_number ? `#${team.seed_number}` : 'TBD'}</span>
               <span className="text-orange-400 flex items-center gap-1"><BarChart2 size={8}/> {avgElo}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(team)} className="p-2 bg-zinc-900 hover:bg-fuchsia-600 text-zinc-500 hover:text-white rounded transition-colors border border-zinc-800" title="Edit Roster"><Edit3 size={12} /></button>
        </div>
      </div>

      {/* Roster List */}
      <div className="flex-grow bg-zinc-900/10 p-1 space-y-0.5">
        {team.members.slice(0, 7).map((m, idx) => {
           const isCap = m.role === 'CAPTAIN';
           const isSub = m.role === 'SUBSTITUTE' || (idx >= 5 && !isCap);
           return (
             <div key={m.id} className={`flex items-center justify-between px-3 py-1.5 rounded hover:bg-white/5 transition-colors ${isSub ? 'opacity-60' : ''}`}>
               <div className="flex items-center gap-2.5 overflow-hidden">
                 {isCap ? <Crown size={12} className="text-fuchsia-500 shrink-0"/> : <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSub ? 'bg-yellow-500' : 'bg-zinc-600'}`}/>}
                 <div className="flex flex-col truncate">
                    <span className={`text-[11px] font-bold truncate leading-none ${isCap ? 'text-white' : 'text-zinc-400'}`}>{m.username}</span>
                    <span className="text-[8px] font-mono text-zinc-600 leading-tight mt-0.5 flex items-center gap-1">
                        <span className="text-orange-500/60">{m.elo}</span> ELO
                    </span>
                 </div>
               </div>
               
               {/* Socials */}
               <div className="flex gap-0.5 shrink-0">
                 <SocialLink href={m.steam_url} type="Steam"/>
                 <SocialLink href={m.faceit_url} type="Faceit"/>
                 {/* Updated: Uses discord_handle or discord_id to form link */}
                 <SocialLink href={null} handle={m.discord_id || m.discord} type="Discord"/>
               </div>
             </div>
           );
        })}
      </div>
      
      {/* Footer: Team Comms or Status */}
      {team.discord_channel_url ? (
        <a href={team.discord_channel_url} target="_blank" rel="noreferrer" className="block w-full py-2 bg-[#5865F2]/5 hover:bg-[#5865F2] border-t border-[#5865F2]/20 text-[#5865F2] hover:text-white text-[9px] font-bold uppercase tracking-[0.2em] text-center transition-all flex items-center justify-center gap-2 group/btn">
           <MessageCircle size={12} className="group-hover/btn:animate-pulse"/> TEAM COMMS
        </a>
      ) : (
        <div className={`px-2 py-2 text-[9px] font-mono text-center uppercase font-bold border-t border-white/5 bg-zinc-950/50 ${playerCount < 5 ? 'text-red-500' : 'text-zinc-600'}`}>
           {playerCount} / 6 OPERATORS — {statusBadge}
        </div>
      )}
    </div>
  );
};

// --- EDIT MODAL (ADMIN) ---
const EditTeamModal = ({ team, onClose, onRefresh, tournamentId }) => {
  const [meta, setMeta] = useState({
    name: team?.name || '',
    logo_url: team?.logo_url || '',
    region: team?.region || 'PAK',
    seed_number: team?.seed_number || 0,
    discord_channel_url: team?.discord_channel_url || ''
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
          discord_channel_url: meta.discord_channel_url // Ensure this saves!
      };

      if (isCreateMode) {
        const { data, error } = await supabase.from('teams').insert(teamData).select('id').single();
        if (error) throw error;
        teamId = data.id;
      } else {
        await supabase.from('teams').update(teamData).eq('id', teamId);
      }

      for (const m of members) {
        const identityPayload = {
            display_name: m.username, 
            steam_url: m.steam_url || null,
            faceit_url: m.faceit_url || null, 
            discord_handle: m.discord || null, // Stores handle/ID
            faceit_elo: parseInt(m.elo) || 1000
        };
        if (m.isNew) {
            const { data: idData } = await supabase.from('global_identities').insert(identityPayload).select('id').single();
            await supabase.from('team_members').insert({ team_id: teamId, global_id: idData.id, role: m.role });
        } else {
            await supabase.from('team_members').update({ role: m.role }).eq('id', m.id);
            await supabase.from('global_identities').update(identityPayload).eq('id', m.global_id);
        }
      }
      onRefresh(); onClose();
    } catch (err) { alert("Error: " + err.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0b0c0f] border border-zinc-700 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
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
                   <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Logo URL</label>
                   <input type="text" value={meta.logo_url} onChange={e => setMeta({...meta, logo_url: e.target.value})} className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:border-fuchsia-500 outline-none"/>
                </div>
                <div className="col-span-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 block mb-1"><MessageCircle size={10}/> Team Discord Invite</label>
                   <input type="text" value={meta.discord_channel_url} onChange={e => setMeta({...meta, discord_channel_url: e.target.value})} placeholder="https://discord.gg/..." className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-[#5865F2] focus:border-[#5865F2] outline-none font-mono"/>
                </div>
                <div className="col-span-1">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 block mb-1"><Globe size={10}/> Region (ISO)</label>
                   <input type="text" value={meta.region} onChange={e => setMeta({...meta, region: e.target.value})} className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-fuchsia-500 outline-none" placeholder="PAK, IND, ME"/>
                </div>
                <div className="col-span-1">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 block mb-1"><Hash size={10}/> Seed Rank</label>
                   <input type="number" value={meta.seed_number} onChange={e => setMeta({...meta, seed_number: parseInt(e.target.value)})} className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-fuchsia-500 outline-none"/>
                </div>
             </div>
          </div>
        </div>

        {/* ROSTER EDITOR */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#0b0c0f]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
             <h3 className="text-xs font-bold text-white uppercase tracking-widest">Active Roster</h3>
             <button onClick={handleAddPlayer} className="flex items-center gap-2 px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-[10px] font-bold uppercase transition-all"><Plus size={12}/> Add Operator</button>
          </div>
          
          <div className="space-y-2">
            {members.sort((a,b) => getRoleWeight(a.role) - getRoleWeight(b.role)).map(m => (
                <div key={m.id} className={`grid grid-cols-12 gap-3 items-end p-3 rounded border transition-colors ${m.isNew ? 'bg-fuchsia-900/10 border-fuchsia-500/30' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}>
                <div className="col-span-3">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Display Name</label>
                    <input type="text" value={m.username} onChange={(e) => updateMember(m.id, 'username', e.target.value)} className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-fuchsia-500 outline-none font-bold"/>
                </div>
                <div className="col-span-2">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Role</label>
                    <select value={m.role} onChange={(e) => updateMember(m.id, 'role', e.target.value)} className="w-full text-[10px] font-bold px-2 py-2 rounded border outline-none bg-zinc-950 text-zinc-300 border-zinc-700 focus:border-fuchsia-500">
                    <option value="CAPTAIN">CAPTAIN</option>
                    <option value="PLAYER">PLAYER</option>
                    <option value="SUBSTITUTE">SUBSTITUTE</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">ELO</label>
                    <input type="number" value={m.elo} onChange={(e) => updateMember(m.id, 'elo', e.target.value)} className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-orange-400 font-mono focus:border-orange-500 outline-none text-center"/>
                </div>
                <div className="col-span-5 grid grid-cols-3 gap-2">
                    <div>
                    <label className="text-[8px] text-zinc-600 font-bold uppercase block mb-1 flex items-center gap-1"><Icons.Steam className="w-2 h-2"/> Steam</label>
                    <input type="text" value={m.steam_url || ''} onChange={(e) => updateMember(m.id, 'steam_url', e.target.value)} className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-[10px] text-zinc-300 focus:border-blue-500 outline-none truncate"/>
                    </div>
                    <div>
                    <label className="text-[8px] text-zinc-600 font-bold uppercase block mb-1 flex items-center gap-1"><Icons.Faceit className="w-2 h-2"/> Faceit</label>
                    <input type="text" value={m.faceit_url || ''} onChange={(e) => updateMember(m.id, 'faceit_url', e.target.value)} className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-[10px] text-zinc-300 focus:border-[#ff5500] outline-none truncate"/>
                    </div>
                    <div>
                    <label className="text-[8px] text-zinc-600 font-bold uppercase block mb-1 flex items-center gap-1"><Icons.Discord className="w-2 h-2"/> Discord ID/Handle</label>
                    <input type="text" value={m.discord || ''} onChange={(e) => updateMember(m.id, 'discord', e.target.value)} className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-[10px] text-zinc-300 focus:border-[#5865F2] outline-none truncate"/>
                    </div>
                </div>
                <div className="col-span-1 flex justify-end pb-1">
                    <button onClick={() => handleDeleteMember(m.id, m.isNew)} className="p-1.5 bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"><Trash2 size={14} /></button>
                </div>
                </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
             <AlertCircle size={12}/> Changes reflect immediately on the Tournament Bracket.
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 text-xs font-bold uppercase text-zinc-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {saving ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
                {saving ? 'Saving...' : 'Save Unit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [tournamentId, setTournamentId] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data: tData } = await supabase.from('tournaments').select('id').limit(1).single();
      if(tData) setTournamentId(tData.id);

      const { data, error } = await supabase.from('teams')
        .select(`
          id, name, logo_url, region, seed_number, discord_channel_url,
          team_members (
            id, role, 
            global_identities (id, display_name, discord_handle, steam_url, faceit_url, faceit_elo, discord_id)
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      
      const formatted = data.map(team => ({
        ...team,
        members: team.team_members.map(tm => ({
          id: tm.id,
          global_id: tm.global_identities?.id,
          role: tm.role?.toUpperCase() || 'PLAYER',
          username: tm.global_identities?.display_name || 'Unknown',
          discord: tm.global_identities?.discord_handle,
          discord_id: tm.global_identities?.discord_id, 
          steam_url: tm.global_identities?.steam_url,
          faceit_url: tm.global_identities?.faceit_url,
          elo: tm.global_identities?.faceit_elo || 1000
        })).sort((a, b) => getRoleWeight(a.role) - getRoleWeight(b.role))
      }));
      setTeams(formatted);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTeams(); }, []);
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
         <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">ROSTER <span className="text-fuchsia-500">COMMAND</span></h1>
            <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {teams.length} UNITS ACTIVE
                </span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    DATABASE: ONLINE
                </span>
            </div>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
             <button onClick={fetchTeams} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase transition-all whitespace-nowrap">
                <RefreshCw size={12} className={loading ? "animate-spin" : ""}/> Sync DB
             </button>
             <button onClick={() => setEditingTeam({})} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-xs font-bold uppercase transition-all shadow-[0_0_15px_rgba(192,38,211,0.3)] whitespace-nowrap">
               <Plus size={14}/> Add Squad
             </button>
            <div className="relative w-full md:w-auto">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
               <input type="text" placeholder="FIND UNIT..." className="w-full md:w-48 bg-black border border-zinc-800 text-white pl-9 pr-3 py-2 rounded text-xs font-mono focus:border-fuchsia-500 outline-none transition-all" onChange={e => setSearchTerm(e.target.value)}/>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-12">
        {filteredTeams.map(team => (
           <TeamCard key={team.id} team={team} onEdit={setEditingTeam} />
        ))}
      </div>

      {editingTeam !== undefined && (
        <EditTeamModal 
          team={Object.keys(editingTeam).length === 0 ? null : editingTeam} 
          onClose={() => setEditingTeam(undefined)} 
          onRefresh={fetchTeams} 
          tournamentId={tournamentId}
        />
      )}
    </div>
  );
};
