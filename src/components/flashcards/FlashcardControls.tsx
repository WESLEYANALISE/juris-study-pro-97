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
  const isMobile = useIsMobile();
  
  return (
    <div className="flex justify-between items-center">
      <Button 
        onClick={onPrevious} 
        disabled={currentIndex === 0}
        variant="outline"
        size={isMobile ? "sm" : "lg"}
        className={`${isMobile ? "w-[100px]" : "w-[120px]"} text-sm`}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Anterior
      </Button>

      <Button 
        onClick={onRestart} 
        variant="outline"
        size="icon"
        className="h-9 w-9 md:h-10 md:w-10"
      >
        <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      <Button 
        onClick={onNext} 
        disabled={currentIndex === totalCards - 1}
        variant="default"
        size={isMobile ? "sm" : "lg"}
        className={`${isMobile ? "w-[100px]" : "w-[120px]"} text-sm`}
      >
        Próximo
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};
