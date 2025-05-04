
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextToSpeechService } from "@/services/textToSpeechService";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  autoNarrate?: boolean;
}

export function FlashcardView({
  flashcard,
  index,
  total,
  showAnswer = false,
  onShowAnswer,
  onNext,
  fullWidth = false,
  hideControls = false,
  autoNarrate = false
}: FlashCardViewProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [narrationRate, setNarrationRate] = useState(1.0);
  const isMobile = useIsMobile();

  // Auto-narrate when card shows or answer appears
  const handleAutoNarrate = async () => {
    if (autoNarrate && !isSpeaking) {
      const textToNarrate = showAnswer 
        ? `Pergunta: ${flashcard.pergunta}. Resposta: ${flashcard.resposta}`
        : flashcard.pergunta;
      
      await handleSpeak(textToNarrate);
    }
  };

  // Effect for auto-narration
  useState(() => {
    if (autoNarrate) {
      handleAutoNarrate();
    }
  });

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      TextToSpeechService.stop();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    await TextToSpeechService.speak(text, { rate: narrationRate });
    setIsSpeaking(false);
  };

  const handleNarrateCard = async () => {
    const textToNarrate = showAnswer 
      ? `Pergunta: ${flashcard.pergunta}. Resposta: ${flashcard.resposta}`
      : flashcard.pergunta;
    
    await handleSpeak(textToNarrate);
  };

  return <motion.div 
      className={cn("flex flex-col items-center", fullWidth ? "w-full" : "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        initial={{
          opacity: 0,
          y: 20
        }} 
        animate={{
          opacity: 1,
          y: 0
        }} 
        exit={{
          opacity: 0,
          y: -20
        }} 
        transition={{
          duration: 0.3
        }} 
        className={cn("w-full", fullWidth ? "" : "max-w-xl")}
      >
        <Card 
          className="relative bg-gradient-to-br from-[#1A1633] via-[#262051] to-[#1A1633] shadow-lg border border-primary/10 rounded-xl overflow-hidden hover:shadow-purple/10"
          style={{
            minHeight: 360
          }}
        >
          <div className="text-primary font-medium px-6 py-3 text-sm border-b border-primary/10 flex items-center justify-between bg-background/5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary/15 px-2 py-0.5 rounded-full">{flashcard.area}</span>
              <span className="text-muted-foreground text-xs font-normal hidden sm:inline">{flashcard.tema}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{index + 1}/{total}</span>
            </div>
          </div>
          
          <div className="p-5 sm:p-8 flex flex-col items-center justify-center">
            <div className="text-xl font-medium text-center mb-8 p-4 rounded-lg bg-[#1A1633]/50 border border-primary/10 w-full">
              {flashcard.pergunta}
            </div>

            <div className="flex flex-col items-center w-full">
              {showAnswer ? <div className="flex flex-col items-center w-full">
                  <motion.div 
                    initial={{
                      opacity: 0,
                      scale: 0.95
                    }} 
                    animate={{
                      opacity: 1,
                      scale: 1
                    }} 
                    transition={{
                      duration: 0.3
                    }} 
                    className="text-xl bg-gradient-to-br from-[#2A1B45] to-[#191328] py-6 px-7 text-foreground font-medium border border-primary/15 text-center mb-6 w-full shadow-sm rounded-2xl"
                  >
                    {flashcard.resposta}
                  </motion.div>
                  
                  {flashcard.explicacao && <motion.div 
                    initial={{
                      opacity: 0,
                      height: 0
                    }} 
                    animate={{
                      opacity: showExplanation ? 1 : 0,
                      height: showExplanation ? "auto" : 0
                    }} 
                    transition={{
                      duration: 0.3
                    }} 
                    className="w-full overflow-hidden"
                  >
                      <div className="text-sm mt-2 text-muted-foreground p-4 bg-[#1A1633]/50 rounded border-l-2 border-primary/30 w-full">
                        <div className="font-medium mb-1 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> Explicação:
                        </div>
                        {flashcard.explicacao}
                      </div>
                    </motion.div>}
                  
                  {flashcard.explicacao && <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowExplanation(!showExplanation)} 
                    className="mt-2"
                  >
                      {showExplanation ? 'Ocultar explicação' : 'Mostrar explicação'}
                    </Button>}
                </div> : <motion.div 
                whileHover={{
                  scale: 1.03
                }} 
                whileTap={{
                  scale: 0.97
                }}
              >
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="py-6 px-12 text-base font-medium mt-4 bg-gradient-to-r from-primary/90 to-purple-600/90 shadow-lg hover:shadow-purple-600/20 border border-primary/20 transition-all duration-300" 
                    onClick={onShowAnswer}
                  >
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
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "lg"} 
                className={cn(
                  "flex-1 max-w-[180px] bg-[#1A1633]/50 border-primary/10",
                  isSpeaking ? "text-primary border-primary" : ""
                )}
              >
                {isSpeaking ? <VolumeX className="mr-2" /> : <Volume2 className="mr-2" />}
                Ouvir narração
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#1A1633] border-primary/20">
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center justify-between">
                  Velocidade da narração
                  <span className="text-xs font-mono text-muted-foreground">{narrationRate}x</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs">0.5x</span>
                  <Slider 
                    value={[narrationRate]} 
                    min={0.5} 
                    max={2.0} 
                    step={0.1} 
                    onValueChange={(val) => setNarrationRate(val[0])} 
                    className="flex-1" 
                  />
                  <span className="text-xs">2.0x</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleNarrateCard} 
                    className="flex-1"
                  >
                    {isSpeaking ? "Parar narração" : "Narrar pergunta"}
                  </Button>
                  {showAnswer && 
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleSpeak(flashcard.resposta)} 
                      className="flex-1"
                    >
                      Narrar resposta
                    </Button>
                  }
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {showAnswer && <Button 
            variant="outline" 
            size={isMobile ? "default" : "lg"} 
            className="flex-1 max-w-[180px] bg-[#1A1633]/50 border-primary/10 hover:bg-primary/20" 
            onClick={onShowAnswer ? () => {} : onNext}
          >
              {onShowAnswer ? <>
                  <EyeOff className="mr-2" />
                  Ocultar resposta
                </> : "Próximo"}
            </Button>}
        </div>}
    </motion.div>;
}
