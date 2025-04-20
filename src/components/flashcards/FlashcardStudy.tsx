import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { FlashcardCard } from "./FlashcardCard";
import { FlashcardControls } from "./FlashcardControls";
import { FlashcardSettings } from "./FlashcardSettings";
import { FlashcardHeader } from "./FlashcardHeader";

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
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-4xl">
      <FlashcardHeader
        currentIndex={currentIndex}
        totalCards={shuffledCards.length}
        progress={progress}
        currentFlashcard={currentFlashcard}
        onBack={onBack}
      />

      <FlashcardCard
        flashcard={currentFlashcard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      <div className="flex flex-col gap-4 md:gap-6">
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
