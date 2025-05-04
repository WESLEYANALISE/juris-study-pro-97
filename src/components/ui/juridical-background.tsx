
import React from 'react';
import { cn } from '@/lib/utils';

interface JuridicalBackgroundProps {
  children: React.ReactNode;
  variant?: 'scales' | 'gavel' | 'books' | 'constitution' | 'courthouse' | 'default';
  className?: string;
  opacity?: number;
}

export function JuridicalBackground({ 
  children, 
  variant = 'default',
  className,
  opacity = 0.05
}: JuridicalBackgroundProps) {
  // Generate texture pattern based on variant
  const getBackgroundPattern = () => {
    switch(variant) {
      case 'scales':
        return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='${opacity}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
      case 'gavel':
        return `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='%239C92AC' fill-opacity='${opacity}' fill-rule='evenodd'/%3E%3C/svg%3E")`;
      case 'books':
        return `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264.888-.14.56.41 1.012.18 1.68.18.145 0 .383.06.52.084.88.114 2.334 1.67 4.257 1.23.7-.156 1.244-.48 1.933-.84.53-.27 1.11-.53 1.782-.6.83-.07 1.677.2 2.518.48.845.292 1.68.5 2.505.41 1.352-.14 2.647-1.41 4.026-2.68.466-.44 1.02-.81 1.472-.84.624-.05 1.29.13 1.94.27.66.13 1.334.28 2.045.2.854-.11 1.603-.79 2.355-1.46.753-.68 1.522-1.34 2.37-1.43.895-.09 1.81.34 2.73.78.913.44 1.84.88 2.80.75.15-.02.29-.04.43-.08-.58-.31-1.17-.62-1.76-.94-2.66-1.41-5.42-2.88-8.24-3.3-1.08-.17-2.17-.12-3.25.14-1.6.38-3.13 1.22-4.64 2.06-.15.08-.3.17-.45.25-.96.53-1.93 1.05-2.95 1.25-.75.15-1.54.08-2.3-.27-1.05-.47-2.01-1.3-2.97-2.13-1.03-.9-2.06-1.8-3.28-2.17-.97-.29-2.03-.25-3.04.05-.67.2-1.3.53-1.92.86-.54.29-1.07.57-1.67.76L0 20h21.183z' fill='%239C92AC' fill-opacity='${opacity}' fill-rule='evenodd'/%3E%3C/svg%3E")`;
      case 'constitution':
        return `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='${opacity}'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
      case 'courthouse':
        return `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='${opacity}'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
      default:
        return `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='${opacity}' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`;
    }
  };

  const backgroundStyle = {
    backgroundImage: getBackgroundPattern(),
    backgroundRepeat: 'repeat',
  };
  
  const bgClassMap = {
    'default': 'bg-background',
    'scales': 'bg-gradient-to-br from-background to-secondary/30',
    'gavel': 'bg-gradient-to-br from-background to-purple-900/20',
    'books': 'bg-gradient-to-br from-background to-blue-900/20',
    'constitution': 'bg-gradient-to-br from-background to-indigo-900/20',
    'courthouse': 'atheneum-bg'
  };

  return (
    <div 
      className={cn(
        "min-h-[calc(100vh-4rem)] w-full",
        bgClassMap[variant],
        className
      )} 
      style={backgroundStyle}
    >
      {children}
    </div>
  );
}
