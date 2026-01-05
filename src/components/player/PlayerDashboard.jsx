import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from '../../auth/useSession';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
    Shield, Swords, Clock, LogOut, CheckCircle, Trophy, RefreshCw, 
    Users, Map as MapIcon, Mic, Monitor, Gamepad2, Calendar, 
    AlertTriangle, User, Save, Link as LinkIcon, Globe
} from 'lucide-react';
import { MatchModal } from '../MatchModal'; 
import { BracketView } from '../BracketView'; 
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

// --- HELPER: HAMMER TIME (Automatic Local Timezone) ---
const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const formatMatchTime = (isoString) => {
    if (!isoString) return 'TBD';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(undefined, {
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    }).format(date);
};

// --- SUB-COMPONENT: PLAYER PROFILE EDITOR ---
const PlayerProfileEditor = ({ identity, onUpdate }) => {
    // Local state for form inputs
    const [form, setForm] = useState({
        display_name: identity?.display_name || '',
        discord_handle: identity?.discord_handle || '',
        steam_url: identity?.steam_url || '',
        faceit_url: identity?.faceit_url || ''
    });
    const [saving, setSaving] = useState(false);

    // Update form when identity prop changes (e.g. initial load)
    useEffect(() => {
        if (identity) {
            setForm({
                display_name: identity.display_name || '',
                discord_handle: identity.discord_handle || '',
                steam_url: identity.steam_url || '',
                faceit_url: identity.faceit_url || ''
            });
        }
    }, [identity]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('global_identities')
                .update({
                    display_name: form.display_name,
                    discord_handle: form.discord_handle,
                    steam_url: form.steam_url,
                    faceit_url: form.faceit_url
                })
                .eq('id', identity.id);

            if (error) throw error;
            toast.success("Profile Updated");
            onUpdate(); // Refresh parent
        } catch (e) {
            toast.error("Update Failed: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-[#0b0c0f] border border-zinc-800 rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div className="w-16 h-16 bg-fuchsia-900/10 rounded-full flex items-center justify-center border border-fuchsia-500/20">
                    <User className="w-8 h-8 text-fuchsia-500" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-black text-white uppercase italic">Operator Profile</h2>
                    <p className="text-xs text-zinc-500 font-mono">ID: {identity?.id?.split('-')[0]}...</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="group">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block group-focus-within:text-fuchsia-500 transition-colors">Display Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                        <input 
                            value={form.display_name} 
                            onChange={e => setForm({...form, display_name: e.target.value})} 
                            className="w-full bg-black border border-zinc-800 rounded pl-10 pr-4 py-2 text-white text-sm focus:border-fuchsia-500 outline-none transition-all"
                            placeholder="Your In-Game Name"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block group-focus-within:text-[#5865F2] transition-colors">Discord</label>
                        <div className="relative">
                            <Mic className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                            <input 
                                value={form.discord_handle} 
                                onChange={e => setForm({...form, discord_handle: e.target.value})} 
                                className="w-full bg-black border border-zinc-800 rounded pl-10 pr-4 py-2 text-white text-sm focus:border-[#5865F2] outline-none transition-all"
                                placeholder="user#1234"
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block group-focus-within:text-blue-500 transition-colors">Steam URL</label>
                        <div className="relative">
                            <Monitor className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                            <input 
                                value={form.steam_url} 
                                onChange={e => setForm({...form, steam_url: e.target.value})} 
                                className="w-full bg-black border border-zinc-800 rounded pl-10 pr-4 py-2 text-white text-sm focus:border-blue-500 outline-none transition-all"
                                placeholder="https://steamcommunity.com/id/..."
                            />
                        </div>
                    </div>
                    <div className="group md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block group-focus-within:text-orange-500 transition-colors">Faceit URL</label>
                        <div className="relative">
                            <Gamepad2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                            <input 
                                value={form.faceit_url} 
                                onChange={e => setForm({...form, faceit_url: e.target.value})} 
                                className="w-full bg-black border border-zinc-800 rounded pl-10 pr-4 py-2 text-white text-sm focus:border-orange-500 outline-none transition-all"
                                placeholder="https://faceit.com/players/..."
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase text-xs rounded flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Profile
                    </button>
                </div>
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
    <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5 hover:border-white/10 transition-all">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-black uppercase ${member.role === 'captain' ? 'bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                {member.username.substring(0, 1)}
            </div>
            <div>
                <div className="text-sm font-bold text-white leading-none">{member.username}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono mt-1">{member.role}</div>
            </div>
        </div>
        <div className="flex gap-1">
            <SocialBadge icon={Monitor} link={member.steam_url} color="text-blue-400 hover:bg-blue-600" label="Steam" />
            <SocialBadge icon={Gamepad2} link={member.faceit_url} color="text-orange-500 hover:bg-orange-600" label="Faceit" />
            <SocialBadge icon={Mic} link={member.discord_handle ? `https://discord.com/users/${member.discord_handle}` : null} color="text-indigo-400 hover:bg-indigo-600" label="Discord" />
        </div>
    </div>
);

// --- MAIN DASHBOARD ---
export const PlayerDashboard = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('OVERVIEW'); 
  const [myTeam, setMyTeam] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMatchModalOpen, setMatchModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false); 

  // 1. Identity Logic (Simplified to avoid loops)
  const teamId = session?.identity?.team_id || session?.team_id || session?.user?.user_metadata?.team_id;
  const currentUserId = session?.identity?.id || session?.user?.id;

  // 2. Data Fetching
  const fetchData = useCallback(async () => {
    if (!teamId) { setLoading(false); return; }
    
    try {
      // A. Fetch Team & Roster
      const { data: teamData } = await supabase
        .from('teams')
        .select(`
            *, 
            team_members (
                id, role, user_id,
                global_identities (id, display_name, steam_url, faceit_url, discord_handle)
            )
        `)
        .eq('id', teamId)
        .single();

      if (teamData) {
          const formattedMembers = (teamData.team_members || []).map(m => ({
              id: m.id,
              user_id: m.user_id, // Important for Profile Tab
              username: m.global_identities?.display_name || 'Unknown Operator',
              role: m.role,
              steam_url: m.global_identities?.steam_url,
              faceit_url: m.global_identities?.faceit_url,
              discord_handle: m.global_identities?.discord_handle,
              profile_data: m.global_identities // Pass full object for editor
          })).sort((a,b) => a.role === 'captain' ? -1 : 1);
          
          setMyTeam({ ...teamData, members: formattedMembers });
      }

      // B. Fetch Next Match
      const { data: match } = await supabase
        .from('matches')
        .select(`*, team1:team1_id(name, logo_url), team2:team2_id(name, logo_url)`)
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .in('status', ['scheduled', 'veto', 'live', 'disputed']) 
        .order('scheduled_at', { ascending: true }) 
        .maybeSingle();

      setActiveMatch(match);

    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // 3. Actions
  const handleCheckIn = async () => {
      if(!activeMatch) return;
      setIsReady(true);
      toast.success("Unit Marked as READY");
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Safe Profile Finder
  const myProfileData = myTeam?.members?.find(
      m => m.user_id === currentUserId || (m.profile_data?.id === currentUserId)
  )?.profile_data;

  if (loading) return (
      <div className="min-h-screen bg-bg flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Loading Tactical Data...</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-brand/30 pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <div className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded flex items-center justify-center">
                  <Shield className="w-5 h-5 text-fuchsia-500" />
              </div>
              <div>
                  <h1 className="text-lg font-display font-black uppercase italic tracking-tighter leading-none">
                      {myTeam?.name || 'OPERATOR DASHBOARD'}
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
                          ONLINE // {myProfileData?.display_name || session?.user?.email}
                      </span>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"><RefreshCw size={16}/></button>
              <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-900/40 text-red-500 border border-red-900/30 rounded text-[10px] font-bold uppercase transition-all">
                  <LogOut size={12}/> <span className="hidden md:inline">Disconnect</span>
              </button>
          </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto p-6">
          
          {/* TAB SWITCHER */}
          <div className="flex gap-4 border-b border-white/5 mb-8 overflow-x-auto">
              {['OVERVIEW', 'BRACKET', 'ROSTER', 'PROFILE'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative px-2 whitespace-nowrap",
                        activeTab === tab ? "text-fuchsia-500" : "text-zinc-500 hover:text-white"
                    )}
                  >
                      {tab}
                      {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-fuchsia-500 animate-in slide-in-from-left duration-300"/>}
                  </button>
              ))}
          </div>

          {/* === TAB 1: OVERVIEW === */}
          {activeTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* HERO CARD: NEXT MATCH */}
                  <div className="lg:col-span-2">
                      <div className={cn(
                          "relative rounded-xl border overflow-hidden min-h-[300px] flex flex-col justify-center items-center p-8 text-center",
                          activeMatch ? "bg-[#0b0c0f] border-fuchsia-500/30 shadow-[0_0_50px_rgba(192,38,211,0.1)]" : "bg-zinc-900/20 border-white/5 border-dashed"
                      )}>
                          {activeMatch ? (
                              <>
                                  <div className="absolute top-4 left-4 flex gap-2">
                                      <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase border", activeMatch.status === 'live' ? "bg-red-500 text-white border-red-600 animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-700")}>
                                          {activeMatch.status}
                                      </span>
                                      <span className="px-2 py-1 rounded text-[9px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                                          BO{activeMatch.best_of}
                                      </span>
                                  </div>

                                  <div className="flex items-center gap-8 mb-8">
                                      <div className="text-center">
                                          <div className="w-20 h-20 bg-black rounded-full border border-zinc-800 flex items-center justify-center mb-2 mx-auto">
                                              {activeMatch.team1?.logo_url ? <img src={activeMatch.team1.logo_url} className="w-12 h-12 object-contain" onError={(e)=>e.target.style.display='none'}/> : <Shield className="w-8 h-8 text-zinc-700"/>}
                                          </div>
                                          <h3 className="text-xl font-black italic uppercase text-white truncate max-w-[150px]">{activeMatch.team1?.name}</h3>
                                      </div>
                                      
                                      <div className="flex flex-col items-center">
                                          <span className="text-4xl font-black text-zinc-700 italic">VS</span>
                                          {activeMatch.scheduled_at && (
                                              <div className="flex flex-col items-center mt-4">
                                                  <div className="flex items-center gap-2 bg-fuchsia-950/30 px-3 py-1.5 rounded border border-fuchsia-500/20" title={`Your Timezone: ${getUserTimezone()}`}>
                                                      <Calendar size={14} className="text-fuchsia-400"/>
                                                      <span className="text-sm font-mono text-white">{formatMatchTime(activeMatch.scheduled_at)}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1 mt-1 text-[9px] text-zinc-600 font-mono uppercase">
                                                      <Globe size={10} />
                                                      {getUserTimezone()}
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      <div className="text-center">
                                          <div className="w-20 h-20 bg-black rounded-full border border-zinc-800 flex items-center justify-center mb-2 mx-auto">
                                              {activeMatch.team2?.logo_url ? <img src={activeMatch.team2.logo_url} className="w-12 h-12 object-contain" onError={(e)=>e.target.style.display='none'}/> : <Shield className="w-8 h-8 text-zinc-700"/>}
                                          </div>
                                          <h3 className="text-xl font-black italic uppercase text-white truncate max-w-[150px]">{activeMatch.team2?.name}</h3>
                                      </div>
                                  </div>

                                  <div className="flex gap-3 w-full max-w-md">
                                      {activeMatch.status === 'scheduled' ? (
                                          <button 
                                            onClick={handleCheckIn}
                                            disabled={isReady}
                                            className={cn(
                                                "flex-1 py-4 rounded font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2",
                                                isReady ? "bg-emerald-600 text-white cursor-default" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                                            )}
                                          >
                                              {isReady ? <><CheckCircle size={14}/> READY</> : "CHECK IN"}
                                          </button>
                                      ) : (
                                          <button 
                                            onClick={() => setMatchModalOpen(true)}
                                            className="flex-1 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest text-xs rounded shadow-lg shadow-fuchsia-900/20 transition-all flex items-center justify-center gap-2"
                                          >
                                              <Swords size={14}/> ENTER MATCH ROOM
                                          </button>
                                      )}
                                  </div>
                              </>
                          ) : (
                              <div className="opacity-50">
                                  <Trophy size={48} className="mx-auto mb-4 text-zinc-700"/>
                                  <h3 className="text-lg font-bold text-white uppercase tracking-widest">No Active Missions</h3>
                                  <p className="text-xs text-zinc-500 font-mono mt-2">Waiting for Tournament Director...</p>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* SIDEBAR: TEAM STATUS */}
                  <div className="bg-[#0b0c0f] border border-zinc-800 rounded-xl p-6 flex flex-col gap-6">
                      <div>
                          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Users size={12}/> Unit Roster
                          </h3>
                          <div className="space-y-2">
                              {myTeam?.members && myTeam.members.length > 0 ? (
                                  myTeam.members.slice(0,5).map(member => (
                                      <div key={member.id} className="flex justify-between items-center text-sm">
                                          <div className="flex items-center gap-2">
                                              <div className={`w-2 h-2 rounded-full ${member.id ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-zinc-700'}`}></div>
                                              <span className="text-zinc-300 font-bold">{member.username}</span>
                                          </div>
                                          {member.role === 'captain' && <Shield size={10} className="text-fuchsia-500"/>}
                                      </div>
                                  ))
                              ) : (
                                  <div className="text-center py-4">
                                      <div className="text-zinc-600 text-[10px] uppercase font-mono mb-2">No Operators Found</div>
                                      <button onClick={fetchData} className="text-fuchsia-500 text-[10px] font-bold underline">Retry Sync</button>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/5">
                          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Quick Actions</h3>
                          <div className="grid grid-cols-2 gap-2">
                              {myTeam?.voice_channel_url && (
                                  <a href={myTeam.voice_channel_url} target="_blank" className="p-3 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all flex items-center justify-center" title="Discord Voice">
                                      <Mic size={16}/>
                                  </a>
                              )}
                              <button onClick={() => setActiveTab('BRACKET')} className="p-3 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 col-span-2 text-[10px] font-bold uppercase">
                                  <MapIcon size={14}/> View Bracket
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* === TAB 2: BRACKET === */}
          {activeTab === 'BRACKET' && (
              <div className="h-[600px] border border-zinc-800 rounded-xl overflow-hidden bg-black animate-in fade-in zoom-in-95">
                  <BracketView />
              </div>
          )}

          {/* === TAB 3: ROSTER DETAILS === */}
          {activeTab === 'ROSTER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                  {myTeam?.members?.map(member => (
                      <TeammateRow key={member.id} member={member} />
                  ))}
                  {(!myTeam?.members || myTeam.members.length === 0) && (
                      <div className="col-span-2 text-center p-12 text-zinc-500 font-mono text-xs uppercase">
                          <AlertTriangle className="mx-auto mb-2 w-6 h-6 opacity-50"/>
                          Roster Data Unavailable
                      </div>
                  )}
              </div>
          )}

          {/* === TAB 4: PROFILE (NEW) === */}
          {activeTab === 'PROFILE' && (
              myProfileData ? (
                  <PlayerProfileEditor identity={myProfileData} onUpdate={fetchData} />
              ) : (
                  <div className="text-center p-12 text-zinc-500 font-mono text-xs uppercase flex flex-col items-center">
                      <AlertTriangle className="mb-4 w-8 h-8 text-yellow-500/50"/>
                      <span className="font-bold text-white mb-2">Profile Not Linked</span>
                      <p className="max-w-md mx-auto mb-4">Your current session is not linked to a player profile in this team. This usually happens if you were added manually by a captain without an account.</p>
                      <p className="text-[10px]">Contact your Team Captain or Admin to link your account.</p>
                  </div>
              )
          )}

      </div>

      {/* MATCH MODAL POPUP */}
      <MatchModal 
        match={activeMatch} 
        isOpen={isMatchModalOpen} 
        onClose={() => setMatchModalOpen(false)} 
      />

    </div>
  );
};
