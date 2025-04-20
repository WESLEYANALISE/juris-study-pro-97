
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";

interface FlashcardControlsProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  onShuffle: () => void;
}

export const FlashcardControls = ({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  onRestart,
  onShuffle,
}: FlashcardControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <Button 
        onClick={onPrevious} 
        disabled={currentIndex === 0}
        variant="outline"
        size="lg"
        className="w-[120px]"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Anterior
      </Button>

      <Button 
        onClick={onRestart} 
        variant="outline"
        size="icon"
        className="h-10 w-10"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>

      <Button 
        onClick={onNext} 
        disabled={currentIndex === totalCards - 1}
        variant="default"
        size="lg"
        className="w-[120px]"
      >
        Próximo
        <ChevronRight className="h-5 w-5 ml-1" />
      </Button>
    </div>
  );
};
