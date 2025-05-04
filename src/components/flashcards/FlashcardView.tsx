import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextToSpeechService } from "@/services/textToSpeechService";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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
  showAnswer?: boolean;
  onShowAnswer?: () => void;
  onNext?: () => void;
  fullWidth?: boolean;
  hideControls?: boolean;
}
export function FlashcardView({
  flashcard,
  index,
  total,
  showAnswer = false,
  onShowAnswer,
  onNext,
  fullWidth = false,
  hideControls = false
}: FlashCardViewProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isMobile = useIsMobile();
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
  return <div className={cn("flex flex-col items-center", fullWidth ? "w-full" : "")}>
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: -20
    }} transition={{
      duration: 0.3
    }} className={cn("w-full", fullWidth ? "" : "max-w-xl")}>
        <Card className="relative bg-gradient-to-br from-card via-[#9b87f510] to-card shadow-md border border-primary/10 rounded-xl overflow-hidden" style={{
        minHeight: 360
      }}>
          <div className="text-primary font-medium px-6 py-3 text-sm border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">{flashcard.area}</span>
              <span className="text-muted-foreground text-xs font-normal hidden sm:inline">{flashcard.tema}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{index + 1}/{total}</span>
            </div>
          </div>
          
          <div className="p-5 sm:p-8 flex flex-col items-center justify-center">
            <div className="text-xl font-medium text-center mb-8 p-4 rounded-lg bg-primary/5 border border-primary/10 w-full">
              {flashcard.pergunta}
            </div>

            <div className="flex flex-col items-center w-full">
              {showAnswer ? <div className="flex flex-col items-center w-full">
                  <motion.div initial={{
                opacity: 0,
                scale: 0.95
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                duration: 0.3
              }} className="text-xl bg-gradient-to-br from-[#D6BCFA10] to-[#FFF] py-6 px-7 text-foreground font-medium border border-primary/15 text-center mb-6 w-full shadow-sm rounded-2xl bg-fuchsia-950">
                    {flashcard.resposta}
                  </motion.div>
                  
                  {flashcard.explicacao && <motion.div initial={{
                opacity: 0,
                height: 0
              }} animate={{
                opacity: showExplanation ? 1 : 0,
                height: showExplanation ? "auto" : 0
              }} transition={{
                duration: 0.3
              }} className="w-full overflow-hidden">
                      <div className="text-sm mt-2 text-muted-foreground p-4 bg-muted/50 rounded border-l-2 border-primary/30 w-full">
                        <div className="font-medium mb-1 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> Explicação:
                        </div>
                        {flashcard.explicacao}
                      </div>
                    </motion.div>}
                  
                  {flashcard.explicacao && <Button variant="ghost" size="sm" onClick={() => setShowExplanation(!showExplanation)} className="mt-2">
                      {showExplanation ? 'Ocultar explicação' : 'Mostrar explicação'}
                    </Button>}
                </div> : <motion.div whileHover={{
              scale: 1.03
            }} whileTap={{
              scale: 0.97
            }}>
                  <Button variant="default" size="lg" className="py-6 px-12 text-base font-medium mt-4 gradient-button" onClick={onShowAnswer}>
                    <Eye className="mr-2 h-5 w-5" />
                    Ver resposta
                  </Button>
                </motion.div>}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Control buttons below the card */}
      {!hideControls && <div className="flex justify-center gap-3 mt-4 w-full">
          <Button variant="outline" size={isMobile ? "default" : "lg"} className="flex-1 max-w-[180px]" onClick={() => handleSpeak(flashcard.pergunta)}>
            <Volume2 className={cn("mr-2", isSpeaking ? "text-primary" : "")} />
            Ouvir pergunta
          </Button>
          
          {showAnswer && <Button variant="outline" size={isMobile ? "default" : "lg"} className="flex-1 max-w-[180px]" onClick={onShowAnswer ? () => {} : onNext}>
              {onShowAnswer ? <>
                  <EyeOff className="mr-2" />
                  Ocultar resposta
                </> : "Próximo"}
            </Button>}
        </div>}
    </div>;
}