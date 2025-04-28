
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LovableResponse {
  questions: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoId, transcript } = await req.json()

    if (!videoId || !transcript) {
      return new Response(
        JSON.stringify({ error: 'videoId and transcript are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate questions using Lovable AI
    const segments = transcript.match(/.{1,500}/g) || []
    const questions = []

    for (const segment of segments) {
      const response = await fetch('https://api.lovable.ai/generate-questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: segment,
          format: 'multiple-choice'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data: LovableResponse = await response.json()
      questions.push(...data.questions)
    }

    // Store questions in database
    const { error: questionsError } = await supabaseClient
      .from('video_questions')
      .insert(
        questions.map((q, i) => ({
          video_id: videoId,
          timestamp: Math.floor((i / questions.length) * transcript.length * 0.1),
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }))
      )

    if (questionsError) {
      throw questionsError
    }

    return new Response(
      JSON.stringify({ success: true, questionCount: questions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
