
import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
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
    secondary: "from-indigo-900/30 to-indigo-900/10 border-indigo-700/20 hover:border-indigo-700/40"
  };

  // Set type-safe hover animation without using the problematic props
  const hoverAnimation = { y: -5, transition: { duration: 0.2 } };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-b p-6 shadow-md transition-all",
        variants[variant],
        className
      )}
      whileHover={hoverAnimation}
      {...props}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-primary/20 p-2 text-primary">{getIcon()}</div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      {children}
    </motion.div>
  );
}
