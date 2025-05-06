
import { useState, useEffect } from "react";
import { FlashcardStudySession } from "./FlashcardStudySession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, BookOpen, CheckCircle2, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import confetti from 'canvas-confetti';

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
  autoNarrate?: boolean;
  autoSpeed?: number;
  onExit: () => void;
}

export function FlashcardSession({ 
  cards, 
  showAnswers, 
  studyMode, 
  autoNarrate = false,
  autoSpeed = 3500, 
  onExit 
}: FlashcardSessionProps) {
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleComplete = () => {
    setSessionComplete(true);
    
    // Trigger confetti effect
    const colors = ['#9b87f5', '#7c68e3', '#6d56cc'];
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });
    
    // Second confetti burst after a delay
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });
    }, 500);
  };

  if (sessionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-[#1A1633] via-[#262051] to-[#1A1633] shadow-lg border border-primary/20">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center text-green-400"
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
              <motion.div 
                className="flex flex-col items-center p-3 rounded-lg bg-[#1A1633]/50 border border-primary/10" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <BookOpen className="h-5 w-5 text-primary mb-1" />
                <div className="text-lg font-semibold">{cards.length}</div>
                <div className="text-xs text-muted-foreground">Cards Estudados</div>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center p-3 rounded-lg bg-[#1A1633]/50 border border-primary/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Award className="h-5 w-5 text-amber-500 mb-1" />
                <div className="text-lg font-semibold">+{cards.length * 5}</div>
                <div className="text-xs text-muted-foreground">Pontos Ganhos</div>
              </motion.div>
            </div>
            
            <motion.div 
              className="border-t border-primary/10 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <p className="text-sm text-center text-muted-foreground mb-4">
                Continue estudando para manter sua sequência!
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="default"
                  className="w-full bg-gradient-to-r from-primary/90 to-purple-600/90 shadow-lg hover:shadow-purple/20 border border-primary/20 transition-all duration-300"
                  onClick={onExit}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Concluir
                </Button>
              </div>
            </motion.div>
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
      autoNarrate={autoNarrate}
      autoSpeed={autoSpeed}
      onComplete={handleComplete}
      onExit={onExit}
    />
  );
}
