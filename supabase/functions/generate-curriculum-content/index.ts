
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

interface RequestBody {
  subject: string;
  contentType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, contentType } = await req.json() as RequestBody;

    if (!subject || !contentType) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Construct the prompt based on content type
    let prompt = "";
    switch (contentType) {
      case "summary":
        prompt = `Crie um resumo conciso sobre o tema "${subject}" no contexto de um curso de direito. O resumo deve ser informativo, acadêmico e focado nos pontos principais que os estudantes de direito devem entender sobre este tema. Limite a 200 palavras.`;
        break;
      case "mindmap":
        prompt = `Crie uma estrutura de mapa mental em formato de texto para o tema "${subject}" no contexto de um curso de direito. Liste os principais conceitos, suas conexões e ramificações. O resultado deve ser um esboço organizado que pode ser transformado em um mapa mental visual.`;
        break;
      case "materials":
        prompt = `Liste 5 materiais de estudo recomendados (livros, artigos ou recursos online) para estudantes de direito que estejam estudando "${subject}". Para cada item, inclua título, autor/fonte e uma breve descrição de uma linha explicando por que é relevante.`;
        break;
      case "questions":
        prompt = `Crie 3 questões de múltipla escolha sobre o tema "${subject}" para estudantes de direito, com 4 alternativas cada e a resposta correta indicada. As questões devem testar o conhecimento e compreensão do tema em diferentes níveis.`;
        break;
      default:
        prompt = `Forneça informações gerais sobre o tema "${subject}" no contexto de um curso de direito.`;
    }

    // Call Gemini API
    console.log(`Calling Gemini API with prompt about: ${subject}`);
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}, ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Failed to get content from Gemini API" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const data = await response.json();
    console.log("Gemini API response received");
    
    let content = "";
    try {
      // Extract the text from the response
      content = data.contents?.[0]?.parts?.[0]?.text || "Não foi possível gerar o conteúdo.";
    } catch (error) {
      console.error("Error parsing Gemini API response:", error);
      return new Response(
        JSON.stringify({ error: "Failed to parse Gemini API response" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
