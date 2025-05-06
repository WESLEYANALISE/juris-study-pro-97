
import { useState, useEffect } from "react";
import { FlashcardStudySession } from "./FlashcardStudySession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, Clock, PartyPopper, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

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
  showAnswers?: boolean;
  studyMode?: "manual" | "auto";
  autoNarrate?: boolean;
  autoSpeed?: number;
  onExit?: () => void;
}

export function FlashcardSession({
  cards,
  showAnswers = false,
  studyMode = "manual",
  autoNarrate = false,
  autoSpeed = 3500,
  onExit
}: FlashcardSessionProps) {
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalCards: cards.length,
    timeSpent: 0,
    reviewedCards: 0
  });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Start timer when session begins
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);
    
    setTimer(interval);
    
    // Clean up on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  
  // Handle session completion
  const handleSessionComplete = () => {
    // Stop the timer
    if (timer) clearInterval(timer);
    
    // Show success animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Update stats
    setSessionStats(prev => ({
      ...prev,
      reviewedCards: cards.length
    }));
    
    // Show completion screen
    setSessionCompleted(true);
    
    // Show toast notification
    toast.success("Sessão de estudo concluída!");
  };
  
  // Format time from seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (sessionCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-[#1A1633] via-[#262051] to-[#1A1633] shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sessão Concluída!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="border border-primary/20 rounded-lg p-4 text-center bg-card/50">
                <div className="text-2xl font-bold mb-1">{sessionStats.totalCards}</div>
                <div className="text-xs text-muted-foreground">Cartões</div>
              </div>
              <div className="border border-primary/20 rounded-lg p-4 text-center bg-card/50">
                <div className="text-2xl font-bold mb-1">{formatTime(sessionStats.timeSpent)}</div>
                <div className="text-xs text-muted-foreground">Tempo total</div>
              </div>
              <div className="border border-primary/20 rounded-lg p-4 text-center bg-card/50">
                <div className="text-2xl font-bold mb-1">
                  {Math.round((sessionStats.totalCards / sessionStats.timeSpent) * 60)}
                </div>
                <div className="text-xs text-muted-foreground">Cards/min</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 items-center">
              <p className="text-center text-muted-foreground">
                Continue estudando regularmente para melhorar seu conhecimento.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onExit} 
                  className="border-primary/20 hover:bg-primary/10"
                >
                  Finalizar
                </Button>
                <Button
                  onClick={() => {
                    setSessionCompleted(false);
                    setSessionStats(prev => ({ ...prev, timeSpent: 0, reviewedCards: 0 }));
                    
                    // Restart timer
                    const interval = setInterval(() => {
                      setSessionStats(prev => ({
                        ...prev,
                        timeSpent: prev.timeSpent + 1
                      }));
                    }, 1000);
                    
                    setTimer(interval);
                  }}
                  className="bg-gradient-to-r from-primary/90 via-purple-600/90 to-primary/90 gap-2"
                >
                  <PartyPopper className="h-4 w-4" /> Estudar novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 flex items-center gap-2 text-sm text-muted-foreground p-1">
        <Clock className="h-4 w-4" />
        <span>{formatTime(sessionStats.timeSpent)}</span>
      </div>
      
      <FlashcardStudySession 
        cards={cards}
        showAnswers={showAnswers}
        studyMode={studyMode}
        autoNarrate={autoNarrate}
        autoSpeed={autoSpeed}
        onComplete={handleSessionComplete}
        onExit={onExit}
      />
    </div>
  );
}
