
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FlashcardRatingProps {
  onRate: (level: 0 | 1 | 2 | 3 | 4 | 5) => void;
  className?: string;
}

export function FlashcardRating({ onRate, className }: FlashcardRatingProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  
  const levels = [
    { value: 0, label: "Não sei", color: "bg-red-500/20 border-red-500/30 hover:bg-red-500/30" },
    { value: 1, label: "Reconheço", color: "bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30" },
    { value: 2, label: "Difícil", color: "bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30" },
    { value: 3, label: "Bom", color: "bg-lime-500/20 border-lime-500/30 hover:bg-lime-500/30" },
    { value: 4, label: "Fácil", color: "bg-green-500/20 border-green-500/30 hover:bg-green-500/30" },
    { value: 5, label: "Domino", color: "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30" },
  ];
  
  return (
    <div className={cn("w-full space-y-3", className)}>
      <p className="text-sm text-muted-foreground text-center mb-4">
        Sua avaliação ajuda a determinar quando você verá este cartão novamente.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {levels.map((level) => (
          <motion.div 
            key={level.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={() => onRate(level.value as 0 | 1 | 2 | 3 | 4 | 5)}
              className={cn(
                "w-full h-16 flex flex-col border", 
                level.color,
                hoveredLevel !== null && hoveredLevel >= level.value ? level.color : ""
              )}
              onMouseEnter={() => setHoveredLevel(level.value)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <span className="text-base">{level.label}</span>
              <span className="text-xs text-muted-foreground mt-1">{level.value}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
