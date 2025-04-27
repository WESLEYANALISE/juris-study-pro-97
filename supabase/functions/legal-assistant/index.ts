
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const { prompt, context } = await req.json()

    const result = await model.generateContent(
      context 
        ? `Contexto: ${context}\n\nPergunta: ${prompt}`
        : prompt
    )

    const response = await result.response
    const text = response.text()

    return new Response(JSON.stringify({ response: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error in legal assistant function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
