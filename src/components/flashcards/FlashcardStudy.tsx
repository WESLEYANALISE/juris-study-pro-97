
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Lightbulb,
  Play,
  Pause,
  MessageSquare,
  Shuffle,
  Timer
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface FlashcardStudyProps {
  flashcards: Tables<"flash_cards">[];
  onBack: () => void;
}

const FlashcardStudy = ({ flashcards = [], onBack }: FlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoInterval, setAutoInterval] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    if (flashcards.length > 0) {
      setProgress(((currentIndex + 1) / flashcards.length) * 100);
    }
  }, [currentIndex, flashcards.length]);

  useEffect(() => {
    if (isAutoMode) {
      const interval = window.setInterval(() => {
        handleNext();
      }, (11 - speed) * 1000);
      setAutoInterval(interval);
    } else if (autoInterval) {
      clearInterval(autoInterval);
      setAutoInterval(null);
    }
    return () => {
      if (autoInterval) clearInterval(autoInterval);
    };
  }, [isAutoMode, speed, currentIndex]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards]
      .sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setIsShuffled(true);
    handleRestart();
  };

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="container mx-auto py-6 max-w-4xl text-center">
        <h2 className="text-xl font-semibold mb-4">Nenhum flashcard encontrado</h2>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Badge variant="outline" className="py-1.5">
            {currentIndex + 1} / {flashcards.length}
          </Badge>
          <Badge variant="secondary" className="py-1.5">
            {currentFlashcard.area || "Sem área"}
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      <motion.div 
        className="perspective-1000 mb-6"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <Card 
          className="min-h-[300px] md:min-h-[400px] cursor-pointer transform-gpu"
          onClick={handleFlip}
        >
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <CardHeader className="text-center pt-8">
                  <h3 className="text-xl font-semibold mb-0">Pergunta</h3>
                  <Separator className="my-3" />
                </CardHeader>
                <CardContent className="text-center px-8">
                  <p className="text-lg">{currentFlashcard.pergunta || "Sem pergunta"}</p>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <CardHeader className="text-center pt-8">
                  <h3 className="text-xl font-semibold mb-0">Resposta</h3>
                  <Separator className="my-3" />
                </CardHeader>
                <CardContent className="text-center px-8">
                  <p className="text-lg">{currentFlashcard.resposta || "Sem resposta"}</p>
                </CardContent>
                {currentFlashcard.explicacao && (
                  <CardFooter className="flex justify-center pb-4">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Ver Explicação
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-lg">
                          <DrawerHeader>
                            <DrawerTitle>Explicação Detalhada</DrawerTitle>
                            <DrawerDescription>
                              Aprofunde seu conhecimento com esta explicação adicional.
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="p-4 pb-0">
                            <div className="space-y-4">
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Sobre este conceito:
                                </h4>
                                <p>{currentFlashcard.explicacao}</p>
                              </div>
                            </div>
                          </div>
                          <DrawerFooter>
                            <Button variant="outline" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))}>
                              Fechar
                            </Button>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </CardFooter>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-center gap-4">
          <Timer className="h-5 w-5 text-muted-foreground" />
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="w-full max-w-xs"
          />
          <span className="text-sm text-muted-foreground">{speed}s</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isAutoMode}
              onCheckedChange={setIsAutoMode}
              id="auto-mode"
            />
            <Label htmlFor="auto-mode">Modo Automático</Label>
          </div>

          <Button 
            variant="outline"
            size="icon"
            onClick={handleShuffle}
            className="h-10 w-10"
          >
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <Button 
            onClick={handlePrevious} 
            disabled={currentIndex === 0}
            variant="outline"
            size="lg"
            className="w-[120px]"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Anterior
          </Button>

          <Button 
            onClick={handleRestart} 
            variant="outline"
            size="icon"
            className="h-10 w-10"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button 
            onClick={handleNext} 
            disabled={currentIndex === flashcards.length - 1}
            variant="default"
            size="lg"
            className="w-[120px]"
          >
            Próximo
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardStudy;
