/**
 * 🛡️ ROSTER BUILDER: RECRUITMENT HUB (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // DATA-LOCKED
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { useTournament } from '../../tournament/useTournament';
import { Lock, Shield, Copy, Plus, RefreshCw, Zap, Users, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { normalizeRole } from '../../lib/security/engine';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { cn } from '../../lib/utils';

export const RosterBuilder = () => {
  const { user, syncNexus } = useNexus();
  const { selectedTournamentId } = useTournament();
  
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // 📡 DATA RETRIEVAL ENGINE
  const fetchMyStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
            role, 
            team:teams!inner (
                id, name, 
                members:team_members (
                    id, role, 
                    player:profiles (display_name, discord_handle, faceit_elo)
                )
            )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.team) {
        const teamData = {
          ...data.team,
          members: data.team.members.map(m => ({
            ...m,
            role: normalizeRole(m.role),
            username: m.player?.display_name || 'Unknown Operator',
            elo: m.player?.faceit_elo || 0
          })).sort((a, b) => (a.role === 'captain' ? -1 : 1))
        };
        setMyTeam(teamData);
      } else {
        setMyTeam(null);
      }
    } catch (err) {
      console.error("Roster Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchMyStatus(); }, [fetchMyStatus]);

  // ⚡ ATOMIC TEAM INITIALIZATION
  const handleCreateTeam = async () => {
      const name = window.prompt("ENTER TACTICAL SQUAD NAME:");
      if (!name || name.length < 3) {
          toast.error("IDENTIFIER TOO SHORT");
          return;
      }

      setIsCreating(true);
      try { SoundNexus.play(CUES.UI_CLICK_HEAVY); } catch(e){}

      try {
          // Phase 1: Team Registry
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({ name, captain_id: user.id })
            .select()
            .single();

          if (teamError) throw teamError;

          // Phase 2: Roster Enlistment (Captain Assignment)
          const { error: memberError } = await supabase
            .from('team_members')
            .insert({ team_id: team.id, user_id: user.id, role: 'captain' });

          if (memberError) throw memberError;

          // Phase 3: Global Profile Sync
          await supabase.from('profiles').update({ team_id: team.id, role: 'captain' }).eq('id', user.id);

          Telemetry.log(EVENTS.ACTION, { action: 'TEAM_CREATED', teamName: name }, user.id);
          toast.success("COMBAT UNIT ESTABLISHED");
          try { SoundNexus.play(CUES.UI_SUCCESS); } catch(e){}
          
          await syncNexus(); // Re-sync global state
          fetchMyStatus();
      } catch (e) {
          toast.error("INITIALIZATION FAILED: " + e.message);
          try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
      } finally {
          setIsCreating(false);
      }
  };

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-4 opacity-50 grayscale">
        <RefreshCw className="animate-spin text-zinc-500" size={24} />
        <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Decoding Roster...</span>
    </div>
  );

  // 🛰️ UNASSIGNED STATE
  if (!myTeam) {
    return (
      <div className="p-10 bg-[#09090b] border border-zinc-800 border-dashed rounded-sm text-center flex flex-col items-center justify-center gap-6 group hover:border-zinc-700 transition-colors">
        <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-700">
            <Users className="w-8 h-8 text-zinc-700 -rotate-45 group-hover:rotate-0 transition-transform duration-700" />
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-display font-black uppercase italic text-white tracking-tighter">Assemble Unit</h3>
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em]">No active squad detected in sector</p>
        </div>
        <button 
            onClick={handleCreateTeam} 
            disabled={isCreating}
            className="px-8 py-4 bg-zinc-900 border border-white/5 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all active:scale-95 shadow-2xl"
        >
            {isCreating ? 'Initializing...' : 'Establish Team'}
        </button>
      </div>
    );
  }

  // ⚔️ ACTIVE ROSTER VIEW
  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-sm overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="p-6 bg-zinc-900/30 border-b border-white/5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-fuchsia-600/10 border border-fuchsia-500/30 rounded-sm flex items-center justify-center rotate-3 shadow-neon">
            <Shield className="w-6 h-6 text-fuchsia-500" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
              {myTeam.name}
            </h3>
            <div className="flex items-center gap-3 mt-2">
                <Zap size={10} className="text-fuchsia-500 animate-pulse" />
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.3em]">Status: Combat Ready</p>
            </div>
          </div>
        </div>
        <div className="text-right">
            <div className="text-[10px] font-black text-white bg-white/5 px-3 py-1 rounded-sm border border-white/10 tracking-widest uppercase">
              {myTeam.members?.length} / 5 Operators
            </div>
        </div>
      </div>

      <div className="p-4 space-y-2 relative z-10">
        {myTeam.members?.map((member, idx) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-black/40 rounded-sm border border-white/5 hover:border-fuchsia-500/30 transition-all group overflow-hidden">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-sm flex items-center justify-center text-sm font-black border transition-all duration-500",
                member.role === 'captain' ? "bg-fuchsia-600/10 text-fuchsia-500 border-fuchsia-500/40" : "bg-zinc-900 text-zinc-600 border-zinc-800"
              )}>
                {member.role === 'captain' ? <Crown size={16} /> : member.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                    {member.username}
                    {member.role === 'captain' && <span className="text-[8px] bg-fuchsia-600 text-white px-1 rounded-sm not-italic">CMD</span>}
                </div>
                <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mt-1 font-mono">{member.role}</div>
              </div>
            </div>
            <div className="text-right opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-zinc-500">Power: {member.elo}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-black/60 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-zinc-800 uppercase tracking-widest">
         <span>Nexus_Unit_ID: {myTeam.id.slice(0, 12)}</span>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Synchronized</span>
         </div>
      </div>
    </div>
  );
};
