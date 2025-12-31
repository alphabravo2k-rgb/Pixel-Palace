import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Search, RefreshCw, Shield, Crown, Pin, 
  ArrowUpRight, Minus, AlertTriangle, Users,
  Edit3, Save, X, Trash2, Plus, Link as LinkIcon
} from 'lucide-react';

// --- ASSETS & HELPERS ---
const Icons = {
  Faceit: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 2.6l-1.9-.3c-2.9-.4-5.2.3-6.8 1.9-.3.3-.6.6-.9 1L12.9 2h-1L10.3 3.6 2.6 13.9l.6 2.2 1.9.6 1.9-2.6.3-.3.3-.6c1.6-3.2 4.5-4.5 7.4-4.2l3.6.3 3.5-3.6 1.9-3.1zM2.6 21.4l1.9.3c2.9.4 5.2-.3 6.8-1.9.3-.3.6-.6.9-1L13.7 17h1l1.6-1.6 7.7-10.3-.6-2.2-1.9-.6-1.9 2.6-.3.3-.3.6c-1.6 3.2-4.5 4.5-7.4 4.2l-3.6-.3L4.5 13.3 2.6 16.4v5z" />
    </svg>
  ),
  Steam: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.979 0C5.66 0 .473 4.904.035 11.12l4.477 6.577 3.32-1.38c.75.526 1.642.85 2.61.88l1.64 4.793c.123.007.245.01.37.01 6.627 0 12-5.373 12-12S19.105 0 11.979 0zm.066 3.99c2.56 0 4.636 2.076 4.636 4.637 0 2.56-2.076 4.637-4.636 4.637-2.56 0-4.637-2.077-4.637-4.637 0-2.56 2.077-4.637 4.637-4.637zm-2.922 8.78c-.76.012-1.48.196-2.12.513l-3.32-1.325c-.29-.115-.595-.195-.913-.23.23-.01.46-.017.693-.017 1.83 0 3.51.64 4.866 1.71-.383-.236-.787-.43-1.206-.59V12.77zm1.87 3.21c-.37-.02-.733-.09-1.08-.205l-1.61 4.707c-.432-.132-.843-.302-1.23-.507l1.71-4.996c.66.425 1.433.682 2.27.682.022 0 .044-.002.066-.002l-.127.32z"/>
    </svg>
  ),
  Discord: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  )
};

const SocialLink = ({ href, type }) => {
  const Icon = Icons[type];
  if (!href) return <div className="p-1 opacity-20"><Icon className="w-3 h-3 grayscale" /></div>;
  const colors = type === 'Faceit' ? 'text-[#ff5500]' : type === 'Steam' ? 'text-blue-400' : 'text-[#5865F2]';
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`p-1 ${colors} hover:scale-110 transition-transform`} onClick={e => e.stopPropagation()}>
      <Icon className="w-3 h-3" />
    </a>
  );
};

const ROLE_WEIGHT = { 'CAPTAIN': 1, 'PLAYER': 2, 'SUBSTITUTE': 3 };
const getRoleWeight = (role) => ROLE_WEIGHT[role?.toUpperCase()] || 99;

// --- EDIT MODAL COMPONENT ---
const EditTeamModal = ({ team, onClose, onRefresh }) => {
  const [members, setMembers] = useState(team.members);
  const [saving, setSaving] = useState(false);

  // Add a blank player to the local state
  const handleAddPlayer = () => {
    const newMember = {
        id: `temp-${Date.now()}`, // Temporary ID
        isNew: true, // Flag for save logic
        role: 'PLAYER',
        username: 'New Operator',
        steam_url: '',
        faceit_url: '',
        discord: '',
        elo: 1000
    };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id, field, value) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleDelete = async (memberId, isNew) => {
    if (isNew) {
        // Just remove from state if it hasn't been saved yet
        setMembers(prev => prev.filter(m => m.id !== memberId));
        return;
    }
    if(!window.confirm("Are you sure you want to remove this player?")) return;
    try {
      await supabase.from('team_members').delete().eq('id', memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      alert("Failed to delete player");
    }
  };

  // Save All Changes to Supabase
  const handleSave = async () => {
    setSaving(true);
    try {
      for (const m of members) {
        if (m.isNew) {
            // --- INSERT LOGIC FOR NEW PLAYERS ---
            // 1. Create Identity
            const { data: identityData, error: identityError } = await supabase
                .from('global_identities')
                .insert({
                    display_name: m.username,
                    steam_url: m.steam_url || null,
                    faceit_url: m.faceit_url || null,
                    discord_handle: m.discord || null,
                    faceit_elo: 1000 // Default ELO
                })
                .select('id')
                .single();
            
            if (identityError) throw identityError;

            // 2. Link to Team
            const { error: linkError } = await supabase
                .from('team_members')
                .insert({
                    team_id: team.id,
                    global_id: identityData.id,
                    role: m.role
                });
            
            if (linkError) throw linkError;

        } else {
            // --- UPDATE LOGIC FOR EXISTING PLAYERS ---
            // Update Role
            await supabase
              .from('team_members')
              .update({ role: m.role })
              .eq('id', m.id);

            // Update Links
            await supabase
              .from('global_identities')
              .update({
                display_name: m.username,
                steam_url: m.steam_url || null,
                faceit_url: m.faceit_url || null,
                discord_handle: m.discord || null
              })
              .eq('id', m.global_id);
        }
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save changes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b0c0f] border border-zinc-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded border border-zinc-700 overflow-hidden p-1">
                {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain"/> : <Shield className="w-full h-full text-zinc-700"/>}
             </div>
             <div>
               <h2 className="text-xl font-bold text-white uppercase italic tracking-tighter">{team.name}</h2>
               <span className="text-xs text-zinc-500 font-mono">MANAGE ROSTER</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400"><X size={20}/></button>
        </div>

        {/* Scrollable List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {members.sort((a,b) => getRoleWeight(a.role) - getRoleWeight(b.role)).map(m => (
            <div key={m.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded border transition-colors ${m.isNew ? 'bg-fuchsia-900/10 border-fuchsia-500/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'}`}>
              
              {/* Identity */}
              <div className="col-span-3">
                <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={m.username} 
                  onChange={(e) => updateMember(m.id, 'username', e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:border-fuchsia-500 outline-none"
                />
              </div>

              {/* Role Selector */}
              <div className="col-span-2">
                <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Role</label>
                <select 
                  value={m.role}
                  onChange={(e) => updateMember(m.id, 'role', e.target.value)}
                  className={`w-full text-xs font-bold px-2 py-1.5 rounded border outline-none appearance-none cursor-pointer ${
                    m.role === 'CAPTAIN' ? 'bg-fuchsia-900/30 text-fuchsia-400 border-fuchsia-500/50' : 
                    m.role === 'SUBSTITUTE' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-500/50' : 
                    'bg-zinc-800 text-zinc-300 border-zinc-600'
                  }`}
                >
                  <option value="CAPTAIN">CAPTAIN</option>
                  <option value="PLAYER">PLAYER</option>
                  <option value="SUBSTITUTE">SUBSTITUTE</option>
                </select>
              </div>

              {/* Links */}
              <div className="col-span-6 grid grid-cols-3 gap-2">
                <div>
                   <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Steam URL</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        value={m.steam_url || ''} 
                        onChange={(e) => updateMember(m.id, 'steam_url', e.target.value)}
                        placeholder="None"
                        className="w-full bg-black border border-zinc-700 rounded pl-6 pr-2 py-1 text-[10px] text-zinc-300 focus:border-blue-500 outline-none"
                      />
                      <Icons.Steam className="absolute left-1.5 top-1.5 w-3 h-3 text-zinc-600" />
                   </div>
                </div>
                <div>
                   <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Faceit URL</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        value={m.faceit_url || ''} 
                        onChange={(e) => updateMember(m.id, 'faceit_url', e.target.value)}
                        placeholder="None"
                        className="w-full bg-black border border-zinc-700 rounded pl-6 pr-2 py-1 text-[10px] text-zinc-300 focus:border-[#ff5500] outline-none"
                      />
                      <Icons.Faceit className="absolute left-1.5 top-1.5 w-3 h-3 text-zinc-600" />
                   </div>
                </div>
                <div>
                   <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Discord</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        value={m.discord || ''} 
                        onChange={(e) => updateMember(m.id, 'discord', e.target.value)}
                        placeholder="None"
                        className="w-full bg-black border border-zinc-700 rounded pl-6 pr-2 py-1 text-[10px] text-zinc-300 focus:border-[#5865F2] outline-none"
                      />
                      <Icons.Discord className="absolute left-1.5 top-1.5 w-3 h-3 text-zinc-600" />
                   </div>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end items-end h-full pb-1">
                 <button 
                  onClick={() => handleDelete(m.id, m.isNew)}
                  title="Remove Player"
                  className="p-1.5 bg-red-900/20 text-red-500 hover:bg-red-900/50 rounded border border-red-900/30 transition-colors"
                 >
                   <Trash2 size={14} />
                 </button>
              </div>
            </div>
          ))}

          {/* ACTIVE ADD PLAYER BUTTON */}
          <button 
            onClick={handleAddPlayer}
            className="w-full p-4 border border-dashed border-zinc-700 hover:border-fuchsia-500 hover:bg-fuchsia-900/10 rounded flex items-center justify-center text-zinc-500 hover:text-fuchsia-400 text-xs uppercase tracking-widest transition-all"
          >
            <Plus size={14} className="mr-2"/> ADD NEW OPERATOR
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
           <div className="text-xs text-zinc-500">
             Changes are applied immediately to the database upon save.
           </div>
           <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase text-zinc-400 hover:text-white transition-colors">Cancel</button>
             <button 
               onClick={handleSave} 
               disabled={saving}
               className="flex items-center gap-2 px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50"
             >
               {saving ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
               {saving ? 'Saving...' : 'Save Roster'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN ROSTER CARD COMPONENT ---
const TeamCard = ({ team, onEdit }) => {
  const playerCount = team.members.length;
  // Determine border color based on validity
  let statusColor = "border-zinc-800 hover:border-zinc-600";
  if (playerCount < 5) statusColor = "border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.15)]";
  else if (playerCount > 6) statusColor = "border-yellow-600/50";

  return (
    <div className={`group relative bg-[#0b0c0f] border ${statusColor} flex flex-col h-full overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-zinc-900 to-black border-b border-white/5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded border border-zinc-800 flex items-center justify-center p-1">
            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain"/> : <Shield className="w-4 h-4 text-zinc-700"/>}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase italic tracking-tighter truncate max-w-[100px]">{team.name}</h3>
            <span className="text-[9px] text-zinc-500 font-mono tracking-widest">{team.seed_number ? `SEED #${team.seed_number}` : 'UNRANKED'}</span>
          </div>
        </div>
        <button 
          onClick={() => onEdit(team)}
          className="p-1.5 bg-zinc-800 hover:bg-fuchsia-600 text-zinc-400 hover:text-white rounded transition-colors"
          title="Edit Roster"
        >
          <Edit3 size={12} />
        </button>
      </div>

      {/* Players List (Compact View) */}
      <div className="flex-grow bg-zinc-900/20 p-1 space-y-px">
        {team.members.slice(0, 7).map((m, idx) => {
           const normalizedRole = m.role?.toUpperCase() || 'PLAYER';
           const isCap = normalizedRole === 'CAPTAIN';
           const isSub = normalizedRole === 'SUBSTITUTE' || (idx >= 5 && !isCap);
           
           return (
             <div key={m.id} className={`flex items-center justify-between px-3 py-1.5 ${isSub ? 'opacity-60 bg-black/20' : ''}`}>
               <div className="flex items-center gap-2">
                 {isCap ? <Crown size={10} className="text-fuchsia-500"/> : <div className={`w-1 h-1 rounded-full ${isSub ? 'bg-yellow-500' : 'bg-zinc-600'}`}/>}
                 <span className={`text-[10px] font-medium truncate w-24 ${isCap ? 'text-white' : 'text-zinc-400'}`}>{m.username}</span>
               </div>
               <div className="flex gap-1">
                 <SocialLink href={m.steam_url} type="Steam"/>
                 <SocialLink href={m.faceit_url} type="Faceit"/>
               </div>
             </div>
           );
        })}
      </div>
      
      {/* Footer Status */}
      <div className={`px-2 py-1 text-[9px] font-mono text-center uppercase font-bold ${playerCount < 5 ? 'bg-red-900/30 text-red-500' : 'bg-zinc-950 text-zinc-600'}`}>
         {playerCount} Operators / {playerCount < 5 ? 'INCOMPLETE' : 'READY'}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export const TeamRosterView = () => {
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id, name, logo_url, region, seed_number,
          team_members (
            id, role,
            global_identities (id, display_name, discord_handle, steam_url, faceit_url, faceit_elo, discord_id)
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      // Format & Sort
      const formatted = data.map(team => ({
        ...team,
        members: team.team_members.map(tm => ({
          id: tm.id,
          global_id: tm.global_identities?.id,
          role: tm.role?.toUpperCase() || 'PLAYER',
          username: tm.global_identities?.display_name || 'Unknown',
          discord: tm.global_identities?.discord_handle,
          steam_url: tm.global_identities?.steam_url,
          faceit_url: tm.global_identities?.faceit_url,
          elo: tm.global_identities?.faceit_elo || 0
        })).sort((a, b) => getRoleWeight(a.role) - getRoleWeight(b.role))
      }));
      setTeams(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
         <div>
            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">ROSTER <span className="text-fuchsia-500">COMMAND</span></h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest">Database Editor // Admin Clearance Only</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
               <input 
                 type="text" 
                 placeholder="SEARCH UNIT..." 
                 className="bg-black border border-zinc-800 text-white pl-8 pr-3 py-1.5 rounded text-xs font-mono w-48 focus:border-fuchsia-500 outline-none transition-all"
                 onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
            <button onClick={fetchTeams} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"><RefreshCw size={14}/></button>
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredTeams.map(team => (
          <TeamCard key={team.id} team={team} onEdit={setEditingTeam} />
        ))}
      </div>

      {/* Editor Modal */}
      {editingTeam && (
        <EditTeamModal 
          team={editingTeam} 
          onClose={() => setEditingTeam(null)} 
          onRefresh={fetchTeams} 
        />
      )}
    </div>
  );
};
