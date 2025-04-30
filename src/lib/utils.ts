import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert seconds to a formatted duration string (MM:SS)
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a date to relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffMonths = Math.round(diffDays / 30);

  if (diffSecs < 60) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 30) return `${diffDays} dias atrás`;
  return `${diffMonths} meses atrás`;
}

/**
 * Get the duration of an audio file from its URL
 * Uses an audio element to load the file and get its duration
 */
export function getDurationFromAudio(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(0);
      return;
    }
    
    try {
      const audio = new Audio();
      
      // Set up CORS handling
      audio.crossOrigin = "anonymous";
      
      // Set a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        audio.pause();
        audio.src = '';
        resolve(0); // Return 0 instead of rejecting to fail gracefully
        console.warn("Audio duration fetch timed out:", url);
      }, 8000);
      
      // Handle successful metadata load
      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(timeoutId);
        if (audio.duration === Infinity) {
          // Some streaming formats return Infinity
          audio.currentTime = 1e101;
          audio.addEventListener('timeupdate', function getDuration() {
            if (audio.duration !== Infinity) {
              audio.removeEventListener('timeupdate', getDuration);
              resolve(audio.duration);
              audio.pause();
              audio.src = '';
            }
          });
        } else {
          resolve(audio.duration);
          audio.pause();
          audio.src = '';
        }
      });
      
      // Handle errors
      audio.addEventListener('error', (e) => {
        clearTimeout(timeoutId);
        console.error("Error loading audio:", e);
        resolve(0); // Return 0 instead of rejecting to fail gracefully
      });
      
      // Start loading the audio
      audio.src = url;
      audio.load();
    } catch (err) {
      console.error("Exception in getDurationFromAudio:", err);
      resolve(0); // Return 0 instead of rejecting to fail gracefully
    }
  });
}
