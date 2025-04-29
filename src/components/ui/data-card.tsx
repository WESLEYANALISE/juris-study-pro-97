
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    default: "gradient-card",
    primary: "gradient-card border-primary/20 shadow-purple/10",
    success: "gradient-card border-green-500/20 shadow-success/10",
    warning: "gradient-card border-yellow-500/20 shadow-warning/10",
    destructive: "gradient-card border-destructive/20 shadow-destructive/10",
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
    initial: initial || { opacity: 0, y: 10 },
    animate: animate || { opacity: 1, y: 0 },
    exit,
    transition: transition || { duration: 0.3 }
  };

  return (
    <motion.div {...motionProps}>
      <Card className={cn("overflow-hidden hover-lift backdrop-blur-sm", variantStyles[variant], className)} {...props}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {icon && <span className={cn("bg-card/50 p-1.5 rounded-full", variantIconStyles[variant])}>{icon}</span>}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="border-t bg-muted/20 px-6 py-3">
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
