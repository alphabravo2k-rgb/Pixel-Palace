import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { useTournament } from '../../tournament/useTournament';
import { Lock, Shield, UserPlus, Copy, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '../../lib/utils';
import { normalizeRole } from '../../lib/roles';
import { Button, Input } from '../../ui/Components';

export const RosterBuilder = () => {
  const { session } = useSession();
  const { selectedTournamentId, tournamentData } = useTournament();
  
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const config = tournamentData?.format_config || { participant_type: 'TEAM', team_size: 5 };
  const maxPlayers = config.team_size || 6;
  const isLocked = tournamentData?.rosters_lock_at && new Date() > new Date(tournamentData.rosters_lock_at);

  // 1. Fetch My Team
  const fetchMyStatus = async () => {
    if (!session?.identity?.id || !selectedTournamentId) return;
    try {
      // Find which team the user is in for this tournament
      const { data, error } = await supabase
        .from('team_members')
        .select(`
            role, 
            team:teams!inner (
                id, name, access_code, 
                members:team_members (
                    id, role, 
                    player:global_identities (display_name, discord_handle)
                )
            )
        `)
        .eq('user_id', session.identity.id)
        .eq('team.tournament_id', selectedTournamentId)
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

  useEffect(() => { fetchMyStatus(); }, [selectedTournamentId, session?.identity?.id]);

  // 2. Actions
  const handleCreateTeam = async () => {
      if (isLocked) return;
      const name = window.prompt("Enter Team Name:");
      if (!name) return;

      setIsCreating(true);
      try {
          // RPC to safely create team + join as captain
          const { data, error } = await supabase.rpc('api_create_team', {
              p_tournament_id: selectedTournamentId,
              p_name: name,
              p_user_id: session.identity.id
          });

          if (error) throw error;
          toast.success("Team Established");
          fetchMyStatus();
      } catch (e) {
          toast.error(e.message);
      } finally {
          setIsCreating(false);
      }
  };

  const handleJoinTeam = async () => {
      if (isLocked) return;
      const code = window.prompt("Enter Access Code:");
      if (!code) return;

      setLoading(true);
      try {
          const { data, error } = await supabase.rpc('api_join_team', {
              p_access_code: code,
              p_user_id: session.identity.id
          });
          if (error) throw error;
          toast.success("Joined Unit Successfully");
          fetchMyStatus();
      } catch (e) {
          toast.error(e.message);
      } finally {
          setLoading(false);
      }
  };

  const copyCode = () => {
      if (myTeam?.access_code) {
          copyToClipboard(myTeam.access_code);
          toast.success("Access Code Copied!");
      }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500 animate-pulse font-mono">SYNCING ROSTER DATA...</div>;

  if (isLocked) {
    return (
      <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-center gap-4">
        <div className="p-2 bg-red-500/10 rounded-full"><Lock className="w-5 h-5 text-red-500" /></div>
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Rosters Locked</h3>
          <p className="text-xs text-red-300/80 mt-1">Modifications are no longer allowed for this event.</p>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (!myTeam) {
    return (
      <div className="p-8 bg-[#09090b] border border-zinc-800 border-dashed rounded-lg text-center flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-2"><Shield className="w-8 h-8 text-zinc-700" /></div>
        <div>
            <h3 className="text-2xl font-display font-bold uppercase text-white mb-2">Assemble Your Squad</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">Create a new unit or join an existing one using an access code.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="primary" onClick={handleCreateTeam} disabled={isCreating}>
                {isCreating ? <RefreshCw className="animate-spin w-4 h-4"/> : <Plus className="w-4 h-4 mr-2"/>} Create Team
            </Button>
            <Button variant="secondary" onClick={handleJoinTeam}>
                Join Existing
            </Button>
        </div>
      </div>
    );
  }

  // ROSTER VIEW
  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-5 bg-zinc-900/80 border-b border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <Shield className="w-5 h-5 text-fuchsia-500" />
            {myTeam.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 cursor-pointer group" onClick={copyCode} title="Click to Copy">
            <p className="text-xs text-zinc-500 font-mono">
              ACCESS CODE: <span className="text-zinc-300 group-hover:text-white transition-colors select-all">{myTeam.access_code}</span>
            </p>
            <Copy size={10} className="text-zinc-600 group-hover:text-fuchsia-500 transition-colors" />
          </div>
        </div>
        <div className="text-xs font-mono px-2 py-1 rounded border bg-zinc-800 text-zinc-400 border-zinc-700">
          {myTeam.members?.length} / {maxPlayers} OPERATORS
        </div>
      </div>

      <div className="p-4 space-y-2">
        {myTeam.members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold border ${member.role === 'captain' ? "bg-fuchsia-900/20 text-fuchsia-400 border-fuchsia-500/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>
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
