
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, BookOpen, Info, RotateCcw } from "lucide-react";

interface FlashcardViewProps {
  question: string;
  answer: string;
  explanation?: string;
  showAnswer: boolean;
  onShowAnswer: () => void;
}

export function FlashcardView({
  question,
  answer,
  explanation,
  showAnswer,
  onShowAnswer,
}: FlashcardViewProps) {
  const [showInfo, setShowInfo] = React.useState(false);
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleToggleFlip = () => {
    if (!showAnswer) {
      onShowAnswer();
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const toggleInfo = () => {
    if (showAnswer) {
      setShowInfo(!showInfo);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        className="w-full perspective"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ perspective: 1200 }}
      >
        <div className="w-full relative preserve-3d" style={{ transformStyle: "preserve-3d" }}>
          {/* Card Front (Question) */}
          <AnimatePresence mode="wait">
            <motion.div
              key="question"
              className={`absolute w-full ${isFlipped ? "backface-hidden" : ""}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isFlipped ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ 
                backfaceVisibility: "hidden",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              }}
            >
              <Card className="p-6 min-h-[200px] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium text-muted-foreground mb-4">Pergunta</div>
                  {showAnswer && (
                    <Button 
                      onClick={handleToggleFlip} 
                      size="sm" 
                      variant="ghost"
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Virar
                    </Button>
                  )}
                </div>
                
                <div className="flex-grow flex items-center justify-center py-4">
                  <p className="text-lg text-center font-medium">{question}</p>
                </div>
                
                <div className="flex justify-center mt-4">
                  {!showAnswer ? (
                    <Button 
                      onClick={onShowAnswer} 
                      className="w-full max-w-[200px]"
                      size="lg"
                    >
                      <Eye className="mr-2 h-4 w-4" /> Ver resposta
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleToggleFlip} 
                      variant="outline" 
                      className="w-full max-w-[200px]"
                      size="lg"
                    >
                      <BookOpen className="mr-2 h-4 w-4" /> Ver resposta
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Card Back (Answer) */}
          <AnimatePresence mode="wait">
            {showAnswer && (
              <motion.div
                key="answer"
                className={`absolute w-full ${!isFlipped ? "backface-hidden" : ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isFlipped ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)"
                }}
              >
                <Card className="p-6 min-h-[200px] flex flex-col justify-between bg-primary/5">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-primary mb-4">Resposta</div>
                    <Button 
                      onClick={handleToggleFlip} 
                      size="sm" 
                      variant="ghost"
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Virar
                    </Button>
                  </div>
                  
                  <div className="flex-grow flex items-center justify-center py-4">
                    {showInfo && explanation ? (
                      <div className="text-center">
                        <p className="text-lg font-medium mb-4">{answer}</p>
                        <div className="border-t border-primary/20 pt-3 mt-3">
                          <p className="text-muted-foreground text-sm italic">{explanation}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-center font-medium">{answer}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    {explanation && (
                      <Button 
                        onClick={toggleInfo} 
                        variant="ghost" 
                        className="w-full max-w-[200px]"
                      >
                        <Info className={`${showInfo ? "text-primary" : ""} mr-2 h-4 w-4`} /> 
                        {showInfo ? "Ocultar explicação" : "Ver explicação"}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style jsx global>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .perspective {
          perspective: 1200px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
