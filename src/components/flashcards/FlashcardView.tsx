
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Brain, Volume2, BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardRating } from "./FlashcardRating";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { TextToSpeechService } from "@/services/textToSpeechService";
import { useIsMobile } from "@/hooks/use-mobile";

interface FlashCardViewProps {
  flashcard: {
    id: string | number;
    pergunta: string;
    resposta: string;
    explicacao?: string | null;
    tema: string;
    area: string;
  };
  index: number;
  total: number;
  onNext?: () => void;
}

export function FlashcardView({ flashcard, index, total, onNext }: FlashCardViewProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [rated, setRated] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { updateProgress } = useFlashcardProgress();
  const isMobile = useIsMobile();
  
  const handleRate = async (level: 0 | 1 | 2 | 3 | 4 | 5) => {
    await updateProgress(flashcard.id, level);
    setRated(true);
    
    // After a brief delay, proceed to the next card
    setTimeout(() => {
      setShowAnswer(false);
      setRated(false);
      if (onNext) onNext();
    }, 600);
  };
  
  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      TextToSpeechService.stop();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    await TextToSpeechService.speak(text);
    setIsSpeaking(false);
  };
  
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card 
          className="relative bg-gradient-to-br from-card via-[#9b87f515] to-card shadow-lg border-primary/20 rounded-xl overflow-hidden"
          style={{ minHeight: 420, width: "100%" }}
        >
          <div className="text-primary font-bold px-6 py-3 text-lg border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm bg-primary/10 px-2 py-0.5 rounded">{flashcard.area}</span>
              <span className="text-muted-foreground text-sm font-normal hidden sm:inline">{flashcard.tema}</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs font-normal text-muted-foreground">{index + 1}/{total}</span>
            </div>
          </div>
          
          <div className="p-5 sm:p-10 flex flex-col items-center justify-center">
            <div className="text-xl font-semibold text-center mb-8 p-4 rounded-lg bg-primary/5 border-l-2 border-primary/30">
              {flashcard.pergunta}
            </div>

            <div className="flex flex-col items-center w-full">
              {showAnswer ? (
                <div className="flex flex-col items-center w-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl bg-gradient-to-br from-[#D6BCFA30] to-[#FFF] py-6 px-7 rounded-lg text-foreground font-medium border text-center mb-6 shadow-md"
                  >
                    {flashcard.resposta}
                  </motion.div>
                  
                  {flashcard.explicacao && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="text-sm mt-3 text-muted-foreground p-4 bg-muted/50 rounded border-l-2 border-primary/30 w-full max-w-md"
                    >
                      <div className="font-medium mb-1 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> Explicação:
                      </div>
                      {flashcard.explicacao}
                    </motion.div>
                  )}
                  
                  {!rated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="mt-8 w-full max-w-md"
                    >
                      <p className="text-sm text-center text-muted-foreground mb-3">Como você avalia seu conhecimento neste card?</p>
                      <FlashcardRating onRate={handleRate} />
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="py-6 px-12 text-base font-medium mt-4 gradient-button"
                    onClick={() => setShowAnswer(true)}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Ver resposta
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Control buttons below the card */}
      <div className="flex w-full justify-between mt-6 gap-3">
        <Button 
          variant="outline" 
          size={isMobile ? "default" : "lg"}
          className="flex-1 py-4 sm:py-6"
          onClick={() => handleSpeak(flashcard.pergunta)}
        >
          <Volume2 className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6" />
          {isMobile ? 'Ouvir' : 'Ouvir pergunta'}
        </Button>
        
        {showAnswer && (
          <Button
            variant="outline"
            size={isMobile ? "default" : "lg"}
            className="flex-1 py-4 sm:py-6"
            onClick={() => setShowAnswer(false)}
          >
            <EyeOff className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6" />
            {isMobile ? 'Ocultar' : 'Ocultar resposta'}
          </Button>
        )}
      </div>
    </div>
  );
}
