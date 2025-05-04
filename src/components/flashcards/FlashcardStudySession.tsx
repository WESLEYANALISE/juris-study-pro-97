
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RotateCcw, 
  BookmarkPlus, 
  Volume2,
  Flag
} from "lucide-react";
import { FlashcardView } from "./FlashcardView";
import { FlashcardRating } from "./FlashcardRating";
import { useToast } from "@/hooks/use-toast";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { TextToSpeechService } from "@/services/textToSpeechService";

export type FlashCard = {
  id: string | number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
};

interface FlashcardStudySessionProps {
  cards: FlashCard[];
  initialIndex?: number;
  showAnswers?: boolean;
  studyMode?: "manual" | "auto";
  autoSpeed?: number;
  onComplete?: () => void;
  onExit?: () => void;
}

export function FlashcardStudySession({
  cards,
  initialIndex = 0,
  showAnswers = false,
  studyMode = "manual",
  autoSpeed = 3500,
  onComplete,
  onExit
}: FlashcardStudySessionProps) {
  const [index, setIndex] = useState(initialIndex);
  const [showingAnswer, setShowingAnswer] = useState(showAnswers);
  const [isRating, setIsRating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { updateProgress } = useFlashcardProgress();
  
  // For auto mode
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (studyMode === "auto" && cards.length > 0 && !isRating) {
      intervalId = setInterval(() => {
        if (!showingAnswer) {
          setShowingAnswer(true);
        } else {
          setIndex((current) => {
            if (current >= cards.length - 1) {
              clearInterval(intervalId!);
              onComplete?.();
              return current;
            }
            return current + 1;
          });
          setShowingAnswer(showAnswers);
        }
      }, autoSpeed);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [studyMode, cards.length, autoSpeed, isRating, showingAnswer, showAnswers, onComplete]);
  
  // Reset showingAnswer when index changes
  useEffect(() => {
    setShowingAnswer(showAnswers);
    setIsRating(false);
  }, [index, showAnswers]);
  
  if (cards.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Nenhum flashcard disponível com os filtros selecionados.
        </p>
        <Button onClick={onExit}>Voltar</Button>
      </Card>
    );
  }

  const currentCard = cards[index];
  const progress = ((index + 1) / cards.length) * 100;
  
  const handleNext = () => {
    if (index < cards.length - 1) {
      setIndex(index + 1);
    } else {
      onComplete?.();
    }
  };
  
  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };
  
  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    setIndex(randomIndex);
  };
  
  const handleRate = async (level: 0 | 1 | 2 | 3 | 4 | 5) => {
    await updateProgress(currentCard.id, level);
    setIsRating(false);
    toast({
      title: "Progresso atualizado",
      description: "Seu conhecimento deste flashcard foi atualizado."
    });
    
    // Move to next card after rating
    setTimeout(handleNext, 500);
  };
  
  const handleSpeak = async () => {
    if (isSpeaking) {
      TextToSpeechService.stop();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    const textToSpeak = showingAnswer 
      ? `${currentCard.pergunta}. A resposta é: ${currentCard.resposta}`
      : currentCard.pergunta;
    
    await TextToSpeechService.speak(textToSpeak);
    setIsSpeaking(false);
  };

  const handleReport = () => {
    toast({
      title: "Flashcard reportado",
      description: "Obrigado por nos ajudar a melhorar o conteúdo."
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Progress bar and info */}
      <div className="w-full mb-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span>Cartão {index + 1} de {cards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1 bg-muted rounded overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentCard.id}-${showingAnswer ? 'answer' : 'question'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {isRating ? (
            <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md border">
              <h3 className="text-lg font-medium mb-6">Como você avalia seu conhecimento?</h3>
              <FlashcardRating onRate={handleRate} className="max-w-lg" />
            </div>
          ) : (
            <FlashcardView
              flashcard={currentCard}
              index={index}
              total={cards.length}
              showAnswer={showingAnswer}
              onShowAnswer={() => setShowingAnswer(true)}
              onNext={handleNext}
              fullWidth={true}
              hideControls={studyMode === "auto"}
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Control buttons */}
      {studyMode === "manual" && !isRating && (
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={index === 0}
            size={isMobile ? "default" : "lg"}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Anterior
          </Button>
          
          {showingAnswer ? (
            <Button
              variant="default"
              onClick={() => setIsRating(true)}
              size={isMobile ? "default" : "lg"}
              className="gradient-button"
            >
              Avaliar Conhecimento
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleRandom}
              size={isMobile ? "default" : "lg"}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Aleatório
            </Button>
          )}
          
          {index < cards.length - 1 && (
            <Button
              variant="outline"
              onClick={handleNext}
              size={isMobile ? "default" : "lg"}
            >
              Próximo
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          )}
          
          {index === cards.length - 1 && showingAnswer && (
            <Button
              variant="default"
              onClick={onComplete}
              size={isMobile ? "default" : "lg"}
            >
              Finalizar Estudo
            </Button>
          )}
        </div>
      )}
      
      {/* Secondary actions */}
      <div className="flex justify-between mt-4">
        <Button variant="ghost" size="icon" onClick={onExit} title="Sair do estudo">
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleSpeak}>
            <Volume2 className={isSpeaking ? "h-4 w-4 text-primary" : "h-4 w-4"} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {
            toast({
              title: "Cartão salvo",
              description: "Cartão adicionado à sua lista de favoritos."
            });
          }}>
            <BookmarkPlus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleReport}>
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
