import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);
  
  if (diffYear > 0) {
    return diffYear === 1 ? 'há 1 ano' : `há ${diffYear} anos`;
  }
  if (diffMonth > 0) {
    return diffMonth === 1 ? 'há 1 mês' : `há ${diffMonth} meses`;
  }
  if (diffDay > 0) {
    return diffDay === 1 ? 'ontem' : `há ${diffDay} dias`;
  }
  if (diffHour > 0) {
    return diffHour === 1 ? 'há 1 hora' : `há ${diffHour} horas`;
  }
  if (diffMin > 0) {
    return diffMin === 1 ? 'há 1 minuto' : `há ${diffMin} minutos`;
  }
  
  return 'agora mesmo';
}

// Function to get audio duration from URL
export async function getDurationFromAudio(audioUrl: string): Promise<number> {
  return new Promise((resolve) => {
    // If no URL, resolve with 0
    if (!audioUrl) {
      resolve(0);
      return;
    }
    
    const audio = new Audio();
    
    // Set up listeners
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && !isNaN(audio.duration)) {
        resolve(audio.duration);
      } else {
        resolve(0);
      }
    });
    
    audio.addEventListener('error', () => {
      console.error('Error loading audio for duration check:', audioUrl);
      resolve(0);
    });
    
    // Add a timeout in case loading takes too long
    const timeout = setTimeout(() => {
      console.warn('Timeout getting audio duration:', audioUrl);
      resolve(0);
    }, 5000);
    
    // Set the source and try to load
    audio.src = audioUrl;
    audio.load();
    
    // Clean up timeout when done
    audio.addEventListener('loadedmetadata', () => clearTimeout(timeout));
    audio.addEventListener('error', () => clearTimeout(timeout));
  });
}
