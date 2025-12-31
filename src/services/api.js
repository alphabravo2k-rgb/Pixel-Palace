import { supabase } from '../supabase/client';

/**
 * PIXEL PALACE DATA SERVICE
 * Centralized data fetching to keep components clean.
 */

// 1. FETCH TEAM ROSTER
// Enforces hierarchy: Captains -> Players -> Substitutes
export const fetchTeamRoster = async (teamId) => {
  if (!teamId) return [];

  try {
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
      // Adjusted field mapping based on Schema (display_name, discord_handle)
      .eq('team_id', teamId)
      .order('role', { ascending: true }) 
      .order('joined_at', { ascending: true });

    if (error) {
      console.error("❌ Roster Load Failed:", error);
      throw new Error('Failed to load team roster.');
    }

    // Flatten the structure for the UI
    return data.map(member => ({
      id: member.id,
      name: member.profile?.username || 'Unknown',
      avatar: member.profile?.avatar_url || null, // Ensure the avatar is handled properly
      role: member.role,
      isCaptain: member.role === 'CAPTAIN',
      discordId: member.profile?.discord_id
    }));
  } catch (err) {
    console.error("❌ Roster Fetch Error:", err);
    return [];
  }
};

// 2. FETCH MATCH DETAILS
export const fetchMatchDetails = async (matchId) => {
  if (!matchId) {
    console.error("❌ No match ID provided.");
    return null;
  }

  try {
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

    if (error) {
      console.error("❌ Match Details Load Failed:", error);
      throw new Error('Failed to load match details.');
    }

    return data;
  } catch (err) {
    console.error("❌ Match Details Fetch Error:", err);
    return null;
  }
};
