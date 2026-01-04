import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { useTournament } from '../../tournament/useTournament';
import { Lock, Shield, UserMinus, UserPlus, Copy, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn, copyToClipboard } from '../../lib/utils';
import { normalizeRole } from '../../lib/roles';
import { Button, Input } from '../../ui/Components';

export const RosterBuilder = () => {
  const { session } = useSession();
  const { selectedTournamentId, tournamentData } = useTournament();
  
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  const config = tournamentData?.format_config || { participant_type: 'TEAM', team_size: 5 };
  const isSolo = config.participant_type === 'SOLO';
  const maxPlayers = config.team_size || 6;
  const isLocked = tournamentData?.rosters_lock_at && new Date() > new Date(tournamentData.rosters_lock_at);

  useEffect(() => {
    fetchMyStatus();
  }, [selectedTournamentId, session?.identity?.id]);

  const fetchMyStatus = async () => {
    if (!session?.identity?.id || !selectedTournamentId) return;
    try {
      // 🛡️ COMPLEX QUERY: Fetch Team via Team Member link
      // We need to see if the CURRENT user is in a team for THIS tournament
      const { data, error } = await supabase
        .from('team_members')
        .select(`
            role, 
            team:teams (
                id, name, access_code, 
                members:team_members (
                    id, role, 
                    player:global_identities (display_name, discord_handle)
                )
            )
        `)
        .eq('user_id', session.identity.id) // Adjusted to match schema (user_id not global_id)
        .eq('team.tournament_id', selectedTournamentId)
        .maybeSingle(); // Changed from single() to avoid 406 error if multiple found (edge case)

      if (data && data.team) {
        const normalizedTeam = {
          ...data.team,
          members: data.team.members.map(m => ({
            ...m,
            role: normalizeRole(m.role),
            username: m.player?.display_name || 'Unknown Agent'
          })).sort((a, b) => (a.role === 'captain' ? -1 : 1))
        };
        setMyTeam(normalizedTeam);
      }
    } catch (err) {
      console.warn("Roster fetch status:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSolo = async () => {
    if (isLocked) return;
    toast.error("Solo Registration is disabled in this version.");
  };

  const handleInvite = async () => {
    if (isLocked || !inviteEmail) return;
    // Logic: In a real app, this would insert into an 'invites' table
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail("");
  };

  const copyCode = () => {
      if (myTeam?.access_code) {
          copyToClipboard(myTeam.access_code);
          toast.success("Access Code Copied!");
      }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500 animate-pulse font-mono">SYNCING ROSTER DATA...</div>;

  // 🔒 LOCKED STATE
  if (isLocked) {
    return (
      <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-center gap-4">
        <div className="p-2 bg-red-500/10 rounded-full">
            <Lock className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Rosters Locked</h3>
          <p className="text-xs text-red-300/80 mt-1">Modifications are no longer allowed for this event.</p>
        </div>
      </div>
    );
  }

  // 🆕 EMPTY STATE (No Team)
  if (!myTeam) {
    return (
      <div className="p-8 bg-bg-panel border border-tactical border-dashed rounded-lg text-center flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-zinc-700" />
        </div>
        <div>
            <h3 className="text-2xl font-display font-bold uppercase text-white mb-2">
            {isSolo ? 'Ready to Compete?' : 'Assemble Your Squad'}
            </h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">
            {isSolo ? 'This is a 1v1 event. Sign up directly.' : `This event requires a team of ${maxPlayers}. Create one now or join using an access code.`}
            </p>
        </div>
        
        <div className="flex gap-3">
            {isSolo ? (
            <Button variant="brand" onClick={handleJoinSolo}>
                Join Tournament
            </Button>
            ) : (
            <>
                <Button variant="primary" onClick={() => toast("Feature: Open Create Team Modal")}>
                    Create Team
                </Button>
                <Button variant="secondary" onClick={() => toast("Feature: Open Join Team Modal")}>
                    Join Existing
                </Button>
            </>
            )}
        </div>
      </div>
    );
  }

  // 👥 ROSTER MANAGEMENT
  return (
    <div className="bg-bg-panel border border-tactical rounded-lg overflow-hidden shadow-lg">
      
      {/* HEADER */}
      <div className="p-5 bg-zinc-900/80 border-b border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <Shield className="w-5 h-5 text-brand" />
            {myTeam.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 cursor-pointer group" onClick={copyCode} title="Click to Copy">
            <p className="text-xs text-zinc-500 font-mono">
              ACCESS CODE: <span className="text-zinc-300 group-hover:text-white transition-colors select-all">{myTeam.access_code}</span>
            </p>
            <Copy size={10} className="text-zinc-600 group-hover:text-brand transition-colors" />
          </div>
        </div>
        <div className={cn(
            "text-xs font-mono px-2 py-1 rounded border", 
            myTeam.members?.length >= maxPlayers ? "bg-emerald-950/30 text-emerald-500 border-emerald-900" : "bg-zinc-800 text-zinc-400 border-zinc-700"
        )}>
          {myTeam.members?.length} / {maxPlayers} OPERATORS
        </div>
      </div>

      {/* MEMBERS LIST */}
      <div className="p-4 space-y-2">
        {myTeam.members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={cn(
                  "w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold border",
                  member.role === 'captain' ? "bg-brand/10 text-brand-glow border-brand/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"
              )}>
                {member.username?.substring(0,1).toUpperCase()}
              </div>
              <div>
                <div className="text-sm text-white font-bold leading-none">
                  {member.username}
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1 font-mono">
                  {member.role}
                </div>
              </div>
            </div>
            
            {/* Kick Button (Only for Captains, removing others) */}
            {member.role !== 'captain' && (
              <button 
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-950/30 rounded text-zinc-600 hover:text-red-500 transition-all"
                title="Remove Player"
                onClick={() => toast.error("Kick functionality coming in v1.1")}
              >
                <UserMinus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        
        {/* INVITE BOX */}
        {myTeam.members?.length < maxPlayers && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-2 block">Recruit New Operator</label>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter player email..." 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-black/40"
              />
              <Button onClick={handleInvite} disabled={!inviteEmail} variant="secondary">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
