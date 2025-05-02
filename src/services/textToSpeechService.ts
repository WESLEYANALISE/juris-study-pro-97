
// Singleton service for handling text-to-speech functionality
let currentAudio: HTMLAudioElement | null = null;

export const TextToSpeechService = {
  /**
   * Convert text to speech using the Google Cloud Text-to-Speech API via Supabase Edge Function
   * @param text The text to convert to speech
   * @param voice The voice to use (default: 'pt-BR-Standard-A')
   */
  speak: async (text: string, voiceId: string = 'pt-BR-Wavenet-D'): Promise<void> => {
    try {
      // If there's already audio playing, stop it
      if (currentAudio) {
        TextToSpeechService.stop();
      }

      // Truncate text if too long (API limits)
      const maxLength = 5000;
      const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

      // Call the Edge Function
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: truncatedText,
          voice: voiceId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro desconhecido');
      }

      const data = await response.json();
      
      // Convert base64 audio content to playable audio
      const audioContent = data.audioContent;
      if (!audioContent) {
        throw new Error('Áudio não recebido');
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], 
        { type: 'audio/mp3' }
      );
      
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      
      // Play the audio
      await currentAudio.play();
      
      // Clean up when audio is done
      currentAudio.onended = () => {
        TextToSpeechService.cleanup();
        return Promise.resolve();
      };

      // Return a promise that resolves when the audio is done playing
      return new Promise((resolve) => {
        if (currentAudio) {
          currentAudio.onended = () => {
            TextToSpeechService.cleanup();
            resolve();
          };
        } else {
          resolve();
        }
      });
    } catch (error) {
      console.error('Error in TextToSpeechService.speak:', error);
      TextToSpeechService.cleanup();
      return Promise.reject(error);
    }
  },

  /**
   * Stop the current audio playback
   */
  stop: (): void => {
    if (currentAudio) {
      currentAudio.pause();
      TextToSpeechService.cleanup();
    }
  },

  /**
   * Clean up resources
   */
  cleanup: (): void => {
    if (currentAudio) {
      const url = currentAudio.src;
      currentAudio = null;
      URL.revokeObjectURL(url);
    }
  }
};

export default TextToSpeechService;
