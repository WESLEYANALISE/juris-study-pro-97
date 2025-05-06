
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
    default: "gradient-card bg-gradient-to-br from-background/60 to-background/90 shadow-lg hover:shadow-xl",
    primary: "gradient-card border-primary/20 bg-gradient-to-br from-purple-900/30 to-purple-800/20 shadow-lg hover:shadow-xl hover:shadow-purple/10",
    success: "gradient-card border-green-500/20 bg-gradient-to-br from-green-900/20 to-green-800/10 shadow-lg hover:shadow-xl hover:shadow-success/10",
    warning: "gradient-card border-yellow-500/20 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 shadow-lg hover:shadow-xl hover:shadow-warning/10",
    destructive: "gradient-card border-destructive/20 bg-gradient-to-br from-destructive/20 to-destructive/5 shadow-lg hover:shadow-xl hover:shadow-destructive/10",
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
    transition: transition || { duration: 0.3 },
    whileHover: { y: -5, boxShadow: "0 15px 30px -8px rgba(0,0,0,0.3), 0 0 15px -3px rgba(139,92,246,0.2)" }
  };

  return (
    <motion.div {...motionProps}>
      <Card className={cn("overflow-hidden hover-lift backdrop-blur-sm border-white/5", variantStyles[variant], className)} {...props}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {icon && <span className={cn("bg-card/50 p-1.5 rounded-full shadow-inner", variantIconStyles[variant])}>{icon}</span>}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="border-t border-white/5 bg-muted/20 px-6 py-3">
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
