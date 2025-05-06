import React, { useState, useEffect, useCallback } from "react";
import { FlashcardView } from "@/components/flashcards/FlashcardView";
import { FlashcardRating } from "@/components/flashcards/FlashcardRating";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardSessionProps {
  flashcards: {
    id: string | number;
    area: string;
    tema: string;
    pergunta: string;
    resposta: string;
    explicacao: string | null;
  }[];
  onComplete?: (results: any) => void;
  onExit?: () => void;
}

export function FlashcardSession({ flashcards, onComplete, onExit }: FlashcardSessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = flashcards[currentCardIndex];

  const handleNextCard = useCallback(() => {
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) => Math.min(prevIndex + 1, flashcards.length - 1));
  }, [flashcards.length]);

  const handlePreviousCard = useCallback(() => {
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  }, []);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRateCard = (level: 0 | 1 | 2 | 3 | 4 | 5) => {
    setResults((prevResults) => [
      ...prevResults,
      {
        cardId: currentCard.id,
        rating: level,
      },
    ]);

    if (currentCardIndex === flashcards.length - 1) {
      setIsComplete(true);
    } else {
      handleNextCard();
    }
  };

  const handleExitSession = () => {
    if (onExit) {
      onExit();
    }
  };

  const handleSubmit = () => {
    if (onComplete) {
      onComplete(results);
    }
  };

  useEffect(() => {
    if (isComplete) {
      handleSubmit();
    }
  }, [isComplete, results, handleSubmit]);

  return (
    <div className="flex flex-col h-full">
      {/* Flashcard View */}
      <div className="flex-grow flex items-center justify-center">
        {currentCard && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
            >
              <FlashcardView
                question={currentCard.pergunta}
                answer={currentCard.resposta}
                explanation={currentCard.explicacao}
                showAnswer={showAnswer}
                onShowAnswer={handleShowAnswer}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Rating and Navigation */}
      {!showAnswer && currentCard && (
        <motion.div
          className="p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FlashcardRating onRate={handleRateCard} />

          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={handlePreviousCard}
              disabled={currentCardIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant="secondary"
              onClick={handleNextCard}
              disabled={currentCardIndex === flashcards.length - 1}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Completion and Exit */}
      {showAnswer && currentCard && (
        <motion.div
          className="p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleExitSession}>
              <XCircle className="w-4 h-4 mr-2" />
              Sair
            </Button>
            <Button variant="default" onClick={() => handleRateCard(5)}>
              Concluir <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
