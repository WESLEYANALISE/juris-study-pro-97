
import { useState } from "react";
import { FlashcardStudySession } from "./FlashcardStudySession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, BookOpen, CheckCircle2, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";

type FlashCard = {
  id: string | number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
};

interface FlashcardSessionProps {
  cards: FlashCard[];
  showAnswers: boolean;
  studyMode: "manual" | "auto";
  autoSpeed?: number;
  onExit: () => void;
}

export function FlashcardSession({ cards, showAnswers, studyMode, autoSpeed = 3500, onExit }: FlashcardSessionProps) {
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleComplete = () => {
    setSessionComplete(true);
  };

  if (sessionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-card via-card/80 to-card shadow-lg border">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"
              >
                <PartyPopper className="h-8 w-8" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl text-center">Sessão Concluída!</CardTitle>
            <CardDescription className="text-center">
              Você estudou {cards.length} flashcards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary mb-1" />
                <div className="text-lg font-semibold">{cards.length}</div>
                <div className="text-xs text-muted-foreground">Cards Estudados</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <Award className="h-5 w-5 text-amber-500 mb-1" />
                <div className="text-lg font-semibold">+{cards.length * 5}</div>
                <div className="text-xs text-muted-foreground">Pontos Ganhos</div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-center text-muted-foreground mb-4">
                Continue estudando para manter sua sequência!
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="default"
                  className="w-full gradient-button"
                  onClick={onExit}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Concluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <FlashcardStudySession
      cards={cards}
      showAnswers={showAnswers}
      studyMode={studyMode}
      autoSpeed={autoSpeed}
      onComplete={handleComplete}
      onExit={onExit}
    />
  );
}
