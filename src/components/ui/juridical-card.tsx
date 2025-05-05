
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Landmark, Book, Scale } from "lucide-react";

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
    primary: "from-purple-900/40 to-purple-800/20 border-purple-700/30 hover:border-purple-700/50",
    default: "from-gray-800/60 to-gray-800/40 border-gray-700/30 hover:border-gray-700/50",
    secondary: "from-indigo-900/30 to-indigo-900/10 border-indigo-700/20 hover:border-indigo-700/40",
  };

  // Create a div element with motion features instead of passing all props directly
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 15px 30px -8px rgba(0,0,0,0.3), 0 0 15px -3px rgba(139,92,246,0.2)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-xl overflow-hidden border backdrop-blur-sm",
        "transition-all duration-300 p-6",
        "bg-gradient-to-br shadow-card-dark",
        variants[variant],
        className
      )}
    >
      <div className="flex flex-col gap-4" {...props}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className={cn(
            "p-2 rounded-full",
            variant === "primary" ? "bg-purple-500/20" :
            variant === "secondary" ? "bg-indigo-500/20" : "bg-gray-700/50"
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
