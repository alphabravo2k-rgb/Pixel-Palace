/**
 * 🛡️ TEAM ROSTER VIEW: PERSONNEL COMMAND
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // DATA-ENRICHED
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Search, RefreshCw, Shield, Edit3, X, Trash2, Users, 
  CheckCircle, Ban, Trophy, Mic, Monitor, Gamepad2, AlertTriangle, 
  Save, Link as LinkIcon 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { cn, copyToClipboard } from '../../lib/utils';

// --- ICONS ---
const BRAND_ICONS = {
  STEAM: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M11.979 0C5.666 0 .548 5.13.548 11.465c0 3.25 1.344 6.18 3.506 8.27l1.96-2.94a4.938 4.938 0 0 1-.366-1.874 4.975 4.975 0 0 1 4.97-4.97c.453 0 .89.066 1.306.184l3.194-4.79A11.378 11.378 0 0 0 11.98 0zm6.983 6.94l-3.33 4.995a4.933 4.933 0 0 1 2.25 2.126l4.634-2.857a11.385 11.385 0 0 0-3.554-4.264zM7.276 17.037l-1.897 2.846a11.37 11.37 0 0 0 5.23 1.94l1.19-4.167a4.966 4.966 0 0 1-4.523-.62zm9.11 1.07l-4.22 2.602a4.965 4.965 0 0 1-2.09.47L8.91 24.5a11.413 11.413 0 0 0 7.476-6.393z"/></svg>,
  DISCORD: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
  FACEIT: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M23.999 2.705c-.167-1.446-1.41-2.433-2.802-2.585-6.522-.73-12.603 1.353-12.603 1.353s-6.336 2.456-12.288 3.03C-.62 4.88-.633 6.643 2.053 6.34c3.418-.387 13.923-2.08 13.923-2.08l.385 1.554-15.01 2.37c-1.396.22-1.35 2.03.02 2.24l15.114 2.253.402 1.62-15.187 2.155c-1.48.212-1.31 2.14.07 2.21 4.545.232 14.832-.852 14.832-.852l.52 2.102-14.898 3.522c-1.8.426-1.077 2.924.787 2.502 6.556-1.48 13.116-2.923 13.116-2.923s5.88-1.528 7.625-5.914c1.19-2.99 1.483-11.233.178-14.394"/></svg>
};

// --- SUB-COMPONENT: TEAM CARD ---
const TeamCard = ({ team, onEdit }) => {
  const activeMembers = team.members.slice(0, 5);
  const reserveMembers = team.members.slice(5);
  const isDQ = team.status === 'DISQUALIFIED';

  return (
    <div className={cn(
        "group relative bg-[#09090b] border flex flex-col h-full transition-all duration-300 rounded-sm overflow-hidden shadow-2xl hover:border-fuchsia-500/40",
        isDQ ? "border-red-900/50 opacity-60 grayscale" : "border-zinc-800"
    )}>
      <div className="p-5 bg-zinc-900/20 border-b border-white/5 flex justify-between items-start">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-black rounded-sm border border-zinc-800 flex items-center justify-center p-2 relative shadow-inner group-hover:border-fuchsia-500/50 transition-colors">
            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name} /> : <Shield className="w-8 h-8 text-zinc-800"/>}
            {isDQ && <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center"><Ban className="w-8 h-8 text-red-600"/></div>}
          </div>
          
          <div className="flex flex-col">
            <h3 className={cn(
                "text-xl font-display font-black uppercase italic tracking-tighter truncate max-w-[180px] leading-none",
                isDQ ? "text-red-500" : "text-white"
            )}>
                {team.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2 py-0.5 rounded-sm text-[9px] font-black text-fuchsia-500 font-mono">
                    <Trophy size={10} /> {team.avg_elo || '----'}
                </div>
                <div className="text-[9px] font-mono text-zinc-600 px-2 py-0.5 bg-black/40 rounded-sm border border-white/5 uppercase">
                    Seed: {team.seed_number || '0'}
                </div>
            </div>
          </div>
        </div>
        
        <button onClick={() => onEdit(team)} className="p-2 bg-zinc-900/50 hover:bg-fuchsia-600 border border-white/5 text-zinc-600 hover:text-white transition-all rounded-sm active:scale-95">
            <Edit3 size={14} />
        </button>
      </div>

      <div className="p-3 space-y-1.5 bg-black/20 flex-1">
        {activeMembers.map(m => (
          <div key={m.id || Math.random()} className="flex justify-between items-center px-3 py-2 bg-zinc-900/10 hover:bg-white/[0.02] rounded-sm border border-transparent hover:border-white/5 transition-all group/member">
             <div className="flex flex-col">
                 <span className={cn("text-xs font-black italic uppercase tracking-tighter", m.role === 'captain' ? "text-fuchsia-500" : "text-zinc-300")}>
                     {m.username}
                 </span>
                 <span className="text-[8px] uppercase text-zinc-600 font-mono tracking-widest">{m.role}</span>
             </div>
             <div className="flex items-center gap-2 opacity-20 group-hover/member:opacity-100 transition-opacity">
                <span className="text-[9px] font-mono font-black text-zinc-500">{m.faceit_elo}</span>
                <Gamepad2 size={12} className="text-zinc-500 hover:text-fuchsia-500 cursor-pointer" />
             </div>
          </div>
        ))}
        {reserveMembers.length > 0 && (
            <div className="text-center pt-3 pb-1">
                <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em]">+ {reserveMembers.length} Reserved Units</span>
            </div>
        )}
      </div>
    </div>
  );
};

// --- SMART EDIT MODAL ---
const EditTeamModal = ({ team, onClose, onRefresh }) => {
  const [meta, setMeta] = useState({
    name: team?.name||'', logo_url: team?.logo_url||'', region: team?.region||'PAK',
    seed_number: team?.seed_number||0, access_code: team?.access_code||'',
    status: team?.status||'ACTIVE', wins: team?.wins||0, losses: team?.losses||0,
    voice_channel_url: team?.voice_channel_url||''
  });
  
  const [members, setMembers] = useState(team?.members?.map(m => ({
      user_id: m.user_id, 
      username: m.username, 
      role: m.role?.toUpperCase() || 'PLAYER', 
      discord: m.discord_handle||'', 
      steam: m.steam_url||'', 
      faceit: m.faceit_url||'', 
      elo: m.faceit_elo||0
  })) || []);
  
  const [saving, setSaving] = useState(false);

  const updateMember = (idx, field, value) => {
      const updated = [...members];
      updated[idx][field] = value;
      setMembers(updated);
  };

  const addMember = () => {
      setMembers([...members, { user_id: null, username: 'New Operator', role: 'PLAYER', discord: '', steam: '', faceit: '', elo: 1000 }]);
  };

  const removeMember = (idx) => {
      setMembers(members.filter((_, i) => i !== idx));
  };

  const handleSmartSync = async (idx) => {
      const member = members[idx];
      let faceitInput = member.username || '';
      let faceitNickname = faceitInput;

      if (faceitInput.includes('faceit.com')) {
          const parts = faceitInput.split('/');
          faceitNickname = parts.pop() || parts.pop(); 
          faceitNickname = faceitNickname.split('?')[0];
      }

      if(!faceitNickname) { toast.error("Enter a Username or Faceit URL first."); return; }

      const toastId = toast.loading(`Enriching data for ${faceitNickname}...`);

      try {
          // ✅ SECURE UPDATE: Using Supabase Edge Function
          const { data, error } = await supabase.functions.invoke('faceit-proxy', {
            body: { nickname: faceitNickname }
          });

          if (error) throw error;
          if (!data || data.errors || !data.player_id) throw new Error("Player not found on Faceit");

          const realName = data.nickname;
          const newElo = data.games?.cs2?.faceit_elo || data.games?.csgo?.faceit_elo || 1000;
          const faceitUrl = data.faceit_url.replace('{lang}', 'en');
          const steamId64 = data.steam_id_64;
          const steamUrl = steamId64 ? `https://steamcommunity.com/profiles/${steamId64}` : member.steam;

          const updated = [...members];
          updated[idx].username = realName;
          updated[idx].elo = newElo;
          updated[idx].faceit = faceitUrl;
          updated[idx].steam = steamUrl;

          toast.success(`Synced ${realName}`, { id: toastId });
          setMembers(updated);

      } catch(e) {
          console.error(e);
          toast.error(`Sync Error: ${e.message}`, { id: toastId });
      }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert Team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .upsert({
            id: team?.id,
            name: meta.name, 
            logo_url: meta.logo_url, 
            region: meta.region,
            seed_number: parseInt(meta.seed_number), 
            access_code: meta.access_code,
            status: meta.status, 
            wins: parseInt(meta.wins), 
            losses: parseInt(meta.losses),
            voice_channel_url: meta.voice_channel_url
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Handle Members (Simpler than RPC for now)
      if (teamData) {
          // Delete old
          await supabase.from('team_members').delete().eq('team_id', teamData.id);
          
          // Insert new
          const membersToInsert = members.map(m => ({
              team_id: teamData.id,
              username: m.username,
              role: m.role.toLowerCase(),
              faceit_elo: parseInt(m.elo),
              steam_url: m.steam,
              faceit_url: m.faceit,
              discord_handle: m.discord,
              user_id: m.user_id // Preserves linked user if existed
          }));
          
          if (membersToInsert.length > 0) {
              await supabase.from('team_members').insert(membersToInsert);
          }
      }

      toast.success("Roster Updated Successfully");
      onRefresh(); 
      onClose();
    } catch(e) { 
        console.error(e);
        toast.error("Save Failed: " + e.message); 
    } finally { 
        setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0b0c0f] border border-zinc-800 w-full max-w-6xl rounded-lg flex flex-col max-h-[95vh] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-zinc-900/90 flex justify-between items-center">
           <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wider">
               EDIT UNIT: <span className="text-fuchsia-500">{meta.name || 'NEW TEAM'}</span>
           </h2>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
               <div className="md:col-span-2 flex flex-col items-center gap-2">
                  <div className="w-24 h-24 bg-black rounded-lg border border-zinc-700 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                     {meta.logo_url ? <img src={meta.logo_url} className="w-full h-full object-contain" alt="Preview"/> : <Shield className="w-8 h-8 text-zinc-700"/>}
                  </div>
                  <span className="text-[10px] uppercase text-zinc-500 font-bold">Logo Preview</span>
               </div>
               <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                       <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Team Identity</label>
                       <input value={meta.name} onChange={e=>setMeta({...meta, name:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-sm mb-2 focus:border-fuchsia-500 outline-none" placeholder="Team Name" />
                       <input value={meta.logo_url} onChange={e=>setMeta({...meta, logo_url:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-zinc-400 rounded text-xs focus:border-fuchsia-500 outline-none" placeholder="Logo URL" />
                   </div>
                   <div>
                       <label className="text-[10px] text-[#5865F2] uppercase font-bold block mb-1 flex items-center gap-1"><Mic size={10}/> Team Voice Channel</label>
                       <input value={meta.voice_channel_url} onChange={e=>setMeta({...meta, voice_channel_url:e.target.value})} className="w-full bg-[#5865F2]/10 border border-[#5865F2]/30 p-2 text-white rounded text-sm mb-2 focus:border-[#5865F2] outline-none" placeholder="Discord Channel Link" />
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
            <div className="bg-zinc-900/30 p-4 rounded border border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                   <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Status</label>
                   <select value={meta.status} onChange={e=>setMeta({...meta, status:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-xs uppercase font-bold focus:border-fuchsia-500 outline-none">
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
                   <input value={meta.access_code} onChange={e=>setMeta({...meta, access_code:e.target.value})} className="w-full bg-black border border-yellow-900/50 text-yellow-500 p-2 rounded text-xs font-mono text-center tracking-wider" />
                </div>
            </div>
            <div className="space-y-4 border-t border-zinc-800 pt-6">
               <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2">
                       <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2"><Users size={14}/> Active Operators</h3>
                       <span className={cn("text-xs font-mono px-1.5 rounded font-bold", members.length < 5 ? 'text-red-500 bg-red-900/20' : 'text-emerald-500 bg-emerald-900/20')}>{members.length}/6</span>
                   </div>
                   <button onClick={addMember} className="text-xs bg-fuchsia-600 hover:bg-fuchsia-500 px-3 py-1.5 rounded text-white font-bold uppercase transition-colors">Add Operator</button>
               </div>
               {members.map((m, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-2 items-center bg-zinc-900/50 p-2 rounded border border-zinc-800 hover:border-zinc-600 transition-colors">
                      <div className="w-full md:w-32 relative group">
                          <input value={m.username} onChange={e => updateMember(idx, 'username', e.target.value)} className="w-full bg-black border border-zinc-700 p-1.5 text-white rounded text-xs font-bold focus:border-fuchsia-500 outline-none" placeholder="Nick or URL..." />
                          <button onClick={() => handleSmartSync(idx)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-fuchsia-500 transition-all opacity-0 group-hover:opacity-100"><RefreshCw size={10} /></button>
                      </div>
                      <div className="w-full md:w-24">
                          <select value={m.role} onChange={e => updateMember(idx, 'role', e.target.value)} className="w-full bg-black border border-zinc-700 p-1.5 text-white rounded text-xs uppercase focus:border-fuchsia-500 outline-none">
                              <option value="CAPTAIN">CAPTAIN</option><option value="PLAYER">PLAYER</option><option value="SUBSTITUTE">SUBSTITUTE</option>
                          </select>
                      </div>
                      <div className="w-full md:w-24 flex gap-1">
                          <input type="number" value={m.elo} onChange={e => updateMember(idx, 'elo', e.target.value)} className="w-full bg-black border border-zinc-700 p-1.5 text-yellow-500 text-center rounded text-xs font-mono" placeholder="ELO" />
                          <button onClick={() => handleSmartSync(idx)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-1.5 rounded"><RefreshCw size={12}/></button>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-2 w-full">
                          <div className="relative"><Monitor className="absolute left-2 top-2 w-3 h-3 text-zinc-600"/><input value={m.steam} onChange={e => updateMember(idx, 'steam', e.target.value)} className="w-full bg-black border border-zinc-700 pl-7 p-1.5 text-zinc-300 rounded text-[10px] focus:border-blue-500 outline-none" placeholder="Steam URL" /></div>
                          <div className="relative"><Mic className="absolute left-2 top-2 w-3 h-3 text-zinc-600"/><input value={m.discord} onChange={e => updateMember(idx, 'discord', e.target.value)} className="w-full bg-black border border-zinc-700 pl-7 p-1.5 text-zinc-300 rounded text-[10px] focus:border-indigo-500 outline-none" placeholder="Discord" /></div>
                          <div className="relative"><Gamepad2 className="absolute left-2 top-2 w-3 h-3 text-zinc-600"/><input value={m.faceit} onChange={e => updateMember(idx, 'faceit', e.target.value)} className="w-full bg-black border border-zinc-700 pl-7 p-1.5 text-zinc-300 rounded text-[10px] focus:border-orange-500 outline-none" placeholder="Faceit URL" /></div>
                      </div>
                      {m.user_id && <div className="text-emerald-500"><LinkIcon size={12}/></div>}
                      <button onClick={() => removeMember(idx)} className="text-zinc-600 hover:text-red-500 p-1.5 transition-colors"><Trash2 size={14}/></button>
                  </div>
               ))}
            </div>
        </div>
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/90 rounded-b-lg">
           <button onClick={onClose} className="px-4 py-2 text-zinc-400 text-xs font-bold uppercase hover:text-white transition-colors">Cancel</button>
           <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase rounded shadow-lg transition-all disabled:opacity-50">
              {saving ? 'Processing...' : 'Save Database Changes'}
           </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ROSTER VIEW ---
export const TeamRosterView = () => {
  const { can } = useNexus();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTeam, setEditTeam] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
        // Fetch teams AND their members in one efficient query
        const { data: teamData } = await supabase.from('teams').select(`*, team_members(*)`).order('name');
        
        // Enrichment Logic: Calculate averages and map display names locally
        const formatted = teamData?.map(t => {
            const avg = t.team_members.length ? Math.round(t.team_members.reduce((a, b) => a + (b.faceit_elo || 0), 0) / t.team_members.length) : 0;
            return { ...t, members: t.team_members, avg_elo: avg };
        });

        setTeams(formatted || []);
        setLoading(false);
    } catch(e) {
        console.error("Uplink Error:", e);
        setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const filtered = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // 🛡️ SECURITY GATE
  if (!can('CAP_MANAGE_ROSTERS')) return <div className="p-20 text-center font-mono text-red-500">CLEARANCE VOID // DATA GATED</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full overflow-y-auto custom-scrollbar pb-32">
       
       {/* SEARCH & FILTER BAR */}
       <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
              <h1 className="text-5xl font-display font-black text-white italic uppercase tracking-tighter leading-none">Roster <span className="text-fuchsia-600">Command</span></h1>
              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.4em] mt-2">Active Combat Unit Registry // {teams.length} Units Online</p>
          </div>
          <div className="flex items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-fuchsia-500 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="FIND UNIT..." 
                   className="bg-black border border-zinc-800 text-white pl-12 pr-6 py-3 rounded-sm text-[10px] font-black tracking-widest focus:border-fuchsia-500 outline-none w-80 uppercase transition-all"
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <button onClick={() => setEditTeam({})} className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all active:scale-95 shadow-lg shadow-fuchsia-600/20">New Unit</button>
              <button onClick={fetchTeams} className="p-3 bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white rounded-sm transition-all"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
          </div>
       </div>

       {loading ? (
           <div className="flex flex-col items-center justify-center py-40 gap-6 grayscale">
               <div className="w-16 h-16 border-2 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em]">Synchronizing Registry...</p>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filtered.map(t => <TeamCard key={t.id} team={t} onEdit={setEditTeam} />)}
           </div>
       )}
       {editTeam !== undefined && <EditTeamModal team={editTeam} onClose={() => setEditTeam(undefined)} onRefresh={fetchTeams} />}
    </div>
  );
};
