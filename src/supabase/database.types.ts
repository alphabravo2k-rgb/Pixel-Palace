/**
 * 🗄️ DATABASE TYPES: THE NEXUS SCHEMA CONTRACT
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: FULLY SYNCHRONIZED
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          role_id: string // Unified Dynamic Role Link (e.g. 'owner', 'admin')
          elo_rating: number // The Master Skill Rating
          rank_tier: number // Cached Tier (1-10)
          steam_id: string | null
          discord_id: string | null
          country_code: string | null
          ac_status: boolean // Anti-Cheat Active?
          last_ac_heartbeat: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          role_id?: string
          elo_rating?: number
          avatar_url?: string | null
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          role_id?: string
          elo_rating?: number
          ac_status?: boolean
          last_ac_heartbeat?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          short_name: string | null
          logo_url: string | null
          captain_id: string | null
          elo_average: number
          created_at: string
        }
        Insert: {
          name: string
          short_name?: string | null
          captain_id?: string | null
          logo_url?: string | null
        }
        Update: {
          name?: string
          logo_url?: string | null
          elo_average?: number
        }
      }
      matches: {
        Row: {
          id: string
          match_type: 'pug' | 'tournament' | 'scrim'
          team1_id: string | null
          team2_id: string | null
          score_team1: number
          score_team2: number
          winner_id: string | null
          status: 'scheduled' | 'veto' | 'live' | 'completed' | 'disputed'
          map_name: string | null
          server_ip: string | null
          server_pass: string | null // Protected by RLS policies
          ac_required: boolean
          tournament_id: string | null
          created_at: string
        }
        Insert: {
          match_type?: 'pug' | 'tournament' | 'scrim'
          team1_id?: string | null
          team2_id?: string | null
          ac_required?: boolean
        }
        Update: {
          score_team1?: number
          score_team2?: number
          status?: 'scheduled' | 'veto' | 'live' | 'completed' | 'disputed'
          map_name?: string | null
          winner_id?: string | null
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          slug: string
          status: 'upcoming' | 'live' | 'completed'
          start_date: string | null
          server_config: Json // Stores { max_rounds, knife_round, etc. }
          theme_config: Json // Stores { primary_color, accent_color }
        }
        Insert: {
          name: string
          slug: string
          server_config?: Json
          theme_config?: Json
        }
        Update: {
          status?: 'upcoming' | 'live' | 'completed'
          theme_config?: Json
        }
      }
      elo_history: {
        Row: {
          id: string
          user_id: string
          match_id: string | null
          elo_change: number
          new_total: number
          created_at: string
        }
        Insert: {
          user_id: string
          match_id?: string | null
          elo_change: number
          new_total: number
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string
          action_type: string // e.g., 'MATCH_FORCE_WIN', 'BAN_USER'
          target_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          actor_id: string
          action_type: string
          target_id?: string | null
          metadata?: Json
        }
      }
    }
    Views: {
      global_rankings: {
        Row: {
          player_id: string
          display_name: string
          elo_rating: number
          rank_position: number
        }
      }
      api_match_config: {
        Row: {
          match_id: string
          final_config: Json
        }
      }
    }
  }
}
