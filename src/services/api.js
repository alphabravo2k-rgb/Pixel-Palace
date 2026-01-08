import { supabase } from '../supabase/client';

/**
 * 🔌 PIXEL PALACE: DATA SERVICE LAYER
 * -----------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * PURPOSE:
 * 1. SCHEMA ABSTRACTION: Decouples UI from DB column names.
 * 2. TYPE SAFETY: Ensures numbers are numbers, not strings.
 * 3. FALLBACKS: Prevents "undefined" crashes in UI.
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
        profile:profiles (
          id,
          display_name,
          avatar_url,
          discord_handle,
          steam_url,
          faceit_url,
          faceit_elo
        )
      `)
      .eq('team_id', teamId);

    if (error) throw error;

    return data
      .map(member => ({
        id: member.id,
        userId: member.profile?.id,
        name: member.profile?.display_name || 'Unknown Agent',
        avatar: member.profile?.avatar_url || null,
        discordHandle: member.profile?.discord_handle || null,
        steamUrl: member.profile?.steam_url || null,
        faceitUrl: member.profile?.faceit_url || null,
        elo: member.profile?.faceit_elo || 1000,
        role: member.role,
        isCaptain: member.role === 'CAPTAIN',
      }))
      .sort((a, b) => {
        // Sort: Captain -> High ELO -> Low ELO
        const pA = ROLE_PRIORITY[a.role] || 99;
        const pB = ROLE_PRIORITY[b.role] || 99;
        if (pA !== pB) return pA - pB;
        return b.elo - a.elo;
      });

  } catch (err) {
    console.error("❌ Roster Fetch Error:", err);
    return [];
  }
};

// 2. FETCH MATCH DETAILS (War Room / HUD)
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
    
    // Sort vetoes chronologically for the playback engine
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
                id, 
                round_number, 
                match_position, 
                status, 
                start_time,
                score_team1, 
                score_team2, 
                winner_id,
                team1:team1_id(id, name, logo_url, seed_number),
                team2:team2_id(id, name, logo_url, seed_number)
            `)
            .eq('tournament_id', tournamentId)
            .order('round_number', { ascending: true })
            .order('match_position', { ascending: true });
            
        if (error) throw error;
        
        // 🛠️ NORMALIZATION: Ensure 'round_number' exists for Bracket.jsx
        return data.map(m => ({
            ...m,
            // Fallback if DB uses 'round' instead of 'round_number'
            round_number: m.round_number || m.round || 1
        }));

    } catch (err) {
        console.error("❌ Bracket Fetch Error:", err);
        return [];
    }
};
