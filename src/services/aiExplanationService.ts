
import { supabase } from "@/lib/supabaseClient";

interface ExplanationRequest {
  lawName: string;
  articleNumber: string;
  articleText: string;
  questionType: 'simple' | 'technical' | 'example' | 'custom';
  customQuestion?: string;
}

interface ExplanationResponse {
  explanation: string;
}

// Generate explanation for law articles using AI
const generateExplanation = async (request: ExplanationRequest): Promise<ExplanationResponse> => {
  try {
    // In a real implementation, this would call a Supabase Edge Function
    // that would use OpenAI or another AI provider to generate the explanation
    
    // For now, we'll simulate a response
    let explanation = '';
    
    switch (request.questionType) {
      case 'simple':
        explanation = `Explicação simplificada do artigo ${request.articleNumber} do ${request.lawName}: 
        Este artigo estabelece regras básicas sobre ${request.articleText.substring(0, 50)}...`;
        break;
      case 'technical':
        explanation = `Explicação técnica do artigo ${request.articleNumber} do ${request.lawName}: 
        Na perspectiva jurídica, este dispositivo determina que ${request.articleText.substring(0, 50)}...`;
        break;
      case 'example':
        explanation = `Exemplo prático do artigo ${request.articleNumber} do ${request.lawName}: 
        Na prática, este artigo se aplica quando ${request.articleText.substring(0, 50)}...`;
        break;
      case 'custom':
        explanation = `Resposta para "${request.customQuestion}" sobre o artigo ${request.articleNumber} do ${request.lawName}: 
        Considerando o texto do artigo, ${request.articleText.substring(0, 50)}...`;
        break;
      default:
        explanation = 'Não foi possível gerar uma explicação. Tente novamente.';
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { explanation };
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw new Error('Não foi possível gerar a explicação. Tente novamente mais tarde.');
  }
};

export const AIExplanationService = {
  generateExplanation
};
