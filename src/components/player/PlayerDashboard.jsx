import React, { useEffect, useState } from 'react';
import { useSession } from '../../auth/useSession';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, Swords, Clock, AlertCircle, LogOut, CheckCircle } from 'lucide-react';

export const PlayerDashboard = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  const [activeMatch, setActiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.team_id) return;
      
      try {
        const { data: match } = await supabase
          .from('matches')
          .select(`*, team1:team1_id(name), team2:team2_id(name)`)
          .or(`team1_id.eq.${session.team_id},team2_id.eq.${session.team_id}`)
          .in('status', ['scheduled', 'veto', 'live'])
          .single();

        setActiveMatch(match);
      } catch (err) {
        console.error("Dashboard Load Error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 animate-pulse font-mono uppercase tracking-widest">Establishing Secure Uplink...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 selection:bg-blue-500/30">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center border-b border-white/10 pb-6 mb-8">
         <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter font-['Teko']">
               UNIT <span className="text-blue-500">DASHBOARD</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                  OPERATOR: {session.identity?.display_name || 'Captain'}
               </span>
               <span className="px-2 py-0.5 bg-blue-900/20 text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-500/20 font-mono">
                  ID: {session.team_id?.slice(0,8)}
               </span>
            </div>
         </div>
         <button onClick={handleLogout} className="group p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-red-400 transition-colors" title="Disconnect">
            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform"/>
         </button>
      </div>

      <div className="max-w-4xl mx-auto grid gap-8">
         
         {/* ACTIVE MISSION CARD */}
         <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600"></div>
            
            {activeMatch ? (
               <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h2 className="text-xl font-bold uppercase flex items-center gap-2 text-white">
                           <Swords className="text-blue-500" /> Active Protocol
                        </h2>
                        <p className="text-zinc-500 text-xs font-mono mt-1 tracking-wider">
                           MATCH #{activeMatch.match_no} • STATUS: <span className="text-white font-bold">{activeMatch.status.toUpperCase()}</span>
                        </p>
                     </div>
                     {activeMatch.status === 'live' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-[10px] font-bold uppercase animate-pulse">
                           <span className="w-1.5 h-1.5 bg-red-500 rounded-full"/> LIVE
                        </div>
                     )}
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-8 rounded-xl border border-white/5 mb-8 backdrop-blur-sm">
                     <div className="text-xl font-black uppercase text-zinc-300 tracking-tight">{activeMatch.team1?.name}</div>
                     <div className="text-2xl font-mono font-bold text-zinc-700">VS</div>
                     <div className="text-xl font-black uppercase text-zinc-300 tracking-tight">{activeMatch.team2?.name}</div>
                  </div>

                  <button 
                     onClick={() => navigate(`/match/${activeMatch.id}`)}
                     className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                     Enter War Room
                  </button>
               </div>
            ) : (
               <div className="text-center py-12">
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                     <Clock className="text-zinc-600 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Standby Phase</h3>
                  <p className="text-zinc-500 text-sm mt-2 max-w-md mx-auto font-mono">
                     No active combat protocols assigned to your unit. 
                     <br/>Stand by for bracket updates.
                  </p>
               </div>
            )}
         </div>

         {/* STATUS GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl flex items-start gap-4">
               <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-500">
                  <Shield size={20}/>
               </div>
               <div>
                   <h3 className="text-sm font-bold uppercase text-white mb-1">Roster Status</h3>
                   <div className="flex items-center gap-2 text-xs text-green-400 font-bold uppercase">
                      <CheckCircle size={12}/> Locked & Verified
                   </div>
               </div>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl flex items-start gap-4">
               <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-500">
                  <AlertCircle size={20}/>
               </div>
               <div>
                   <h3 className="text-sm font-bold uppercase text-white mb-1">Admin Support</h3>
                   <p className="text-xs text-zinc-600 leading-relaxed">
                      Issues? Use the "Dispute" tool inside the Match Room to alert staff.
                   </p>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};
