/**
 * 🔌 PIXEL PALACE: DATA SERVICE LAYER (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // SCHEMA-AGNOSTIC
 */

import { supabase } from '../supabase/client';

const ROLE_PRIORITY = {
  'CAPTAIN': 1,
  'PLAYER': 2,
  'SUBSTITUTE': 3,
  'COACH': 4
};

// ==========================================
// 1. ROSTER OPERATIONS: TEAM DYNAMICS
// ==========================================

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
          discord_id,
          steam_id,
          elo_rating,
          rank_tier
        )
      `)
      .eq('team_id', teamId);

    if (error) throw error;

    return data
      .map(member => ({
        id: member.id,
        uid: member.profile?.id,
        name: member.profile?.display_name || 'REDACTED AGENT',
        avatar: member.profile?.avatar_url || null,
        elo: member.profile?.elo_rating || 1000,
        tier: member.profile?.rank_tier || 1,
        role: member.role,
        isCaptain: member.role === 'CAPTAIN',
      }))
      .sort((a, b) => {
        // Sort Priority: Hierarchy -> Skill Level
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

// ==========================================
// 2. MATCH OPERATIONS: WAR ROOM DATA
// ==========================================

export const fetchMatchDetails = async (matchId) => {
  if (!matchId) return null;

  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team1:team1_id(id, name, logo_url, elo_average),
        team2:team2_id(id, name, logo_url, elo_average),
        vetoes:match_vetoes(*)
      `)
      .eq('id', matchId)
      .maybeSingle();

    if (error) throw error;
    
    // 🧬 Chronological Veto Sequence for 3D HUD Playback
    if (data?.vetoes) {
      data.vetoes.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    
    return data;

  } catch (err) {
    console.error("❌ Match Details Fetch Error:", err);
    return null;
  }
};

// ==========================================
// 3. TOURNAMENT OPERATIONS: BRACKET KERNEL
// ==========================================

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
        score_team1, 
        score_team2, 
        winner_id,
        team1:team1_id(id, name, logo_url),
        team2:team2_id(id, name, logo_url)
      `)
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true })
      .order('match_position', { ascending: true });
      
    if (error) throw error;
    
    return data;

  } catch (err) {
    console.error("❌ Bracket Fetch Error:", err);
    return [];
  }
};
