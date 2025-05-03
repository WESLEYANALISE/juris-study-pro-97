
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Glass card component with 3D hover effect
export function AtheneumCard({
  children,
  className,
  hoverEffect = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hoverEffect?: boolean }) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-lg shadow-xl",
        hoverEffect && "transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-500/20 hover:shadow-xl",
        className
      )}
      initial={hoverEffect ? { y: 10, opacity: 0 } : false}
      animate={hoverEffect ? { y: 0, opacity: 1 } : false}
      // Remove the whileHover prop
      {...props}
    >
      {children}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}

// Section title with decorative elements
export function AtheneumTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div className="relative mb-6 flex items-center">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-800/50" />
      <h2
        className={cn(
          "relative px-6 text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent",
          className
        )}
        {...props}
      >
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-800/50" />
    </div>
  );
}

// Decorative background element for sections
export function AtheneumBackground({
  children,
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "dark" | "light" | "gradient";
}) {
  const variants = {
    default: "bg-gradient-to-b from-background to-purple-950/20",
    dark: "bg-gradient-to-b from-background to-black",
    light: "bg-gradient-to-b from-background to-purple-900/10",
    gradient: "bg-gradient-to-br from-background via-purple-950/20 to-background",
  };

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden",
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-3xl" />
        <div className="absolute -bottom-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Gold-accent button
export function AtheneumButton({
  children,
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "link";
}) {
  const variants = {
    default: "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400",
    outline: "bg-transparent border border-amber-700 text-amber-400 hover:bg-amber-950/30",
    ghost: "bg-transparent text-amber-400 hover:bg-amber-950/30",
    link: "bg-transparent text-amber-400 underline-offset-4 hover:underline p-0 h-auto",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
