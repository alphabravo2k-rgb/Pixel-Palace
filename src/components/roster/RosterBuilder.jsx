import React, { useState, useEffect } from 'react';
import { useSession } from '../../auth/useSession';
import { useTournament } from '../../tournament/useTournament';
import { supabase } from '../../supabase/client';
import { UserPlus, UserMinus, Shield, Lock, AlertTriangle } from 'lucide-react';

export const RosterBuilder = () => {
  const { session } = useSession();
  const { selectedTournamentId, tournamentData } = useTournament();
  
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  // 1. CONFIG: Read the rules from the DB
  const config = tournamentData?.format_config || { participant_type: 'TEAM', team_size: 5 };
  const isSolo = config.participant_type === 'SOLO';
  const maxPlayers = config.team_size;
  
  // 2. LIFECYCLE: Check if Roster Lock has passed
  const isLocked = tournamentData?.rosters_lock_at && new Date() > new Date(tournamentData.rosters_lock_at);

  useEffect(() => {
    fetchMyStatus();
  }, [selectedTournamentId, session?.identity?.id]);

  const fetchMyStatus = async () => {
    if (!session?.identity?.id || !selectedTournamentId) return;
    try {
      // Find the team this user belongs to for this tournament
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          role,
          team:teams (
            id, name, access_code,
            members:team_members (
              id, role, player:players(ingame_name, avatar_url)
            )
          )
        `)
        .eq('user_id', session.identity.id)
        .eq('team.tournament_id', selectedTournamentId) // Ensure scope
        .single();

      if (data) setMyTeam(data.team);
    } catch (err) {
      // No team found is normal for new users
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSolo = async () => {
    if (isLocked) return;
    // Logic to auto-create a "Team of 1" for the user
    // In backend, 1v1 is treated as a 1-man team for bracket compatibility
    const { error } = await supabase.rpc('register_solo_player', {
      p_tournament_id: selectedTournamentId,
      p_user_id: session.identity.id
    });
    if (!error) fetchMyStatus();
  };

  const handleInvite = async () => {
    if (isLocked || !inviteEmail) return;
    // Real implementation would send an email or generate a link
    alert(`Invite system would send link to: ${inviteEmail}`);
    setInviteEmail("");
  };

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading Roster Status...</div>;

  // 🔒 LOCKED STATE UI
  if (isLocked) {
    return (
      <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-lg flex items-center gap-3">
        <Lock className="w-5 h-5 text-red-500" />
        <div>
          <h3 className="text-white font-bold text-sm">Rosters are Locked</h3>
          <p className="text-xs text-red-300">Modifications are no longer allowed for this event.</p>
        </div>
      </div>
    );
  }

  // 👋 NOT REGISTERED STATE
  if (!myTeam) {
    return (
      <div className="p-6 bg-zinc-900 border border-white/10 rounded-lg text-center">
        <h3 className="text-xl font-['Teko'] uppercase text-white mb-2">
          {isSolo ? 'Ready to Compete?' : 'Assemble Your Squad'}
        </h3>
        <p className="text-zinc-500 text-sm mb-6">
          {isSolo 
            ? 'This is a 1v1 event. Sign up directly.' 
            : `This event requires a team of ${maxPlayers}. Create one now.`}
        </p>
        
        {isSolo ? (
          <button 
            onClick={handleJoinSolo}
            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase tracking-wider rounded transition-all"
          >
            Join Tournament
          </button>
        ) : (
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded transition-all">
            Create Team
          </button>
        )}
      </div>
    );
  }

  // 🛡️ TEAM MANAGEMENT UI (5v5)
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-zinc-950 border-b border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-fuchsia-500" />
            {myTeam.name}
          </h3>
          <p className="text-xs text-zinc-500 font-mono">
            Code: <span className="text-zinc-300 select-all">{myTeam.access_code}</span>
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-400">
          {myTeam.members?.length} / {maxPlayers} Players
        </div>
      </div>

      {/* Member List */}
      <div className="p-4 space-y-2">
        {myTeam.members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500">
                {member.player?.ingame_name?.substring(0,2).toUpperCase() || '??'}
              </div>
              <div>
                <div className="text-sm text-white font-bold">
                  {member.player?.ingame_name || 'Unknown'}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  {member.role}
                </div>
              </div>
            </div>
            
            {/* Kick Button (Only Captains can see) */}
            {member.role !== 'CAPTAIN' && (
              <button className="text-zinc-600 hover:text-red-500 transition-colors">
                <UserMinus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Invite Slot */}
        {myTeam.members?.length < maxPlayers && (
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            <input 
              type="email" 
              placeholder="Invite by email..." 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-fuchsia-500 outline-none"
            />
            <button 
              onClick={handleInvite}
              className="p-2 bg-white/5 hover:bg-white/10 rounded text-zinc-300"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
