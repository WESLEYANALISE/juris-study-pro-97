
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SoundscapeVisualizationProps {
  isPlaying: boolean;
  className?: string;
  barCount?: number;
}

export function SoundscapeVisualization({ 
  isPlaying, 
  className,
  barCount = 3 
}: SoundscapeVisualizationProps) {
  return (
    <div className={cn("flex items-end gap-[2px]", className)}>
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-primary rounded-full w-[2px]"
          initial={{ height: "30%" }}
          animate={isPlaying ? {
            height: ["20%", "70%", "40%", "60%", "30%"],
            transition: {
              duration: 1.2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: index * 0.15,
            }
          } : { height: "30%" }}
        />
      ))}
    </div>
  );
}

interface AudioWaveProps {
  isPlaying?: boolean;
  className?: string;
}

export function AudioWave({ isPlaying = true, className }: AudioWaveProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 2, 1].map((height, index) => (
        <motion.div
          key={index}
          className="bg-primary rounded-full w-[3px]"
          initial={{ height: `${height * 4}px` }}
          animate={isPlaying ? {
            height: [`${height * 3}px`, `${height * 8}px`, `${height * 4}px`],
            transition: {
              duration: 0.8 + (index * 0.1),
              repeat: Infinity,
              repeatType: "reverse",
              delay: index * 0.1,
            }
          } : { height: `${height * 4}px` }}
        />
      ))}
    </div>
  );
}

interface PulseRingProps {
  className?: string;
}

export function PulseRing({ className }: PulseRingProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse" />
    </div>
  );
}
