/**
 * PIXEL PALACE: OPERATOR DASHBOARD
 * VERSION: 5.0.0 (MASTER HYBRID)
 * STATUS: SECURED
 * FEATURES:
 * 1. REAL-TIME INTEL: Instant match updates via Supabase Realtime.
 * 2. SQUAD MANAGEMENT: View roster status and profile links.
 * 3. IDENTITY CONTROL: Update Steam/Faceit IDs directly from the HUD.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNexusStore } from '../../store/useNexusStore';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Swords, LogOut, CheckCircle, Trophy, RefreshCw, Activity, 
  BookOpen, User, Save, Monitor, Gamepad2, Mic, Map as MapIcon, AlertTriangle 
} from 'lucide-react';
import { normalizeRole } from '../../lib/roles';
import { MatchModal } from '../MatchModal'; 
import { NexusManual } from '../guide/NexusManual'; 
import { BracketView } from '../BracketView'; 
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

// --- SUB-COMPONENT: PROFILE EDITOR ---
const ProfileEditor = ({ onClose }) => {
    const { profile, uid } = useNexusStore();
    const [form, setForm] = useState({
        display_name: profile?.display_name || '',
        steam_url: profile?.steam_url || '',
        faceit_url: profile?.faceit_url || '',
        discord_handle: profile?.discord_handle || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.from('global_identities').upsert({
                id: uid,
                ...form,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            toast.success("Identity Record Updated");
            onClose();
        } catch (e) {
            toast.error("Update Failed: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-sm space-y-4 animate-in fade-in">
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Edit Credentials</h3>
            <div className="space-y-3">
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Callsign</label>
                    <div className="flex items-center bg-black border border-white/10 rounded px-3 py-2">
                        <User size={14} className="text-zinc-500 mr-2"/>
                        <input value={form.display_name} onChange={e=>setForm({...form, display_name:e.target.value})} className="bg-transparent text-xs text-white w-full outline-none" placeholder="Operator Name"/>
                    </div>
                </div>
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Steam Link</label>
                    <div className="flex items-center bg-black border border-white/10 rounded px-3 py-2">
                        <Monitor size={14} className="text-blue-500 mr-2"/>
                        <input value={form.steam_url} onChange={e=>setForm({...form, steam_url:e.target.value})} className="bg-transparent text-xs text-white w-full outline-none" placeholder="https://steamcommunity.com/id/..."/>
                    </div>
                </div>
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Discord Tag</label>
                    <div className="flex items-center bg-black border border-white/10 rounded px-3 py-2">
                        <Mic size={14} className="text-indigo-500 mr-2"/>
                        <input value={form.discord_handle} onChange={e=>setForm({...form, discord_handle:e.target.value})} className="bg-transparent text-xs text-white w-full outline-none" placeholder="user#1234"/>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} className="px-3 py-2 text-[10px] font-bold uppercase text-zinc-500 hover:text-white">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand text-white text-[10px] font-bold uppercase rounded hover:bg-brand-glow transition-all flex items-center gap-2">
                    {saving ? <RefreshCw className="animate-spin w-3 h-3"/> : <Save className="w-3 h-3"/>} Save
                </button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: TEAMMATE ROW ---
const SocialBadge = ({ icon: Icon, link, color, label }) => {
    if (!link) return null;
    return (
        <a href={link} target="_blank" rel="noreferrer" className={`p-1.5 rounded-full bg-zinc-900 border border-zinc-800 ${color} hover:text-white transition-colors`} title={label}>
            <Icon size={12} />
        </a>
    );
};

const TeammateRow = ({ member }) => (
    <div className="flex items-center justify-between p-4 bg-black/40 rounded border border-white/5 hover:border-brand/30 transition-all group">
        <div className="flex items-center gap-3">
            <div className={cn(
                "w-10 h-10 rounded flex items-center justify-center text-sm font-black uppercase",
                member.role === 'captain' ? 'bg-fuchsia-900/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            )}>
                {member.username.substring(0, 1)}
            </div>
            <div>
                <div className="text-sm font-bold text-white leading-none flex items-center gap-2">
                    {member.username}
                    {!member.user_id && <span className="text-[8px] bg-zinc-800 text-zinc-500 px-1 rounded uppercase font-mono">Ghost</span>}
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono mt-1">{member.role}</div>
            </div>
        </div>
        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <SocialBadge icon={Monitor} link={member.steam_url} color="text-blue-400 hover:bg-blue-600" label="Steam" />
            <SocialBadge icon={Gamepad2} link={member.faceit_url} color="text-orange-500 hover:bg-orange-600" label="Faceit" />
            <SocialBadge icon={Mic} link={member.discord_handle ? `https://discord.com/users/${member.discord_handle}` : null} color="text-indigo-400 hover:bg-indigo-600" label="Discord" />
        </div>
    </div>
);

// --- MAIN COMPONENT ---
export const PlayerDashboard = () => {
  const { profile, uid, clearNexus } = useNexusStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('OVERVIEW'); 
  const [activeMatch, setActiveMatch] = useState(null);
  const [myTeam, setMyTeam] = useState(null); // Added for Roster Tab
  const [loading, setLoading] = useState(true);
  const [isMatchModalOpen, setMatchModalOpen] = useState(false);
  const [showManual, setShowManual] = useState(false); // 📘 MANUAL
  const [showProfile, setShowProfile] = useState(false);

  // 1. IDENTITY RESOLUTION
  const teamId = useMemo(() => profile?.team_id, [profile]);
  const userRole = useMemo(() => normalizeRole(profile?.role), [profile]);
  const displayName = profile?.display_name || 'Unknown Operator';

  // 2. DATA UPLINK
  const fetchData = useCallback(async () => {
    if (!teamId) {
        setLoading(false);
        return;
    }
    
    try {
      // A. Fetch Match
      const { data: match } = await supabase
        .from('matches')
        .select(`*, team1:team1_id(name, logo_path), team2:team2_id(name, logo_path)`)
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .in('status', ['scheduled', 'veto', 'live', 'disputed']) 
        .order('scheduled_at', { ascending: true }) 
        .limit(1)
        .maybeSingle();

      setActiveMatch(match);

      // B. Fetch Team Roster (Only needed if viewing roster tab, but fetching here for simplicity)
      const { data: teamData } = await supabase
        .from('teams')
        .select(`*, team_members(id, role, user_id, global_identities(display_name, steam_url, faceit_url, discord_handle))`)
        .eq('id', teamId)
        .single();

      if (teamData) {
          const formattedMembers = (teamData.team_members || []).map(m => ({
              id: m.id,
              user_id: m.user_id,
              username: m.global_identities?.display_name || 'Unknown Operator',
              role: m.role,
              steam_url: m.global_identities?.steam_url,
              faceit_url: m.global_identities?.faceit_url,
              discord_handle: m.global_identities?.discord_handle,
          })).sort((a,b) => a.role === 'captain' ? -1 : 1);
          setMyTeam({ ...teamData, members: formattedMembers });
      }

    } catch (err) {
      console.error("Nexus Linkage Error:", err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // 3. REAL-TIME SUBSCRIPTION
  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel(`player_dashboard_${teamId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `team1_id=eq.${teamId}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `team2_id=eq.${teamId}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [teamId, fetchData]);

  const handleLogout = async () => {
    clearNexus();
    navigate('/login');
  };

  if (loading) return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col gap-6">
          <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin shadow-neon"></div>
          <div className="text-zinc-600 animate-pulse font-mono uppercase tracking-[0.5em] text-[10px]">Neural Link Establishing...</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
      {/* ATMOSPHERIC BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* TOP COMMAND BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-12">
            <div>
              <h1 className="text-5xl font-display font-black italic uppercase tracking-tighter leading-none">
                  OPERATOR <span className="text-brand">CORE</span>
              </h1>
              <div className="flex items-center gap-4 mt-4">
                 <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-sm border border-white/5 backdrop-blur-md">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-widest">
                       Uplink: <span className="text-white">{displayName}</span>
                    </span>
                 </div>
                 <button onClick={() => setShowManual(true)} className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all">
                    <BookOpen size={12}/> Field Manual
                 </button>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={fetchData} className="p-4 bg-zinc-900/50 hover:bg-zinc-800 rounded-sm border border-white/5 text-zinc-500 hover:text-white transition-all">
                  <RefreshCw size={20} className={cn(loading && "animate-spin")} />
              </button>
              <button onClick={handleLogout} className="p-4 bg-zinc-900/50 hover:bg-red-950/30 rounded-sm border border-white/5 text-zinc-500 hover:text-red-500 transition-all">
                  <LogOut size={20} />
              </button>
            </div>
        </div>

        {/* DASHBOARD CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: ACTIVE MISSION (2/3 Width) */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* NAVIGATION TABS */}
                <div className="flex gap-1 bg-zinc-900/30 p-1 rounded-sm border border-white/5 mb-6">
                    {['OVERVIEW', 'BRACKET', 'ROSTER'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm",
                                activeTab === tab ? "bg-brand text-white shadow-neon" : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* === TAB VIEW: OVERVIEW === */}
                {activeTab === 'OVERVIEW' && (
                    <div className={cn(
                        "relative rounded-sm border transition-all duration-700 overflow-hidden",
                        activeMatch ? "bg-bg-panel border-brand/30 shadow-neon" : "bg-zinc-900/20 border-white/5"
                    )}>
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-brand/20" />
                        
                        {activeMatch ? (
                        <div className="p-10 animate-in slide-in-from-bottom-4 duration-1000">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-3">
                                    <Swords className="text-brand" size={24} />
                                    <h2 className="text-2xl font-display font-black uppercase italic text-white tracking-tighter">Combat Protocol Active</h2>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-brand text-white text-[10px] font-black uppercase tracking-widest italic">
                                    {activeMatch.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center bg-black/40 border border-white/5 rounded-sm p-12 relative group cursor-pointer hover:border-brand/40 transition-all" onClick={() => setMatchModalOpen(true)}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5">
                                        <img src={activeMatch.team1?.logo_path} className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all" alt="" />
                                    </div>
                                    <span className="text-xl font-display font-black uppercase italic text-white">{activeMatch.team1?.name}</span>
                                </div>
                                
                                <div className="text-center">
                                    <span className="text-5xl font-display font-black text-zinc-800 italic select-none">VS</span>
                                    <div className="mt-4 text-[9px] text-zinc-600 font-black tracking-[0.3em] uppercase">{activeMatch.map_name || 'Awaiting Veto'}</div>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5">
                                        <img src={activeMatch.team2?.logo_path} className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all" alt="" />
                                    </div>
                                    <span className="text-xl font-display font-black uppercase italic text-white">{activeMatch.team2?.name}</span>
                                </div>
                            </div>

                            <button 
                                className="w-full py-6 mt-8 bg-brand hover:bg-brand-glow text-white font-black uppercase italic tracking-[0.4em] rounded-sm transition-all shadow-lg shadow-brand/20"
                                onClick={() => setMatchModalOpen(true)}
                            >
                                Engage Combat Zone
                            </button>
                        </div>
                        ) : (
                        <div className="p-20 text-center">
                            <Activity className="w-16 h-16 text-zinc-800 mx-auto mb-6 animate-pulse" />
                            <h3 className="text-3xl font-display font-black uppercase italic text-white">Standby...</h3>
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Awaiting Signal from High Command</p>
                        </div>
                        )}
                    </div>
                )}

                {/* === TAB VIEW: BRACKET === */}
                {activeTab === 'BRACKET' && (
                    <div className="h-[600px] border border-zinc-800 rounded-sm overflow-hidden bg-black animate-in fade-in">
                        <BracketView />
                    </div>
                )}

                {/* === TAB VIEW: ROSTER === */}
                {activeTab === 'ROSTER' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                        {myTeam?.members?.map(member => (
                            <TeammateRow key={member.id} member={member} />
                        ))}
                        {(!myTeam?.members || myTeam.members.length === 0) && (
                            <div className="col-span-2 text-center p-12 text-zinc-500 font-mono text-xs uppercase border border-dashed border-zinc-800 rounded-sm">
                                <AlertTriangle className="mx-auto mb-4 w-8 h-8 opacity-50"/>
                                Roster Data Unavailable
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: TACTICAL FEED */}
            <div className="space-y-6">
                
                {/* PROFILE CARD */}
                <div className="bg-bg-panel border border-white/5 p-8 rounded-sm">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <Shield className="text-brand" size={18} />
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Unit Security</h3>
                       </div>
                       <button onClick={() => setShowProfile(!showProfile)} className="text-[9px] font-bold text-zinc-600 hover:text-white uppercase transition-colors">
                           {showProfile ? "Close" : "Edit"}
                       </button>
                    </div>
                    
                    {showProfile ? (
                        <ProfileEditor onClose={() => setShowProfile(false)} />
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-emerald-500">
                               <CheckCircle size={14} />
                               <span className="text-[10px] font-black uppercase tracking-wider">Neural Link Valid</span>
                            </div>
                            <p className="text-[10px] text-zinc-600 leading-relaxed uppercase font-mono">
                               Identity confirmed as <span className="text-white">{userRole}</span>. All tactical actions are audited under UID: {uid?.slice(0,8)}.
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-bg-panel border border-white/5 p-8 rounded-sm">
                    <div className="flex items-center gap-3 mb-6">
                       <Trophy className="text-brand" size={18} />
                       <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Match Intel</h3>
                    </div>
                    <p className="text-[10px] text-zinc-600 leading-relaxed uppercase font-mono italic">
                       Ensure your Steam ID matches the registration record before entering the server to avoid automated kick protocols.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <MatchModal 
        match={activeMatch} 
        isOpen={isMatchModalOpen} 
        onClose={() => setMatchModalOpen(false)} 
      />

      <NexusManual 
        role={userRole} 
        isOpen={showManual} 
        onClose={() => setShowManual(false)} 
      />
    </div>
  );
};
