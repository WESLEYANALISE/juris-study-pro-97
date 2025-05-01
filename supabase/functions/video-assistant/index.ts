
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyBto9zJDNJCvz76qz56oeMPOBfHhxjPTKA'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { prompt, context, contentType } = await req.json()
    
    // Prepare the request payload for Gemini API
    const requestBody = {
      contents: [{
        parts: [
          { text: context ? `Contexto: ${context}\n\nPergunta: ${prompt}` : prompt }
        ]
      }]
    }
    
    // Make request to Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status} ${errorText}`)
    }
    
    const responseData = await response.json()
    
    // Extract text from the response
    const result = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated."
    
    // Return the response
    return new Response(JSON.stringify({ response: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error in video assistant function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
