import { supabase } from '../supabase/client';

/**
 * PIXEL PALACE DATA SERVICE
 * Centralized data fetching to keep components clean.
 */

// 1. FETCH TEAM ROSTER (The Correct Way)
// Enforces hierarchy: Captains -> Players -> Substitutes
export const fetchTeamRoster = async (teamId) => {
  if (!teamId) return [];

  // Query the 'team_members' table (The new abstraction we built)
  // Joined with 'global_identities' to get names/avatars
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
    // 🛡️ SORTING FIX: Captains First
    // 'CAPTAIN' comes before 'PLAYER' alphabetically, so this puts Captains on top.
    .order('role', { ascending: true }) 
    .order('joined_at', { ascending: true }); // Then by join date

  if (error) {
    console.error("❌ Roster Load Failed:", error);
    return [];
  }

  // Flatten the structure for the UI
  return data.map(member => ({
    id: member.id, // This is the membership_id needed for Kicking
    name: member.profile?.username || 'Unknown',
    avatar: member.profile?.avatar_url,
    role: member.role,
    isCaptain: member.role === 'CAPTAIN',
    faceitId: member.profile?.faceit_id,
    discordId: member.profile?.discord_id
  }));
};

// 2. FETCH MATCH DETAILS (For Admin Modal)
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
