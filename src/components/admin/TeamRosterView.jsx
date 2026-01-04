import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Search, RefreshCw, Shield, Edit3, X, Trash2, Key, Users, 
  Copy, CheckCircle, Ban, Trophy, Mic, Globe, Monitor, Gamepad2, AlertTriangle, Save, Link as LinkIcon 
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import { toast } from 'react-hot-toast';
import { cn, copyToClipboard } from '../../lib/utils';
import { normalizeRole } from '../../lib/roles';

// --- ASSETS & HELPERS ---
const BRAND_ICONS = {
  STEAM: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M11.979 0C5.666 0 .548 5.13.548 11.465c0 3.25 1.344 6.18 3.506 8.27l1.96-2.94a4.938 4.938 0 0 1-.366-1.874 4.975 4.975 0 0 1 4.97-4.97c.453 0 .89.066 1.306.184l3.194-4.79A11.378 11.378 0 0 0 11.98 0zm6.983 6.94l-3.33 4.995a4.933 4.933 0 0 1 2.25 2.126l4.634-2.857a11.385 11.385 0 0 0-3.554-4.264zM7.276 17.037l-1.897 2.846a11.37 11.37 0 0 0 5.23 1.94l1.19-4.167a4.966 4.966 0 0 1-4.523-.62zm9.11 1.07l-4.22 2.602a4.965 4.965 0 0 1-2.09.47L8.91 24.5a11.413 11.413 0 0 0 7.476-6.393z"/></svg>,
  DISCORD: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
  FACEIT: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M23.999 2.705c-.167-1.446-1.41-2.433-2.802-2.585-6.522-.73-12.603 1.353-12.603 1.353s-6.336 2.456-12.288 3.03C-.62 4.88-.633 6.643 2.053 6.34c3.418-.387 13.923-2.08 13.923-2.08l.385 1.554-15.01 2.37c-1.396.22-1.35 2.03.02 2.24l15.114 2.253.402 1.62-15.187 2.155c-1.48.212-1.31 2.14.07 2.21 4.545.232 14.832-.852 14.832-.852l.52 2.102-14.898 3.522c-1.8.426-1.077 2.924.787 2.502 6.556-1.48 13.116-2.923 13.116-2.923s5.88-1.528 7.625-5.914c1.19-2.99 1.483-11.233.178-14.394"/></svg>
};

const getRoleWeight = (role) => ({ 'captain': 1, 'player': 2, 'substitute': 3 }[normalizeRole(role)] || 99);
const generateAccessCode = (teamName) => `${(teamName.replace(/[^a-zA-Z]/g,'').toUpperCase().substring(0,3)||'XXX').padEnd(3,'X')}-${Math.floor(1000+Math.random()*9000)}`;

// --- SUB-COMPONENT: TEAM CARD ---
const TeamCard = ({ team, onEdit }) => {
  const activeMembers = team.members.slice(0, 5);
  const reserveMembers = team.members.slice(5);
  const isDQ = team.status === 'DISQUALIFIED';

  return (
    <div className={cn(
        "group relative bg-bg-panel border flex flex-col h-full transition-all duration-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg",
        isDQ ? "border-red-900/50 opacity-75" : "border-tactical hover:border-brand/50"
    )}>
      
      {/* Header */}
      <div className="p-4 bg-zinc-900/40 border-b border-white/5 flex justify-between items-start">
        <div className="flex items-start gap-3">
          {/* Logo Box */}
          <div className="w-12 h-12 bg-black rounded border border-white/10 flex items-center justify-center p-1 relative shadow-inner">
            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name} /> : <Shield className="w-6 h-6 text-zinc-700"/>}
            {isDQ && <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded"><Ban className="w-6 h-6 text-red-600"/></div>}
          </div>
          
          <div className="flex flex-col">
            <h3 className={cn(
                "text-lg font-display font-black uppercase italic tracking-tighter truncate max-w-[150px] leading-none",
                isDQ ? "text-red-500 line-through" : "text-white"
            )}>
                {team.name}
            </h3>
            
            {/* Metadata Badges */}
            <div className="flex items-center gap-2 mt-1.5">
                {team.avg_elo > 0 && (
                    <div className="inline-flex items-center gap-1 bg-yellow-900/10 border border-yellow-600/20 px-1.5 py-0.5 rounded text-[9px] font-bold text-yellow-500 font-mono" title="Average ELO">
                        <Trophy size={8} /> {team.avg_elo}
                    </div>
                )}
                {isDQ ? (
                    <span className="text-[9px] font-bold bg-red-900/20 text-red-500 px-1.5 rounded border border-red-900/50">DQ</span> 
                ) : (
                    <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 px-1.5 py-0.5 bg-black/40 rounded border border-white/5">
                        <span className="text-emerald-500 font-bold">{team.wins||0}W</span> - <span className="text-red-400 font-bold">{team.losses||0}L</span>
                    </div>
                )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-1">
            {team.voice_channel_url && (
                <a href={team.voice_channel_url} target="_blank" rel="noreferrer" className="p-2 bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white rounded border border-[#5865F2]/30 transition-all" title="Join Voice">
                    <Mic size={14} />
                </a>
            )}
            <button onClick={() => onEdit(team)} className="p-2 bg-zinc-900 hover:bg-brand text-zinc-500 hover:text-white rounded border border-zinc-800 hover:border-brand/50 transition-colors">
                <Edit3 size={14} />
            </button>
        </div>
      </div>

      {/* Roster List */}
      <div className="p-2 space-y-1 bg-bg-surface/30 flex-1">
        {activeMembers.map(m => {
           const role = normalizeRole(m.role);
           const isDiscordId = /^\d+$/.test(m.discord_handle); 
           
           return (
             <div key={m.id} className="flex justify-between items-center px-2 py-1.5 bg-white/5 rounded border border-transparent hover:border-white/10 transition-colors group">
                <div className="flex flex-col">
                    <span className={cn(
                        "text-xs font-bold leading-none",
                        role === 'captain' ? "text-brand-glow" : "text-zinc-300"
                    )}>
                        {m.username || 'Unknown Agent'}
                    </span>
                    <span className="text-[8px] uppercase text-zinc-600 font-mono mt-0.5">{role}</span>
                </div>
                
                {/* Links & ELO */}
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                   {m.faceit_elo > 0 && (
                       <span className="text-[9px] font-mono font-bold text-zinc-400 bg-black/40 px-1 rounded border border-white/5" title="Faceit ELO">{m.faceit_elo}</span>
                   )}
                   
                   {m.steam_url && <a href={m.steam_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-[#171a21] hover:bg-white rounded-full p-0.5 transition-colors">{BRAND_ICONS.STEAM}</a>}
                   
                   {m.discord_handle && (
                       isDiscordId ? 
                       <a href={`https://discord.com/users/${m.discord_handle}`} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-[#5865F2] hover:bg-white rounded-full p-0.5 transition-colors">{BRAND_ICONS.DISCORD}</a>
                       : <button onClick={() => { copyToClipboard(m.discord_handle); toast.success("Discord ID Copied"); }} className="text-zinc-500 hover:text-[#5865F2] hover:bg-white rounded-full p-0.5 transition-colors cursor-copy">{BRAND_ICONS.DISCORD}</button>
                   )}

                   {m.faceit_url && <a href={m.faceit_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-[#ff5500] hover:bg-white rounded-full p-0.5 transition-colors">{BRAND_ICONS.FACEIT}</a>}
                </div>
             </div>
           );
        })}
        
        {/* Reserve List (Tooltip Style) */}
        {reserveMembers.length > 0 && (
            <div className="relative group text-center pt-2 pb-1 cursor-help z-20">
                <div className="text-[10px] text-zinc-600 font-bold italic group-hover:text-brand transition-colors">
                    +{reserveMembers.length} Reserves Available
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-zinc-700 rounded-lg p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                    <div className="text-[9px] font-bold uppercase text-zinc-500 mb-2 border-b border-zinc-800 pb-1">Reserve Roster</div>
                    {reserveMembers.map(sub => (
                        <div key={sub.id} className="flex justify-between text-[10px] text-zinc-300 py-1">
                            <span>{sub.username}</span>
                            <span className="text-zinc-600 font-mono">{sub.faceit_elo || 'NR'}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// --- SMART EDIT MODAL (Hybrid Upgrade) ---
const EditTeamModal = ({ team, onClose, onRefresh }) => {
  const [meta, setMeta] = useState({
    name: team?.name||'', logo_url: team?.logo_url||'', region: team?.region||'PAK',
    seed_number: team?.seed_number||0, access_code: team?.access_code||'',
    status: team?.status||'ACTIVE', wins: team?.wins||0, losses: team?.losses||0,
    voice_channel_url: team?.voice_channel_url||''
  });
  
  // ✅ IMPORTANT: Store user_id to prevent duplicates on save
  const [members, setMembers] = useState(team?.members.map(m => ({
      user_id: m.user_id, // Keep the ID if exists
      username: m.username, 
      role: normalizeRole(m.role).toUpperCase(), 
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
      // New members have NO user_id yet
      setMembers([...members, { user_id: null, username: 'New Operator', role: 'PLAYER', discord: '', steam: '', faceit: '', elo: 1000 }]);
  };

  const removeMember = (idx) => {
      setMembers(members.filter((_, i) => i !== idx));
  };

  // ⚡ SMART SYNC: Handles Nickname OR Full URL Input
  const handleSmartSync = async (idx) => {
      const member = members[idx];
      // Logic: User can type name "-BRAVO-" OR paste URL "https://faceit.com/players/-BRAVO-"
      let faceitInput = member.username || '';
      let faceitNickname = faceitInput;

      // 1. Detect if it's a URL
      if (faceitInput.includes('faceit.com')) {
          // Extract nickname from URL
          const parts = faceitInput.split('/');
          // Get last part, ignoring trailing slash
          faceitNickname = parts.pop() || parts.pop(); 
          // Clean query params just in case
          faceitNickname = faceitNickname.split('?')[0];
      }

      if(!faceitNickname) { toast.error("Enter a Username or Faceit URL first."); return; }

      const toastId = toast.loading(`Enriching data for ${faceitNickname}...`);

      try {
          // 2. Fetch via Proxy (Fixes "Failed to Fetch")
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://open.faceit.com/data/v4/players?nickname=${faceitNickname}`)}`;
          
          const res = await fetch(proxyUrl, {
              headers: { 'Authorization': 'Bearer a77d0763-5fdd-4bde-a8a5-6e840408de2e' } // Note: Header might be stripped by some proxies
          });
          
          const json = await res.json();
          // Safety Check for Proxy Response
          if (!json.contents) throw new Error("Proxy connection refused. Security Policy Block.");
          
          const data = JSON.parse(json.contents); // AllOrigins returns data in 'contents' string

          if(!data.player_id) throw new Error("Player not found on Faceit");
          
          // 3. Extract Data
          const realName = data.nickname;
          const newElo = data.games?.cs2?.faceit_elo || data.games?.csgo?.faceit_elo || 1000;
          const faceitUrl = data.faceit_url.replace('{lang}', 'en');
          const steamId64 = data.steam_id_64;
          const steamUrl = steamId64 ? `https://steamcommunity.com/profiles/${steamId64}` : member.steam;

          // 4. 🛡️ DATABASE CONFLICT CHECK
          // Check if this Faceit URL already exists in our DB
          const { data: existingUser } = await supabase
            .from('global_identities')
            .select('id')
            .eq('faceit_url', faceitUrl)
            .maybeSingle();

          const updated = [...members];
          updated[idx].username = realName; // Correct the name field
          updated[idx].elo = newElo;
          updated[idx].faceit = faceitUrl;
          updated[idx].steam = steamUrl;

          if (existingUser) {
              updated[idx].user_id = existingUser.id; // ✅ LINK EXISTING USER
              toast.success(`Linked existing profile: ${realName}`, { id: toastId, icon: '🔗' });
          } else {
              toast.success(`Found new player: ${realName}`, { id: toastId });
          }
          
          setMembers(updated);

      } catch(e) {
          console.error(e);
          // Fallback Alert
          if(e.message.includes("Proxy")) {
             toast.error("Security Block: Please update _headers or input manually.", { id: toastId });
          } else {
             toast.error(`Sync Error: ${e.message}`, { id: toastId });
          }
      }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('admin_upsert_team', {
          p_team_id: team?.id || null,
          p_name: meta.name, 
          p_logo_url: meta.logo_url, 
          p_region: meta.region,
          p_seed_number: parseInt(meta.seed_number), 
          p_access_code: meta.access_code,
          p_status: meta.status, 
          p_wins: parseInt(meta.wins), 
          p_losses: parseInt(meta.losses),
          p_voice_channel_url: meta.voice_channel_url,
          p_members: members 
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);

      toast.success("Roster Updated Successfully");
      onRefresh(); 
      onClose();
    } catch(e) { 
        console.error(e);
        if (e.message.includes('faceit_url_key')) {
            toast.error("DATABASE CONFLICT: One of these Faceit URLs is already used by another player.");
        } else {
            toast.error("Save Failed: " + e.message); 
        }
    } finally { 
        setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-panel border border-tactical w-full max-w-6xl rounded-lg flex flex-col max-h-[95vh] shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 bg-zinc-900/90 flex justify-between items-center">
           <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wider">
               EDIT UNIT: <span className="text-brand">{meta.name || 'NEW TEAM'}</span>
           </h2>
           <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
           
           {/* SECTION 1: TEAM DETAILS */}
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
                      <input value={meta.name} onChange={e=>setMeta({...meta, name:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-sm mb-2 focus:border-brand outline-none" placeholder="Team Name" />
                      <input value={meta.logo_url} onChange={e=>setMeta({...meta, logo_url:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-zinc-400 rounded text-xs focus:border-brand outline-none" placeholder="Logo URL" />
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
           <div className="bg-zinc-900/30 p-4 rounded border border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Status</label>
                  <select value={meta.status} onChange={e=>setMeta({...meta, status:e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-white rounded text-xs uppercase font-bold focus:border-brand outline-none">
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
           
           {/* SECTION 3: ROSTER EDITOR */}
           <div className="space-y-4 border-t border-zinc-800 pt-6">
              <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2"><Users size={14}/> Active Operators</h3>
                      <span className={cn(
                          "text-xs font-mono px-1.5 rounded font-bold", 
                          members.length < 5 ? 'text-red-500 bg-red-900/20' : members.length > 6 ? 'text-yellow-500 bg-yellow-900/20' : 'text-emerald-500 bg-emerald-900/20'
                      )}>
                          {members.length}/6
                      </span>
                  </div>
                  <button onClick={addMember} disabled={members.length >= 7} className="text-xs bg-brand hover:bg-brand-glow disabled:opacity-50 px-3 py-1.5 rounded text-white font-bold uppercase transition-colors shadow-lg">
                      {members.length >= 7 ? 'Max Limit' : '+ Add Operator'}
                  </button>
              </div>
              
              {members.length < 5 && <div className="text-[10px] text-red-500 flex items-center gap-1 mb-2 bg-red-900/10 p-2 rounded border border-red-900/30"><AlertTriangle size={10}/> Team needs at least 5 players to be eligible.</div>}

              <div className="flex gap-2 px-3 py-1 text-[9px] uppercase font-bold text-zinc-500">
                  <div className="w-32">Display Name / Paste URL</div>
                  <div className="w-24">Role</div>
                  <div className="w-24 text-center">ELO / Auto-Fill</div>
                  <div className="flex-1">Identity Links (Steam / Discord / Faceit)</div>
                  <div className="w-6"></div>
              </div>

              {members.map((m, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row gap-2 items-center bg-zinc-900/50 p-2 rounded border border-zinc-800 hover:border-zinc-600 transition-colors">
                    {/* INPUT: NAME / URL */}
                    <div className="w-full md:w-32 relative group">
                        <input 
                            value={m.username} 
                            onChange={e => updateMember(idx, 'username', e.target.value)} 
                            className="w-full bg-black border border-zinc-700 p-1.5 text-white rounded text-xs font-bold focus:border-brand outline-none" 
                            placeholder="Nick or URL..." 
                        />
                        {/* ⚡ THE MAGIC BUTTON (Visible on Hover) */}
                        <button 
                            onClick={() => handleSmartSync(idx)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-brand bg-zinc-900 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="Auto-Fill details from Faceit"
                        >
                            <RefreshCw size={10} />
                        </button>
                    </div>

                    <div className="w-full md:w-24">
                        <select value={m.role} onChange={e => updateMember(idx, 'role', e.target.value)} className="w-full bg-black border border-zinc-700 p-1.5 text-white rounded text-xs uppercase focus:border-brand outline-none">
                            <option value="CAPTAIN">CAPTAIN</option>
                            <option value="PLAYER">PLAYER</option>
                            <option value="SUBSTITUTE">SUBSTITUTE</option>
                        </select>
                    </div>

                    <div className="w-full md:w-24 flex gap-1">
                        <input type="number" value={m.elo} onChange={e => updateMember(idx, 'elo', e.target.value)} className="w-full bg-black border border-zinc-700 p-1.5 text-yellow-500 text-center rounded text-xs font-mono" placeholder="ELO" />
                        <button onClick={() => handleSmartSync(idx)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-1.5 rounded" title="Force Sync"><RefreshCw size={12}/></button>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-2 w-full">
                        <div className="relative"><Monitor className="absolute left-2 top-2 w-3 h-3 text-zinc-600"/><input value={m.steam} onChange={e => updateMember(idx, 'steam', e.target.value)} className="w-full bg-black border border-zinc-700 pl-7 p-1.5 text-zinc-300 rounded text-[10px] focus:border-blue-500 outline-none" placeholder="Steam URL" /></div>
                        <div className="relative"><Mic className="absolute left-2 top-2 w-3 h-3 text-zinc-600"/><input value={m.discord} onChange={e => updateMember(idx, 'discord', e.target.value)} className="w-full bg-black border border-zinc-700 pl-7 p-1.5 text-zinc-300 rounded text-[10px] focus:border-indigo-500 outline-none" placeholder="Discord" /></div>
                        <div className="relative"><Gamepad2 className="absolute left-2 top-2 w-3 h-3 text-zinc-600"/><input value={m.faceit} onChange={e => updateMember(idx, 'faceit', e.target.value)} className="w-full bg-black border border-zinc-700 pl-7 p-1.5 text-zinc-300 rounded text-[10px] focus:border-orange-500 outline-none" placeholder="Faceit URL" /></div>
                    </div>
                    
                    {/* Link Indicator */}
                    {m.user_id && <div className="text-emerald-500" title="Linked to Database ID"><LinkIcon size={12}/></div>}
                    
                    <button onClick={() => removeMember(idx)} className="text-zinc-600 hover:text-red-500 p-1.5 transition-colors" title="Remove"><Trash2 size={14}/></button>
                 </div>
              ))}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/90 rounded-b-lg">
           <button onClick={onClose} className="px-4 py-2 text-zinc-400 text-xs font-bold uppercase hover:text-white transition-colors">Cancel</button>
           <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-brand hover:bg-brand-glow text-white text-xs font-bold uppercase rounded shadow-lg transition-all disabled:opacity-50 disabled:cursor-wait">
              {saving ? 'Processing...' : 'Save Database Changes'}
           </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN VIEW ---
export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editTeam, setEditTeam] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    try {
        const { data: teamData } = await supabase.from('teams').select(`*, team_members(id, role, user_id)`).order('name');
        if(!teamData) { setTeams([]); return; }
        
        // Manual Join to avoid RLS complexity
        const allUserIds = teamData.flatMap(t => t.team_members.map(m => m.user_id)).filter(Boolean);
        const { data: profiles } = await supabase.from('global_identities').select('*').in('id', allUserIds);
        const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

        const formatted = teamData.map(t => {
            const members = t.team_members.map(tm => {
                const p = profileMap[tm.user_id] || {};
                return {
                    id: tm.id,
                    user_id: tm.user_id, // ✅ CRITICAL: Pass User ID to modal
                    role: tm.role,
                    username: p.display_name || 'Unknown Operator',
                    discord_handle: p.discord_handle,
                    steam_url: p.steam_url,
                    faceit_url: p.faceit_url,
                    faceit_elo: p.faceit_elo || 0
                };
            }).sort((a,b)=>getRoleWeight(a.role)-getRoleWeight(b.role));
            
            const elos = members.map(m => m.faceit_elo).filter(e => e > 0);
            const avg = elos.length ? Math.round(elos.reduce((a,b)=>a+b,0)/elos.length) : 0;
            return { ...t, members, avg_elo: avg };
        });
        setTeams(formatted);
        setLoading(false);
    } catch(e) { console.error(e); setLoading(false); }
  };

  const handleGenCodes = async () => {
    if(!window.confirm("Generate new access codes for teams missing them?")) return;
    setGenerating(true);
    for(const t of teams.filter(t => !t.access_code)) { 
        await supabase.from('teams').update({ access_code: generateAccessCode(t.name) }).eq('id', t.id); 
    }
    await fetchTeams(); 
    setGenerating(false);
    toast.success("Codes Generated");
  }

  useEffect(() => { 
      fetchTeams(); 
      const interval = setInterval(fetchTeams, 3 * 60 * 60 * 1000); 
      return () => clearInterval(interval);
  }, []);

  const filtered = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalP = teams.reduce((acc, t) => acc + t.members.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in p-6">
       {/* Top Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Teams" value={teams.length} icon={Shield} color="text-white" />
          <StatsCard title="Active Operators" value={totalP} icon={Users} color="text-brand-glow" />
          <StatsCard title="Combat Ready" value={teams.filter(t=>t.members.length>=5).length} icon={CheckCircle} color="text-emerald-500" />
       </div>

       {/* Toolbar */}
       <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-4">
          <div>
              <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">
                  ROSTER <span className="text-brand">COMMAND</span>
              </h1>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">Database Administration // V3.1</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={handleGenCodes} disabled={generating} className="px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 rounded text-xs font-bold uppercase flex items-center gap-2 transition-colors">
                {generating ? <RefreshCw className="animate-spin w-3 h-3"/> : <Key size={14}/>} Gen Codes
             </button>
             
             <button onClick={() => setEditTeam({})} className="px-4 py-2 bg-brand hover:bg-brand-glow text-white rounded text-xs font-bold uppercase shadow-lg shadow-brand/20 transition-all flex items-center gap-2">
                <Edit3 size={14} /> New Team
             </button>
             
             <button onClick={fetchTeams} className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"><RefreshCw size={16}/></button>
             
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="FIND UNIT..." 
                    className="bg-black border border-zinc-800 text-white pl-9 pr-3 py-2 rounded text-xs font-mono focus:border-brand outline-none w-64 uppercase placeholder:text-zinc-700" 
                    onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
       </div>
       
       {/* Grid */}
       {loading ? (
           <div className="flex items-center justify-center py-20 text-zinc-500 font-mono animate-pulse">LOADING ROSTER DATA...</div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
              {filtered.map(t => <TeamCard key={t.id} team={t} onEdit={setEditTeam} />)}
           </div>
       )}
       
       {/* Modal */}
       {editTeam !== undefined && <EditTeamModal team={editTeam} onClose={() => setEditTeam(undefined)} onRefresh={fetchTeams} />}
    </div>
  );
};
export default TeamRosterView;
