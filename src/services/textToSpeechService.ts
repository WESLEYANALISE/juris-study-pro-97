
// Singleton service for handling text-to-speech functionality
let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

export const TextToSpeechService = {
  /**
   * Convert text to speech using the Google Cloud Text-to-Speech API via Supabase Edge Function
   * @param text The text to convert to speech
   * @param voice The voice to use (default: 'pt-BR-Wavenet-D')
   */
  speak: async (text: string, voiceId: string = 'pt-BR-Wavenet-D'): Promise<void> => {
    try {
      // If there's already audio playing, stop it
      if (currentAudio) {
        TextToSpeechService.stop();
      }

      // Truncate text if too long (API limits)
      const maxLength = 3000;
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
        throw new Error(error.error || 'Erro ao gerar áudio');
      }

      const data = await response.json();
      
      // Convert base64 audio content to playable audio
      const audioContent = data.audioContent;
      if (!audioContent) {
        throw new Error('Áudio não recebido do servidor');
      }

      // Clean up any existing audio
      TextToSpeechService.cleanup();

      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], 
        { type: 'audio/mp3' }
      );
      
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      
      // Set up audio context to provide better control (volume, playbackRate)
      // This is optional but improves the quality of the playback
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaElementSource(currentAudio);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0; // Default volume
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
      } catch (err) {
        console.warn('AudioContext not supported, falling back to basic audio playback', err);
      }
      
      // Play the audio
      currentAudio.play();
      
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
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.pause();
      currentAudio = null;
      URL.revokeObjectURL(url);
    }
    
    if (audioContext) {
      audioContext.close().catch(console.error);
      audioContext = null;
    }
  }
};

export default TextToSpeechService;
