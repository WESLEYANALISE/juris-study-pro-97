
import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "default" | "sm" | "md" | "lg" | "xl" | "full";
  glass?: boolean;
}

export function Container({ 
  children, 
  size = "default", 
  glass = false,
  className,
  ...props 
}: ContainerProps) {
  const sizeClasses = {
    default: "max-w-screen-xl",
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    full: "max-w-full"
  };
  
  return (
    <div 
      className={cn(
        "w-full mx-auto px-4 sm:px-6", 
        sizeClasses[size], 
        glass && "bg-glass-card rounded-xl p-4 sm:p-6",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
