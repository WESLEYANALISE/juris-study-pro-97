
// Text-to-speech service using browser's native Speech Synthesis API and Supabase edge function

import { supabase } from "@/lib/supabaseClient";

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

// Use Supabase edge function for speech synthesis
const speakWithEdgeFunction = async (text: string): Promise<void> => {
  try {
    // Cancel any ongoing speech
    stop();
    
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text },
    });
    
    if (error) {
      throw error;
    }
    
    if (!data.audioContent) {
      throw new Error('No audio content received');
    }
    
    // Create audio element if it doesn't exist
    if (!audioElement) {
      audioElement = new Audio();
    }
    
    // Convert base64 to audio
    const base64Audio = data.audioContent;
    audioElement.src = `data:audio/mp3;base64,${base64Audio}`;
    
    return new Promise((resolve, reject) => {
      if (audioElement) {
        audioElement.onended = () => resolve();
        audioElement.onerror = (e) => reject(e);
        audioElement.play().catch(reject);
      } else {
        reject(new Error('Audio element not created'));
      }
    });
  } catch (error) {
    console.error('Error with edge function TTS:', error);
    // Fallback to browser TTS
    return speakWithBrowser(text);
  }
};

// Use browser's native Speech Synthesis API
const speakWithBrowser = async (text: string, options: SpeechOptions = {}): Promise<void> => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported in this browser');
    return Promise.reject(new Error('Text-to-speech not supported in this browser'));
  }
  
  // Cancel any ongoing speech
  speechSynthesis.cancel();
  
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
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = mergedOptions.lang || 'pt-BR';
  utterance.rate = mergedOptions.rate || 1;
  utterance.pitch = mergedOptions.pitch || 1;
  utterance.volume = mergedOptions.volume || 1;
  
  if (voice) {
    utterance.voice = voice;
  }
  
  // Speak
  speechSynthesis.speak(utterance);
  
  return new Promise((resolve) => {
    utterance.onend = () => resolve();
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

// Initialize on load
initSpeechSynthesis();

export const TextToSpeechService = {
  speak,
  stop,
  getVoices,
  getPortugueseVoices,
};
