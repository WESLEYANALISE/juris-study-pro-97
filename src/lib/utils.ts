
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return "agora mesmo";
  } else if (diffMins < 60) {
    return `há ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
  } else if (diffHours < 24) {
    return `há ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  } else if (diffDays < 7) {
    return `há ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
  } else if (diffWeeks < 4) {
    return `há ${diffWeeks} ${diffWeeks === 1 ? "semana" : "semanas"}`;
  } else if (diffMonths < 12) {
    return `há ${diffMonths} ${diffMonths === 1 ? "mês" : "meses"}`;
  } else {
    return `há ${diffYears} ${diffYears === 1 ? "ano" : "anos"}`;
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Get audio duration from URL
 * @param audioUrl URL of the audio file
 * @returns Duration in seconds
 */
export async function getDurationFromAudio(audioUrl: string): Promise<number> {
  // If we have a cached duration, return it
  const cachedDuration = localStorage.getItem(`audio-duration-${audioUrl}`);
  if (cachedDuration) {
    return Number(cachedDuration);
  }
  
  try {
    return new Promise((resolve) => {
      // For safety, set a timeout
      const timeoutId = setTimeout(() => {
        resolve(0); // Default duration if we can't load the audio
      }, 5000);
      
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(timeoutId);
        
        if (audio.duration && !isNaN(audio.duration)) {
          // Cache the duration for future use
          localStorage.setItem(`audio-duration-${audioUrl}`, audio.duration.toString());
          resolve(audio.duration);
        } else {
          resolve(0);
        }
      });
      
      audio.addEventListener('error', () => {
        clearTimeout(timeoutId);
        console.error('Error loading audio for duration check:', audioUrl);
        resolve(0);
      });
      
      // Prevent actually playing the audio
      audio.preload = 'metadata';
      audio.volume = 0;
      audio.src = audioUrl;
    });
  } catch (err) {
    console.error('Error getting audio duration:', err);
    return 0;
  }
}

/**
 * Get audio metadata with more advanced techniques
 */
export async function getAudioMetadata(audioUrl: string): Promise<{ duration: number }> {
  try {
    // Try to use getDurationFromAudio first
    const duration = await getDurationFromAudio(audioUrl);
    if (duration > 0) {
      return { duration };
    }
    
    // Fallback - just return a default duration
    return { duration: 0 };
  } catch (err) {
    console.error('Error getting audio metadata:', err);
    return { duration: 0 };
  }
}
