import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { useTournament } from '../../tournament/useTournament';
import { Lock, Shield, Copy, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { normalizeRole } from '../../lib/security/engine';
import { Button } from '../../ui/Components';
import { SoundNexus, CUES } from '../../lib/soundNexus';

/**
 * 🛡️ ROSTER BUILDER: RECRUITMENT CENTER
 * -------------------------------------
 * STATUS: MASTERED (SCHEMA ALIGNED)
 * * FIXES:
 * 1. DATABASE: Points to 'profiles' table instead of 'global_identities'.
 * 2. AUDIO: Added SoundNexus triggers.
 */

export const RosterBuilder = () => {
  const { session } = useSession();
  const { selectedTournamentId, tournamentData } = useTournament();
  
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch My Team
  const fetchMyStatus = async () => {
    // Check session.user.id because 'session.identity' might be legacy
    const userId = session?.user?.id || session?.identity?.id;
    if (!userId || !selectedTournamentId) return;

    try {
      // ✅ FIXED: Using 'profiles' instead of 'global_identities'
      const { data, error } = await supabase
        .from('team_members')
        .select(`
            role, 
            team:teams!inner (
                id, name, 
                members:team_members (
                    id, role, 
                    player:profiles (display_name, discord_handle)
                )
            )
        `)
        .eq('user_id', userId)
        // Note: If you want to filter by tournament, teams needs a tournament_id column.
        // If teams are global, remove the next line. Assuming global for now:
        // .eq('team.tournament_id', selectedTournamentId) 
        .maybeSingle();

      if (data?.team) {
        setMyTeam({
          ...data.team,
          members: data.team.members.map(m => ({
            ...m,
            role: normalizeRole(m.role),
            username: m.player?.display_name || 'Unknown Operator'
          })).sort((a, b) => (a.role === 'captain' ? -1 : 1))
        });
      }
    } catch (err) {
      console.error("Roster Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyStatus(); }, [selectedTournamentId, session]);

  // 2. Actions
  const handleCreateTeam = async () => {
      const name = window.prompt("ENTER SQUAD NAME:");
      if (!name) return;

      setIsCreating(true);
      SoundNexus.play(CUES.UI_CLICK);

      try {
          const userId = session?.user?.id;
          
          // 1. Create Team
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({ name, captain_id: userId })
            .select()
            .single();

          if (teamError) throw teamError;

          // 2. Add Self as Captain
          const { error: memberError } = await supabase
            .from('team_members')
            .insert({ team_id: team.id, user_id: userId, role: 'captain' });

          if (memberError) throw memberError;

          // 3. Update Profile
          await supabase.from('profiles').update({ team_id: team.id, role: 'captain' }).eq('id', userId);

          toast.success("TEAM ESTABLISHED");
          SoundNexus.play(CUES.SUCCESS);
          fetchMyStatus();
      } catch (e) {
          toast.error(e.message);
          SoundNexus.play(CUES.ERROR);
      } finally {
          setIsCreating(false);
      }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500 animate-pulse font-mono">SYNCING ROSTER DATA...</div>;

  // EMPTY STATE
  if (!myTeam) {
    return (
      <div className="p-8 bg-[#09090b] border border-zinc-800 border-dashed rounded-lg text-center flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-2"><Shield className="w-8 h-8 text-zinc-700" /></div>
        <div>
            <h3 className="text-2xl font-display font-bold uppercase text-white mb-2">Assemble Your Squad</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">Create a new unit to compete.</p>
        </div>
        <Button variant="primary" onClick={handleCreateTeam} disabled={isCreating}>
            {isCreating ? <RefreshCw className="animate-spin w-4 h-4"/> : <Plus className="w-4 h-4 mr-2"/>} Create Team
        </Button>
      </div>
    );
  }

  // ROSTER VIEW
  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-5 bg-zinc-900/80 border-b border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <Shield className="w-5 h-5 text-emerald-500" />
            {myTeam.name}
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-1">CAPTAIN ACCESS GRANTED</p>
        </div>
        <div className="text-xs font-mono px-2 py-1 rounded border bg-zinc-800 text-zinc-400 border-zinc-700">
          {myTeam.members?.length} / 5 OPERATORS
        </div>
      </div>

      <div className="p-4 space-y-2">
        {myTeam.members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold border ${member.role === 'captain' ? "bg-emerald-900/20 text-emerald-400 border-emerald-500/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>
                {member.username?.substring(0,1).toUpperCase()}
              </div>
              <div>
                <div className="text-sm text-white font-bold leading-none">{member.username}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1 font-mono">{member.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
