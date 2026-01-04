import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Search, RefreshCw, Shield, Edit3, X, Trash2, Key, Users, Copy, CheckCircle, Ban, Trophy, Mic, Globe, Monitor, Gamepad2, Link as LinkIcon } from 'lucide-react';
import StatsCard from '../../components/StatsCard';

// --- ICONS (YOUR CUSTOM ASSETS) ---
const BRAND_ICONS = {
  STEAM: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M11.979 0C5.666 0 .548 5.13.548 11.465c0 3.25 1.344 6.18 3.506 8.27l1.96-2.94a4.938 4.938 0 0 1-.366-1.874 4.975 4.975 0 0 1 4.97-4.97c.453 0 .89.066 1.306.184l3.194-4.79A11.378 11.378 0 0 0 11.98 0zm6.983 6.94l-3.33 4.995a4.933 4.933 0 0 1 2.25 2.126l4.634-2.857a11.385 11.385 0 0 0-3.554-4.264zM7.276 17.037l-1.897 2.846a11.37 11.37 0 0 0 5.23 1.94l1.19-4.167a4.966 4.966 0 0 1-4.523-.62zm9.11 1.07l-4.22 2.602a4.965 4.965 0 0 1-2.09.47L8.91 24.5a11.413 11.413 0 0 0 7.476-6.393z"/></svg>,
  DISCORD: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
  FACEIT: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M23.999 2.705c-.167-1.446-1.41-2.433-2.802-2.585-6.522-.73-12.603 1.353-12.603 1.353s-6.336 2.456-12.288 3.03C-.62 4.88-.633 6.643 2.053 6.34c3.418-.387 13.923-2.08 13.923-2.08l.385 1.554-15.01 2.37c-1.396.22-1.35 2.03.02 2.24l15.114 2.253.402 1.62-15.187 2.155c-1.48.212-1.31 2.14.07 2.21 4.545.232 14.832-.852 14.832-.852l.52 2.102-14.898 3.522c-1.8.426-1.077 2.924.787 2.502 6.556-1.48 13.116-2.923 13.116-2.923s5.88-1.528 7.625-5.914c1.19-2.99 1.483-11.233.178-14.394"/></svg>
};

const getRoleWeight = (role) => ({ 'CAPTAIN': 1, 'PLAYER': 2, 'SUBSTITUTE': 3 }[role?.toUpperCase()] || 99);
const generateAccessCode = (teamName) => `${(teamName.replace(/[^a-zA-Z]/g,'').toUpperCase().substring(0,3)||'XXX').padEnd(3,'X')}-${Math.floor(1000+Math.random()*9000)}`;
const getRegionFlag = (code) => {
  if(!code) return null;
  const map = { 'PAK':'pk', 'PK':'pk', 'IND':'in', 'IN':'in', 'UAE':'ae', 'SA':'sa', 'UK':'gb', 'US':'us' };
  return map[code.toUpperCase()] 
    ? <img src={`https://flagcdn.com/24x18/${map[code.toUpperCase()]}.png`} className="h-3 w-4 rounded opacity-80" alt={code}/> 
    : <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 rounded">{code.substring(0,2)}</span>;
};

// --- TEAM CARD (YOUR EXACT COMPONENT) ---
const TeamCard = ({ team, onEdit }) => {
  const activeMembers = team.members.slice(0, 5);
  const reserveMembers = team.members.slice(5);
  const isDQ = team.status === 'DISQUALIFIED';

  return (
    <div className={`group relative bg-[#0b0c0f] border hover:border-zinc-600 flex flex-col h-full transition-all duration-300 rounded-xl overflow-visible ${isDQ ? 'border-red-900/50 opacity-75' : 'border-zinc-800'}`}>
      
      {/* Header */}
      <div className="p-3 bg-zinc-900/50 border-b border-white/5 flex justify-between items-start rounded-t-xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-black rounded border border-zinc-800 flex items-center justify-center p-1 relative mt-1">
            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name} /> : <Shield className="w-6 h-6 text-zinc-700"/>}
            {isDQ && <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded"><Ban className="w-6 h-6 text-red-600"/></div>}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className={`text-base font-black uppercase italic tracking-tighter truncate max-w-[140px] leading-none ${isDQ ? 'text-red-500 line-through' : 'text-white'}`}>{team.name}</h3>
            {/* AVG ELO BADGE */}
            {team.avg_elo > 0 && (
                <div className="inline-flex items-center gap-1 bg-yellow-900/10 border border-yellow-600/20 px-1.5 py-0.5 rounded w-fit">
                    <Trophy size={8} className="text-yellow-500" />
                    <span className="text-[9px] font-bold text-yellow-500 font-mono">AVG {team.avg_elo}</span>
                </div>
            )}
            <div className="flex items-center gap-2 mt-0.5">
                {isDQ ? <span className="text-[9px] font-bold bg-red-900/20 text-red-500 px-1.5 rounded border border-red-900/50">DQ</span> : 
                <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500"><span className="text-emerald-500 font-bold">{team.wins||0}W</span> - <span className="text-red-400 font-bold">{team.losses||0}L</span></div>}
                <span className="flex items-center" title={team.region}>{getRegionFlag(team.region)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1">
            {team.voice_channel_url && (
                <a href={team.voice_channel_url} target="_blank" rel="noreferrer" className="p-2 bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white rounded border border-[#5865F2]/30 transition-all" title="Join Voice">
                    <Mic size={14} />
                </a>
            )}
            <button onClick={() => onEdit(team)} className="p-2 bg-zinc-900 hover:bg-white/10 text-zinc-500 hover:text-white rounded border border-zinc-800 transition-colors"><Edit3 size={14} /></button>
        </div>
      </div>

      {/* Roster */}
      <div className="p-2 space-y-1">
        {activeMembers.map(m => {
           // SMART DISCORD LOGIC: Check if handle is purely numeric
           const isDiscordId = /^\d+$/.test(m.discord_handle); 
           return (
             <div key={m.id} className="flex justify-between items-center px-2 py-1.5 bg-black/20 rounded border border-transparent hover:border-zinc-800 transition-colors">
                <div className="flex flex-col">
                    <span className={`text-xs font-bold leading-none ${m.role === 'CAPTAIN' ? 'text-fuchsia-400' : 'text-zinc-300'}`}>{m.username || 'Unknown'}</span>
                    <span className="text-[8px] uppercase text-zinc-600 font-mono mt-0.5">{m.role}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {m.faceit_elo > 0 && <span className="text-[9px] font-mono font-bold text-yellow-500 bg-yellow-900/10 px-1 rounded border border-yellow-500/20">{m.faceit_elo}</span>}
                    {m.steam_url && <a href={m.steam_url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-[#171a21] hover:bg-white rounded-full p-0.5 transition-colors">{BRAND_ICONS.STEAM}</a>}
                    
                    {/* SMART DISCORD BUTTON */}
                    {m.discord_handle && (
                        isDiscordId ? 
                        <a href={`https://discord.com/users/${m.discord_handle}`} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-[#5865F2] hover:bg-white rounded-full p-0.5 transition-colors cursor-pointer" title="Open Discord Profile">{BRAND_ICONS.DISCORD}</a>
                        : <button onClick={() => { navigator.clipboard.writeText(m.discord_handle); alert(`Copied "${m.discord_handle}" to clipboard!`); }} className="text-zinc-600 hover:text-[#5865F2] hover:bg-white rounded-full p-0.5 transition-colors cursor-copy" title="Copy Handle (Text ID)">{BRAND_ICONS.DISCORD}</button>
                    )}

                    {m.faceit_url && <a href={m.faceit_url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-[#ff5500] hover:bg-white rounded-full p-0.5 transition-colors">{BRAND_ICONS.FACEIT}</a>}
                </div>
             </div>
           );
        })}
        {reserveMembers.length > 0 && (
            <div className="relative group text-center pt-1 cursor-help z-50">
                <div className="text-[9px] text-zinc-600 italic group-hover:text-fuchsia-500">+{reserveMembers.length} Reserves</div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0b0c0f] border border-zinc-700 rounded-lg p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none group-hover:pointer-events-auto">
                    <div className="text-[9px] font-bold uppercase text-zinc-500 mb-2 border-b border-zinc-800 pb-1">Reserve Roster</div>
                    {reserveMembers.map(sub => <div key={sub.id} className="flex justify-between text-[10px] text-zinc-300 py-1"><span>{sub.username}</span><span className="text-zinc-600">{sub.faceit_elo||'NR'}</span></div>)}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// --- EDIT MODAL (YOUR EXACT COMPONENT) ---
const EditTeamModal = ({ team, onClose, onRefresh }) => {
  const [meta, setMeta] = useState({
    name: team?.name||'', logo_url: team?.logo_url||'', region: team?.region||'PAK',
    seed_number: team?.seed_number||0, access_code: team?.access_code||'',
    status: team?.status||'ACTIVE', wins: team?.wins||0, losses: team?.losses||0,
    voice_channel_url: team?.voice_channel_url||''
  });
  
  const [members, setMembers] = useState(team?.members || []);
  const [saving, setSaving] = useState(false);

  // ⚡ UPDATED: SAVE FUNCTION WIRED TO DB RPC
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('admin_upsert_team', {
          p_team_id: team?.id || null,
          p_name: meta.name, p_logo_url: meta.logo_url, p_region: meta.region,
          p_seed_number: parseInt(meta.seed_number), p_access_code: meta.access_code,
          p_status: meta.status, p_wins: parseInt(meta.wins), p_losses: parseInt(meta.losses),
          p_voice_channel_url: meta.voice_channel_url
      });
      if (error) throw error;
      onRefresh(); onClose();
    } catch(e) { alert("Save Failed: " + e.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b0c0f] border border-zinc-700 w-full max-w-6xl rounded-2xl flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between">
           <h2 className="text-xl font-black text-white uppercase italic">EDIT UNIT: <span className="text-fuchsia-500">{meta.name || 'NEW TEAM'}</span></h2>
           <button onClick={onClose}><X className="text-zinc-400 hover:text-white" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8">
           {/* SECTION 1: TEAM DETAILS */}
           <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Live Logo Preview */}
              <div className="md:col-span-2 flex flex-col items-center gap-2">
                 <div className="w-24 h-24 bg-black rounded-lg border border-zinc-700 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                    {meta.logo_url ? <img src={meta.logo_url} className="w-full h-full object-contain" alt="Preview"/> : <Shield className="w-8 h-8 text-zinc-700"/>}
                 </div>
                 <span className="text-[9px] uppercase text-zinc-500 font-bold">Logo Preview</span>
              </div>

              {/* Text Fields */}
              <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Team Identity (Name & Logo)</label>
                      <input value={meta.name} onChange={e=>setMeta({...meta, name:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-sm mb-2 focus:border-fuchsia-500 outline-none" placeholder="Team Name (e.g. Navi)" />
                      <input value={meta.logo_url} onChange={e=>setMeta({...meta, logo_url:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-zinc-400 rounded text-xs focus:border-fuchsia-500 outline-none" placeholder="https://imgur.com/... (Logo URL)" />
                  </div>
                  <div>
                      <label className="text-[10px] text-[#5865F2] uppercase font-bold block mb-1 flex items-center gap-1"><Mic size={10}/> Team Voice Channel</label>
                      <input value={meta.voice_channel_url} onChange={e=>setMeta({...meta, voice_channel_url:e.target.value})} className="w-full bg-[#5865F2]/10 border border-[#5865F2]/30 p-2 text-white rounded text-sm mb-2 focus:border-[#5865F2] outline-none" placeholder="https://discord.com/channels/..." />
                      <div className="flex gap-2">
                          <div className="flex-1">
                             <label className="text-[10px] text-zinc-500 uppercase font-bold">Region</label>
                             <input value={meta.region} onChange={e=>setMeta({...meta, region:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-xs" />
                          </div>
                          <div className="flex-1">
                             <label className="text-[10px] text-zinc-500 uppercase font-bold">Seed</label>
                             <input type="number" value={meta.seed_number} onChange={e=>setMeta({...meta, seed_number:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-xs" />
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           {/* SECTION 2: STATUS & STATS */}
           <div className="bg-zinc-900/30 p-4 rounded border border-zinc-800 grid grid-cols-4 gap-4">
               <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Status</label>
                  <select value={meta.status} onChange={e=>setMeta({...meta, status:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-xs uppercase font-bold">
                      <option value="ACTIVE">Active</option>
                      <option value="DISQUALIFIED">Disqualified</option>
                      <option value="ELIMINATED">Eliminated</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] text-emerald-600 uppercase font-bold block mb-1">Wins</label>
                  <input type="number" value={meta.wins} onChange={e=>setMeta({...meta, wins:e.target.value})} className="w-full bg-black border border-emerald-900/50 text-emerald-500 p-2 rounded text-xs font-bold text-center" />
               </div>
               <div>
                  <label className="text-[10px] text-red-600 uppercase font-bold block mb-1">Losses</label>
                  <input type="number" value={meta.losses} onChange={e=>setMeta({...meta, losses:e.target.value})} className="w-full bg-black border border-red-900/50 text-red-500 p-2 rounded text-xs font-bold text-center" />
               </div>
               <div>
                  <label className="text-[10px] text-yellow-600 uppercase font-bold block mb-1">Access Key</label>
                  <input value={meta.access_code} onChange={e=>setMeta({...meta, access_code:e.target.value})} className="w-full bg-black border border-yellow-900/50 text-yellow-500 p-2 rounded text-xs font-mono text-center" />
               </div>
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

// --- MAIN VIEW (UPDATED ENGINE) ---
export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editTeam, setEditTeam] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // ⚡ THE FIX: "Safe Fetch" Strategy 
  // 
  const fetchTeams = async () => {
    setLoading(true);
    try {
        // 1. Get Teams & Members (No Join to Profiles yet)
        const { data: teamData } = await supabase.from('teams')
            .select(`*, team_members(id, role, user_id)`).order('name');
        
        if(!teamData) { setTeams([]); return; }

        // 2. Extract IDs and Fetch Profiles Separately
        const allUserIds = teamData.flatMap(t => t.team_members.map(m => m.user_id)).filter(Boolean);
        
        // This query will succeed even if some profiles are missing/restricted
        const { data: profiles } = await supabase.from('global_identities')
            .select('id, display_name, discord_handle, steam_url, faceit_url, faceit_elo')
            .in('id', allUserIds);
        
        const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

        // 3. Stitch Data in JavaScript
        const formatted = teamData.map(t => {
            const members = t.team_members.map(tm => {
                const p = profileMap[tm.user_id] || {}; // Fallback to empty if profile missing
                return {
                    id: tm.id,
                    role: tm.role,
                    username: p.display_name || 'Unknown Operator',
                    discord_handle: p.discord_handle,
                    steam_url: p.steam_url,
                    faceit_url: p.faceit_url,
                    faceit_elo: p.faceit_elo || 0
                };
            }).sort((a,b)=>getRoleWeight(a.role)-getRoleWeight(b.role));
            
            // Auto-calculate Team Average
            const elos = members.map(m => m.faceit_elo).filter(e => e > 0);
            const avg = elos.length ? Math.round(elos.reduce((a,b)=>a+b,0)/elos.length) : 0;

            return { ...t, members, avg_elo: avg };
        });

        setTeams(formatted);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleGenCodes = async () => {
    if(!window.confirm("Generate codes for teams missing them?")) return;
    setGenerating(true);
    const teamsToUpdate = teams.filter(t => !t.access_code);
    for(const t of teamsToUpdate) { 
        await supabase.from('teams').update({ access_code: generateAccessCode(t.name) }).eq('id', t.id); 
    }
    await fetchTeams(); setGenerating(false);
  }

  useEffect(() => { fetchTeams(); }, []);
  const filtered = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalP = teams.reduce((acc, t) => acc + t.members.length, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Teams" value={teams.length} type="teams" />
          <StatsCard title="Active Operators" value={totalP} type="players" />
          <StatsCard title="Combat Ready" value={teams.filter(t=>t.members.length>=5).length} type="active" />
       </div>

       <div className="flex justify-between items-end border-b border-white/10 pb-4">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">ROSTER <span className="text-fuchsia-500">COMMAND</span></h1>
          <div className="flex items-center gap-3">
             <button onClick={handleGenCodes} disabled={generating} className="px-3 py-2 bg-yellow-600/10 text-yellow-500 border border-yellow-600/30 rounded text-xs font-bold uppercase flex gap-2">{generating ? <RefreshCw className="animate-spin w-3 h-3"/> : <Key size={14}/>} Gen Codes</button>
             <button onClick={() => setEditTeam({})} className="px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-xs font-bold uppercase">+ New Team</button>
             <button onClick={fetchTeams} className="p-2 bg-zinc-900 border border-zinc-800 text-white rounded"><RefreshCw size={14}/></button>
             <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" /><input type="text" placeholder="FIND UNIT..." className="bg-black border border-zinc-800 text-white pl-9 pr-3 py-2 rounded text-xs font-mono focus:border-fuchsia-500 outline-none w-48" onChange={e => setSearchTerm(e.target.value)}/></div>
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
          {filtered.map(t => <TeamCard key={t.id} team={t} onEdit={setEditTeam} />)}
       </div>
       
       {editTeam !== undefined && <EditTeamModal team={editTeam} onClose={() => setEditTeam(undefined)} onRefresh={fetchTeams} />}
    </div>
  );
};
export default TeamRosterView;
