/**
 * 🎮 PLAYER DASHBOARD: OPERATOR CORE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // NEURAL LINK ACTIVE
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Swords, LogOut, CheckCircle, Trophy, RefreshCw, Activity, 
  User, Save, Monitor, Gamepad2, Mic, AlertTriangle, Zap, Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { useNexus } from '../../hooks/useNexus';
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// SUB-SYSTEMS
import { MatchModal } from '../MatchModal'; 
import { BracketView } from '../BracketView'; 

// --- SUB-COMPONENT: IDENTITY EDITOR ---
const ProfileEditor = ({ onClose }) => {
    const { user, syncNexus } = useNexus();
    const [form, setForm] = useState({
        display_name: user?.username || '',
        steam_url: user?.steam_url || '',
        faceit_url: user?.faceit_url || '',
        discord_handle: user?.discord_handle || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try { SoundNexus.play(CUES.UI_CLICK); } catch(e){}
        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                ...form,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
            await syncNexus(); 
            toast.success("IDENTITY RECORD COMMITTED");
            try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
            onClose();
        } catch (e) {
            toast.error("COMMIT FAILED: " + e.message);
            try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-black border border-fuchsia-500/20 p-6 rounded-sm space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-fuchsia-500/30" />
            <div className="space-y-4">
                <div className="relative">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Tactical Callsign</label>
                    <input value={form.display_name} onChange={e=>setForm({...form, display_name:e.target.value})} className="w-full bg-zinc-900/30 border border-zinc-800 text-xs text-white p-3 outline-none focus:border-fuchsia-500 transition-all font-mono" placeholder="OPERATOR_ID"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Steam Link</label>
                        <input value={form.steam_url} onChange={e=>setForm({...form, steam_url:e.target.value})} className="w-full bg-zinc-900/30 border border-zinc-800 text-[10px] text-white p-3 outline-none focus:border-blue-500 transition-all font-mono" placeholder="STEAM_URL"/>
                    </div>
                    <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Discord</label>
                        <input value={form.discord_handle} onChange={e=>setForm({...form, discord_handle:e.target.value})} className="w-full bg-zinc-900/30 border border-zinc-800 text-[10px] text-white p-3 outline-none focus:border-indigo-500 transition-all font-mono" placeholder="NAME#0000"/>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-2">
                <button onClick={onClose} className="text-[9px] font-black uppercase text-zinc-600 hover:text-white tracking-widest">Abort</button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-fuchsia-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-fuchsia-500 transition-all flex items-center gap-2">
                    {saving ? <RefreshCw className="animate-spin w-3 h-3"/> : <Save size={12}/>} Commit
                </button>
            </div>
        </motion.div>
    );
};

// --- MAIN DASHBOARD ---
export const PlayerDashboard = () => {
  const { user, logout, theme } = useNexus();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('OVERVIEW'); 
  const [activeMatch, setActiveMatch] = useState(null);
  const [myTeam, setMyTeam] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isMatchModalOpen, setMatchModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // 📡 DATA UPLINK ENGINE
  const fetchData = useCallback(async () => {
    if (!user?.teamId) {
        setLoading(false);
        return;
    }
    
    try {
      // Phase 1: Match Intel
      const { data: match } = await supabase
        .from('matches')
        .select(`*, team1:team1_id(name, logo_url), team2:team2_id(name, logo_url)`)
        .or(`team1_id.eq.${user.teamId},team2_id.eq.${user.teamId}`)
        .order('created_at', { ascending: false }) 
        .limit(1)
        .maybeSingle();

      setActiveMatch(match);

      // Phase 2: Team Roster Enrichment
      const { data: teamData } = await supabase
        .from('teams')
        .select(`*, team_members(id, role, user_id, profiles(display_name, steam_url, faceit_url, discord_handle))`)
        .eq('id', user.teamId)
        .single();

      if (teamData) {
          const formattedMembers = (teamData.team_members || []).map(m => ({
              id: m.id,
              user_id: m.user_id,
              username: m.profiles?.display_name || 'Operator Unknown',
              role: m.role,
              steam_url: m.profiles?.steam_url,
              faceit_url: m.profiles?.faceit_url,
              discord_handle: m.profiles?.discord_handle,
          })).sort((a,b) => a.role === 'captain' ? -1 : 1);
          setMyTeam({ ...teamData, members: formattedMembers });
      }

    } catch (err) {
      console.error("Neural Link Failure:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.teamId]);

  useEffect(() => {
    fetchData();
    Telemetry.log(EVENTS.ACTION, { action: 'DASHBOARD_MOUNT' }, user?.id);
    
    const channel = supabase
      .channel(`combat_ops:${user?.teamId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
          fetchData();
          try { SoundNexus.play(CUES.UI_NOTIFICATION); } catch(e){}
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.teamId, fetchData, user?.id]);

  const handleLogout = async () => {
    try { SoundNexus.play(CUES.UI_POWER_DOWN); } catch(e){}
    await logout();
    navigate('/login');
  };

  if (loading) return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-8">
          <Target size={64} className="text-fuchsia-500 animate-ping opacity-20" />
          <div className="text-zinc-700 font-mono uppercase tracking-[0.8em] text-[10px]">Neural_Link_Establishing...</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
      
      {/* 🧩 ATMOSPHERIC GRID */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
         <div className="scanlines" />
      </div>
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* COMMAND HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-10 mb-12">
            <div>
              <h1 className="text-6xl font-display font-black italic uppercase tracking-tighter leading-none text-white">
                  Operator <span className="text-fuchsia-600">Core</span>
              </h1>
              <div className="flex items-center gap-5 mt-5">
                 <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 border border-white/5 backdrop-blur-md rounded-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-[0.3em]">
                       Uplink: <span className="text-white">{user?.username}</span>
                    </span>
                 </div>
                 <span className="text-[9px] text-zinc-700 font-mono uppercase tracking-widest bg-black px-2 py-1 border border-white/5">
                    Node: {user?.role}
                 </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => { fetchData(); try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} }} className="p-4 bg-zinc-900/40 border border-white/5 hover:border-fuchsia-500/50 text-zinc-500 hover:text-white transition-all active:scale-95 rounded-sm">
                  <RefreshCw size={20} className={cn(loading && "animate-spin")} />
              </button>
              <button onClick={handleLogout} className="p-4 bg-zinc-900/40 border border-white/5 hover:border-red-500/50 text-zinc-500 hover:text-red-500 transition-all active:scale-95 rounded-sm">
                  <LogOut size={20} />
              </button>
            </div>
        </header>

        {/* HUD CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* TACTICAL VIEWPORT (8 COLS) */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* NAV SELECTOR */}
                <div className="flex gap-2 bg-zinc-900/20 p-1.5 border border-white/5 rounded-sm backdrop-blur-xl">
                    {['OVERVIEW', 'BRACKET', 'ROSTER'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => { setActiveTab(tab); try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} }}
                            className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-sm",
                                activeTab === tab ? "bg-fuchsia-600 text-white shadow-2xl" : "text-zinc-600 hover:text-zinc-300"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'OVERVIEW' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className={cn(
                                "relative rounded-sm border transition-all duration-1000 overflow-hidden min-h-[450px] flex items-center justify-center",
                                activeMatch ? "bg-[#09090b] border-fuchsia-500/30" : "bg-zinc-950/40 border-white/5"
                            )}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(192,38,211,0.02),_transparent)]" />
                            
                            {activeMatch ? (
                            <div className="p-12 w-full">
                                <div className="flex justify-between items-center mb-16">
                                    <div className="flex items-center gap-4">
                                        <Zap className="text-fuchsia-500" size={24} />
                                        <h2 className="text-3xl font-display font-black uppercase italic text-white tracking-tighter">Engagement Identified</h2>
                                    </div>
                                    <div className="px-6 py-2 bg-fuchsia-600 text-white text-[10px] font-black uppercase tracking-[0.4em] italic shadow-lg shadow-fuchsia-600/20">
                                        {activeMatch.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 items-center bg-black/40 border border-white/5 p-12 relative group cursor-pointer hover:border-fuchsia-500/30 transition-all rounded-sm" onClick={() => setMatchModalOpen(true)}>
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-24 h-24 bg-zinc-900 border border-white/5 rounded-sm flex items-center justify-center p-4">
                                            {activeMatch.team1?.logo_url ? <img src={activeMatch.team1.logo_url} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" alt="" /> : <Shield size={32} className="text-zinc-800" />}
                                        </div>
                                        <span className="text-2xl font-display font-black uppercase italic text-white tracking-tight">{activeMatch.team1?.name}</span>
                                    </div>
                                    
                                    <div className="text-center relative">
                                        <span className="text-7xl font-display font-black text-zinc-900 italic select-none">VS</span>
                                        <div className="mt-6 text-[10px] text-fuchsia-500 font-black tracking-[0.5em] uppercase animate-pulse">{activeMatch.map_name || 'VETO_PENDING'}</div>
                                    </div>

                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-24 h-24 bg-zinc-900 border border-white/5 rounded-sm flex items-center justify-center p-4">
                                            {activeMatch.team2?.logo_url ? <img src={activeMatch.team2.logo_url} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" alt="" /> : <Shield size={32} className="text-zinc-800" />}
                                        </div>
                                        <span className="text-2xl font-display font-black uppercase italic text-white tracking-tight">{activeMatch.team2?.name}</span>
                                    </div>
                                </div>

                                <button 
                                    className="w-full py-6 mt-12 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase italic tracking-[0.6em] text-[11px] rounded-sm transition-all shadow-2xl shadow-fuchsia-600/20 active:scale-[0.99]"
                                    onClick={() => setMatchModalOpen(true)}
                                >
                                    Initialize Combat Uplink
                                </button>
                            </div>
                            ) : (
                            <div className="p-20 text-center">
                                <Activity className="w-16 h-16 text-zinc-800 mx-auto mb-6 animate-pulse" />
                                <h3 className="text-3xl font-display font-black uppercase italic text-white">Standby...</h3>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Awaiting Signal from High Command</p>
                            </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'BRACKET' && (
                        <motion.div key="bracket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[700px] border border-white/5 rounded-sm overflow-hidden bg-black shadow-inner">
                            <BracketView />
                        </motion.div>
                    )}

                    {activeTab === 'ROSTER' && (
                        <motion.div key="roster" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {myTeam?.members?.map(m => (
                                <div key={m.id} className="p-6 bg-zinc-900/30 border border-white/5 rounded-sm flex justify-between items-center hover:border-fuchsia-500/20 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 flex items-center justify-center font-black text-lg border", m.role === 'captain' ? "text-fuchsia-500 border-fuchsia-500/30 bg-fuchsia-500/5" : "text-zinc-600 border-zinc-800")}>
                                            {m.username.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase italic text-white leading-none">{m.username}</p>
                                            <p className="text-[8px] font-mono text-zinc-600 uppercase mt-1.5 tracking-widest">{m.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <Gamepad2 size={14} className="text-fuchsia-500" />
                                        <Mic size={14} className="text-indigo-500" />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* INTELLIGENCE FEED (4 COLS) */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* IDENTITY HUD */}
                <div className="bg-[#09090b] border border-white/5 p-8 rounded-sm shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><Shield size={100} /></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                           <Shield className="text-fuchsia-500" size={20} />
                           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Security Ident</h3>
                        </div>
                        <button onClick={() => { setShowProfile(!showProfile); try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} }} className="text-[9px] font-black text-fuchsia-500 hover:text-white uppercase tracking-widest transition-all">
                            {showProfile ? "Close" : "Update"}
                        </button>
                    </div>
                    
                    {showProfile ? (
                        <ProfileEditor onClose={() => setShowProfile(false)} />
                    ) : (
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4 text-emerald-500 bg-emerald-500/5 p-4 border border-emerald-500/20 rounded-sm">
                               <CheckCircle size={16} />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Link Verified</span>
                            </div>
                            <div className="space-y-3 font-mono">
                                <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
                                   Assigned Clearance: <span className="text-white">{user?.role}</span>
                                </p>
                                <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
                                   Audit Trace ID: <span className="text-fuchsia-400">{user?.id?.slice(0,12)}...</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* COMBAT INTEL */}
                <div className="bg-[#09090b]/40 border border-white/5 p-10 rounded-sm">
                    <div className="flex items-center gap-4 mb-6">
                       <Activity className="text-fuchsia-500" size={20} />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Intel Feed</h3>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed font-mono uppercase italic border-l border-zinc-800 pl-4">
                       "All combat maneuvers are logged in the global audit trail. Ensure credentials match registered Steam Ident before initiating server connection."
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
    </div>
  );
};
