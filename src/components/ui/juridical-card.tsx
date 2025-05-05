
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Landmark, Book, Scale, LucideIcon } from "lucide-react";

interface JuridicalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: string | React.ReactNode;
  variant?: "primary" | "default" | "secondary";
  children?: React.ReactNode;
}

export function JuridicalCard({
  title,
  description,
  icon,
  variant = "default",
  className,
  children,
  ...props
}: JuridicalCardProps) {
  const getIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    switch (icon) {
      case "landmark":
        return <Landmark className="h-5 w-5" />;
      case "book":
        return <Book className="h-5 w-5" />;
      case "scales":
        return <Scale className="h-5 w-5" />;
      default:
        return <Landmark className="h-5 w-5" />;
    }
  };
  
  const variants = {
    primary: "from-purple-950/40 to-purple-900/20 border-purple-700/30 hover:border-purple-700/50",
    default: "from-background/60 to-background/80 border-white/10 hover:border-white/20",
    secondary: "from-indigo-950/30 to-indigo-900/10 border-indigo-700/20 hover:border-indigo-700/40",
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "relative rounded-xl overflow-hidden border backdrop-blur-sm",
        "transition-colors duration-300 p-6",
        "bg-gradient-to-br shadow-xl hover:shadow-2xl",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className={cn(
            "p-2 rounded-full",
            variant === "primary" ? "bg-purple-500/20" :
            variant === "secondary" ? "bg-indigo-500/20" : "bg-white/10"
          )}>
            {getIcon()}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}
