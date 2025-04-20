
const GEMINI_API_KEY = "AIzaSyCIQSUR9Mhy6rT1DgaszVxc5rL-gmVYGK0";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface GeminiResponse {
  text: string;
  error?: string;
}

export async function askGemini(prompt: string): Promise<GeminiResponse> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return {
      text: data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      text: '',
      error: 'Failed to get response from AI'
    };
  }
}
