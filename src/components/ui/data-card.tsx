
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, MotionProps } from "framer-motion";

interface DataCardProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {
  title: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  children: React.ReactNode;
}

export function DataCard({
  title,
  icon,
  footer,
  variant = "default",
  className,
  children,
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

  return (
    <motion.div {...props}>
      <Card className={cn("overflow-hidden", variantStyles[variant], className)}>
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
