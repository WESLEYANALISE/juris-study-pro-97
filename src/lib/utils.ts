
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  
  if (diffInSecs < 60) {
    return 'Agora mesmo';
  } else if (diffInMins < 60) {
    return `${diffInMins} ${diffInMins === 1 ? 'minuto' : 'minutos'} atrás`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
  } else if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
  } else {
    return `${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'} atrás`;
  }
}

export function truncateString(str: string, maxLength: number): string {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}
