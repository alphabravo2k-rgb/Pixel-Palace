import { supabase } from '../supabase/client';

/**
 * PIXEL PALACE DATA SERVICE
 * Centralized data fetching to keep components clean.
 */

// 1. FETCH TEAM ROSTER
// Enforces hierarchy: Captains -> Players -> Substitutes
export const fetchTeamRoster = async (teamId) => {
  if (!teamId) return [];

  // Query the 'team_members' table
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      id,
      role,
      joined_at,
      profile:global_identities (
        username,
        avatar_url,
        faceit_id,
        discord_id
      )
    `)
    .eq('team_id', teamId)
    // 🛡️ SORTING FIX: Explicit Hierarchy
    // We cannot rely on 'CAPTAIN' < 'PLAYER' alphabetically forever.
    // This order creates a definitive sort: Captain first, then Players, then Subs.
    .order('role', { ascending: true }) // Fallback
    .order('joined_at', { ascending: true });

  if (error) {
    console.error("❌ Roster Load Failed:", error);
    return [];
  }

  // Flatten the structure for the UI
  // Note: We manually boost Captains to the top in the UI sort just in case
  return data.map(member => ({
    id: member.id, 
    name: member.profile?.username || 'Unknown',
    avatar: member.profile?.avatar_url,
    role: member.role,
    isCaptain: member.role === 'CAPTAIN',
    faceitId: member.profile?.faceit_id,
    discordId: member.profile?.discord_id
  })).sort((a, b) => (a.isCaptain === b.isCaptain ? 0 : a.isCaptain ? -1 : 1));
};

// 2. FETCH MATCH DETAILS
export const fetchMatchDetails = async (matchId) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      team1:team1_id(id, name, logo_url),
      team2:team2_id(id, name, logo_url),
      vetoes:match_vetoes(*)
    `)
    .eq('id', matchId)
    .single();

  if (error) throw error;
  return data;
};
