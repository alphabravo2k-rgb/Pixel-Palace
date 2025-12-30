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
  // Joined with 'global_identities' to get names/avatars
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      id,
      role,
      joined_at,
      profile:global_identities (
        username:display_name, 
        avatar_url:discord_handle, 
        discord_id
      )
    `)
    // Note: Adjusted field mapping based on Schema (display_name, discord_handle)
    .eq('team_id', teamId)
    .order('role', { ascending: true }) 
    .order('joined_at', { ascending: true });

  if (error) {
    console.error("❌ Roster Load Failed:", error);
    return [];
  }

  // Flatten the structure for the UI
  return data.map(member => ({
    id: member.id,
    name: member.profile?.username || 'Unknown',
    avatar: null, // Schema doesn't have avatar_url yet, using placeholder in UI
    role: member.role,
    isCaptain: member.role === 'CAPTAIN',
    discordId: member.profile?.discord_id
  }));
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
