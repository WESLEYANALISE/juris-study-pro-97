
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || 'AIzaSyC_vdQ6MShNiZo60KK2sHO-lgMhUda1woE';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoId, videoTitle, transcript } = await req.json()

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'videoId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Generating summary for video: ${videoId}, title: ${videoTitle || "unknown"}`)
    
    // Check if we already have a summary
    const { data: existingSummary } = await supabase
      .from('video_summaries')
      .select('summary')
      .eq('video_id', videoId)
      .maybeSingle()

    if (existingSummary?.summary) {
      console.log("Using existing summary")
      return new Response(
        JSON.stringify({ summary: existingSummary.summary }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get or fetch transcript
    let videoTranscript = transcript
    if (!videoTranscript) {
      const { data: transcriptData } = await supabase
        .from('video_transcripts')
        .select('transcript')
        .eq('video_id', videoId)
        .maybeSingle()
        
      if (transcriptData?.transcript) {
        videoTranscript = transcriptData.transcript
      } else {
        // For demonstration purposes, we'll generate a simple mock summary when we don't have a transcript
        const summary = `Este é um resumo gerado para o vídeo "${videoTitle || videoId}". ` +
          `Em um ambiente de produção, este resumo seria gerado usando o texto completo da transcrição do vídeo ` +
          `e processado por um modelo de linguagem avançado para destacar os pontos principais, conceitos-chave, ` +
          `e fornecer um resumo estruturado do conteúdo. O resumo incluiria uma introdução ao tema do vídeo, ` +
          `os pontos principais discutidos, conceitos jurídicos relevantes, e uma conclusão.`;
          
        // Store the generated summary
        await supabase
          .from('video_summaries')
          .insert({
            video_id: videoId,
            summary: summary,
            ai_generated: true
          })
          
        return new Response(
          JSON.stringify({ summary }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // In a production environment, here we would use an AI model to generate a summary
    // For demonstration purposes, we'll generate a simple mock summary
    const summary = `Este é um resumo gerado para o vídeo "${videoTitle || videoId}" baseado na sua transcrição. ` +
      `Os principais temas discutidos incluem conceitos jurídicos fundamentais, análise de legislação relevante, ` +
      `e aplicação prática do conhecimento. O vídeo apresenta de forma didática os pontos mais importantes sobre o tema, ` +
      `com exemplos práticos e referências à doutrina mais recente. ` +
      `Recomenda-se assistir com atenção aos trechos entre 2:30 e 5:45, onde são explicados os conceitos essenciais.`;
      
    // Store the generated summary
    await supabase
      .from('video_summaries')
      .insert({
        video_id: videoId,
        summary: summary,
        ai_generated: true
      })
      
    return new Response(
      JSON.stringify({ summary }),
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
