
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type } = await req.json();
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let systemPrompt = '';
    switch (type) {
      case 'doubt':
        systemPrompt = 'Você é um assistente jurídico especializado em esclarecer dúvidas sobre direito brasileiro. Responda de forma clara e objetiva.';
        break;
      case 'case-analysis':
        systemPrompt = 'Você é um assistente jurídico especializado em análise de casos. Analise o caso apresentado considerando a legislação brasileira.';
        break;
      case 'study-plan':
        systemPrompt = 'Você é um assistente especializado em criar planos de estudo personalizados para área jurídica.';
        break;
      default:
        systemPrompt = 'Você é um assistente jurídico especializado em direito brasileiro.';
    }

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: "Por favor, atue como um assistente jurídico especializado.",
        },
        {
          role: "model",
          parts: systemPrompt,
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    
    return new Response(JSON.stringify({ 
      text: response.text(),
      type: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
