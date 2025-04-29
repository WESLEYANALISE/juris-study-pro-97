
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  ThumbsDown,
  Frown,
  Meh,
  Smile,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type KnowledgeLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface FlashcardRatingProps {
  onRate: (level: KnowledgeLevel) => void;
  className?: string;
}

export function FlashcardRating({ onRate, className }: FlashcardRatingProps) {
  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel | null>(null);
  
  const ratingOptions: {level: KnowledgeLevel, label: string, icon: React.ReactNode, color: string}[] = [
    { level: 1, label: "Não sei", icon: <Frown className="h-5 w-5" />, color: "bg-red-600 bg-opacity-90 text-white hover:bg-red-700" },
    { level: 2, label: "Difícil", icon: <ThumbsDown className="h-5 w-5" />, color: "bg-orange-500 bg-opacity-90 text-white hover:bg-orange-600" },
    { level: 3, label: "Regular", icon: <Meh className="h-5 w-5" />, color: "bg-yellow-500 bg-opacity-90 text-white hover:bg-yellow-600" },
    { level: 4, label: "Bom", icon: <Smile className="h-5 w-5" />, color: "bg-green-500 bg-opacity-90 text-white hover:bg-green-600" },
    { level: 5, label: "Fácil", icon: <ThumbsUp className="h-5 w-5" />, color: "bg-emerald-500 bg-opacity-90 text-white hover:bg-emerald-600" },
  ];

  const handleRate = (level: KnowledgeLevel) => {
    setSelectedLevel(level);
    onRate(level);
  };

  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {ratingOptions.map((option) => (
        <motion.div
          key={option.level}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="lg"
            className={cn(
              option.color,
              selectedLevel === option.level ? "ring-2 ring-offset-2 ring-white/20" : "",
              "border-0 shadow-md transition-all flex-1"
            )}
            onClick={() => handleRate(option.level)}
          >
            {option.icon}
            <span className="ml-2">{option.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
