import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from '../../auth/useSession';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
    Shield, Swords, Clock, LogOut, CheckCircle, Trophy, RefreshCw, 
    Users, Map as MapIcon, Mic, Monitor, Gamepad2, Calendar
} from 'lucide-react';
import { MatchModal } from '../MatchModal'; 
import { BracketView } from '../BracketView'; 
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

// --- HELPER: HAMMER TIME (Automatic Local Timezone) ---
const formatMatchTime = (isoString) => {
    if (!isoString) return 'TBD';
    const date = new Date(isoString);
    
    // This automatically detects the user's browser timezone
    return new Intl.DateTimeFormat(undefined, {
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true // e.g. "Jan 24, 5:00 PM"
    }).format(date);
};

// --- SUB-COMPONENTS ---

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

export const PlayerDashboard = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('OVERVIEW'); 
  const [myTeam, setMyTeam] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMatchModalOpen, setMatchModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false); 

  // 1. Identity Logic
  const getTeamId = useCallback(() => {
    // Check all possible locations for the ID
    return session?.identity?.team_id || session?.team_id || session?.user?.user_metadata?.team_id;
  }, [session]);

  const teamId = getTeamId();

  // 2. Data Fetching
  const fetchData = useCallback(async () => {
    if (!teamId) { setLoading(false); return; }
    
    try {
      // A. Fetch Team & Roster (Robust Query)
      // Note: We use 'team_members' and join 'global_identities' to get player names
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
            *, 
            team_members (
                id, role, user_id,
                global_identities (display_name, steam_url, faceit_url, discord_handle)
            )
        `)
        .eq('id', teamId)
        .single();

      if (teamData) {
          // Flatten the nested structure for easier display
          const formattedMembers = (teamData.team_members || []).map(m => ({
              id: m.id,
              username: m.global_identities?.display_name || 'Unknown Operator',
              role: m.role,
              steam_url: m.global_identities?.steam_url,
              faceit_url: m.global_identities?.faceit_url,
              discord_handle: m.global_identities?.discord_handle
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
                      {/* FIX: Use the loaded user name or fallback */}
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
                          ONLINE // {myTeam?.members?.find(m => m.id === session?.identity?.id)?.username || session?.user?.email}
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
          <div className="flex gap-4 border-b border-white/5 mb-8">
              {['OVERVIEW', 'BRACKET', 'ROSTER'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
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
                                          {/* ✅ TIMEZONE FIX: Shows Date and Local Time */}
                                          {activeMatch.scheduled_at && (
                                              <div className="flex flex-col items-center mt-2">
                                                  <span className="text-xs font-mono text-fuchsia-400 flex items-center gap-1 bg-fuchsia-950/30 px-2 py-1 rounded border border-fuchsia-500/20">
                                                      <Calendar size={12}/> {formatMatchTime(activeMatch.scheduled_at)}
                                                  </span>
                                                  <span className="text-[9px] text-zinc-600 mt-1 font-mono uppercase">Local Time</span>
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
                              {/* ROSTER FETCH FIX: Check if members exist before mapping */}
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
