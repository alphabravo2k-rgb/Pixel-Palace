/**
 * 🛰️ FACEIT PROXY KERNEL: DATA REFINERY
 * VERSION: 2050.5.0
 * STATUS: SECURED // OPTIMIZED
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nickname } = await req.json()
    if (!nickname) throw new Error('Nickname target required for uplink.')

    // Retrieve API Key from Vault
    const FACEIT_KEY = Deno.env.get('FACEIT_API_KEY')
    if (!FACEIT_KEY) throw new Error('Proxy Secret Vault is empty.')

    // 2. FETCH DATA FROM SOURCE
    const response = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
      {
        headers: {
          'Authorization': `Bearer ${FACEIT_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      // Graceful 404 handling if player doesn't exist
      return new Response(JSON.stringify({ error: 'Player not found in Faceit database' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const rawData = await response.json()

    // 3. DATA REFINERY (The Faceit-Killer Optimization)
    // We only send exactly what the 3D HUD needs. This reduces latency.
    const refinedData = {
      player_id: rawData.player_id,
      nickname: rawData.nickname,
      avatar: rawData.avatar,
      country: rawData.country,
      // Priority: CS2 -> CSGO -> Default 1000
      elo: rawData.games?.cs2?.faceit_elo || rawData.games?.csgo?.faceit_elo || 1000,
      level: rawData.games?.cs2?.skill_level || rawData.games?.csgo?.skill_level || 1,
      steam_id: rawData.steam_id_64 || rawData.steam_user_id, // Ensure we get the 64-bit ID
      faceit_url: rawData.faceit_url?.replace('{lang}', 'en')
    }

    return new Response(JSON.stringify(refinedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
