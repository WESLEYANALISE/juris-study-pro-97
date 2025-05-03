
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Waveform-inspired card
export function SoundscapeCard({
  children,
  className,
  waveColor = "rgb(139, 92, 246)",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  waveColor?: string;
}) {
  return (
    <motion.div
      className={cn(
        "relative rounded-lg border border-white/10 bg-black/40 backdrop-blur-lg shadow-lg overflow-hidden",
        className
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
      
      {/* Audio waveform decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
    </motion.div>
  );
}

// Audio visualization component
export function SoundscapeVisualization({ 
  isPlaying = false, 
  color = "rgba(139, 92, 246, 0.8)",
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  isPlaying?: boolean;
  color?: string;
}) {
  const [bars, setBars] = useState<number[]>(Array(16).fill(1));
  
  // Animate the bars when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setBars(bars => bars.map(() => Math.max(1, Math.random() * 20)));
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div 
      className={cn("flex items-end justify-center space-x-1 h-16", className)}
      {...props}
    >
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ height: 2 }}
          animate={{ height: isPlaying ? `${height * 2}px` : 2 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 10,
            duration: 0.1
          }}
        />
      ))}
    </div>
  );
}

// Audio player UI container
export function SoundscapePlayerContainer({
  children,
  className,
  expanded = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  expanded?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-white/10 bg-gradient-to-b from-purple-950/80 to-black/80 backdrop-blur-xl shadow-xl p-4",
        expanded ? "fixed inset-0 z-50" : "relative",
        className
      )}
      layout
      transition={{
        layout: { duration: 0.6, type: "spring" }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Sound wave timeline for podcast scrubbing
export function SoundscapeTimeline({
  progress = 0,
  onSeek,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  progress: number;
  onSeek?: (value: number) => void;
}) {
  const [wavePoints, setWavePoints] = useState<number[]>([]);
  
  // Generate waveform points for visualization
  useEffect(() => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      points.push(Math.sin(i * 0.2) * Math.random() * 15 + 20);
    }
    setWavePoints(points);
  }, []);
  
  return (
    <div 
      className={cn("relative h-16 cursor-pointer", className)}
      onClick={(e) => {
        if (!onSeek) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        onSeek(percentage);
      }}
      {...props}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 40">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <clipPath id="progressClip">
            <rect x="0" y="0" width={`${progress * 100}%`} height="40" />
          </clipPath>
        </defs>
        
        {/* Background wave */}
        <polyline
          points={wavePoints.map((p, i) => `${i},${p}`).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        
        {/* Progress wave */}
        <polyline
          points={wavePoints.map((p, i) => `${i},${p}`).join(' ')}
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          clipPath="url(#progressClip)"
        />
      </svg>
    </div>
  );
}
