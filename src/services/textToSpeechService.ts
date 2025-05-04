
import { useToast } from "@/hooks/use-toast";

interface SpeechConfig {
  voiceName: string;
  language: string;
  pitch: number;
  rate: number;
}

class TextToSpeechServiceClass {
  private speechSynthesis: SpeechSynthesis | null;
  private utterance: SpeechSynthesisUtterance | null;
  private defaultConfig: SpeechConfig;
  private speaking: boolean;

  constructor() {
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.utterance = null;
    this.speaking = false;
    this.defaultConfig = {
      voiceName: 'Google português do Brasil',
      language: 'pt-BR',
      pitch: 1,
      rate: 1
    };
  }

  public async speak(text: string, config?: Partial<SpeechConfig>): Promise<void> {
    // Use Google Cloud TTS API if available
    try {
      await this.speakWithGoogleTTS(text);
      return;
    } catch (error) {
      console.warn('Failed to use Google Cloud TTS, falling back to browser TTS', error);
      this.speakWithBrowserTTS(text, config);
    }
  }

  public stop(): void {
    if (this.speechSynthesis && this.speaking) {
      this.speechSynthesis.cancel();
      this.speaking = false;
    }
  }

  private async speakWithGoogleTTS(text: string): Promise<void> {
    try {
      const apiKey = 'AIzaSyCX26cgIpSd-BvtOLDdEQFa28_wh_HX1uk';
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

      const requestBody = {
        input: {
          text: text
        },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Wavenet-E'
        },
        audioConfig: {
          audioEncoding: 'MP3'
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert base64 to audio
      const audioContent = data.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      
      this.speaking = true;
      
      audio.onended = () => {
        this.speaking = false;
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error with Google Cloud TTS:', error);
      throw error;
    }
  }

  private speakWithBrowserTTS(text: string, config?: Partial<SpeechConfig>): void {
    if (!this.speechSynthesis) {
      console.error('Speech synthesis not available');
      return;
    }

    // Stop any current speech
    this.stop();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance;

    // Merge configs
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Set utterance properties
    utterance.lang = mergedConfig.language;
    utterance.pitch = mergedConfig.pitch;
    utterance.rate = mergedConfig.rate;

    // Find voice
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes(mergedConfig.voiceName) || 
      voice.lang.includes(mergedConfig.language)
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Start speaking
    this.speaking = true;
    utterance.onend = () => {
      this.speaking = false;
    };

    this.speechSynthesis.speak(utterance);
  }

  public isSpeaking(): boolean {
    return this.speaking;
  }
}

// Export as singleton
export const TextToSpeechService = new TextToSpeechServiceClass();
