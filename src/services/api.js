import { supabase } from '../supabase/client';

/**
 * PIXEL PALACE DATA SERVICE
 * Centralized data fetching aligned with Master DB Schema (Code A).
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
        profile:global_identities (
          id,
          display_name, 
          discord_handle, 
          steam_url,
          faceit_url,
          faceit_elo
        )
      `)
      .eq('team_id', teamId);

    if (error) throw error;

    // Client-side sorting and flattening
    return data
      .map(member => ({
        id: member.id,
        // Fallback to 'Unknown' if profile is missing (prevents crash)
        name: member.profile?.display_name || 'Unknown Agent',
        discordHandle: member.profile?.discord_handle || null,
        steamUrl: member.profile?.steam_url || null,
        faceitUrl: member.profile?.faceit_url || null,
        elo: member.profile?.faceit_elo || 1000,
        role: member.role,
        isCaptain: member.role === 'CAPTAIN',
      }))
      .sort((a, b) => {
        // 1. Sort by Role (Captain first)
        const pA = ROLE_PRIORITY[a.role] || 99;
        const pB = ROLE_PRIORITY[b.role] || 99;
        if (pA !== pB) return pA - pB;
        
        // 2. Sort by ELO (High skill first)
        return b.elo - a.elo;
      });

  } catch (err) {
    console.error("❌ Roster Fetch Error:", err);
    return [];
  }
};

// 2. FETCH MATCH DETAILS (War Room)
export const fetchMatchDetails = async (matchId) => {
  if (!matchId) return null;

  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team1:team1_id(id, name, logo_url, region, wins, losses),
        team2:team2_id(id, name, logo_url, region, wins, losses),
        vetoes:match_vetoes(*)
      `)
      .eq('id', matchId)
      .maybeSingle(); 

    if (error) throw error;
    
    // Sort vetoes by pick_order for correct display history
    if (data && data.vetoes) {
        data.vetoes.sort((a, b) => a.pick_order - b.pick_order);
    }
    
    return data;

  } catch (err) {
    console.error("❌ Match Details Fetch Error:", err);
    return null;
  }
};

// 3. FETCH BRACKET (Tournament Tree)
export const fetchBracketMatches = async (tournamentId) => {
    if (!tournamentId) return [];
    
    try {
        const { data, error } = await supabase
            .from('matches')
            .select(`
                id, round, match_no, status, start_time,
                score_team1, score_team2, winner_id,
                team1:team1_id(id, name, logo_url, seed_number),
                team2:team2_id(id, name, logo_url, seed_number)
            `)
            .eq('tournament_id', tournamentId)
            .order('round', { ascending: true })
            .order('match_no', { ascending: true });
            
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("❌ Bracket Fetch Error:", err);
        return [];
    }
};
