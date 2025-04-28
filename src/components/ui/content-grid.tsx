
import { cn } from "@/lib/utils";
import React from "react";

interface ContentGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ContentGrid({ 
  children, 
  columns = { default: 1, sm: 2, md: 3, lg: 4 }, 
  className, 
  ...props 
}: ContentGridProps) {
  // Calculate grid template columns based on breakpoints
  const gridCols = `grid-cols-${columns.default} sm:grid-cols-${columns.sm || columns.default} md:grid-cols-${columns.md || columns.sm || columns.default} lg:grid-cols-${columns.lg || columns.md || columns.sm || columns.default} xl:grid-cols-${columns.xl || columns.lg || columns.md || columns.sm || columns.default}`;
  
  return (
    <div 
      className={cn("grid gap-4 w-full", gridCols, className)} 
      {...props}
    >
      {children}
    </div>
  );
}
