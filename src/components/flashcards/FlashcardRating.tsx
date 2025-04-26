
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

type KnowledgeLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface FlashcardRatingProps {
  onRate: (level: KnowledgeLevel) => void;
  className?: string;
}

export function FlashcardRating({ onRate, className }: FlashcardRatingProps) {
  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel | null>(null);
  
  const ratingOptions: {level: KnowledgeLevel, label: string, icon: React.ReactNode, color: string}[] = [
    { level: 1, label: "Não sei", icon: <Frown className="h-4 w-4" />, color: "bg-red-100 text-red-600 hover:bg-red-200" },
    { level: 2, label: "Difícil", icon: <ThumbsDown className="h-4 w-4" />, color: "bg-orange-100 text-orange-600 hover:bg-orange-200" },
    { level: 3, label: "Regular", icon: <Meh className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" },
    { level: 4, label: "Bom", icon: <Smile className="h-4 w-4" />, color: "bg-green-100 text-green-600 hover:bg-green-200" },
    { level: 5, label: "Fácil", icon: <ThumbsUp className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" },
  ];

  const handleRate = (level: KnowledgeLevel) => {
    setSelectedLevel(level);
    onRate(level);
  };

  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {ratingOptions.map((option) => (
        <Button
          key={option.level}
          variant="outline"
          size="sm"
          className={cn(
            option.color,
            selectedLevel === option.level ? "ring-2 ring-offset-1" : "",
            "border transition-all"
          )}
          onClick={() => handleRate(option.level)}
        >
          {option.icon}
          <span className="ml-1">{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
