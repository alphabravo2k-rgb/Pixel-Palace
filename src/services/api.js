import { supabase } from '../supabase/client';

/**
 * PIXEL PALACE DATA SERVICE
 * Centralized data fetching aligned with Golden Master DB Schema.
 */

const ROLE_PRIORITY = {
  'CAPTAIN': 1,
  'PLAYER': 2,
  'SUBSTITUTE': 3,
  'COACH': 4
};

// 1. FETCH TEAM ROSTER
export const fetchTeamRoster = async (teamId) => {
  if (!teamId) return [];

  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        joined_at,
        profile:global_identities (
          display_name, 
          discord_handle, 
          discord_id,
          steam_url
        )
      `)
      .eq('team_id', teamId);

    if (error) throw error;

    // Client-side sorting and flattening
    return data
      .map(member => ({
        id: member.id,
        name: member.profile?.display_name || 'Unknown',
        discordHandle: member.profile?.discord_handle || null,
        role: member.role,
        isCaptain: member.role === 'CAPTAIN',
        discordId: member.profile?.discord_id,
        joinedAt: member.joined_at
      }))
      .sort((a, b) => {
        // Sort by Role Priority first, then Join Date
        const pA = ROLE_PRIORITY[a.role] || 99;
        const pB = ROLE_PRIORITY[b.role] || 99;
        if (pA !== pB) return pA - pB;
        return new Date(a.joinedAt) - new Date(b.joinedAt);
      });

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
      .maybeSingle(); // Prevents 406 error if match doesn't exist

    if (error) throw error;
    return data;

  } catch (err) {
    console.error("❌ Match Details Fetch Error:", err);
    return null;
  }
};
