
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Brain, Volume2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardRating } from "./FlashcardRating";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { TextToSpeechService } from "@/services/textToSpeechService";

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [rated, setRated] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { updateProgress } = useFlashcardProgress();
  
  const handleFlip = () => {
    if (!rated) {  // Only allow flipping if not rated yet
      setIsFlipped(!isFlipped);
    }
  };
  
  const handleRate = async (level: 0 | 1 | 2 | 3 | 4 | 5) => {
    await updateProgress(flashcard.id, level);
    setRated(true);
    
    // After a brief delay, proceed to the next card
    setTimeout(() => {
      setIsFlipped(false);
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
    <div className="perspective w-full">
      <div 
        className={`relative transform-style-3d transition-all duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front side - Pergunta */}
        <Card 
          className={`backface-hidden relative bg-gradient-to-br from-card via-[#9b87f508] to-card shadow-lg border-primary/20 rounded-xl overflow-hidden transition-all ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{
            minHeight: 300,
          }}
        >
          <div className="text-primary font-bold px-6 py-3 text-lg border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm bg-primary/10 px-2 py-0.5 rounded">{flashcard.area}</span>
              <span className="text-muted-foreground text-sm font-normal">{flashcard.tema}</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-normal text-muted-foreground">{index + 1}/{total}</span>
            </div>
          </div>
          
          <div className="p-8 flex flex-col items-center justify-center min-h-[220px]">
            <div className="text-lg font-semibold text-center mb-8">{flashcard.pergunta}</div>
            
            <div className="mt-auto flex flex-col gap-3 w-full max-w-xs mx-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => handleSpeak(flashcard.pergunta)}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                {isSpeaking ? 'Parar narração' : 'Ouvir pergunta'}
              </Button>
              
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={handleFlip}
              >
                Ver resposta
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Back side - Resposta */}
        <Card 
          className={`backface-hidden absolute top-0 rotate-y-180 w-full bg-gradient-to-br from-[#F8F9FC] via-white to-card shadow-lg border-primary/20 rounded-xl overflow-hidden transition-all ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{
            minHeight: 300,
          }}
        >
          <div className="text-primary font-bold px-6 py-3 text-lg border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm bg-primary/10 px-2 py-0.5 rounded">{flashcard.area}</span>
              <span className="text-muted-foreground text-sm font-normal">{flashcard.tema}</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-normal text-muted-foreground">{index + 1}/{total}</span>
            </div>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center min-h-[220px] gap-4">
            <div className="text-base bg-gradient-to-br from-[#D6BCFA22] to-[#FFF] py-4 px-6 rounded-lg text-gray-800 font-medium border text-center">{flashcard.resposta}</div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full max-w-xs"
              onClick={() => handleSpeak(flashcard.resposta)}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              {isSpeaking ? 'Parar narração' : 'Ouvir resposta'}
            </Button>
            
            {flashcard.explicacao && (
              <div className="text-xs mt-1 text-muted-foreground p-3 bg-muted/50 rounded border-l-2 border-primary/30 w-full max-w-xs">
                <div className="font-medium mb-1 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Explicação:
                </div>
                {flashcard.explicacao}
              </div>
            )}
            
            {!rated && (
              <div className="mt-3 w-full max-w-xs">
                <p className="text-sm text-center text-muted-foreground mb-2">Como você avalia seu conhecimento neste card?</p>
                <FlashcardRating onRate={handleRate} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
