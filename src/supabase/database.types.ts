/**
 * 🗄️ DATABASE TYPES: THE SCHEMA BLUEPRINT
 * VERSION: 2050.5.0
 * STATUS: SYNCHRONIZED
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
          role: 'guest' | 'player' | 'organizer' | 'admin' | 'owner'
          steam_id_64: string | null
          faceit_elo: number
          country_code: string
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          role?: string
          faceit_elo?: number
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          faceit_elo?: number
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          short_name: string
          logo_url: string | null
          captain_id: string | null
          created_at: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          slug: string
          status: 'upcoming' | 'live' | 'completed'
          server_config: Json // Stores { max_rounds, knife_round, etc. }
          start_date: string | null
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          team1_id: string | null
          team2_id: string | null
          score_team1: number
          score_team2: number
          status: 'scheduled' | 'veto' | 'live' | 'completed'
          server_ip: string | null // Protected by RLS
          server_port: number | null
          map_name: string | null
        }
      }
    }
    Views: {
      api_match_config: {
        Row: {
          match_id: string
          final_config: Json // Merged Tournament + Match config
        }
      }
    }
  }
}
