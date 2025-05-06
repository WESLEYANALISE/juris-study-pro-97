
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
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  const levels = [
    { 
      value: 0, 
      label: "Não sei", 
      description: "Não consegui recordar",
      color: "bg-red-500/20 border-red-500/30 hover:bg-red-500/30",
      activeColor: "bg-red-500/40 border-red-500/50", 
      textColor: "text-red-600 dark:text-red-400"
    },
    { 
      value: 1, 
      label: "Reconheço", 
      description: "Parece familiar",
      color: "bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30",
      activeColor: "bg-orange-500/40 border-orange-500/50",
      textColor: "text-orange-600 dark:text-orange-400"
    },
    { 
      value: 2, 
      label: "Difícil", 
      description: "Resposta com esforço",
      color: "bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30",
      activeColor: "bg-amber-500/40 border-amber-500/50",
      textColor: "text-amber-600 dark:text-amber-400"
    },
    { 
      value: 3, 
      label: "Bom", 
      description: "Resposta após reflexão",
      color: "bg-lime-500/20 border-lime-500/30 hover:bg-lime-500/30",
      activeColor: "bg-lime-500/40 border-lime-500/50",
      textColor: "text-lime-600 dark:text-lime-400"
    },
    { 
      value: 4, 
      label: "Fácil", 
      description: "Resposta rápida",
      color: "bg-green-500/20 border-green-500/30 hover:bg-green-500/30",
      activeColor: "bg-green-500/40 border-green-500/50",
      textColor: "text-green-600 dark:text-green-400"
    },
    { 
      value: 5, 
      label: "Domino", 
      description: "Conhecimento sólido",
      color: "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30",
      activeColor: "bg-emerald-500/40 border-emerald-500/50",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
  ];
  
  const handleRating = (level: 0 | 1 | 2 | 3 | 4 | 5) => {
    setSelectedLevel(level);
    // Small delay to show the selection animation before submitting
    setTimeout(() => onRate(level), 300);
  };
  
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <div className="h-0.5 w-12 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
        <div className="h-0.5 w-12 bg-gradient-to-r from-orange-500 to-amber-500"></div>
        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
        <div className="h-0.5 w-12 bg-gradient-to-r from-amber-500 to-lime-500"></div>
        <div className="w-2 h-2 rounded-full bg-lime-500"></div>
        <div className="h-0.5 w-12 bg-gradient-to-r from-lime-500 to-green-500"></div>
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <div className="h-0.5 w-12 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      </div>
      
      <p className="text-sm text-muted-foreground text-center mb-4">
        Sua avaliação ajuda a determinar quando você verá este cartão novamente:
      </p>
      
      <div className="grid grid-cols-3 gap-3">
        {levels.map((level) => (
          <motion.div 
            key={level.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              variant="outline"
              onClick={() => handleRating(level.value as 0 | 1 | 2 | 3 | 4 | 5)}
              className={cn(
                "w-full h-20 flex flex-col border transition-all duration-300", 
                selectedLevel === level.value ? level.activeColor : level.color,
                hoveredLevel !== null && hoveredLevel >= level.value ? level.color : "",
                selectedLevel === level.value ? "ring-2 ring-offset-1 ring-offset-background" : ""
              )}
              onMouseEnter={() => setHoveredLevel(level.value)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <span className={cn("text-base font-medium", level.textColor)}>{level.label}</span>
              <span className="text-xs text-muted-foreground mt-1">{level.description}</span>
              <span className={cn("text-xs font-bold mt-1", level.textColor)}>{level.value}</span>
            </Button>
          </motion.div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        Dificuldade: <span className="font-semibold">Não sei</span> (muito frequente) → <span className="font-semibold">Domino</span> (muito espaçado)
      </p>
    </div>
  );
}
