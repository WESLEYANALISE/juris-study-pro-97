
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = "models/gemini-1.5-pro";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, type } = await req.json();
    
    if (!topic || !type) {
      return new Response(
        JSON.stringify({ error: "Topic and type are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const prompt = generatePromptForRedacao(topic, type);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const content = data.candidates[0].content.parts[0].text;
    
    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in generate-redacao-content function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function generatePromptForRedacao(topic: string, type: string): string {
  switch (type) {
    case "artigo":
      return `Crie um artigo de redação jurídica sobre o tópico "${topic}". 
              O artigo deve conter:
              - Introdução ao tema
              - Fundamentos e conceitos teóricos
              - Aspectos práticos e aplicação
              - Exemplos relevantes
              - Conclusão
              Use linguagem formal e técnica apropriada para textos jurídicos.`;
    
    case "modelo":
      return `Crie um modelo de peça jurídica do tipo "${topic}". 
              O modelo deve:
              - Seguir a formatação padrão esperada pelos tribunais
              - Incluir todas as seções necessárias
              - Usar linguagem jurídica apropriada
              - Ter marcadores de [INSERIR_TEXTO] para personalização
              Forneça um documento completo que possa ser usado como base.`;
    
    case "dicas":
      return `Forneça dicas precisas de redação jurídica sobre "${topic}".
              As dicas devem:
              - Ser diretas e aplicáveis
              - Focar em aspectos técnicos e formais
              - Incluir exemplos curtos do que fazer e o que evitar
              - Mencionar erros comuns e como corrigi-los
              Organize em formato de lista para fácil consulta.`;
    
    case "exercicio":
      return `Crie um exercício prático de redação jurídica sobre "${topic}".
              O exercício deve incluir:
              - Contexto e situação hipotética
              - Instruções claras sobre o que deve ser redigido
              - Critérios de avaliação
              - Dicas para uma boa resolução
              - Gabarito ou elementos essenciais que deveriam estar na resposta`;
    
    default:
      return `Crie um conteúdo sobre redação jurídica relacionado a "${topic}".
              Seja didático, use linguagem formal e técnica apropriada para textos jurídicos.`;
  }
}
