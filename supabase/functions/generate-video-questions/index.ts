
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
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

    console.log(`Generating questions for video ID: ${videoId}`)

    // Split transcript into segments of approximately 1000 characters to process in chunks
    const segments = splitTranscript(transcript, 1000)
    
    // Generate at most 5 questions to avoid overwhelming the user
    const maxQuestions = Math.min(5, Math.max(2, Math.floor(transcript.length / 500)))
    
    console.log(`Target question count: ${maxQuestions}, transcript length: ${transcript.length} chars`)
    
    // Generate questions from the transcript
    const questions = await generateQuestionsFromTranscript(segments, maxQuestions)
    
    // Calculate timestamps for questions
    // We'll distribute them evenly across the video duration
    // For simplicity, we'll estimate video duration based on transcript length
    const estimatedDuration = Math.max(60, Math.min(3600, transcript.length / 10)) // Rough estimate: 10 chars per second
    
    console.log(`Estimated video duration: ${estimatedDuration} seconds`)
    
    // Distribute questions at approximately 25%, 50%, 75% of the video
    const questionsWithTimestamps = questions.map((question, index) => {
      const timestamp = Math.floor((index + 1) * estimatedDuration / (questions.length + 1))
      return { ...question, timestamp }
    })

    console.log(`Generated ${questionsWithTimestamps.length} questions at timestamps:`, 
      questionsWithTimestamps.map(q => q.timestamp).join(", "))

    // Store questions in database
    const { error: questionsError } = await supabaseClient
      .from('video_questions')
      .insert(
        questionsWithTimestamps.map(q => ({
          video_id: videoId,
          timestamp: q.timestamp,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }))
      )

    if (questionsError) {
      console.error("Error storing questions:", questionsError)
      throw questionsError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        questionCount: questionsWithTimestamps.length,
        questions: questionsWithTimestamps
      }),
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

function splitTranscript(transcript: string, maxLength: number): string[] {
  const segments: string[] = []
  let currentIndex = 0
  
  while (currentIndex < transcript.length) {
    // Find a good breaking point (end of sentence) within maxLength
    let endIndex = Math.min(currentIndex + maxLength, transcript.length)
    
    if (endIndex < transcript.length) {
      // Try to find end of sentence (., !, ?)
      const periodIndex = transcript.lastIndexOf('.', endIndex)
      const exclamationIndex = transcript.lastIndexOf('!', endIndex)
      const questionIndex = transcript.lastIndexOf('?', endIndex)
      
      // Find the maximum of these indices that is still after currentIndex
      const sentenceEndIndex = Math.max(
        periodIndex > currentIndex ? periodIndex + 1 : currentIndex,
        exclamationIndex > currentIndex ? exclamationIndex + 1 : currentIndex,
        questionIndex > currentIndex ? questionIndex + 1 : currentIndex
      )
      
      // If we found a sentence end, use it, otherwise just use the maximum length
      endIndex = sentenceEndIndex > currentIndex ? sentenceEndIndex : endIndex
    }
    
    segments.push(transcript.substring(currentIndex, endIndex).trim())
    currentIndex = endIndex
  }
  
  return segments
}

async function generateQuestionsFromTranscript(
  segments: string[],
  targetQuestionCount: number
): Promise<GeneratedQuestion[]> {
  // We'll use a simple approach to generate multiple choice questions
  // This is a placeholder for actual question generation
  const questions: GeneratedQuestion[] = []
  const questionsPerSegment = Math.ceil(targetQuestionCount / segments.length)
  
  for (const segment of segments) {
    // Skip segments that are too short
    if (segment.length < 100) continue
    
    const segmentQuestions = await generateQuestionsForSegment(segment, questionsPerSegment)
    questions.push(...segmentQuestions)
    
    // If we've reached our target, stop
    if (questions.length >= targetQuestionCount) break
  }
  
  // If we have more questions than needed, take a selection distributed across the segments
  if (questions.length > targetQuestionCount) {
    const step = questions.length / targetQuestionCount
    const selectedQuestions: GeneratedQuestion[] = []
    
    for (let i = 0; i < targetQuestionCount; i++) {
      const index = Math.floor(i * step)
      selectedQuestions.push(questions[index])
    }
    
    return selectedQuestions
  }
  
  return questions
}

async function generateQuestionsForSegment(
  segment: string, 
  count: number
): Promise<GeneratedQuestion[]> {
  try {
    // Extract key sentences or information from the segment
    const sentences = segment.split(/[.!?]/).filter(s => s.trim().length > 15)
    
    if (sentences.length === 0) {
      return []
    }
    
    const questions: GeneratedQuestion[] = []
    
    // Generate a simple question for each selected sentence
    for (let i = 0; i < Math.min(count, sentences.length); i++) {
      const index = Math.floor(i * sentences.length / count)
      const sentence = sentences[index].trim()
      
      if (sentence.length < 20) continue
      
      // Extract a key term or concept from the sentence
      const words = sentence.split(' ')
      const keyWordIndex = Math.floor(words.length / 2)
      const keyWord = words[keyWordIndex]
      
      if (!keyWord || keyWord.length < 4) continue
      
      // Create a question about this key term
      const question = `O que o texto explica sobre ${keyWord}?`
      
      // Create options (correct answer + 3 distractors)
      const correctAnswer = sentence
      
      // Generate distractors (in a real implementation these would be more sophisticated)
      const distractors = [
        `${keyWord} não é mencionado no texto.`,
        `${keyWord} é considerado irrelevante no contexto apresentado.`,
        `${keyWord} refere-se a um conceito diferente do abordado.`
      ]
      
      // Shuffle options
      const options = [correctAnswer, ...distractors]
      shuffleArray(options)
      
      questions.push({
        question,
        options,
        correct_answer: correctAnswer,
        explanation: `A resposta correta é extraída diretamente do texto: "${sentence}"`
      })
    }
    
    return questions
  } catch (error) {
    console.error("Error generating questions for segment:", error)
    return []
  }
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}
