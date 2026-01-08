# 🚀 PIXEL PALACE: DEPLOYMENT PROTOCOL
### "THE BURJ KHALIFA STANDARD"

**STATUS:** CLASSIFIED // LEVEL 10 CLEARANCE
**VERSION:** 5.0.0 (GENESIS)

---

## 🛑 PHASE 1: DATABASE GENESIS (SUPABASE)
Navigate to your Supabase Dashboard -> **SQL Editor** -> **New Query**.
Copy and paste the following block to construct the infrastructure.

```sql
-- 1. CLEANUP (WARNING: Wipes existing data)
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS match_vetoes;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS profiles;

-- 2. PROFILES (The Identity Layer)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'guest', -- owner, admin, captain, player
  team_id UUID, -- Will link to teams table later
  faceit_elo INT DEFAULT 1000,
  faceit_url TEXT,
  steam_url TEXT,
  discord_handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TEAMS (The Units)
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  seed_number INT, -- 1 to 16
  captain_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TEAM MEMBERS (The Roster Link)
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player', -- captain, player, standin
  UNIQUE(team_id, user_id)
);

-- 5. MATCHES (The Core Engine)
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_position INT, -- For bracket logic (1, 2, 3...)
  round_number INT DEFAULT 1,
  
  -- Combatants
  team1_id UUID REFERENCES teams(id),
  team2_id UUID REFERENCES teams(id),
  
  -- Scores & State
  score_team1 INT DEFAULT 0,
  score_team2 INT DEFAULT 0,
  winner_id UUID REFERENCES teams(id),
  status TEXT DEFAULT 'scheduled', -- scheduled, veto, live, completed
  
  -- Config
  best_of INT DEFAULT 1,
  map_name TEXT,
  
  -- Server Intel (Protected by RLS)
  server_ip TEXT,
  server_pass TEXT,
  is_visible BOOLEAN DEFAULT FALSE,
  is_paused BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  
  -- Media
  stream_url TEXT,
  demo_url TEXT,
  
  start_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MATCH VETOES (The Ban Phase)
CREATE TABLE match_vetoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  map_name TEXT NOT NULL, -- de_mirage, de_nuke
  type TEXT NOT NULL, -- BAN, PICK, DECIDER
  pick_order INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MESSAGES (Global Chat Nexus)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  display_name TEXT,
  role TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. STORAGE BUCKETS (Execute via "Storage" tab if SQL fails here)
INSERT INTO storage.buckets (id, name, public) VALUES ('team-assets', 'team-assets', true);
