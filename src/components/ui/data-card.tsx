
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Fix: Separate the HTMLDiv props and MotionProps to avoid conflicts
interface DataCardProps {
  title: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  children: React.ReactNode;
  className?: string;
  // Add any motion props you need explicitly
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
}

export function DataCard({
  title,
  icon,
  footer,
  variant = "default",
  className,
  children,
  // Extract motion props
  initial,
  animate,
  exit,
  transition,
  ...props
}: DataCardProps) {
  const variantStyles = {
    default: "",
    primary: "border-primary/20",
    success: "border-green-500/20",
    warning: "border-yellow-500/20",
    destructive: "border-destructive/20",
  };

  const variantIconStyles = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    destructive: "text-destructive",
  };

  // Pass only the motion props to motion.div
  const motionProps = {
    initial,
    animate,
    exit,
    transition
  };

  return (
    <motion.div {...motionProps}>
      <Card className={cn("overflow-hidden", variantStyles[variant], className)} {...props}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {icon && <span className={cn(variantIconStyles[variant])}>{icon}</span>}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="border-t bg-muted/50 px-6 py-3">
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
