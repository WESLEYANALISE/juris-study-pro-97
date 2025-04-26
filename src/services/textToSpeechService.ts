
// Simple text-to-speech service using browser's native Speech Synthesis API

interface SpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

// Default options for Brazilian Portuguese
const defaultOptions: SpeechOptions = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  lang: 'pt-BR',
};

// Cache of available voices
let cachedVoices: SpeechSynthesisVoice[] = [];

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

// Speak text
const speak = async (text: string, options: SpeechOptions = {}): Promise<void> => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported in this browser');
    return;
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

// Stop speaking
const stop = (): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
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
