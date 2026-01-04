import React, { useEffect, useState } from 'react';
import { useSession } from '../../auth/useSession';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, Swords, Clock, AlertCircle, LogOut, CheckCircle, Trophy, User } from 'lucide-react';
import { normalizeRole } from '../../lib/roles';
import { MatchModal } from '../MatchModal'; // ✅ Use the Modal we built
import { cn } from '../../lib/utils';
import { Button } from '../../ui/Components';

export const PlayerDashboard = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  
  const [activeMatch, setActiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMatchModalOpen, setMatchModalOpen] = useState(false);

  // Helper to get Team ID safely from session metadata
  const teamId = session?.user?.user_metadata?.team_id || session?.teamId;
  const userRole = normalizeRole(session?.role);
  const displayName = session?.user?.user_metadata?.display_name || session?.user?.email?.split('@')[0] || 'Operator';

  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) {
          setLoading(false);
          return;
      }
      
      try {
        // Find the most urgent match
        const { data: match } = await supabase
          .from('matches')
          .select(`*, team1:team1_id(name, logo_url), team2:team2_id(name, logo_url)`)
          .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
          .in('status', ['scheduled', 'veto', 'live'])
          .order('scheduled_at', { ascending: true }) // Get the soonest one
          .limit(1)
          .maybeSingle();

        setActiveMatch(match);
      } catch (err) {
        console.error("Dashboard Load Error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return (
      <div className="min-h-screen bg-bg flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <div className="text-zinc-500 animate-pulse font-mono uppercase tracking-widest text-xs">Establishing Uplink...</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-bg text-white p-6 selection:bg-brand/30">
      
      {/* 1. HEADER */}
      <div className="max-w-5xl mx-auto flex justify-between items-center border-b border-white/5 pb-6 mb-8">
         <div>
            <h1 className="text-4xl font-display font-black italic uppercase tracking-tighter">
               OPERATOR <span className="text-brand">DASHBOARD</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
               {/* Online Status */}
               <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2 bg-zinc-900 px-2 py-1 rounded border border-white/5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"/>
                  ONLINE // {displayName}
               </span>
               
               {/* Team ID Badge */}
               {teamId && (
                   <span className="px-2 py-1 bg-brand/10 text-brand-glow text-[10px] font-bold uppercase rounded border border-brand/20 font-mono">
                     UNIT ID: {teamId.slice(0,8)}
                   </span>
               )}
            </div>
         </div>
         
         <button onClick={handleLogout} className="group p-3 bg-zinc-900 hover:bg-red-950/30 rounded-full border border-zinc-800 hover:border-red-900/50 text-zinc-500 hover:text-red-400 transition-all" title="Disconnect">
            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform"/>
         </button>
      </div>

      <div className="max-w-5xl mx-auto grid gap-8">
         
         {/* 2. ACTIVE MISSION CARD */}
         <div className={cn(
             "relative overflow-hidden rounded-lg border transition-all group",
             activeMatch ? "bg-bg-panel border-brand/50 shadow-[0_0_30px_rgba(var(--color-brand)/0.1)]" : "bg-zinc-900/20 border-zinc-800"
         )}>
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand to-brand-glow"></div>
            
            {activeMatch ? (
               <div className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h2 className="text-xl font-bold uppercase flex items-center gap-2 text-white">
                           <Swords className="text-brand animate-pulse" /> Active Protocol
                        </h2>
                        <p className="text-zinc-500 text-xs font-mono mt-1 tracking-wider">
                           MATCH #{activeMatch.match_no} • STATUS: <span className={cn("font-bold", activeMatch.status === 'live' ? "text-red-500" : "text-white")}>{activeMatch.status.toUpperCase()}</span>
                        </p>
                     </div>
                     {activeMatch.status === 'live' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-[10px] font-bold uppercase animate-pulse">
                           <span className="w-1.5 h-1.5 bg-red-500 rounded-full"/> LIVE COMBAT
                        </div>
                     )}
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-8 rounded-lg border border-white/5 mb-8 backdrop-blur-sm relative overflow-hidden">
                      {/* Team 1 */}
                      <div className="flex flex-col items-center gap-2 z-10">
                          <img src={activeMatch.team1?.logo_url || "https://via.placeholder.com/50"} className="w-12 h-12 object-contain" alt="" />
                          <span className="text-xl font-display font-black uppercase text-zinc-300 tracking-tight">{activeMatch.team1?.name}</span>
                      </div>
                      
                      {/* VS */}
                      <div className="text-3xl font-display font-black text-zinc-800 italic z-10">VS</div>
                      
                      {/* Team 2 */}
                      <div className="flex flex-col items-center gap-2 z-10">
                          <img src={activeMatch.team2?.logo_url || "https://via.placeholder.com/50"} className="w-12 h-12 object-contain" alt="" />
                          <span className="text-xl font-display font-black uppercase text-zinc-300 tracking-tight">{activeMatch.team2?.name}</span>
                      </div>
                      
                      {/* Background VS Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                          <Swords size={200} />
                      </div>
                  </div>

                  <Button 
                      variant="brand" 
                      className="w-full py-6 text-lg tracking-widest"
                      onClick={() => setMatchModalOpen(true)}
                  >
                      ENTER MATCH LOBBY
                  </Button>
               </div>
            ) : (
               <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                     <Clock className="text-zinc-600 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Standby Phase</h3>
                  <p className="text-zinc-500 text-sm mt-2 max-w-md mx-auto font-mono leading-relaxed">
                     No active combat protocols assigned to your unit. 
                     <br/>Stand by for tournament bracket updates.
                  </p>
                  
                  {!teamId && (
                      <div className="mt-6 bg-yellow-900/20 border border-yellow-700/30 p-4 rounded text-yellow-500 text-xs font-mono">
                          ⚠️ NO UNIT ASSIGNED. CONTACT ADMIN.
                      </div>
                  )}
               </div>
            )}
         </div>

         {/* 3. STATUS GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Roster Status */}
            <div className="bg-bg-panel border border-tactical p-6 rounded-lg flex items-start gap-4 hover:border-brand/30 transition-colors">
               <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-zinc-500">
                  <Shield size={20}/>
               </div>
               <div>
                   <h3 className="text-sm font-bold uppercase text-white mb-1">Unit Status</h3>
                   <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase">
                      <CheckCircle size={12}/> Verified
                   </div>
                   <p className="text-[10px] text-zinc-600 mt-1 uppercase">Role: {userRole}</p>
               </div>
            </div>
            
            {/* Tournament Info */}
            <div className="bg-bg-panel border border-tactical p-6 rounded-lg flex items-start gap-4 hover:border-brand/30 transition-colors">
               <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-zinc-500">
                  <Trophy size={20}/>
               </div>
               <div>
                   <h3 className="text-sm font-bold uppercase text-white mb-1">Admin Support</h3>
                   <p className="text-xs text-zinc-500 leading-relaxed">
                      Issues? Use the "Dispute" tool inside the Match Lobby to alert staff immediately.
                   </p>
               </div>
            </div>
         </div>

      </div>

      {/* 4. MATCH MODAL (Pop-up instead of new page) */}
      <MatchModal 
        match={activeMatch} 
        isOpen={isMatchModalOpen} 
        onClose={() => setMatchModalOpen(false)} 
      />

    </div>
  );
};
