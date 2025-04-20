import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { FlashcardCard } from "./FlashcardCard";
import { FlashcardControls } from "./FlashcardControls";
import { FlashcardSettings } from "./FlashcardSettings";
import { useIsMobile } from "@/hooks/use-mobile";

interface FlashcardStudyProps {
  flashcards: Tables<"flash_cards">[];
  onBack: () => void;
}

const FlashcardStudy = ({ flashcards = [], onBack }: FlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoInterval, setAutoInterval] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [shuffledCards, setShuffledCards] = useState(flashcards);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (flashcards.length > 0) {
      setProgress(((currentIndex + 1) / flashcards.length) * 100);
    }
  }, [currentIndex, flashcards.length]);

  useEffect(() => {
    if (isAutoMode) {
      const interval = window.setInterval(() => {
        handleNext();
      }, (11 - speed) * 1000);
      setAutoInterval(interval);
    } else if (autoInterval) {
      clearInterval(autoInterval);
      setAutoInterval(null);
    }
    return () => {
      if (autoInterval) clearInterval(autoInterval);
    };
  }, [isAutoMode, speed, currentIndex]);

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    const shuffled = [...shuffledCards]
      .sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    handleRestart();
  };

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="container mx-auto py-6 max-w-4xl text-center">
        <h2 className="text-xl font-semibold mb-4">Nenhum flashcard encontrado</h2>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  const currentFlashcard = shuffledCards[currentIndex];

  return (
    <div className="container mx-auto py-4 md:py-6 px-2 md:px-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onBack} className="text-sm">
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Badge variant="outline" className="py-1 md:py-1.5 text-xs md:text-sm">
            {currentIndex + 1} / {shuffledCards.length}
          </Badge>
          <Badge variant="secondary" className="py-1 md:py-1.5 text-xs md:text-sm">
            {currentFlashcard.area || "Sem área"}
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="mb-4 md:mb-6 h-1.5 md:h-2" />

      <FlashcardCard
        flashcard={currentFlashcard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      <div className="flex flex-col gap-3 md:gap-6 pb-safe-area-bottom">
        <FlashcardSettings
          speed={speed}
          isAutoMode={isAutoMode}
          onSpeedChange={handleSpeedChange}
          onAutoModeChange={setIsAutoMode}
          onShuffle={handleShuffle}
        />

        <FlashcardControls
          currentIndex={currentIndex}
          totalCards={shuffledCards.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onRestart={handleRestart}
          onShuffle={handleShuffle}
        />
      </div>
    </div>
  );
};

export default FlashcardStudy;
