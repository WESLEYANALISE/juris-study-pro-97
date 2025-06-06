
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice } = await req.json();
    
    if (!text) {
      throw new Error('O texto é obrigatório');
    }

    // Ensure voice is correct
    const voiceId = voice || 'pt-BR-Wavenet-D';
    
    // Use Google TTS API with the provided API key
    const googleTTSApiKey = "AIzaSyC_vdQ6MShNiZo60KK2sHO-lgMhUda1woE";
    
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTTSApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: text
        },
        voice: {
          languageCode: 'pt-BR',
          name: voiceId,
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95, // Slightly slower for better clarity
          pitch: 0.0,         // Default pitch
          volumeGainDb: 0.0   // Default volume
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Google TTS API Error:", error);
      throw new Error(error.error?.message || 'Falha ao gerar áudio');
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ audioContent: data.audioContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
