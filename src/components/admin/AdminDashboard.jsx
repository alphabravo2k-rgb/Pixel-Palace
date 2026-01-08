/**
 * 🛡️ PIXEL PALACE: OVERSEER COMMAND CENTER
 * VERSION: 4.5.0 (MASTER HYBRID)
 * STATUS: MASTERED
 * * ARCHITECTURE:
 * 1. REAL-TIME INTEL: WebSocket uplink for live match data.
 * 2. HOLOGRAPHIC UI: Glassmorphism panels with 3D depth context.
 * 3. TACTICAL AUDIO: SoundNexus integration for critical alerts.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useNexusStore } from '../../store/useNexusStore';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { 
  Shield, Activity, Users, AlertTriangle, 
  Layout, Sword, FileText, UserCircle, RefreshCw,
  Terminal, Monitor
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

// 🏗️ SUB-MODULES (We will build these next)
import { BracketView } from '../BracketView'; 
import { SystemDiagnostic } from './SystemDiagnostic';

// --- TEMPORARY STUBS (To be replaced by Priority 3 Files) ---
const TeamRosterView = () => <div className="p-10 text-center border border-dashed border-zinc-700 rounded-sm text-zinc-500 font-mono">ROSTER MODULE INITIALIZING...</div>;
const StaffManagement = () => <div className="p-10 text-center border border-dashed border-zinc-700 rounded-sm text-zinc-500 font-mono">STAFF MODULE INITIALIZING...</div>;
const AdminProfile = () => <div className="p-10 text-center border border-dashed border-zinc-700 rounded-sm text-zinc-500 font-mono">IDENTITY MODULE INITIALIZING...</div>;

// 🧩 SUB-COMPONENT: Live Match Row
const LiveMatchRow = ({ match, onWarRoom }) => (
  <div className="p-4 hover:bg-white/[0.02] transition-all flex items-center justify-between group cursor-default border-b border-white/5 last:border-0 animate-in slide-in-from-left-2">
    <div className="flex items-center gap-6">
      <div className={cn(
        "w-8 h-8 flex items-center justify-center border rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]",
        match.status === 'live' ? "border-red-600 bg-red-900/20" : "border-brand/40 bg-brand/10"
      )}>
         <Activity size={14} className={match.status === 'live' ? "text-red-500 animate-pulse" : "text-brand"} />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-wider">Round {match.round_number}</span>
          <div className="w-1 h-1 bg-zinc-800 rounded-full" />
          <span className={cn(
            "text-[9px] font-black uppercase italic tracking-widest",
            match.status === 'live' ? "text-red-500" : "text-brand-glow"
          )}>{match.status}</span>
        </div>
        <div className="text-lg font-display font-black text-white uppercase italic tracking-tighter">
          {match.team1?.name || 'TBD'} <span className="text-zinc-700 px-2 font-sans not-italic">//</span> {match.team2?.name || 'TBD'}
        </div>
      </div>
    </div>
    <button 
      onClick={() => onWarRoom(match.id)} 
      className="px-5 py-2 bg-zinc-900 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:border-brand/50 hover:bg-brand hover:text-white transition-all shadow-lg active:scale-95"
    >
      Intercept
    </button>
  </div>
);

// 📊 SUB-COMPONENT: Stats Card
const StatsCard = ({ title, value, icon: Icon, className }) => (
  <div className={cn("p-5 border border-white/5 bg-zinc-900/30 rounded-sm backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors", className)}>
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
        <h3 className="text-4xl font-display font-black text-white italic tracking-tighter tabular-nums group-hover:scale-105 transition-transform origin-left">{value}</h3>
      </div>
      <div className="p-2 bg-white/5 rounded-sm text-zinc-400 group-hover:text-brand group-hover:bg-brand/10 transition-colors">
        <Icon size={18} />
      </div>
    </div>
    {/* Decorative Glow */}
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors" />
  </div>
);

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isLive, is3DEnabled } = useNexusStore();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [stats, setStats] = useState({ teams: 0, matches: 0, disputes: 0 });
  const [liveMatches, setLiveMatches] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeWarRoomId, setActiveWarRoomId] = useState(null);

  // 1️⃣ INTEL UPLINK
  const fetchDashboardIntel = useCallback(async (silent = false) => {
    try {
        const [teamsRes, matchesRes, logsRes] = await Promise.all([
            supabase.from('teams').select('id', { count: 'exact', head: true }),
            supabase.from('matches').select('*, team1:team1_id(name), team2:team2_id(name)').or('status.eq.live,status.eq.disputed,status.eq.veto').order('round_number', { ascending: true }),
            supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5)
        ]);

        const newStats = {
            teams: teamsRes.count || 0,
            matches: matchesRes.data?.length || 0,
            disputes: matchesRes.data?.filter(m => m.status === 'disputed').length || 0
        };

        if (newStats.disputes > stats.disputes && !silent) {
            SoundNexus.play(CUES.DISPUTE_TRIGGER);
        }

        setStats(newStats);
        setLiveMatches(matchesRes.data || []);
        setAuditLogs(logsRes.data || []);
    } catch (err) {
        console.error("Nexus Intel Failure:", err);
    }
  }, [stats.disputes]);

  // 2️⃣ REAL-TIME SYNC
  useEffect(() => {
    fetchDashboardIntel();
    const channel = supabase.channel('admin_global_intel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchDashboardIntel(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => fetchDashboardIntel(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardIntel]);

  // 3. TAB RENDERER
  const renderContent = () => {
      switch(activeTab) {
          case 'BRACKET': return <div className="h-[80vh] bg-black border border-white/5 rounded-sm overflow-hidden"><BracketView adminMode={true} /></div>;
          case 'DIAGNOSTICS': return <SystemDiagnostic />;
          case 'ROSTER': return <TeamRosterView />;
          case 'STAFF': return <StaffManagement />;
          case 'PROFILE': return <AdminProfile />;
          case 'OVERVIEW':
          default:
            return (
              <div className="space-y-8 animate-in fade-in duration-500">
                  {/* TOP STATS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <StatsCard title="Operational Matches" value={stats.matches} icon={Activity} />
                      <StatsCard title="Combat Units" value={stats.teams} icon={Users} />
                      <StatsCard 
                          title="Active Disputes" 
                          value={stats.disputes} 
                          icon={AlertTriangle} 
                          className={stats.disputes > 0 ? "border-red-500/50 bg-red-950/10 shadow-[0_0_20px_rgba(220,38,38,0.1)]" : ""}
                      />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* MAIN FEED */}
                      <div className="lg:col-span-2 space-y-6">
                          {stats.disputes > 0 && (
                              <div className="bg-red-600/10 border border-red-500/50 rounded-sm p-4 shadow-[0_0_30px_rgba(220,38,38,0.1)] animate-pulse">
                                  <div className="flex items-center justify-between text-red-500 mb-3">
                                      <div className="flex items-center gap-2">
                                          <Shield size={18} className="fill-current" />
                                          <h3 className="font-display font-black uppercase italic tracking-tighter">Containment Breach</h3>
                                      </div>
                                      <span className="text-[9px] font-black bg-red-500 text-black px-2 py-0.5 rounded-sm uppercase">Priority 1</span>
                                  </div>
                                  <div className="space-y-2">
                                      {liveMatches.filter(m => m.status === 'disputed').map(m => (
                                          <div key={m.id} className="flex justify-between items-center bg-black/40 p-2 rounded-sm border border-red-500/20">
                                              <span className="text-red-200 text-xs font-black uppercase italic">Match #{m.match_position} // Dispute Active</span>
                                              <button onClick={() => navigate(`/match/${m.id}`)} className="px-4 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all">Resolve</button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}

                          <div className="bg-black/40 border border-white/5 rounded-sm overflow-hidden shadow-2xl backdrop-blur-sm">
                              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                  <h3 className="font-display font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                      <Sword size={16} className="text-brand" /> Live Deployments
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">Real-time</span>
                                  </div>
                              </div>
                              <div className="divide-y divide-white/5">
                                  {liveMatches.length === 0 ? (
                                      <div className="p-12 text-center">
                                          <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                                          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Radar Clear</p>
                                      </div>
                                  ) : (
                                      liveMatches.map(match => (
                                          <LiveMatchRow key={match.id} match={match} onWarRoom={(id) => navigate(`/match/${id}`)} />
                                      ))
                                  )}
                              </div>
                          </div>
                      </div>

                      {/* AUDIT LOG */}
                      <div className="bg-black/40 border border-white/5 rounded-sm overflow-hidden h-fit backdrop-blur-sm">
                          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                              <FileText size={16} className="text-zinc-500" />
                              <h3 className="font-display font-black text-white uppercase italic tracking-tighter">Command Ledger</h3>
                          </div>
                          <div className="p-4 space-y-4">
                              {auditLogs.length === 0 ? (
                                  <div className="text-center text-zinc-700 text-[9px] uppercase font-mono tracking-widest py-2">Ledger Empty</div>
                              ) : (
                                  auditLogs.map(log => (
                                      <div key={log.id} className="relative pl-4 border-l border-white/10 pb-1 group">
                                          <div className="absolute left-[-2.5px] top-1 w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-brand transition-colors" />
                                          <p className="text-[8px] text-zinc-600 font-black font-mono uppercase tracking-widest mb-0.5">
                                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                          </p>
                                          <p className="text-[10px] font-bold text-zinc-300 uppercase leading-tight group-hover:text-brand transition-colors">
                                            {log.action_type?.replace(/_/g, ' ')}
                                          </p>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
              </div>
            );
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 overflow-x-hidden relative">
      {/* 3D ATMOSPHERE */}
      {is3DEnabled && (
         <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-brand/5 blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-full h-[50vh] bg-blue-600/5 blur-[120px]" />
         </div>
      )}

      <div className="pt-8 px-4 md:px-8 max-w-[1800px] mx-auto relative z-10 space-y-8">
         
         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
            <div>
                <h1 className="text-6xl md:text-8xl font-display font-black italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                  Overseer <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-emerald-500">HUD</span>
                </h1>
                <div className="flex items-center gap-4 mt-4 ml-1">
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                       <Activity size={12} className={cn(isLive ? "text-emerald-500" : "text-red-500")} />
                       Uplink: {isLive ? 'SECURE' : 'OFFLINE'}
                   </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-zinc-900/60 backdrop-blur-md p-1.5 rounded-sm border border-white/5 shadow-2xl">
               {[
                   { id: 'OVERVIEW', icon: Activity, label: 'Radar' },
                   { id: 'BRACKET', icon: Layout, label: 'Tactical' },
                   { id: 'DIAGNOSTICS', icon: Monitor, label: 'Kernel' }, // 🩺 NEW
                   { id: 'ROSTER', icon: Users, label: 'Units' },
                   { id: 'STAFF', icon: Shield, label: 'Clearance' }
               ].map(tab => (
                   <button
                       key={tab.id}
                       onClick={() => { SoundNexus.play(CUES.UI_CLICK); setActiveTab(tab.id); }}
                       className={cn(
                         "flex items-center gap-2 px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                         activeTab === tab.id ? "bg-brand text-white shadow-neon" : "text-zinc-500 hover:text-white hover:bg-white/5"
                       )}
                   >
                       <tab.icon size={12} /> {tab.label}
                   </button>
               ))}
            </div>
         </div>

         {/* MAIN VIEWPORT */}
         <main className="min-h-[60vh]">
            {renderContent()}
         </main>
      </div>
    </div>
  );
};
