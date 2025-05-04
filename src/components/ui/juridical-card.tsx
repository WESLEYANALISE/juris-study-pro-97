
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
  onClick?: () => void;
}

export function JuridicalCard({
  title,
  description,
  icon = "scales",
  variant = "default",
  children,
  footer,
  className,
  onClick
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
    default: "border-border/50 bg-gradient-to-br from-background/60 to-background/90",
    primary: "border-primary/20 bg-gradient-to-br from-purple-900/30 to-purple-800/20",
    secondary: "border-secondary/20 bg-gradient-to-br from-blue-900/30 to-purple-800/20"
  };
  
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 15px 30px -8px rgba(0,0,0,0.3), 0 0 15px -3px rgba(139,92,246,0.3)" }}
      transition={{ duration: 0.25 }}
      className={cn("group", className)}
      onClick={onClick}
    >
      <Card className={cn(
        "transition-all duration-300 shadow-lg hover:shadow-xl", 
        variantClasses[variant],
        "border-white/5"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {IconComponent && (
              <span className="p-2 rounded-md bg-background/50 text-primary group-hover:text-secondary transition-colors duration-300 shadow-inner">
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
