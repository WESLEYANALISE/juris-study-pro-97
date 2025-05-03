
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Gavel, Scale, BookOpen, Landmark, ScrollText } from "lucide-react";

interface JuridicalCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: "scales" | "gavel" | "book" | "landmark" | "scroll";
  variant?: "primary" | "secondary" | "default";
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void; // Added onClick prop
}

export function JuridicalCard({
  title,
  description,
  icon = "scales",
  variant = "default",
  children,
  footer,
  className,
  onClick // Destructure onClick prop
}: JuridicalCardProps) {
  const iconMap = {
    scales: Scale,
    gavel: Gavel,
    book: BookOpen,
    landmark: Landmark,
    scroll: ScrollText
  };
  
  const IconComponent = iconMap[icon];
  
  const variantClasses = {
    default: "border-border/50",
    primary: "border-primary/20 gradient-purple",
    secondary: "border-secondary/20 gradient-card"
  };
  
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
      transition={{ duration: 0.2 }}
      className={cn("group", className)}
      onClick={onClick} // Add onClick handler
    >
      <Card className={cn("transition-all duration-300", variantClasses[variant])}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {IconComponent && (
              <span className="p-2 rounded-md bg-background/50 text-primary group-hover:text-secondary transition-colors duration-300">
                <IconComponent className="h-5 w-5" />
              </span>
            )}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        {children && (
          <CardContent>
            {children}
          </CardContent>
        )}
        {footer && (
          <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-3">
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
