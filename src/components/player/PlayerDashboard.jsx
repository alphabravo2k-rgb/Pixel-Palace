import React, { useEffect, useState } from 'react';
import { useSession } from '../../auth/useSession';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, Swords, Clock, AlertCircle, LogOut } from 'lucide-react';

export const PlayerDashboard = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  const [activeMatch, setActiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Get Team Details & Active Match
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.team_id) return;
      
      try {
        // Find active match (Scheduled, Veto, or Live)
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 animate-pulse">Establishing Uplink...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center border-b border-white/10 pb-6 mb-8">
         <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter font-['Teko']">
               UNIT <span className="text-blue-500">DASHBOARD</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  OPERATOR: {session.identity?.display_name || 'Captain'}
               </span>
               <span className="px-2 py-0.5 bg-blue-900/20 text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-500/20">
                  Team ID: {session.team_id?.slice(0,8)}
               </span>
            </div>
         </div>
         <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-red-400 transition-colors">
            <LogOut size={20} />
         </button>
      </div>

      <div className="max-w-4xl mx-auto grid gap-6">
         
         {/* ACTIVE MISSION CARD */}
         <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            
            {activeMatch ? (
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-xl font-bold uppercase flex items-center gap-2">
                           <Swords className="text-blue-500" /> Active Protocol
                        </h2>
                        <p className="text-zinc-500 text-xs font-mono mt-1">
                           MATCH #{activeMatch.match_no} • {activeMatch.status.toUpperCase()}
                        </p>
                     </div>
                     {activeMatch.status === 'live' && (
                        <span className="animate-pulse bg-red-600 px-3 py-1 rounded text-[10px] font-bold uppercase">LIVE</span>
                     )}
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-6 rounded-xl border border-white/5 mb-6">
                     <div className="text-lg font-black uppercase text-zinc-300">{activeMatch.team1?.name}</div>
                     <div className="text-2xl font-mono font-bold text-blue-500">VS</div>
                     <div className="text-lg font-black uppercase text-zinc-300">{activeMatch.team2?.name}</div>
                  </div>

                  <button 
                     onClick={() => navigate(`/match/${activeMatch.id}`)}
                     className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                  >
                     Enter War Room
                  </button>
               </div>
            ) : (
               <div className="text-center py-8">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Clock className="text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase">Standby Phase</h3>
                  <p className="text-zinc-500 text-sm mt-2 max-w-md mx-auto">
                     No active matches assigned to your unit. Wait for the bracket to update or contact an admin.
                  </p>
               </div>
            )}
         </div>

         {/* QUICK LINKS */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
               <h3 className="text-sm font-bold uppercase text-zinc-400 mb-2 flex items-center gap-2">
                  <Shield size={14}/> Unit Status
               </h3>
               <p className="text-xs text-zinc-600">
                  Roster locked. No substitutions allowed without Admin override.
               </p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
               <h3 className="text-sm font-bold uppercase text-zinc-400 mb-2 flex items-center gap-2">
                  <AlertCircle size={14}/> Help Request
               </h3>
               <p className="text-xs text-zinc-600">
                  Need assistance? Use the "Dispute" button inside the Match Room.
               </p>
            </div>
         </div>

      </div>
    </div>
  );
};
