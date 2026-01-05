import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from '../../auth/useSession';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, Swords, Clock, LogOut, CheckCircle, Trophy, RefreshCw, Info } from 'lucide-react';
import { normalizeRole } from '../../lib/roles';
import { MatchModal } from '../MatchModal'; 
import { cn } from '../../lib/utils';
import { Button } from '../../ui/Components';

export const PlayerDashboard = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  
  const [activeMatch, setActiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMatchModalOpen, setMatchModalOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // --- IDENTITY RESOLVER ---
  const getTeamId = useCallback(() => {
    // Priority 1: Direct session property (PIN Login)
    if (session?.team_id) return session.team_id;
    if (session?.teamId) return session.teamId;
    
    // Priority 2: User Metadata (Email Login)
    if (session?.user?.user_metadata?.team_id) return session.user.user_metadata.team_id;
    
    // Priority 3: Persistence Layer
    const saved = localStorage.getItem('pixel_captain_session');
    if (saved) {
      try { return JSON.parse(saved).team_id; } catch (e) { return null; }
    }
    return null;
  }, [session]);

  const teamId = getTeamId();
  const userRole = normalizeRole(session?.role);
  const displayName = session?.teamName || session?.user?.user_metadata?.display_name || 'Operator';

  const fetchData = useCallback(async () => {
    if (!teamId) {
        setLoading(false);
        return;
    }
    
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select(`*, team1:team1_id(name, logo_url), team2:team2_id(name, logo_url)`)
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        // We include 'scheduled' so they can see their next opponent immediately
        .in('status', ['scheduled', 'veto', 'live', 'disputed']) 
        .order('scheduled_at', { ascending: true }) 
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveMatch(match);
    } catch (err) {
      console.error("Dashboard Linkage Error:", err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('pixel_captain_session');
    navigate('/login');
  };

  if (loading) return (
      <div className="min-h-screen bg-bg flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--color-brand)/0.5)]"></div>
          <div className="text-zinc-500 animate-pulse font-mono uppercase tracking-widest text-[10px]">Establishing Uplink...</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-bg text-white p-6 selection:bg-brand/30">
      
      {/* 1. TOP NAVIGATION */}
      <div className="max-w-5xl mx-auto flex justify-between items-center border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-display font-black italic uppercase tracking-tighter">
               OPERATOR <span className="text-brand">DASHBOARD</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2 bg-zinc-900/50 px-2 py-1 rounded border border-white/5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"/>
                  ONLINE // {displayName}
               </span>
               
               {teamId && (
                   <button 
                    onClick={() => setShowDebug(!showDebug)}
                    className="px-2 py-1 bg-brand/10 text-brand-glow text-[10px] font-bold uppercase rounded border border-brand/20 font-mono hover:bg-brand/20 transition-all"
                   >
                      UNIT ID: {teamId.slice(0,8)}
                   </button>
               )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-full border border-zinc-800 text-zinc-400 hover:text-white transition-all shadow-lg">
                <RefreshCw size={18} />
            </button>
            <button onClick={handleLogout} className="group p-3 bg-zinc-900 hover:bg-red-950/30 rounded-full border border-zinc-800 hover:border-red-900/50 text-zinc-500 hover:text-red-400 transition-all shadow-lg">
                <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform"/>
            </button>
          </div>
      </div>

      <div className="max-w-5xl mx-auto grid gap-8">
          
          {/* DEBUG INFO (Hidden by default) */}
          {showDebug && (
            <div className="bg-blue-950/20 border border-blue-500/30 p-4 rounded text-[10px] font-mono text-blue-400 animate-in slide-in-from-top-2">
               <Info size={12} className="inline mr-2" />
               SYSTEM_DEBUG: Full UID [{teamId}] | Status [{activeMatch?.status || 'no_match'}] | Auth [PIN]
            </div>
          )}

          {/* 2. MAIN MISSION CARD */}
          <div className={cn(
              "relative overflow-hidden rounded-lg border transition-all duration-500",
              activeMatch ? "bg-bg-panel border-brand/40 shadow-[0_0_40px_rgba(0,0,0,0.5)]" : "bg-zinc-900/10 border-zinc-800/50"
          )}>
            <div className="absolute top-0 left-0 w-1 h-full bg-brand shadow-[0_0_15px_rgba(var(--color-brand)/0.5)]"></div>
            
            {activeMatch ? (
               <div className="p-8 relative z-10 animate-in fade-in duration-700">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h2 className="text-xl font-bold uppercase flex items-center gap-2 text-white italic tracking-tight">
                           <Swords className="text-brand" /> Active Operational Protocol
                        </h2>
                        <p className="text-zinc-500 text-[10px] font-mono mt-1 tracking-[0.2em] uppercase">
                           Match Location: Sector {activeMatch.match_position} // Status: <span className={cn(activeMatch.status === 'live' ? "text-red-500" : "text-brand-glow")}>{activeMatch.status}</span>
                        </p>
                     </div>
                     {activeMatch.status === 'live' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-[10px] font-black uppercase animate-pulse">
                           LIVE ENGAGEMENT
                        </div>
                     )}
                  </div>

                  <div className="flex items-center justify-between bg-black/60 p-10 rounded-xl border border-white/5 mb-8 backdrop-blur-md relative overflow-hidden group-hover:border-brand/20 transition-all">
                      <div className="flex flex-col items-center gap-3 z-10">
                          <div className="w-16 h-16 bg-zinc-900 rounded-lg p-2 border border-white/5 flex items-center justify-center">
                            <img src={activeMatch.team1?.logo_url || "/placeholder-team.png"} className="max-w-full max-h-full object-contain" alt="" />
                          </div>
                          <span className="text-2xl font-display font-black uppercase text-white tracking-tighter italic">{activeMatch.team1?.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-center z-10">
                        <div className="text-4xl font-display font-black text-zinc-800 italic select-none">VS</div>
                        <div className="text-[10px] font-mono text-zinc-600 tracking-widest mt-2 uppercase italic">{activeMatch.map_name || 'VETO PENDING'}</div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-3 z-10">
                          <div className="w-16 h-16 bg-zinc-900 rounded-lg p-2 border border-white/5 flex items-center justify-center">
                            <img src={activeMatch.team2?.logo_url || "/placeholder-team.png"} className="max-w-full max-h-full object-contain" alt="" />
                          </div>
                          <span className="text-2xl font-display font-black uppercase text-white tracking-tighter italic">{activeMatch.team2?.name}</span>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                          <Swords size={300} />
                      </div>
                  </div>

                  <Button 
                      variant="brand" 
                      className="w-full py-8 text-xl font-black italic tracking-[0.3em] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                      onClick={() => setMatchModalOpen(true)}
                  >
                      ENTER COMBAT ZONE
                  </Button>
               </div>
            ) : (
               <div className="p-16 text-center animate-in fade-in duration-500">
                  <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                     <Clock className="text-zinc-700 w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter italic">Standby Phase</h3>
                  <p className="text-zinc-500 text-xs mt-3 max-w-sm mx-auto font-mono leading-relaxed uppercase tracking-widest">
                      No active combat protocols assigned to your unit. 
                      <br/>awaiting bracket update from command.
                  </p>
                  
                  {!teamId && (
                      <div className="mt-8 bg-red-950/20 border border-red-500/30 p-4 rounded text-red-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                          ⚠️ AUTHENTICATION ERROR: NO UNIT ASSIGNED
                      </div>
                  )}
               </div>
            )}
          </div>

          {/* 3. FOOTER INTEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-lg flex items-start gap-4 hover:border-brand/20 transition-all group">
               <div className="p-3 bg-zinc-950 rounded border border-white/5 text-zinc-500 group-hover:text-brand transition-colors">
                  <Shield size={20}/>
               </div>
               <div>
                   <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-widest mb-1">Unit Verification</h3>
                   <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-black uppercase tracking-tighter">
                      <CheckCircle size={12}/> Biometric Link Active
                   </div>
                   <p className="text-[9px] text-zinc-600 mt-1 uppercase font-mono">Role Access: {userRole}</p>
               </div>
            </div>
            
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-lg flex items-start gap-4 hover:border-brand/20 transition-all group">
               <div className="p-3 bg-zinc-950 rounded border border-white/5 text-zinc-500 group-hover:text-brand transition-colors">
                  <Trophy size={20}/>
               </div>
               <div>
                   <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-widest mb-1">Support Uplink</h3>
                   <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-mono italic">
                      Use the "Dispute" tool in the lobby for emergency staff intervention.
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
