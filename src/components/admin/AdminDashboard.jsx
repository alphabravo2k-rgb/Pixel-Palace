import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Shield, Activity, Users, AlertTriangle, 
  Layout, Sword, FileText
} from 'lucide-react';
import { AdminToolbar } from './AdminToolbar';
import { TeamRosterView } from './TeamRosterView';
import { StaffManagement } from './StaffManagement';
import BracketView from '../BracketView'; // ✅ FIXED: Default Import
import StatsCard from '../StatsCard';
import { MatchWarRoom } from './MatchWarRoom';
import { formatDistanceToNow } from 'date-fns';

// --- HELPER: Time Formatter ---
const timeAgo = (date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } 
    catch { return 'just now'; }
};

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [stats, setStats] = useState({ teams: 0, matches: 0, disputes: 0 });
  const [liveMatches, setLiveMatches] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeWarRoomId, setActiveWarRoomId] = useState(null);

  // 1. DATA FETCHING (Intel Feed)
  const fetchDashboardIntel = async () => {
    try {
        // Fetch stats and active matches
        const [teamsRes, matchesRes, logsRes] = await Promise.all([
            supabase.from('teams').select('id', { count: 'exact', head: true }),
            supabase.from('matches')
              .select('*, team1:team1_id(name), team2:team2_id(name)')
              .or('status.eq.LIVE,status.eq.disputed,status.eq.veto')
              .order('round_number', { ascending: true }),
            supabase.from('admin_audit_logs')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(5)
        ]);

        setStats({
            teams: teamsRes.count || 0,
            matches: matchesRes.data?.length || 0,
            disputes: matchesRes.data?.filter(m => m.status?.toLowerCase() === 'disputed').length || 0
        });

        setLiveMatches(matchesRes.data || []);
        setAuditLogs(logsRes.data || []);
    } catch (err) {
        console.error("Dashboard Intel Fetch Error:", err);
    }
  };

  useEffect(() => {
      fetchDashboardIntel();
      const interval = setInterval(fetchDashboardIntel, 15000); // Poll every 15s
      return () => clearInterval(interval);
  }, []);

  // 2. TAB RENDERER
  const renderContent = () => {
      switch(activeTab) {
          case 'BRACKET': 
            return <div className="h-[80vh] border border-white/10 rounded-lg overflow-hidden bg-black"><BracketView adminMode={true} /></div>;
          case 'ROSTER': 
            return <TeamRosterView />;
          case 'STAFF': 
            return <StaffManagement />;
          case 'OVERVIEW':
          default:
              return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    {/* STATS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard title="Active Operations" value={stats.matches} icon={Activity} color="text-blue-400" />
                        <StatsCard title="Registered Units" value={stats.teams} icon={Users} color="text-zinc-300" />
                        <StatsCard title="Critical Disputes" value={stats.disputes} icon={AlertTriangle} color={stats.disputes > 0 ? "text-red-500" : "text-emerald-500"} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LIVE OPS FEED */}
                        <div className="lg:col-span-2 space-y-6">
                            {stats.disputes > 0 && (
                                <div className="bg-red-950/20 border border-red-500/50 rounded-lg p-4 animate-pulse">
                                    <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-sm mb-2">
                                        <AlertTriangle size={16} /> Attention Required
                                    </div>
                                    <div className="space-y-2">
                                        {liveMatches.filter(m => m.status?.toLowerCase() === 'disputed').map(m => (
                                            <div key={m.id} className="flex justify-between items-center bg-red-900/10 p-2 rounded border border-red-900/30">
                                                <span className="text-white text-xs font-mono">MATCH #{m.match_position} (DISPUTED)</span>
                                                <button onClick={() => setActiveWarRoomId(m.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase rounded">Resolve</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-zinc-900/50 border border-white/10 rounded-lg overflow-hidden">
                                <div className="p-4 border-b border-white/5 bg-zinc-900 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                                        <Sword size={14} className="text-brand" /> Active Deployments
                                    </h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {liveMatches.length === 0 ? (
                                        <div className="p-8 text-center text-zinc-600 text-xs font-mono uppercase tracking-widest">No active matches on radar.</div>
                                    ) : (
                                        liveMatches.map(match => (
                                            <div key={match.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {match.status === 'LIVE' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${match.status === 'LIVE' ? 'bg-red-900/20 text-red-500 border-red-900/50' : 'bg-zinc-800 text-zinc-400 border-white/10'}`}>{match.status}</span>
                                                        <span className="text-xs font-mono text-zinc-500">R{match.round_number} | POS {match.match_position}</span>
                                                    </div>
                                                    <div className="text-sm font-bold text-white">
                                                        {match.team1?.name || 'TBD'} vs {match.team2?.name || 'TBD'}
                                                    </div>
                                                </div>
                                                <button onClick={() => setActiveWarRoomId(match.id)} className="px-4 py-2 bg-zinc-800 hover:bg-brand text-white text-xs font-bold uppercase rounded border border-white/5 transition-all">War Room</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* AUDIT LOG */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-lg overflow-hidden h-fit">
                            <div className="p-4 border-b border-white/5 bg-zinc-900">
                                <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                                    <FileText size={14} className="text-zinc-400" /> Recent Activity
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {auditLogs.length === 0 ? <div className="text-zinc-600 text-xs font-mono text-center py-4">Log Empty</div> : auditLogs.map(log => (
                                    <div key={log.id} className="relative pl-4 border-l border-zinc-800 pb-1">
                                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-800 border-2 border-black" />
                                        <div className="text-[10px] text-zinc-500 font-mono mb-0.5 uppercase">{timeAgo(log.created_at)}</div>
                                        <div className="text-xs text-zinc-300 font-bold leading-tight">{log.action_type?.replace(/_/g, ' ') || 'Action'}</div>
                                        <div className="text-[10px] text-zinc-500 mt-1 truncate">Target: <span className="text-zinc-400">{log.target || 'N/A'}</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              );
      }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand/30 pb-20">
      <AdminToolbar />
      
      <div className="pt-20 px-6 max-w-[1600px] mx-auto space-y-6">
         {/* SUB-NAV TABS */}
         <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-lg border border-white/10 w-fit sticky top-20 z-40 shadow-xl backdrop-blur-md">
            {[
                { id: 'OVERVIEW', icon: Activity, label: 'Overview' },
                { id: 'BRACKET', icon: Layout, label: 'Bracket' },
                { id: 'ROSTER', icon: Users, label: 'Roster Cmd' },
                { id: 'STAFF', icon: Shield, label: 'Staff' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all
                    ${activeTab === tab.id ? 'bg-brand text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
            ))}
         </div>

         {/* MAIN CONTENT AREA */}
         <main>
            {renderContent()}
         </main>
      </div>

      {/* WAR ROOM MODAL */}
      {activeWarRoomId && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
               <div className="relative w-full max-w-5xl h-[85vh]">
                    <MatchWarRoom 
                        matchId={activeWarRoomId} 
                        onClose={() => { setActiveWarRoomId(null); fetchDashboardIntel(); }} 
                    />
               </div>
           </div>
       )}
    </div>
  );
};
