
// Text-to-speech service using browser's native Speech Synthesis API and Supabase edge function

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface SpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  useEdgeFunction?: boolean;
}

// Default options for Brazilian Portuguese
const defaultOptions: SpeechOptions = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  lang: 'pt-BR',
  useEdgeFunction: true, // By default, use the edge function for better voice quality
};

// Cache of available voices
let cachedVoices: SpeechSynthesisVoice[] = [];

// Audio element for playing edge function generated audio
let audioElement: HTMLAudioElement | null = null;

// Initialize speech synthesis
const initSpeechSynthesis = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If the browser doesn't support speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser');
      resolve(false);
      return;
    }
    
    // If voices are already loaded
    if (speechSynthesis.getVoices().length > 0) {
      cachedVoices = speechSynthesis.getVoices();
      resolve(true);
      return;
    }
    
    // Wait for voices to be loaded
    speechSynthesis.onvoiceschanged = () => {
      cachedVoices = speechSynthesis.getVoices();
      resolve(true);
    };
  });
};

// Get available voices
const getVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  
  if (cachedVoices.length === 0) {
    await initSpeechSynthesis();
  }
  
  return cachedVoices;
};

// Get Portuguese voices
const getPortugueseVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  const allVoices = await getVoices();
  return allVoices.filter(voice => 
    voice.lang.includes('pt') || 
    voice.lang.includes('PT') || 
    voice.name.includes('Brazil') || 
    voice.name.includes('Brasil')
  );
};

// Cache audio response to improve performance
const audioCache = new Map<string, string>();

// Use Supabase edge function for speech synthesis
const speakWithEdgeFunction = async (text: string): Promise<void> => {
  try {
    // Cancel any ongoing speech
    stop();
    
    // Check cache first
    const cachedAudio = audioCache.get(text);
    if (cachedAudio) {
      playAudio(cachedAudio);
      return;
    }
    
    toast.loading('Preparando narração...', { id: 'tts-loading' });
    
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text },
    });
    
    toast.dismiss('tts-loading');
    
    if (error) {
      toast.error('Erro ao gerar narração');
      throw error;
    }
    
    if (!data.audioContent) {
      throw new Error('No audio content received');
    }
    
    // Cache the response
    audioCache.set(text, data.audioContent);
    
    // Play the audio
    return playAudio(data.audioContent);
  } catch (error) {
    console.error('Error with edge function TTS:', error);
    toast.error('Falha na narração, tentando método alternativo');
    // Fallback to browser TTS
    return speakWithBrowser(text);
  }
};

// Play audio from base64 data
const playAudio = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create audio element if it doesn't exist
    if (!audioElement) {
      audioElement = new Audio();
    }
    
    // Convert base64 to audio
    audioElement.src = `data:audio/mp3;base64,${base64Audio}`;
    audioElement.onended = () => resolve();
    audioElement.onerror = (e) => reject(e);
    
    // Use a try-catch for better error handling
    try {
      const playPromise = audioElement.play();
      
      // Modern browsers return a promise from play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          reject(error);
        });
      }
    } catch (error) {
      console.error('Exception playing audio:', error);
      reject(error);
    }
  });
};

// Use browser's native Speech Synthesis API
const speakWithBrowser = async (text: string, options: SpeechOptions = {}): Promise<void> => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported in this browser');
    toast.error('Narração não é suportada pelo seu navegador');
    return Promise.reject(new Error('Text-to-speech not supported in this browser'));
  }
  
  // Cancel any ongoing speech
  speechSynthesis.cancel();
  
  // Split long text into smaller chunks to improve performance
  const chunks = splitTextIntoChunks(text);
  
  // Merge options with defaults
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Get Portuguese voices if language is Portuguese
  let voice = mergedOptions.voice;
  if (!voice && mergedOptions.lang?.includes('pt')) {
    const ptVoices = await getPortugueseVoices();
    if (ptVoices.length > 0) {
      voice = ptVoices[0];
    }
  }

  // Speak each chunk sequentially
  for (const chunk of chunks) {
    await speakChunk(chunk, voice, mergedOptions);
  }
  
  return Promise.resolve();
};

// Split text into manageable chunks to prevent cutting off
const splitTextIntoChunks = (text: string, maxLength: number = 200): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }
  
  const chunks: string[] = [];
  let currentChunk = '';
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If a single sentence is longer than maxLength, split it further
      if (sentence.length > maxLength) {
        const words = sentence.split(' ');
        currentChunk = '';
        
        for (const word of words) {
          if (currentChunk.length + word.length + 1 <= maxLength) {
            currentChunk += (currentChunk ? ' ' : '') + word;
          } else {
            chunks.push(currentChunk);
            currentChunk = word;
          }
        }
      } else {
        currentChunk = sentence;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

// Speak a single chunk of text
const speakChunk = (text: string, voice: SpeechSynthesisVoice | undefined, options: SpeechOptions): Promise<void> => {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = options.lang || 'pt-BR';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // Also resolve on error to continue with next chunk
    
    speechSynthesis.speak(utterance);
  });
};

// Speak text - decides whether to use edge function or browser
const speak = async (text: string, options: SpeechOptions = {}): Promise<void> => {
  const mergedOptions = { ...defaultOptions, ...options };
  
  if (mergedOptions.useEdgeFunction) {
    return speakWithEdgeFunction(text);
  } else {
    return speakWithBrowser(text, options);
  }
};

// Stop speaking
const stop = (): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
};

// Check if playing
const isPlaying = (): boolean => {
  if (audioElement && !audioElement.paused) {
    return true;
  }
  
  if ('speechSynthesis' in window && speechSynthesis.speaking) {
    return true;
  }
  
  return false;
};

// Initialize on load
initSpeechSynthesis();

export const TextToSpeechService = {
  speak,
  stop,
  getVoices,
  getPortugueseVoices,
  isPlaying
};
