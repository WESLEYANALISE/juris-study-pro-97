
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Fetch transcript from YouTube
    const transcript = await fetchYouTubeTranscript(videoId)

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

async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  try {
    // First we need to get the caption track URLs
    const videoInfoResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    
    if (!videoInfoResponse.ok) {
      throw new Error('Failed to fetch video info')
    }
    
    const videoInfoText = await videoInfoResponse.text()
    
    // Extract captions data - this is a simplified approach, real implementation would need to parse JSON
    const captionsMatch = videoInfoText.match(/"captionTracks":\[(.*?)\]/)
    
    if (!captionsMatch) {
      // No captions found, let's try to extract some content from the title and description
      const titleMatch = videoInfoText.match(/<title>(.*?)<\/title>/)
      const descriptionMatch = videoInfoText.match(/<meta name="description" content="(.*?)"/)
      
      let extractedContent = ""
      if (titleMatch && titleMatch[1]) {
        extractedContent += titleMatch[1] + ". "
      }
      if (descriptionMatch && descriptionMatch[1]) {
        extractedContent += descriptionMatch[1]
      }
      
      if (extractedContent.length > 0) {
        return extractedContent
      }
      
      return "Não foi possível obter as legendas para este vídeo. Por favor, selecione outro vídeo com legendas disponíveis."
    }
    
    // Extract the caption URL - this is a simplified approach
    const captionsData = captionsMatch[1]
    const urlMatch = captionsData.match(/https:\/\/[^"]*/)
    
    if (!urlMatch) {
      throw new Error('Failed to find caption URL')
    }
    
    const captionUrl = decodeURIComponent(urlMatch[0].replace(/\\u0026/g, '&'))
    
    // Fetch and parse the captions
    const captionsResponse = await fetch(captionUrl)
    
    if (!captionsResponse.ok) {
      throw new Error('Failed to fetch captions')
    }
    
    const captionsXml = await captionsResponse.text()
    
    // Extract text from XML - this is a simplified approach
    const textSegments = Array.from(captionsXml.matchAll(/<text[^>]*>(.*?)<\/text>/g))
      .map(match => match[1].replace(/&#39;/g, "'")
                           .replace(/&amp;/g, "&")
                           .replace(/&quot;/g, '"')
                           .replace(/<[^>]*>/g, ''))
      .filter(text => text.trim().length > 0)
    
    // Join all text segments with periods to make a readable transcript
    return textSegments.join(". ")
    
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw new Error(`Failed to fetch transcript: ${error.message}`)
  }
}
