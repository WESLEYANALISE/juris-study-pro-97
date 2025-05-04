
import { useToast } from "@/hooks/use-toast";

interface SpeechConfig {
  voiceName?: string;
  language?: string;
  pitch?: number;
  rate?: number;
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
    
    // Preload voices if possible
    if (this.speechSynthesis) {
      // For Chrome and other browsers that need to wait for voices to load
      this.speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
      // Immediate load for Firefox and others
      this.loadVoices();
    }
  }
  
  private loadVoices(): void {
    if (!this.speechSynthesis) return;
    
    // Just trigger the voices loading - we'll get them when needed
    this.speechSynthesis.getVoices();
  }

  public async speak(text: string, config?: Partial<SpeechConfig>): Promise<void> {
    // Use Google Cloud TTS API if available
    try {
      await this.speakWithGoogleTTS(text, config);
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

  public pause(): void {
    if (this.speechSynthesis && this.speaking) {
      this.speechSynthesis.pause();
    }
  }
  
  public resume(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.resume();
    }
  }

  private async speakWithGoogleTTS(text: string, config?: Partial<SpeechConfig>): Promise<void> {
    try {
      const mergedConfig = { ...this.defaultConfig, ...config };
      const apiKey = 'AIzaSyCX26cgIpSd-BvtOLDdEQFa28_wh_HX1uk';
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

      const requestBody = {
        input: {
          text: text
        },
        voice: {
          languageCode: mergedConfig.language || 'pt-BR',
          name: 'pt-BR-Wavenet-E'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: mergedConfig.rate || 1.0,
          pitch: mergedConfig.pitch || 0.0
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
    utterance.lang = mergedConfig.language || 'pt-BR';
    utterance.pitch = mergedConfig.pitch || 1;
    utterance.rate = mergedConfig.rate || 1;

    // Find voice
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      (mergedConfig.voiceName && voice.name.includes(mergedConfig.voiceName)) || 
      voice.lang.includes(mergedConfig.language || 'pt-BR')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Start speaking
    this.speaking = true;
    utterance.onend = () => {
      this.speaking = false;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.speaking = false;
    };

    this.speechSynthesis.speak(utterance);
  }

  public isSpeaking(): boolean {
    return this.speaking;
  }
  
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynthesis) return [];
    return this.speechSynthesis.getVoices();
  }
  
  public getPreferredVoice(language: string = 'pt-BR'): SpeechSynthesisVoice | null {
    if (!this.speechSynthesis) return null;
    
    const voices = this.speechSynthesis.getVoices();
    return voices.find(voice => voice.lang.includes(language)) || null;
  }
}

// Export as singleton
export const TextToSpeechService = new TextToSpeechServiceClass();
