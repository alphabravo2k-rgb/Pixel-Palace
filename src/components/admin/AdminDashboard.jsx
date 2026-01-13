import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Users, AlertTriangle, Layout, Sword, Monitor, Radio, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// 🏗️ SUB-MODULES
import { BracketView } from '../BracketView'; 
import { SystemDiagnostic } from './SystemDiagnostic';
import { TeamRosterView } from './TeamRosterView'; 
import { StaffManagement } from './StaffManagement';
import { AdminAuditLog } from './AdminAuditLog';

// 🧩 SUB-COMPONENT: Live Match Row
const LiveMatchRow = ({ match, onWarRoom }) => (
  <div className="p-3 hover:bg-white/[0.02] transition-all flex items-center justify-between group cursor-default border-b border-white/5 last:border-0 animate-in slide-in-from-left-2">
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-8 h-8 flex items-center justify-center border rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]",
        match.status === 'live' ? "border-red-600 bg-red-900/20" : "border-emerald-500/40 bg-emerald-900/10"
      )}>
         <Activity size={14} className={match.status === 'live' ? "text-red-500 animate-pulse" : "text-emerald-500"} />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-wider">Round {match.round_number}</span>
          <div className="w-1 h-1 bg-zinc-800 rounded-full" />
          <span className={cn(
            "text-[9px] font-black uppercase italic tracking-widest",
            match.status === 'live' ? "text-red-500" : "text-emerald-500"
          )}>{match.status}</span>
        </div>
        <div className="text-sm font-display font-black text-white uppercase italic tracking-tighter">
          {match.team1?.name || 'TBD'} <span className="text-zinc-700 px-1 font-sans not-italic">//</span> {match.team2?.name || 'TBD'}
        </div>
      </div>
    </div>
    <button 
      onClick={() => onWarRoom(match.id)} 
      className="px-4 py-1.5 bg-zinc-900 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:border-fuchsia-500 hover:bg-fuchsia-600 hover:text-white transition-all shadow-lg active:scale-95"
    >
      Intercept
    </button>
  </div>
);

// 📊 SUB-COMPONENT: Stats Card
const StatsCard = ({ title, value, icon: Icon, className }) => (
  <div className={cn("p-5 border border-white/5 bg-zinc-900/30 rounded-lg backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors", className)}>
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
        <h3 className="text-4xl font-display font-black text-white italic tracking-tighter tabular-nums group-hover:scale-105 transition-transform origin-left">{value}</h3>
      </div>
      <div className="p-2 bg-white/5 rounded-md text-zinc-400 group-hover:text-fuchsia-400 group-hover:bg-fuchsia-500/10 transition-colors">
        <Icon size={18} />
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl group-hover:bg-fuchsia-500/10 transition-colors" />
  </div>
);

/**
 * 🏛️ ADMIN DASHBOARD: OVERSEER HUD
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // REAL-TIME COMMAND
 */
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, theme, can } = useNexus();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [stats, setStats] = useState({ teams: 0, matches: 0, disputes: 0 });
  const [liveMatches, setLiveMatches] = useState([]);

  // 1️⃣ INTEL UPLINK (The Data Pulse)
  const fetchDashboardIntel = useCallback(async (silent = false) => {
    try {
        const [teamsRes, matchesRes] = await Promise.all([
            supabase.from('teams').select('id', { count: 'exact', head: true }),
            supabase.from('matches')
              .select('*, team1:team1_id(name), team2:team2_id(name)')
              .or('status.eq.live,status.eq.disputed,status.eq.veto')
        ]);

        const newStats = {
            teams: teamsRes.count || 0,
            matches: matchesRes.data?.length || 0,
            disputes: matchesRes.data?.filter(m => m.status === 'disputed').length || 0
        };

        // 🔊 TRIGGER ALARM: If a new dispute is detected
        if (newStats.disputes > stats.disputes && !silent) {
            SoundNexus.playVortex(CUES.UI_ERROR, 1500);
            Telemetry.log(EVENTS.ERROR, { type: 'DISPUTE_ALERT', count: newStats.disputes });
        }

        setStats(newStats);
        setLiveMatches(matchesRes.data || []);
    } catch (err) {
        console.error("Nexus Intel Failure:", err);
    }
  }, [stats.disputes]);

  useEffect(() => {
    if (!can('CAP_VIEW_ADMIN_DASHBOARD')) return;
    fetchDashboardIntel();
    
    // 📡 Global Sync Channel
    const channel = supabase.channel('admin_uplink')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchDashboardIntel(true))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [can, fetchDashboardIntel]);

  // 🛡️ SECURITY GATE
  if (!can('CAP_VIEW_ADMIN_DASHBOARD')) return (
    <div className="h-screen flex items-center justify-center bg-[#050505] text-red-500 font-mono">
        <Shield size={48} className="mb-4 animate-pulse" />
        <span className="block mt-4 text-xl tracking-widest">CLEARANCE VOID // ACCESS DENIED</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 relative overflow-hidden">
      
      {/* 🌌 ATMOSPHERIC OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="pt-12 px-8 max-w-[1800px] mx-auto relative z-10 space-y-10">
          
          {/* 🧩 TACTICAL HEADER */}
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
            <div className="space-y-2">
                <h1 className="text-7xl font-display font-black italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                  Sovereign <span className={theme.color}>Overseer</span>
                </h1>
                <div className="flex items-center gap-6 ml-1">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                        <Radio size={12} className="text-emerald-500 animate-pulse" />
                        Network State: <span className="text-white">Encrypted Uplink</span>
                    </p>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
                        Operator: <span className={theme.color}>{user?.username}</span>
                    </p>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 bg-zinc-900/40 backdrop-blur-xl p-1.5 rounded-lg border border-white/10 shadow-2xl">
                {[
                    { id: 'OVERVIEW', icon: Activity, label: 'Radar' },
                    { id: 'BRACKET', icon: Layout, label: 'Tactical' },
                    { id: 'DIAGNOSTICS', icon: Monitor, label: 'Kernel' },
                    { id: 'ROSTER', icon: Users, label: 'Units' },
                    { id: 'STAFF', icon: Shield, label: 'Clearance' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { SoundNexus.play(CUES.UI_CLICK); setActiveTab(tab.id); }}
                        className={cn(
                          "flex items-center gap-2 px-5 py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                          activeTab === tab.id ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <tab.icon size={12} /> {tab.label}
                    </button>
                ))}
            </div>
          </div>

          {/* ⚡ VIEWPORT RENDERING */}
          <main className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[600px]">
            {activeTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* COLUMN 1-3: LIVE FEEDS */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard title="Active Matches" value={stats.matches} icon={Sword} />
                    <StatsCard title="Total Units" value={stats.teams} icon={Users} />
                    <StatsCard 
                      title="Alerts" 
                      value={stats.disputes} 
                      icon={AlertTriangle} 
                      className={stats.disputes > 0 ? "border-red-500 bg-red-950/20 animate-pulse" : ""} 
                    />
                  </div>

                  {/* LIVE MATCH LISTING */}
                  <div className="bg-zinc-900/20 border border-white/5 rounded-lg backdrop-blur-md overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                      <h3 className="text-xs font-black uppercase italic tracking-widest flex items-center gap-2 text-zinc-300">
                        <Activity size={14} className="text-emerald-500" /> Active Deployments
                      </h3>
                      <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>
                         <span className="text-[9px] font-mono text-zinc-500 uppercase">Live Feed</span>
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

                {/* COLUMN 4: GLOBAL AUDIT */}
                <div className="lg:col-span-1">
                   <AdminAuditLog className="max-h-[800px] border-white/10" />
                </div>

              </div>
            )}
            
            {/* OTHER TABS */}
            {activeTab === 'BRACKET' && <div className="h-[800px] rounded-lg border border-white/10 overflow-hidden bg-[#0b0c0f]"><BracketView adminMode /></div>}
            {activeTab === 'DIAGNOSTICS' && <SystemDiagnostic />}
            {activeTab === 'ROSTER' && <TeamRosterView />}
            {activeTab === 'STAFF' && <StaffManagement />}
          </main>
      </div>
    </div>
  );
};
