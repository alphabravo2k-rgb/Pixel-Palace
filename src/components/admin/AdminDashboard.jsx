import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Users, AlertTriangle, Sword, FileText, CheckCircle } from 'lucide-react';
import StatsCard from '../StatsCard';
import { MatchWarRoom } from './MatchWarRoom';
import { formatDistanceToNow } from 'date-fns';

const timeAgo = (date) => {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
        return 'just now';
    }
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ teams: 0, matches: 0, disputes: 0 });
  const [liveMatches, setLiveMatches] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWarRoomId, setActiveWarRoomId] = useState(null);

  const fetchDashboardIntel = async () => {
    setLoading(true);
    try {
        const [teamsRes, matchesRes, logsRes] = await Promise.all([
            supabase.from('teams').select('id', { count: 'exact' }),
            supabase.from('matches').select('*').or('status.eq.live,status.eq.disputed,status.eq.veto').order('scheduled_at', { ascending: true }),
            supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(10)
        ]);

        setStats({
            teams: teamsRes.count || 0,
            matches: matchesRes.data?.length || 0,
            disputes: matchesRes.data?.filter(m => m.status === 'disputed').length || 0
        });

        setLiveMatches(matchesRes.data || []);
        setAuditLogs(logsRes.data || []);
    } catch (err) {
        console.error("Intel Fetch Error:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchDashboardIntel();
      const interval = setInterval(fetchDashboardIntel, 30000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-8 animate-in fade-in">
       
       {/* 1. HEADER & STATS */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
              <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
                  COMMAND <span className="text-fuchsia-600">CENTER</span>
              </h1>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                  System Status: <span className="text-emerald-500 font-bold">ONLINE</span>
              </p>
              <button onClick={fetchDashboardIntel} className="text-[10px] text-zinc-600 hover:text-white underline cursor-pointer">
                Force Refresh Intel
              </button>
          </div>
          
          <StatsCard title="Active Operations" value={stats.matches} icon={Activity} color="text-blue-400" />
          <StatsCard title="Registered Units" value={stats.teams} icon={Users} color="text-zinc-300" />
          <StatsCard title="Critical Disputes" value={stats.disputes} icon={AlertTriangle} color={stats.disputes > 0 ? "text-red-500" : "text-emerald-500"} />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. LIVE OPERATIONS FEED */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* DISPUTE ALERT */}
              {stats.disputes > 0 && (
                  <div className="bg-red-950/20 border border-red-500/50 rounded-lg p-4 animate-pulse">
                      <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-sm mb-2">
                          <AlertTriangle size={16} /> Attention Required
                      </div>
                      <div className="space-y-2">
                          {liveMatches.filter(m => m.status === 'disputed').map(m => (
                              <div key={m.id} className="flex justify-between items-center bg-red-900/10 p-2 rounded border border-red-900/30">
                                  <span className="text-white text-xs font-mono">MATCH #{m.match_no}</span>
                                  <button onClick={() => setActiveWarRoomId(m.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase rounded">
                                    Resolve
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* LIVE MATCHES TABLE */}
              <div className="bg-[#0b0c0f] border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
                      <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                          <Sword size={14} className="text-fuchsia-500" /> Active Deployments
                      </h3>
                      <span className="text-[10px] text-zinc-500 bg-black px-2 py-1 rounded border border-zinc-800">
                          {liveMatches.length} MATCHES
                      </span>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                      {liveMatches.length === 0 ? (
                          <div className="p-8 text-center text-zinc-600 text-xs font-mono uppercase tracking-widest">
                              No active matches on radar.
                          </div>
                      ) : (
                          liveMatches.map(match => (
                              <div key={match.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          {match.status === 'live' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${match.status === 'live' ? 'bg-red-900/20 text-red-500 border-red-900/50' : 'bg-fuchsia-900/20 text-fuchsia-500 border-fuchsia-900/50'}`}>
                                              {match.status}
                                          </span>
                                          <span className="text-xs font-mono text-zinc-500">#{match.match_no}</span>
                                      </div>
                                      <div className="text-sm font-bold text-white">
                                          Match in progress...
                                      </div>
                                  </div>
                                  <button onClick={() => setActiveWarRoomId(match.id)} className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-zinc-800 hover:bg-fuchsia-600 text-white text-xs font-bold uppercase rounded">
                                    War Room
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              {/* QUICK NAVIGATION */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <NavButton icon={Shield} label="Bracket View" onClick={() => navigate('/admin/bracket')} color="text-blue-400" />
                  <NavButton icon={Users} label="Roster Cmd" onClick={() => navigate('/admin/roster')} color="text-green-400" />
                  <NavButton icon={FileText} label="Staff Logs" onClick={() => navigate('/admin/staff')} color="text-yellow-400" />
                  <NavButton icon={Activity} label="System Config" onClick={() => alert("Config Disabled in v1.0")} color="text-purple-400" />
              </div>
          </div>

          {/* 3. AUDIT LOG */}
          <div className="space-y-6">
              <div className="bg-[#0b0c0f] border border-zinc-800 rounded-lg overflow-hidden h-full">
                  <div className="p-4 border-b border-white/5 bg-zinc-900/50">
                      <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                          <FileText size={14} className="text-zinc-400" /> Recent Activity
                      </h3>
                  </div>
                  <div className="p-4 space-y-4">
                      {auditLogs.length === 0 ? (
                          <div className="text-zinc-600 text-xs font-mono text-center">Log Empty</div>
                      ) : (
                          auditLogs.map(log => (
                              <div key={log.id} className="relative pl-4 border-l border-zinc-800 pb-1">
                                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-800 border-2 border-black" />
                                  <div className="text-[10px] text-zinc-500 font-mono mb-0.5 uppercase">
                                      {timeAgo(log.created_at)}
                                  </div>
                                  <div className="text-xs text-zinc-300 font-bold leading-tight">
                                      {log.action_type.replace(/_/g, ' ')}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 mt-1 truncate">
                                      Target: <span className="text-zinc-400">{log.target}</span>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>

       </div>

       {/* WAR ROOM MODAL */}
       {activeWarRoomId && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
               <MatchWarRoom 
                  matchId={activeWarRoomId} 
                  onClose={() => { setActiveWarRoomId(null); fetchDashboardIntel(); }} 
               />
           </div>
       )}

    </div>
  );
};

const NavButton = ({ icon: Icon, label, onClick, color }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 rounded-lg transition-all group">
        <div className={`p-2 rounded-full bg-black border border-zinc-800 group-hover:scale-110 transition-transform ${color}`}>
            <Icon size={20} />
        </div>
        <span className="text-xs font-bold uppercase text-zinc-400 group-hover:text-white">{label}</span>
    </button>
);
