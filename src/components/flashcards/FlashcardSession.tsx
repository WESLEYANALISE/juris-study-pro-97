
import React, { useState, useEffect } from "react";
import { FlashcardView } from "./FlashcardView";
import { FlashcardRating } from "./FlashcardRating";
import { Button } from "@/components/ui/button";
import { FlashcardHeader } from "./FlashcardHeader";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Layers, RotateCw } from "lucide-react";

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  area: string;
  tema: string;
  dificuldade?: string;
  explicacao?: string;
}

interface FlashcardSessionProps {
  flashcards: Flashcard[];
  onComplete: (results: any) => void;
  onExit: () => void;
  areaName?: string;
  temaNome?: string;
}

export function FlashcardSession({ 
  flashcards, 
  onComplete, 
  onExit,
  areaName,
  temaNome
}: FlashcardSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<{ cardId: string; rating: number }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  
  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex) / flashcards.length) * 100;
  
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };
  
  const handleRating = (rating: 0 | 1 | 2 | 3 | 4 | 5) => {
    // Update statistics
    if (rating <= 1) {
      setStats(prev => ({ ...prev, hard: prev.hard + 1 }));
    } else if (rating <= 3) {
      setStats(prev => ({ ...prev, medium: prev.medium + 1 }));
    } else {
      setStats(prev => ({ ...prev, easy: prev.easy + 1 }));
    }
    
    // Save result
    setResults([
      ...results,
      { cardId: currentCard.id, rating }
    ]);
    
    // Move to next card or complete
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setIsCompleted(true);
      // Call onComplete with a small delay to allow animation
      setTimeout(() => {
        onComplete(results);
      }, 1000);
    }
  };
  
  const handleRetry = () => {
    // Reset everything
    setCurrentIndex(0);
    setShowAnswer(false);
    setResults([]);
    setIsCompleted(false);
  };

  const sessionTitle = `${areaName || "Direito"} - ${temaNome || "Revisão geral"}`;
  
  const userStats = {
    totalStudied: 120,
    todayStudied: 25,
    masteredCards: 50,
    streak: 3,
  };

  return (
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
      <FlashcardHeader 
        userStats={userStats}
        onShowStats={() => {}}
        isMobile={false}
        title={sessionTitle}
      />
      
      {/* Progress bar and count */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          Cartão {currentIndex + 1} de {flashcards.length}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> 
            Difíceis: {stats.hard}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 
            Médios: {stats.medium}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> 
            Fáceis: {stats.easy}
          </span>
        </div>
      </div>
      <Progress value={progress} className="h-2" 
        style={{
          background: "linear-gradient(to right, rgba(240,82,82,0.2), rgba(245,158,11,0.2), rgba(132,204,22,0.2))"
        }}
      />
      
      <AnimatePresence mode="wait">
        {isCompleted ? (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center space-y-6 py-12"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Sessão concluída!</h2>
            <p className="text-muted-foreground text-center">
              Você estudou {flashcards.length} cartões nesta sessão.
            </p>
            
            <div className="grid grid-cols-3 gap-4 w-full mt-4">
              <div className="flex flex-col items-center p-4 bg-red-500/20 rounded-lg">
                <span className="text-2xl font-bold text-red-500">{stats.hard}</span>
                <span className="text-sm">Difíceis</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-amber-500/20 rounded-lg">
                <span className="text-2xl font-bold text-amber-500">{stats.medium}</span>
                <span className="text-sm">Médios</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-500/20 rounded-lg">
                <span className="text-2xl font-bold text-green-500">{stats.easy}</span>
                <span className="text-sm">Fáceis</span>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={onExit} className="gap-2">
                <Layers className="h-4 w-4" />
                Voltar ao menu
              </Button>
              <Button onClick={handleRetry} variant="default" className="gap-2">
                <RotateCw className="h-4 w-4" />
                Revisar novamente
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="session"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <FlashcardView
              question={currentCard.pergunta}
              answer={currentCard.resposta}
              explanation={currentCard.explicacao}
              showAnswer={showAnswer}
              onShowAnswer={handleShowAnswer}
            />
            
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FlashcardRating onRate={handleRating} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
