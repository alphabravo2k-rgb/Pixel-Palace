import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Users, AlertTriangle, Sword } from 'lucide-react';
import StatsCard from '../StatsCard';
import { MatchWarRoom } from './MatchWarRoom';
import { AdminAuditLog } from './AdminAuditLog'; // ✅ Importing the Real-Time Component

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ teams: 0, matches: 0, disputes: 0 });
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWarRoomId, setActiveWarRoomId] = useState(null);

  const fetchDashboardIntel = async () => {
    setLoading(true);
    try {
        const [teamsRes, matchesRes] = await Promise.all([
            supabase.from('teams').select('id', { count: 'exact' }),
            supabase.from('matches').select('*').or('status.eq.live,status.eq.disputed,status.eq.veto').order('scheduled_at', { ascending: true })
        ]);

        setStats({
            teams: teamsRes.count || 0,
            matches: matchesRes.data?.length || 0,
            disputes: matchesRes.data?.filter(m => m.status === 'disputed').length || 0
        });

        setLiveMatches(matchesRes.data || []);
    } catch (err) {
        console.error("Intel Fetch Error:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchDashboardIntel();
      // Poll stats every 30s (Audit Log handles its own real-time)
      const interval = setInterval(fetchDashboardIntel, 30000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in fade-in h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar">
       
       {/* 1. TOP STATS ROW */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-1">
              <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
                  COMMAND <span className="text-fuchsia-600">CENTER</span>
              </h1>
              <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">System Online</p>
              </div>
          </div>
          <StatsCard title="Active Operations" value={stats.matches} icon={Activity} color="text-blue-400" />
          <StatsCard title="Registered Units" value={stats.teams} icon={Users} color="text-zinc-300" />
          <StatsCard title="Critical Disputes" value={stats.disputes} icon={AlertTriangle} color={stats.disputes > 0 ? "text-red-500" : "text-emerald-500"} />
       </div>

       {/* 2. MAIN LAYOUT GRID */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          
          {/* LEFT: LIVE OPERATIONS (2/3 width) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
              
              {/* ALERTS */}
              {stats.disputes > 0 && (
                  <div className="bg-red-950/20 border border-red-500/50 rounded-lg p-3 animate-pulse flex justify-between items-center">
                      <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs">
                          <AlertTriangle size={14} /> Attention Required: {stats.disputes} Dispute(s)
                      </div>
                  </div>
              )}

              {/* LIVE MATCHES */}
              <div className="bg-[#0b0c0f] border border-zinc-800 rounded-lg overflow-hidden flex-1 flex flex-col">
                  <div className="p-3 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
                      <h3 className="font-bold text-white text-xs uppercase flex items-center gap-2">
                          <Sword size={14} className="text-fuchsia-500" /> Active Deployments
                      </h3>
                      <span className="text-[9px] text-zinc-500 bg-black px-2 py-1 rounded border border-zinc-800">{liveMatches.length} MATCHES</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                      {liveMatches.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                              <Sword size={48} className="mb-2 stroke-1"/>
                              <span className="text-xs font-mono uppercase tracking-widest">No active hostilities</span>
                          </div>
                      ) : (
                          liveMatches.map(match => (
                              <div key={match.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center justify-between group">
                                  <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${match.status === 'live' ? 'bg-red-900/20 text-red-500 border-red-900/50' : 'bg-fuchsia-900/20 text-fuchsia-500 border-fuchsia-900/50'}`}>
                                              {match.status}
                                          </span>
                                          <span className="text-[10px] font-mono text-zinc-500">#{match.match_no}</span>
                                      </div>
                                      <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                                          Match in progress...
                                      </span>
                                  </div>
                                  <button onClick={() => setActiveWarRoomId(match.id)} className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-zinc-800 hover:bg-fuchsia-600 text-white text-[10px] font-bold uppercase rounded border border-zinc-700 hover:border-fuchsia-500">
                                    War Room
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="grid grid-cols-4 gap-3 h-24">
                  <NavButton icon={Shield} label="Bracket" onClick={() => navigate('/admin/bracket')} color="text-blue-400" />
                  <NavButton icon={Users} label="Roster" onClick={() => navigate('/admin/roster')} color="text-green-400" />
                  <NavButton icon={Activity} label="Staff" onClick={() => navigate('/admin/staff')} color="text-yellow-400" />
                  <NavButton icon={Sword} label="Matches" onClick={() => alert("Matches list view coming soon")} color="text-purple-400" />
              </div>
          </div>

          {/* RIGHT: REAL-TIME AUDIT LOG (1/3 width) */}
          <div className="h-full">
              {/* ✅ THIS IS THE LINK: Dashboard now uses the dedicated Audit Component */}
              <AdminAuditLog className="h-full" limit={50} />
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
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-2 bg-[#0b0c0f] border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 rounded-lg transition-all group h-full">
        <div className={`p-1.5 rounded-full bg-black border border-zinc-800 group-hover:scale-110 transition-transform ${color}`}>
            <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold uppercase text-zinc-500 group-hover:text-white">{label}</span>
    </button>
);
