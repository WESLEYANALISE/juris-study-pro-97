
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type BackgroundVariant = "default" | "scales" | "books" | "gavel" | "constitution";

interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BackgroundVariant;
  children: React.ReactNode;
  opacity?: number;
}

export function JuridicalBackground({
  variant = "default",
  children,
  opacity = 0.05,
  className,
  ...props
}: BackgroundProps) {
  const getBackgroundPattern = () => {
    switch (variant) {
      case "scales":
        return (
          <div className="pointer-events-none">
            <motion.div 
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-radial from-primary/20 to-transparent opacity-40 blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }} 
              transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-radial from-purple-700/20 to-transparent opacity-40 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }} 
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 2
              }}
            />
            <svg 
              width="100%" 
              height="100%"
              className="absolute inset-0 text-primary"
              style={{ opacity: opacity/2 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <pattern
                id="pattern-scales" 
                x="0" 
                y="0" 
                width="40" 
                height="40" 
                patternUnits="userSpaceOnUse"
              >
                <path 
                  d="M20 0 L40 20 L20 40 L0 20 Z" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pattern-scales)" />
            </svg>
          </div>
        );
      case "books":
        return (
          <div className="pointer-events-none">
            <motion.div 
              className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-radial from-purple-800/20 to-transparent opacity-30 blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              }} 
              transition={{ 
                duration: 18, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-radial from-primary/20 to-transparent opacity-30 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }} 
              transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 3
              }}
            />
            <svg 
              width="100%" 
              height="100%"
              className="absolute inset-0 text-primary"
              style={{ opacity: opacity/2 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <pattern
                id="pattern-books" 
                x="0" 
                y="0" 
                width="60" 
                height="60" 
                patternUnits="userSpaceOnUse"
              >
                <path 
                  d="M10 0 V60 M20 0 V60 M30 0 V60 M40 0 V60 M50 0 V60" 
                  stroke="currentColor" 
                  strokeWidth="3"
                  strokeOpacity="0.15"
                />
                <path 
                  d="M0 10 H60 M0 30 H60 M0 50 H60" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeOpacity="0.1"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pattern-books)" />
            </svg>
          </div>
        );
      case "gavel":
        return (
          <div className="pointer-events-none">
            <motion.div 
              className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-radial from-primary/20 to-transparent opacity-30 blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              }} 
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <svg 
              width="100%" 
              height="100%"
              className="absolute inset-0 text-primary"
              style={{ opacity }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <pattern
                id="pattern-gavel" 
                x="0" 
                y="0" 
                width="64" 
                height="64" 
                patternUnits="userSpaceOnUse"
              >
                <path 
                  d="M32 8 L40 16 L16 40 L8 32 Z M44 20 L52 28 L48 32 L40 24 Z" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1"
                  strokeOpacity="0.2"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pattern-gavel)" />
            </svg>
          </div>
        );
      case "constitution":
        return (
          <div className="pointer-events-none">
            <motion.div 
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-radial from-purple-800/20 to-transparent opacity-30 blur-3xl"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.3, 0.2],
              }} 
              transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <svg 
              width="100%" 
              height="100%"
              className="absolute inset-0 text-primary"
              style={{ opacity: opacity/1.5 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <pattern
                id="pattern-constitution" 
                x="0" 
                y="0" 
                width="100" 
                height="100" 
                patternUnits="userSpaceOnUse"
              >
                <path 
                  d="M50 10 A40 40 0 0 1 50 90 A40 40 0 0 1 50 10" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeOpacity="0.15"
                />
                <line 
                  x1="50" y1="0" x2="50" y2="100" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeOpacity="0.1"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pattern-constitution)" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="pointer-events-none">
            <motion.div 
              className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-radial from-primary/20 to-transparent opacity-30 blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.4, 0.3],
              }} 
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-radial from-purple-700/20 to-transparent opacity-30 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }} 
              transition={{ 
                duration: 25, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 5
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className={cn("relative min-h-[calc(100vh-4rem)] overflow-hidden", className)} {...props}>
      {getBackgroundPattern()}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
