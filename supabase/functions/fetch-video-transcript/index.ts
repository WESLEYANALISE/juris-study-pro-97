
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoId } = await req.json()

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'videoId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Fetching transcript for video ID: ${videoId}`)
    
    // For now, we'll return a simulated transcript
    // In a production environment, you would use a proper YouTube transcript API
    // or a third-party service to extract transcripts
    const transcript = `Este é um exemplo de transcrição para o vídeo ${videoId}. 
    Em um ambiente de produção, esta função usaria uma API adequada para extrair 
    a transcrição real do YouTube ou serviços de terceiros. A transcrição incluiria 
    todo o conteúdo falado no vídeo, permitindo que os alunos possam revisar o material, 
    fazer anotações ou usar para recursos de acessibilidade. Além disso, a transcrição 
    serve como base para a geração de perguntas interativas e resumos do conteúdo do vídeo.`;

    return new Response(
      JSON.stringify({ transcript }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
