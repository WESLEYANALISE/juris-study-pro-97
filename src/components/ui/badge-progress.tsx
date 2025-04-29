
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BadgeProgressProps {
  value: number;
  label: string;
  max?: number;
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  className?: string;
  progressClassName?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

export function BadgeProgress({
  value,
  label,
  max = 100,
  size = "md",
  showPercentage = true,
  className,
  progressClassName,
  variant = "default",
}: BadgeProgressProps) {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };
  
  const variantClasses = {
    default: "",
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    destructive: "text-destructive",
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm">{label}</span>
        <Badge variant="outline" className={cn("font-mono", variantClasses[variant])}>
          {showPercentage ? `${percentage}%` : `${value}/${max}`}
        </Badge>
      </div>
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5 }}
        style={{ originX: 0 }}
      >
        <Progress 
          value={percentage} 
          className={cn(sizeClasses[size], progressClassName)} 
        />
      </motion.div>
    </div>
  );
}
