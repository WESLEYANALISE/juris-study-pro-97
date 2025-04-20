
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  RefreshCw, 
  Lightbulb,
  X,
  Play,
  Pause,
  MessageSquare
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type FlashCard = Tables<"flash_cards">;

interface FlashcardStudyProps {
  flashcards: FlashCard[];
  onBack: () => void;
}

const FlashcardStudy = ({ flashcards = [], onBack }: FlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(true);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoInterval, setAutoInterval] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);

  // Safely check if we have flashcards before calculating progress
  useEffect(() => {
    if (flashcards.length > 0) {
      setProgress(((currentIndex + 1) / flashcards.length) * 100);
    } else {
      setProgress(0);
    }
  }, [currentIndex, flashcards.length]);

  // Only set up auto mode if we have flashcards
  useEffect(() => {
    if (isAutoMode && flashcards.length > 0) {
      const interval = window.setInterval(() => {
        handleNext();
      }, 5000);
      setAutoInterval(interval);
    } else {
      if (autoInterval) {
        clearInterval(autoInterval);
        setAutoInterval(null);
      }
    }

    return () => {
      if (autoInterval) {
        clearInterval(autoInterval);
      }
    };
  }, [isAutoMode, currentIndex, flashcards.length]);

  // Guard against empty flashcards array
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="container mx-auto py-6 max-w-4xl text-center">
        <h2 className="text-xl font-semibold mb-4">Nenhum flashcard encontrado</h2>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleModeChange = () => {
    setIsAdvancedMode(!isAdvancedMode);
    setShowAnswer(!isAdvancedMode);
  };

  const handleAutoModeChange = () => {
    setIsAutoMode(!isAutoMode);
  };

  const currentFlashcard = flashcards[currentIndex];

  // Add null check for currentFlashcard
  if (!currentFlashcard) {
    return (
      <div className="container mx-auto py-6 max-w-4xl text-center">
        <h2 className="text-xl font-semibold mb-4">Erro ao carregar flashcard</h2>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
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
          <Badge className="py-1.5">
            {currentFlashcard.tema || "Sem tema"}
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="advanced-mode" checked={isAdvancedMode} onCheckedChange={handleModeChange} />
          <Label htmlFor="advanced-mode">
            {isAdvancedMode ? "Modo Avançado" : "Modo Eficiente"}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="auto-mode" checked={isAutoMode} onCheckedChange={handleAutoModeChange} />
          <Label htmlFor="auto-mode">
            {isAutoMode ? "Modo Automático" : "Modo Manual"}
          </Label>
        </div>
      </div>

      <div 
        className={`cursor-pointer transition-all duration-500 perspective-1000 mb-6 ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={isAdvancedMode ? handleFlip : undefined}
        style={{ perspective: '1000px' }}
      >
        <Card className={`transform-style-3d relative min-h-[300px] transform transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className={`absolute w-full h-full backface-hidden ${isFlipped ? 'hidden' : ''}`}>
            <CardHeader className="text-center pt-8">
              <h3 className="text-xl font-semibold mb-0">Pergunta</h3>
              <Separator className="my-3" />
            </CardHeader>
            <CardContent className="text-center px-8">
              <p className="text-lg">{currentFlashcard.pergunta || "Sem pergunta"}</p>
            </CardContent>
            <CardFooter className="flex justify-center pb-8">
              {isAdvancedMode && (
                <Badge variant="outline" className="animate-pulse">
                  Clique para ver a resposta
                </Badge>
              )}
            </CardFooter>
          </div>

          <div className={`absolute w-full h-full backface-hidden transform rotate-y-180 ${!isFlipped && isAdvancedMode ? 'hidden' : (!isAdvancedMode && showAnswer ? '' : 'hidden')}`}>
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
                        <DrawerClose asChild>
                          <Button variant="outline">Fechar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </CardFooter>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Button 
          onClick={handlePrevious} 
          disabled={currentIndex === 0}
          variant="outline"
          size="lg"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button 
            onClick={handleRestart} 
            variant="outline"
            size="icon"
            className="h-10 w-10"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          {isAutoMode ? (
            <Button 
              onClick={handleAutoModeChange} 
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <Pause className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleAutoModeChange} 
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <Play className="h-5 w-5" />
            </Button>
          )}
        </div>

        <Button 
          onClick={handleNext} 
          disabled={currentIndex === flashcards.length - 1}
          variant="default"
          size="lg"
        >
          Próximo
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardStudy;
