
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ChevronDown, Volume2 } from "lucide-react";

type Flashcard = {
  id: string | number;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
  area: string;
  tema: string;
};

interface FlashcardViewProps {
  flashcard: Flashcard;
  index?: number;
  total?: number;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onNext?: () => void;
  autoNarrate?: boolean;
  fullWidth?: boolean;
  hideControls?: boolean;
}

export function FlashcardView({ 
  flashcard, 
  index, 
  total,
  showAnswer, 
  onShowAnswer, 
  onNext,
  autoNarrate = false,
  fullWidth = false,
  hideControls = false
}: FlashcardViewProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Auto narration effect
  useEffect(() => {
    if (!autoNarrate) return;
    
    const synth = window.speechSynthesis;
    const questionUtterance = new SpeechSynthesisUtterance(flashcard.pergunta);
    
    // Select Portuguese voice if available
    const voices = synth.getVoices();
    const ptVoice = voices.find(voice => voice.lang.includes('pt'));
    if (ptVoice) questionUtterance.voice = ptVoice;
    
    synth.speak(questionUtterance);
    
    if (showAnswer) {
      const answerUtterance = new SpeechSynthesisUtterance(flashcard.resposta);
      if (ptVoice) answerUtterance.voice = ptVoice;
      
      // Delay the answer narration slightly
      setTimeout(() => {
        synth.speak(answerUtterance);
      }, 1000);
    }
    
    return () => {
      synth.cancel(); // Stop narration when component unmounts or changes
    };
  }, [flashcard, showAnswer, autoNarrate]);
  
  // Manually trigger narration
  const handleNarrate = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select Portuguese voice if available
    const voices = synth.getVoices();
    const ptVoice = voices.find(voice => voice.lang.includes('pt'));
    if (ptVoice) utterance.voice = ptVoice;
    
    synth.speak(utterance);
  };

  return (
    <Card className={`${fullWidth ? 'w-full' : 'max-w-md mx-auto'} border-primary/10 shadow-lg bg-gradient-to-br from-[#1A1633] via-[#262051] to-[#1A1633]`}>
      <CardContent className="p-6 space-y-4">
        {/* Card metadata */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="bg-primary/10 border-primary/20">
              {flashcard.area}
            </Badge>
            <p className="text-xs text-muted-foreground">{flashcard.tema}</p>
          </div>
          
          {index !== undefined && total !== undefined && (
            <Badge variant="outline" className="text-xs">
              {index + 1}/{total}
            </Badge>
          )}
        </div>
        
        {/* Question */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-primary">Pergunta</h3>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-primary/10"
              onClick={() => handleNarrate(flashcard.pergunta)}
            >
              <Volume2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <div className="p-4 bg-[#1A1633]/80 border border-primary/10 rounded-md">
            <p>{flashcard.pergunta}</p>
          </div>
        </div>
        
        {/* Answer */}
        {showAnswer ? (
          <motion.div 
            className="space-y-2" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-primary">Resposta</h3>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-primary/10"
                onClick={() => handleNarrate(flashcard.resposta)}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="p-4 bg-[#1A1633]/80 border border-primary/10 rounded-md">
              <p>{flashcard.resposta}</p>
            </div>
            
            {/* Explanation section */}
            {flashcard.explicacao && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm hover:bg-primary/10 p-2 h-auto"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  <span className="mr-1">{showExplanation ? "Ocultar" : "Mostrar"} explicação</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showExplanation ? "rotate-180" : ""}`} />
                </Button>
                
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 p-4 bg-primary/5 border border-primary/10 rounded-md"
                  >
                    <p className="text-sm">{flashcard.explicacao}</p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          !hideControls && (
            <Button 
              className="w-full bg-gradient-to-r from-primary/90 via-purple-600/90 to-primary/90 shadow-md hover:shadow-purple-600/20"
              onClick={onShowAnswer}
            >
              Ver resposta
            </Button>
          )
        )}
        
        {/* Next button */}
        {showAnswer && onNext && !hideControls && (
          <Button 
            className="w-full"
            onClick={onNext}
            variant="default"
          >
            Próximo cartão
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
