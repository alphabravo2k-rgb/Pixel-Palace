// supabase/functions/faceit-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS Preflight Request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Get the nickname from the request body
    const { nickname } = await req.json()
    if (!nickname) throw new Error('Nickname is required')

    // 3. Get your API Key from Supabase Secrets
    // Run this in terminal: supabase secrets set FACEIT_API_KEY=your_key_here
    const FACEIT_KEY = Deno.env.get('FACEIT_API_KEY')

    // 4. Call Faceit API (Server to Server - No CORS issues here)
    const response = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${nickname}`,
      {
        headers: {
          'Authorization': `Bearer ${FACEIT_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()

    // 5. Return data to your React App
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
