
// Singleton service for handling text-to-speech functionality
let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

export const TextToSpeechService = {
  /**
   * Convert text to speech using the Google Cloud Text-to-Speech API
   * @param text The text to convert to speech
   * @param voice The voice to use (default: 'pt-BR-Wavenet-E')
   * @param rate Speaking rate (0.25 to 4.0, default: 1.0)
   */
  speak: async (
    text: string, 
    voice: string = 'pt-BR-Wavenet-E', 
    rate: number = 1.0
  ): Promise<void> => {
    try {
      // If there's already audio playing, stop it
      if (currentAudio) {
        TextToSpeechService.stop();
      }

      // Truncate text if too long (API limits)
      const maxLength = 3000;
      const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

      const apiKey = 'AIzaSyCX26cgIpSd-BvtOLDdEQFa28_wh_HX1uk';
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

      const requestBody = {
        input: {
          text: truncatedText
        },
        voice: {
          languageCode: 'pt-BR',
          name: voice
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: rate, // Control the speed
          pitch: 0.0,         // Default pitch
          volumeGainDb: 0.0   // Default volume
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Falha ao gerar áudio');
      }

      const data = await response.json();
      
      // Clean up any existing audio
      TextToSpeechService.cleanup();

      // Play the audio
      currentAudio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      
      // Set up audio context to provide better control (volume, playbackRate)
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
